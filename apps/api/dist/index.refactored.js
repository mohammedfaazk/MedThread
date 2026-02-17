"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.httpServer = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const config_1 = require("./config");
const errorHandler_1 = require("./middleware/errorHandler");
// Import refactored routes
const auth_refactored_1 = require("./routes/auth.refactored");
// Import other routes as they are refactored
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
exports.httpServer = httpServer;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: config_1.config.cors.origin,
    credentials: config_1.config.cors.credentials,
}));
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Request logging middleware (development only)
if (config_1.config.nodeEnv === 'development') {
    app.use((req, res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        next();
    });
}
// Socket.io Setup
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: config_1.config.cors.origin,
        credentials: config_1.config.cors.credentials,
    }
});
exports.io = io;
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
            environment: config_1.config.nodeEnv,
        }
    });
});
// API Routes
app.use('/api/v1/auth', auth_refactored_1.authRouter);
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
app.use(errorHandler_1.errorHandler);
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
httpServer.listen(config_1.config.port, () => {
    console.log(`
╔════════════════════════════════════════╗
║   🏥 MedThread API Server Started     ║
╠════════════════════════════════════════╣
║  Port:        ${config_1.config.port.toString().padEnd(24)}║
║  Environment: ${config_1.config.nodeEnv.padEnd(24)}║
║  Time:        ${new Date().toLocaleTimeString().padEnd(24)}║
╚════════════════════════════════════════╝
  `);
});
