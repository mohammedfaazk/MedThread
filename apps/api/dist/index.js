"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const threads_1 = require("./routes/threads");
const users_1 = require("./routes/users");
const replies_1 = require("./routes/replies");
const auth_1 = require("./routes/auth");
const timeline_1 = require("./routes/timeline");
const appointments_1 = require("./routes/appointments");
const chat_1 = require("./routes/chat");
const chat_handler_1 = require("./handlers/chat.handler");
const notification_handler_1 = require("./handlers/notification.handler");
const socket_1 = require("./socket");
const doctor_verification_routes_1 = require("./routes/doctor-verification.routes");
const doctor_profile_enhanced_routes_1 = require("./routes/doctor-profile-enhanced.routes");
const consultation_funnel_routes_1 = require("./routes/consultation-funnel.routes");
const cme_credits_routes_1 = require("./routes/cme-credits.routes");
const health_insights_routes_1 = require("./routes/health-insights.routes");
const payment_routes_1 = require("./routes/payment.routes");
const file_upload_routes_1 = require("./routes/file-upload.routes");
const notification_routes_1 = require("./routes/notification.routes");
const posts_1 = __importDefault(require("./routes/posts"));
const comments_1 = __importDefault(require("./routes/comments"));
const communities_1 = __importDefault(require("./routes/communities"));
const search_1 = __importDefault(require("./routes/search"));
const karma_1 = __importDefault(require("./routes/karma"));
const awards_1 = __importDefault(require("./routes/awards"));
const account_1 = __importDefault(require("./routes/account"));
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
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' })); // Increased for base64 uploads
// Routes
app.use('/api/auth', auth_1.authRouter);
app.use('/api/threads', threads_1.threadRouter);
app.use('/api/users', users_1.userRouter);
app.use('/api/replies', replies_1.replyRouter);
app.use('/api/timeline', timeline_1.timelineRouter);
app.use('/api/appointments', appointments_1.appointmentRouter);
app.use('/api/chat', chat_1.chatRouter);
app.use('/api/v1/doctor-verification', doctor_verification_routes_1.doctorVerificationRouter);
// Strategic Feature Routes
app.use('/api/doctor-profile', doctor_profile_enhanced_routes_1.doctorProfileEnhancedRouter);
app.use('/api/consultation-funnel', consultation_funnel_routes_1.consultationFunnelRouter);
app.use('/api/cme-credits', cme_credits_routes_1.cmeCreditsRouter);
app.use('/api/health-insights', health_insights_routes_1.healthInsightsRouter);
app.use('/api/payment', payment_routes_1.paymentRouter);
app.use('/api/upload', file_upload_routes_1.fileUploadRouter);
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
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
httpServer.listen(PORT, () => {
    console.log(`🏥 MedThread API running on port ${PORT}`);
});
