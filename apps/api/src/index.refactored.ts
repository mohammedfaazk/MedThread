import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';

// Import refactored routes
import { authRouter } from './routes/auth.refactored';
// Import other routes as they are refactored

const app = express();
const httpServer = createServer(app);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware (development only)
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// Socket.io Setup
const io = new Server(httpServer, {
  cors: {
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.id}`);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
    }
  });
});

// API Routes
app.use('/api/v1/auth', authRouter);
// Add other routes here as they are refactored

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('[Server] SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    console.log('[Server] Server closed');
    process.exit(0);
  });
});

// Start server
httpServer.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════╗
║   🏥 MedThread API Server Started     ║
╠════════════════════════════════════════╣
║  Port:        ${config.port.toString().padEnd(24)}║
║  Environment: ${config.nodeEnv.padEnd(24)}║
║  Time:        ${new Date().toLocaleTimeString().padEnd(24)}║
╚════════════════════════════════════════╝
  `);
});

export { app, httpServer, io };
