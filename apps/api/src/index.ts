import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { threadRouter } from './routes/threads';
import { userRouter } from './routes/users';
import { replyRouter } from './routes/replies';
import { authRouter } from './routes/auth';
import { timelineRouter } from './routes/timeline';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/threads', threadRouter);
app.use('/api/users', userRouter);
app.use('/api/replies', replyRouter);
app.use('/api/timeline', timelineRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🏥 MedThread API running on port ${PORT}`);
});
