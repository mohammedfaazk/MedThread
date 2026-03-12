import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { threadRouter } from './routes/threads';
import { userRouter } from './routes/users';
import { replyRouter } from './routes/replies';
import { authRouter } from './routes/auth.refactored';
import { timelineRouter } from './routes/timeline';
import { appointmentRouter } from './routes/appointments';
import { chatRouter } from './routes/chat';
import { chatRouterV2 } from './routes/chat.v2';
import { chatHandler } from './handlers/chat.handler';
import { notificationHandler } from './handlers/notification.handler';
import { analyticsHandler } from './handlers/analytics.handler';
import { setSocketInstance } from './socket';
import { doctorVerificationRouter } from './routes/doctor-verification.routes';
import { doctorProfileEnhancedRouter } from './routes/doctor-profile-enhanced.routes';
import { consultationFunnelRouter } from './routes/consultation-funnel.routes';
import { cmeCreditsRouter } from './routes/cme-credits.routes';
import { healthInsightsRouter } from './routes/health-insights.routes';
import { uploadRouter } from './routes/upload.routes';
import { adminRouter } from './routes/admin.routes';
import { reportRouter } from './routes/report.routes';
import { postsRouter as postsRouterV2 } from './routes/posts.routes';
import { analyticsRouter } from './routes/analytics.routes';
import { healthAnalyticsRouter } from './routes/health-analytics.routes';
import { doctorAnalyticsRouter } from './routes/doctor-analytics.routes';
import { platformAnalyticsRouter } from './routes/platform-analytics.routes';
import { paymentRouter } from './routes/payment.routes';
import { fileUploadRouter } from './routes/file-upload.routes';
import { notificationRouter } from './routes/notification.routes';
import { emailQueueService } from './services/email-queue.service';
import { cronJobsService } from './services/cron-jobs.service';
import postsRouter from './routes/posts';
import commentsRouter from './routes/comments';
import communitiesRouter from './routes/communities';
import searchRouter from './routes/search';
import karmaRouter from './routes/karma';
import awardsRouter from './routes/awards';
import accountRouter from './routes/account';
import { profileRouter } from './routes/profile.routes';
import { followRouter } from './routes/follow';
import { badgeRouter } from './routes/badge.routes';
import { blockRouter } from './routes/block.routes';
import { usersRouter } from './routes/users.routes';
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

// Set global socket instance for use in services
setSocketInstance(io);

// Initialize Socket Handlers
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  chatHandler(io, socket);
  notificationHandler(io, socket);
  analyticsHandler(io, socket);
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

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/admin', adminRouter);
app.use('/api/reports', reportRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/health-analytics', healthAnalyticsRouter);
app.use('/api/doctor-analytics', doctorAnalyticsRouter);
app.use('/api/platform-analytics', platformAnalyticsRouter);
app.use('/api/payment', paymentRouter);
app.use('/api/threads', threadRouter);
app.use('/api/users', userRouter);
app.use('/api/replies', replyRouter);
app.use('/api/timeline', timelineRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/chat', chatRouter);
app.use('/api/v2/chat', chatRouterV2);
app.use('/api/v1/doctor-verification', doctorVerificationRouter);

// Strategic Feature Routes
app.use('/api/doctor-profile', doctorProfileEnhancedRouter);
app.use('/api/consultation-funnel', consultationFunnelRouter);
app.use('/api/cme-credits', cmeCreditsRouter);
app.use('/api/health-insights', healthInsightsRouter);
app.use('/api/file-upload', fileUploadRouter);

// Posts & Comments System
app.use('/api/v1/posts', postsRouter);
app.use('/api/v1/comments', commentsRouter);
app.use('/api/v1/communities', communitiesRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/karma', karmaRouter);
app.use('/api/v1/awards', awardsRouter);
app.use('/api/v1/account', accountRouter);

// Notification System
app.use('/api/notifications', notificationRouter);

// Profile System
app.use('/api/profile', profileRouter);

// Follow System
app.use('/api/follow', followRouter);

// Badge System
app.use('/api/badges', badgeRouter);

// Block System
app.use('/api/block', blockRouter);

// Users System (v2)
app.use('/api/v2/users', usersRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler middleware (must be last)
app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`🏥 MedThread API running on port ${PORT}`);
  
  // Start email queue processing
  console.log('📧 Starting email queue worker...');
  emailQueueService.startProcessing();
  
  // Initialize cron jobs
  console.log('⏰ Initializing cron jobs...');
  cronJobsService.initializeCronJobs();
});
