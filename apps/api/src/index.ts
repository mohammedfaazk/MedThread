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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

httpServer.listen(PORT, () => {
  console.log(`🏥 MedThread API running on port ${PORT}`);
});

