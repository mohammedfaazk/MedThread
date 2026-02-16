import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { threadRouter } from './routes/threads';
import { userRouter } from './routes/users';
import { replyRouter } from './routes/replies';
import { authRouter } from './routes/auth';
import { timelineRouter } from './routes/timeline';
import { appointmentRouter } from './routes/appointments';
import { chatRouter } from './routes/chat';
import { chatHandler } from './handlers/chat.handler';
import { doctorVerificationRouter } from './routes/doctor-verification.routes';
import { doctorProfileEnhancedRouter } from './routes/doctor-profile-enhanced.routes';
import { consultationFunnelRouter } from './routes/consultation-funnel.routes';
import { cmeCreditsRouter } from './routes/cme-credits.routes';
import { healthInsightsRouter } from './routes/health-insights.routes';
import { paymentRouter } from './routes/payment.routes';
import { fileUploadRouter } from './routes/file-upload.routes';
import postsRouter from './routes/posts';
import commentsRouter from './routes/comments';
import communitiesRouter from './routes/communities';
import searchRouter from './routes/search';
import karmaRouter from './routes/karma';
import awardsRouter from './routes/awards';
import accountRouter from './routes/account';

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

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased for base64 uploads

// Routes
app.use('/api/auth', authRouter);
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
app.use('/api/payment', paymentRouter);
app.use('/api/upload', fileUploadRouter);

// Posts & Comments System
app.use('/api/v1/posts', postsRouter);
app.use('/api/v1/comments', commentsRouter);
app.use('/api/v1/communities', communitiesRouter);
app.use('/api/v1/search', searchRouter);
app.use('/api/v1/karma', karmaRouter);
app.use('/api/v1/awards', awardsRouter);
app.use('/api/v1/account', accountRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

httpServer.listen(PORT, () => {
  console.log(`🏥 MedThread API running on port ${PORT}`);
});

