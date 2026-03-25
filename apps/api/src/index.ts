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
import enhancedAnalyticsRouter from './routes/enhanced-analytics';
import doctorProfileAnalyticsRouter from './routes/doctor-profile-analytics.routes';
import postPriorityRouter from './routes/post-priority.routes';
import adminUserActivityRouter from './routes/admin-user-activity.routes';
import regionalSymptomAnalyticsRouter from './routes/regional-symptom-analytics.routes';
import { paymentRouter } from './routes/payment.routes';
import { fileUploadRouter } from './routes/file-upload.routes';
import notificationRouter from './routes/notification.routes';
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
import healthProfileRouter from './routes/health-profile';
import dietPlanRouter from './routes/diet-plan';
import { usersRouter } from './routes/users.routes';
import medicationRouter from './routes/medication';
import symptomDiaryRouter from './routes/symptom-diary';
import healthTimelineRouter from './routes/health-timeline';
import healthChallengesRouter from './routes/health-challenges';
import supportGroupsRouter from './routes/support-groups';
import healthRiskRouter from './routes/health-risk';
import uniqueFeaturesRouter from './routes/unique-features';
import voiceMessagesRouter from './routes/voice-messages';
import aiDetectiveRouter from './routes/ai-detective';
import secondOpinionRouter from './routes/second-opinion';
import familyRouter from './routes/family';
import medicalLibraryRouter from './routes/medical-library.routes';
import translationRouter from './routes/translation.routes';
import conversationSearchRouter from './routes/conversation-search.routes';
import healthTipsRouter from './routes/health-tips.routes';
import healthProfileRouter from './routes/health-profile.routes';
import emergencyBroadcastRouter from './routes/emergency-broadcast.routes';
import reviewsRouter from './routes/reviews.routes';
import qaForumRouter from './routes/qa-forum.routes';
import healthChallengesRouterNew from './routes/health-challenges.routes';
import successStoriesRouter from './routes/success-stories.routes';
import moderationRouter from './routes/moderation.routes';
import technicalImprovementsRouter from './routes/technical-improvements.routes';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { sanitizeInput } from './middleware/sanitize';
import { getCsrfToken } from './middleware/csrf';
import medicalVerificationRoutes from './routes/medical-verification.routes';
import contentModerationRoutes from './routes/content-moderation.routes';
import liabilityProtectionRoutes from './routes/liability-protection.routes';
import searchEnhancedRoutes from './routes/search.routes';
import backupRoutes from './routes/backup.routes';
import performanceMonitorRoutes from './routes/performance-monitor.routes';
import notificationEnhancedRoutes from './routes/notification.routes';
import spamDetectionRoutes from './routes/spam-detection.routes';
import cacheRoutes from './routes/cache.routes';
import { performanceMonitorService } from './services/performance-monitor.service';
import {
  authRateLimit,
  postingRateLimit,
  searchRateLimit,
  medicalAIRateLimit,
  uploadRateLimit,
  passwordResetRateLimit,
  reportingRateLimit
} from './middleware/rateLimiter';

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
      imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com', 'http://localhost:3000', 'http://localhost:3001'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3003',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3003',
    process.env.CORS_ORIGIN || 'http://localhost:3000'
  ],
  credentials: true, // Allow cookies
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(sanitizeInput); // Prevent NoSQL injection

// Apply rate limiting to all routes
app.use('/api/', apiLimiter);

// Apply specific rate limiters
// TEMPORARILY DISABLED FOR DEBUGGING
// app.use('/api/auth', authRateLimit);
app.use('/api/v1/posts', postingRateLimit);
app.use('/api/v1/search', searchRateLimit);
app.use('/api/upload', uploadRateLimit);
app.use('/api/reports', reportingRateLimit);

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
app.use('/api/enhanced-analytics', enhancedAnalyticsRouter);
app.use('/api/doctor-profile-analytics', doctorProfileAnalyticsRouter);
app.use('/api/post-priority', postPriorityRouter);
app.use('/api/admin-user-activity', adminUserActivityRouter);
app.use('/api/regional-symptom-analytics', regionalSymptomAnalyticsRouter);
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

// Health Profile & Diet Planner
app.use('/api/v1/health-profile', healthProfileRouter);
app.use('/api/v1/diet-plan', dietPlanRouter);

// Medical Features
app.use('/api/v1/medications', medicationRouter);
app.use('/api/v1/symptom-diary', symptomDiaryRouter);
app.use('/api/v1/health-timeline', healthTimelineRouter);
app.use('/api/v1/medical-library', medicalLibraryRouter);
app.use('/api/v1/voice-messages', voiceMessagesRouter);
app.use('/api/v1/translation', translationRouter);
app.use('/api/v1/conversations', conversationSearchRouter);
app.use('/api/v1/health-challenges', healthChallengesRouterNew);
app.use('/api/v1/support-groups', supportGroupsRouter);
app.use('/api/v1/health-risk', healthRiskRouter);

// New Features
app.use('/api/v1/health-tips', healthTipsRouter);
app.use('/api/v1/health-profile', healthProfileRouter);
app.use('/api/v1/emergency-broadcast', emergencyBroadcastRouter);
app.use('/api/v1/reviews', reviewsRouter);

// Community Features
app.use('/api/v1/qa-forum', qaForumRouter);
app.use('/api/v1/success-stories', successStoriesRouter);

// Safety & Moderation
app.use('/api/v1/moderation', moderationRouter);

// Technical Improvements
app.use('/api/v1/technical', technicalImprovementsRouter);

// Unique Features
app.use('/api/v1/unique-features', uniqueFeaturesRouter);

// Voice Messages
app.use('/api/v1/voice-messages', voiceMessagesRouter);

// AI Disease Detective
app.use('/api/v1/ai-detective', aiDetectiveRouter);

// Second Opinion Marketplace
app.use('/api/v1/second-opinion', secondOpinionRouter);

// Family Health Dashboard
app.use('/api/v1/family', familyRouter);

// Users System (v2)
app.use('/api/v2/users', usersRouter);

// NEW FEATURE ROUTES - Medical Safety & Advanced Features
app.use('/api/v1/medical-verification', medicalAIRateLimit, medicalVerificationRoutes);
app.use('/api/v1/content-moderation', contentModerationRoutes);
app.use('/api/v1/liability', liabilityProtectionRoutes);
app.use('/api/v1/search-enhanced', searchEnhancedRoutes);
app.use('/api/v1/backup', backupRoutes);
app.use('/api/v1/performance', performanceMonitorRoutes);
app.use('/api/v1/notifications-enhanced', notificationEnhancedRoutes);
app.use('/api/v1/spam-detection', spamDetectionRoutes);
app.use('/api/v1/cache', cacheRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler middleware (must be last)
app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`🏥 MedThread API running on port ${PORT}`);
  
  // Start performance monitoring
  console.log('📊 Starting performance monitoring...');
  performanceMonitorService.monitorSystemResources();
  
  // Start email queue processing
  try {
    console.log('📧 Starting email queue worker...');
    emailQueueService.startProcessing();
  } catch (error) {
    console.warn('⚠️  Email queue worker failed to start (EmailQueue table may not exist):', error instanceof Error ? error.message : error);
  }
  
  // Initialize cron jobs
  console.log('⏰ Initializing cron jobs...');
  cronJobsService.initializeCronJobs();

  // Run heatmap aggregation once on startup in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔄 Running initial heatmap aggregation for development...');
    const { runHeatmapAggregation } = require('./services/heatmapAggregator.service');
    runHeatmapAggregation().catch(console.error);
  }
});
