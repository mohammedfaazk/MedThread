"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const threads_1 = require("./routes/threads");
const users_1 = require("./routes/users");
const replies_1 = require("./routes/replies");
const auth_refactored_1 = require("./routes/auth.refactored");
const timeline_1 = require("./routes/timeline");
const appointments_1 = require("./routes/appointments");
const chat_1 = require("./routes/chat");
const chat_v2_1 = require("./routes/chat.v2");
const chat_handler_1 = require("./handlers/chat.handler");
const notification_handler_1 = require("./handlers/notification.handler");
const socket_1 = require("./socket");
const doctor_verification_routes_1 = require("./routes/doctor-verification.routes");
const doctor_profile_enhanced_routes_1 = require("./routes/doctor-profile-enhanced.routes");
const consultation_funnel_routes_1 = require("./routes/consultation-funnel.routes");
const cme_credits_routes_1 = require("./routes/cme-credits.routes");
const health_insights_routes_1 = require("./routes/health-insights.routes");
const upload_routes_1 = require("./routes/upload.routes");
const admin_routes_1 = require("./routes/admin.routes");
const report_routes_1 = require("./routes/report.routes");
const analytics_routes_1 = require("./routes/analytics.routes");
const payment_routes_1 = require("./routes/payment.routes");
const file_upload_routes_1 = require("./routes/file-upload.routes");
const notification_routes_1 = require("./routes/notification.routes");
const email_queue_service_1 = require("./services/email-queue.service");
const cron_jobs_service_1 = require("./services/cron-jobs.service");
const posts_1 = __importDefault(require("./routes/posts"));
const comments_1 = __importDefault(require("./routes/comments"));
const communities_1 = __importDefault(require("./routes/communities"));
const search_1 = __importDefault(require("./routes/search"));
const karma_1 = __importDefault(require("./routes/karma"));
const awards_1 = __importDefault(require("./routes/awards"));
const account_1 = __importDefault(require("./routes/account"));
const profile_routes_1 = require("./routes/profile.routes");
const follow_1 = require("./routes/follow");
const badge_routes_1 = require("./routes/badge.routes");
const block_routes_1 = require("./routes/block.routes");
const users_routes_1 = require("./routes/users.routes");
const doctor_location_routes_1 = require("./routes/doctor-location.routes");
const doctor_ranking_routes_1 = require("./routes/doctor-ranking.routes");
const seo_routes_1 = require("./routes/seo.routes");
const doctor_business_routes_1 = require("./routes/doctor-business.routes");
const patient_journey_routes_1 = require("./routes/patient-journey.routes");
const smart_matching_routes_1 = require("./routes/smart-matching.routes");
const revenue_routes_1 = require("./routes/revenue.routes");
const trust_safety_routes_1 = require("./routes/trust-safety.routes");
const errorHandler_1 = require("./middleware/errorHandler");
const rateLimiter_1 = require("./middleware/rateLimiter");
const sanitize_1 = require("./middleware/sanitize");
const csrf_1 = require("./middleware/csrf");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 3001;
// Socket.io Setup
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*", // allow all for now, restrict in production
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});
// Set global socket instance for use in services
(0, socket_1.setSocketInstance)(io);
// Initialize Socket Handlers
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    (0, chat_handler_1.chatHandler)(io, socket);
    (0, notification_handler_1.notificationHandler)(io, socket);
});
// Security middleware
app.use((0, helmet_1.default)({
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
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:3000',
        'http://localhost:3003',
        process.env.CORS_ORIGIN || 'http://localhost:3000'
    ],
    credentials: true, // Allow cookies
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(sanitize_1.sanitizeInput); // Prevent NoSQL injection
// Apply rate limiting to all routes
app.use('/api/', rateLimiter_1.apiLimiter);
// CSRF token endpoint
app.get('/api/csrf-token', csrf_1.getCsrfToken);
// Serve static files from uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.use('/api/auth', auth_refactored_1.authRouter);
app.use('/api/upload', upload_routes_1.uploadRouter);
app.use('/api/admin', admin_routes_1.adminRouter);
app.use('/api/reports', report_routes_1.reportRouter);
app.use('/api/analytics', analytics_routes_1.analyticsRouter);
app.use('/api/payment', payment_routes_1.paymentRouter);
app.use('/api/threads', threads_1.threadRouter);
app.use('/api/users', users_1.userRouter);
app.use('/api/replies', replies_1.replyRouter);
app.use('/api/timeline', timeline_1.timelineRouter);
app.use('/api/appointments', appointments_1.appointmentRouter);
app.use('/api/chat', chat_1.chatRouter);
app.use('/api/v2/chat', chat_v2_1.chatRouterV2);
app.use('/api/v1/doctor-verification', doctor_verification_routes_1.doctorVerificationRouter);
// Strategic Feature Routes
app.use('/api/doctor-profile', doctor_profile_enhanced_routes_1.doctorProfileEnhancedRouter);
app.use('/api/consultation-funnel', consultation_funnel_routes_1.consultationFunnelRouter);
app.use('/api/cme-credits', cme_credits_routes_1.cmeCreditsRouter);
app.use('/api/health-insights', health_insights_routes_1.healthInsightsRouter);
app.use('/api/file-upload', file_upload_routes_1.fileUploadRouter);
// Posts & Comments System
app.use('/api/v1/posts', posts_1.default);
app.use('/api/v1/comments', comments_1.default);
app.use('/api/v1/communities', communities_1.default);
app.use('/api/v1/search', search_1.default);
app.use('/api/v1/karma', karma_1.default);
app.use('/api/v1/awards', awards_1.default);
app.use('/api/v1/account', account_1.default);
// Notification System
app.use('/api/notifications', notification_routes_1.notificationRouter);
// Profile System
app.use('/api/profile', profile_routes_1.profileRouter);
// Follow System
app.use('/api/follow', follow_1.followRouter);
// Badge System
app.use('/api/badges', badge_routes_1.badgeRouter);
// Block System
app.use('/api/block', block_routes_1.blockRouter);
// Users System (v2)
app.use('/api/v2/users', users_routes_1.usersRouter);
// Doctor Location & Area-Wise Replies
app.use('/api', doctor_location_routes_1.doctorLocationRouter);
// Doctor Ranking & Reviews
app.use('/api', doctor_ranking_routes_1.doctorRankingRouter);
// SEO Rating Website
app.use('/api', seo_routes_1.seoRouter);
// Doctor Business Dashboard
app.use('/api', doctor_business_routes_1.doctorBusinessRouter);
// Patient Journey Optimization
app.use('/api', patient_journey_routes_1.patientJourneyRouter);
// Smart Matching Algorithm
app.use('/api', smart_matching_routes_1.smartMatchingRouter);
// Revenue Streams
app.use('/api', revenue_routes_1.revenueRouter);
// Trust & Safety
app.use('/api', trust_safety_routes_1.trustSafetyRouter);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error handler middleware (must be last)
app.use(errorHandler_1.errorHandler);
httpServer.listen(PORT, () => {
    console.log(`🏥 MedThread API running on port ${PORT}`);
    // Start email queue processing
    console.log('📧 Starting email queue worker...');
    email_queue_service_1.emailQueueService.startProcessing();
    // Initialize cron jobs
    console.log('⏰ Initializing cron jobs...');
    cron_jobs_service_1.cronJobsService.initializeCronJobs();
});
