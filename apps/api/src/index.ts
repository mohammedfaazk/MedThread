import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { threadRouter } from './routes/threads';
import { userRouter } from './routes/users';
import { replyRouter } from './routes/replies';
import { authRouter } from './routes/auth.refactored';
import { timelineRouter } from './routes/timeline';
import { appointmentRouter } from './routes/appointments';
import { chatRouter } from './routes/chat';
import { chatHandler } from './handlers/chat.handler';
import { doctorVerificationRouter } from './routes/doctor-verification.routes';
import { doctorProfileEnhancedRouter } from './routes/doctor-profile-enhanced.routes';
import { consultationFunnelRouter } from './routes/consultation-funnel.routes';
import { cmeCreditsRouter } from './routes/cme-credits.routes';
import { healthInsightsRouter } from './routes/health-insights.routes';
import { uploadRouter } from './routes/upload.routes';
import { adminRouter } from './routes/admin.routes';
import { reportRouter } from './routes/report.routes';
import { postsRouter } from './routes/posts.routes';
import { analyticsRouter } from './routes/analytics.routes';
import { paymentRouter } from './routes/payment.routes';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { sanitizeInput } from './middleware/sanitize';
import { getCsrfToken } from './middleware/csrf';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

// Socket.io Setup
const io = new Server(httpServer, {
  cors: {
    origin: "*", // allow all for now, restrict in production
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Initialize Socket Handlers
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  chatHandler(io, socket);
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3003',
    process.env.CORS_ORIGIN || 'http://localhost:3000'
  ],
  credentials: true, // Allow cookies
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(sanitizeInput); // Prevent NoSQL injection

// Apply rate limiting to all routes
app.use('/api/', apiLimiter);

// CSRF token endpoint
app.get('/api/csrf-token', getCsrfToken);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/admin', adminRouter);
app.use('/api/reports', reportRouter);
app.use('/api/posts', postsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/threads', threadRouter);
app.use('/api/users', userRouter);
app.use('/api/replies', replyRouter);
app.use('/api/timeline', timelineRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/chat', chatRouter);
app.use('/api/v1/doctor-verification', doctorVerificationRouter);

// Strategic Feature Routes
app.use('/api/doctor-profile', doctorProfileEnhancedRouter);
app.use('/api/consultation-funnel', consultationFunnelRouter);
app.use('/api/cme-credits', cmeCreditsRouter);
app.use('/api/health-insights', healthInsightsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler middleware (must be last)
app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`🏥 MedThread API running on port ${PORT}`);
});

