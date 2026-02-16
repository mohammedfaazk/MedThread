import { Router } from 'express';
import { prisma } from '@medthread/database';
import { z } from 'zod';
import { aiSymptomAnalysisService } from '../services/ai-symptom-analysis.service';

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

// Mark thread as resolved
threadRouter.patch('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, bestAnswerId } = req.body;
    
    const thread = await prisma.medicalThread.findUnique({
      where: { id }
    });
    
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    
    if (thread.patientId !== userId) {
      return res.status(403).json({ error: 'Only the thread author can mark it as resolved' });
    }
    
    const updatedThread = await prisma.medicalThread.update({
      where: { id },
      data: {
        isResolved: true,
        status: 'RESOLVED',
        resolvedAt: new Date()
      }
    });
    
    // Mark best answer if provided
    if (bestAnswerId) {
      await prisma.threadReply.update({
        where: { id: bestAnswerId },
        data: { isHelpful: true }
      });
    }
    
    // Create timeline event
    await prisma.caseTimelineEvent.create({
      data: {
        threadId: id,
        eventType: 'RESOLVED',
        description: 'Thread marked as resolved',
        metadata: { bestAnswerId }
      }
    });
    
    res.json(updatedThread);
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve thread' });
  }
});

// Update thread status
threadRouter.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, userId } = req.body;
    
    const thread = await prisma.medicalThread.findUnique({
      where: { id }
    });
    
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    
    if (thread.patientId !== userId) {
      return res.status(403).json({ error: 'Only the thread author can update status' });
    }
    
    const updatedThread = await prisma.medicalThread.update({
      where: { id },
      data: { status }
    });
    
    // Create timeline event
    await prisma.caseTimelineEvent.create({
      data: {
        threadId: id,
        eventType: 'STATUS_CHANGED',
        description: `Status changed to ${status}`,
        metadata: { newStatus: status }
      }
    });
    
    res.json(updatedThread);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Get thread analytics
threadRouter.get('/:id/analytics', async (req, res) => {
  try {
    const { id } = req.params;
    
    const thread = await prisma.medicalThread.findUnique({
      where: { id },
      include: {
        replies: {
          include: {
            author: { select: { role: true, doctorVerificationStatus: true } }
          }
        }
      }
    });
    
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    
    const analytics = {
      totalReplies: thread.replies.length,
      doctorReplies: thread.replies.filter(r => r.author.role === 'DOCTOR' && r.author.doctorVerificationStatus === 'APPROVED').length,
      averageResponseTime: 0, // Calculate based on timestamps
      helpfulReplies: thread.replies.filter(r => r.isHelpful).length,
      totalUpvotes: thread.replies.reduce((sum, r) => sum + r.upvotes, 0),
      isResolved: thread.isResolved,
      status: thread.status
    };
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get AI symptom analysis for thread
threadRouter.get('/:id/ai-analysis', async (req, res) => {
  try {
    const { id } = req.params;
    
    const thread = await prisma.medicalThread.findUnique({
      where: { id }
    });
    
    if (!thread) {
      return res.status(404).json({ error: 'Thread not found' });
    }
    
    // Return cached analysis if exists
    if (thread.aiAnalysis) {
      return res.json(thread.aiAnalysis);
    }
    
    // Generate new analysis
    const analysis = await aiSymptomAnalysisService.analyzeThread(id);
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate AI analysis' });
  }
});

// Symptom checker endpoint
threadRouter.post('/symptom-checker', async (req, res) => {
  try {
    const symptoms = req.body;
    const analysis = await aiSymptomAnalysisService.analyzeSymptoms({ symptoms });
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: 'Failed to analyze symptoms' });
  }
});

export default threadRouter;
