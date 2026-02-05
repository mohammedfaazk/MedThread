import { Router } from 'express';
import { prisma } from '@medthread/database';
import { authenticate } from '../middleware/auth';

export const timelineRouter = Router();

timelineRouter.post('/', authenticate, async (req, res) => {
  try {
    const { threadId, eventType, data } = req.body;
    
    const event = await prisma.caseTimelineEvent.create({
      data: {
        threadId,
        userId: req.userId!,
        eventType,
        data
      }
    });
    
    res.json(event);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create timeline event' });
  }
});

timelineRouter.get('/:threadId', async (req, res) => {
  const events = await prisma.caseTimelineEvent.findMany({
    where: { threadId: req.params.threadId },
    orderBy: { timestamp: 'asc' },
    include: {
      user: { select: { username: true, role: true } }
    }
  });
  
  res.json(events);
});

export default timelineRouter;
