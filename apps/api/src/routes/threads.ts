import { Router } from 'express';
import { prisma } from '@medthread/database';
import { z } from 'zod';

export const threadRouter = Router();

const createThreadSchema = z.object({
  patientId: z.string(),
  title: z.string(),
  symptoms: z.object({
    age: z.number().optional(),
    gender: z.string().optional(),
    weight: z.number().optional(),
    existingConditions: z.array(z.string()),
    medications: z.array(z.string()),
    primarySymptoms: z.array(z.string()),
    duration: z.string(),
    severity: z.enum(['LOW', 'MODERATE', 'HIGH', 'EMERGENCY']),
    description: z.string()
  }),
  tags: z.array(z.string())
});

threadRouter.post('/', async (req, res) => {
  try {
    const data = createThreadSchema.parse(req.body);
    
    const thread = await prisma.medicalThread.create({
      data: {
        patientId: data.patientId,
        title: data.title,
        symptoms: data.symptoms,
        severityScore: data.symptoms.severity,
        tags: data.tags
      }
    });
    
    res.json(thread);
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

threadRouter.get('/', async (req, res) => {
  const threads = await prisma.medicalThread.findMany({
    include: {
      patient: { select: { username: true, role: true } },
      replies: { take: 3, orderBy: { createdAt: 'desc' } }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  
  res.json(threads);
});

threadRouter.get('/:id', async (req, res) => {
  const thread = await prisma.medicalThread.findUnique({
    where: { id: req.params.id },
    include: {
      patient: { select: { username: true, role: true } },
      replies: {
        include: {
          author: { select: { username: true, role: true } },
          childReplies: true
        }
      },
      timeline: { orderBy: { timestamp: 'asc' } }
    }
  });
  
  if (!thread) {
    return res.status(404).json({ error: 'Thread not found' });
  }
  
  res.json(thread);
});

export default threadRouter;
