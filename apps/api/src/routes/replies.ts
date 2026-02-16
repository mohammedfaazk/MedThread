import { Router } from 'express';
import { prisma } from '@medthread/database';
import { z } from 'zod';

export const replyRouter = Router();

const createReplySchema = z.object({
  threadId: z.string(),
  parentReplyId: z.string().optional(),
  authorId: z.string(),
  content: z.string().min(10)
});

replyRouter.post('/', async (req, res) => {
  try {
    const data = createReplySchema.parse(req.body);
    
    const author = await prisma.user.findUnique({
      where: { id: data.authorId },
      select: {
        id: true,
        role: true,
        doctorVerificationStatus: true,
      }
    });
    
    if (!author) {
      return res.status(404).json({ error: 'Author not found' });
    }
    
    // Check if doctor is trying to reply without verification
    if (author.role === 'DOCTOR' && author.doctorVerificationStatus !== 'APPROVED') {
      return res.status(403).json({ 
        error: 'Doctor verification required',
        message: 'Your doctor account must be verified before you can post replies.'
      });
    }
    
    // Determine if this is a verified doctor reply
    const isDoctorVerified = author.role === 'DOCTOR' && author.doctorVerificationStatus === 'APPROVED';
    
    const reply = await prisma.threadReply.create({
      data: {
        threadId: data.threadId,
        parentReplyId: data.parentReplyId,
        authorId: data.authorId,
        authorRole: author.role,
        content: data.content,
        doctorVerified: isDoctorVerified
      }
    });
    
    // Create timeline event
    await prisma.caseTimelineEvent.create({
      data: {
        threadId: data.threadId,
        eventType: 'REPLY_ADDED',
        description: `${isDoctorVerified ? 'Verified doctor' : 'User'} replied`,
        metadata: { replyId: reply.id, authorRole: author.role }
      }
    });
    
    res.json(reply);
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

// Upvote a reply
replyRouter.post('/:id/upvote', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    // Check if user already voted
    const existingVote = await prisma.vote.findFirst({
      where: {
        commentId: id,
        userId
      }
    });
    
    if (existingVote) {
      if (existingVote.value === 1) {
        // Remove upvote
        await prisma.vote.delete({ where: { id: existingVote.id } });
        await prisma.threadReply.update({
          where: { id },
          data: { upvotes: { decrement: 1 } }
        });
        return res.json({ message: 'Upvote removed', action: 'removed' });
      } else {
        // Change downvote to upvote
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value: 1 }
        });
        await prisma.threadReply.update({
          where: { id },
          data: {
            upvotes: { increment: 1 },
            downvotes: { decrement: 1 }
          }
        });
        return res.json({ message: 'Changed to upvote', action: 'changed' });
      }
    }
    
    // Create new upvote
    await prisma.vote.create({
      data: {
        commentId: id,
        userId,
        value: 1
      }
    });
    
    const reply = await prisma.threadReply.update({
      where: { id },
      data: { upvotes: { increment: 1 } }
    });
    
    res.json({ message: 'Upvoted', action: 'added', reply });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upvote' });
  }
});

// Downvote a reply
replyRouter.post('/:id/downvote', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    // Check if user already voted
    const existingVote = await prisma.vote.findFirst({
      where: {
        commentId: id,
        userId
      }
    });
    
    if (existingVote) {
      if (existingVote.value === -1) {
        // Remove downvote
        await prisma.vote.delete({ where: { id: existingVote.id } });
        await prisma.threadReply.update({
          where: { id },
          data: { downvotes: { decrement: 1 } }
        });
        return res.json({ message: 'Downvote removed', action: 'removed' });
      } else {
        // Change upvote to downvote
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value: -1 }
        });
        await prisma.threadReply.update({
          where: { id },
          data: {
            downvotes: { increment: 1 },
            upvotes: { decrement: 1 }
          }
        });
        return res.json({ message: 'Changed to downvote', action: 'changed' });
      }
    }
    
    // Create new downvote
    await prisma.vote.create({
      data: {
        commentId: id,
        userId,
        value: -1
      }
    });
    
    const reply = await prisma.threadReply.update({
      where: { id },
      data: { downvotes: { increment: 1 } }
    });
    
    res.json({ message: 'Downvoted', action: 'added', reply });
  } catch (error) {
    res.status(500).json({ error: 'Failed to downvote' });
  }
});

// Mark reply as helpful
replyRouter.post('/:id/helpful', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    const reply = await prisma.threadReply.findUnique({
      where: { id },
      include: { thread: true }
    });
    
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }
    
    // Only thread author can mark as helpful
    if (reply.thread.patientId !== userId) {
      return res.status(403).json({ error: 'Only thread author can mark replies as helpful' });
    }
    
    const updated = await prisma.threadReply.update({
      where: { id },
      data: { isHelpful: !reply.isHelpful }
    });
    
    // Create timeline event
    if (updated.isHelpful) {
      await prisma.caseTimelineEvent.create({
        data: {
          threadId: reply.threadId,
          eventType: 'HELPFUL_MARKED',
          description: 'Reply marked as helpful',
          metadata: { replyId: id }
        }
      });
    }
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as helpful' });
  }
});

// Mark reply as best answer
replyRouter.post('/:id/best-answer', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    const reply = await prisma.threadReply.findUnique({
      where: { id },
      include: { thread: true }
    });
    
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }
    
    // Only thread author can mark best answer
    if (reply.thread.patientId !== userId) {
      return res.status(403).json({ error: 'Only thread author can mark best answer' });
    }
    
    // Remove best answer from other replies
    await prisma.threadReply.updateMany({
      where: {
        threadId: reply.threadId,
        id: { not: id }
      },
      data: { isHelpful: false }
    });
    
    // Mark this as best answer
    const updated = await prisma.threadReply.update({
      where: { id },
      data: { isHelpful: true }
    });
    
    // Mark thread as resolved
    await prisma.medicalThread.update({
      where: { id: reply.threadId },
      data: {
        isResolved: true,
        status: 'RESOLVED',
        resolvedAt: new Date()
      }
    });
    
    // Create timeline event
    await prisma.caseTimelineEvent.create({
      data: {
        threadId: reply.threadId,
        eventType: 'BEST_ANSWER',
        description: 'Best answer selected',
        metadata: { replyId: id }
      }
    });
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as best answer' });
  }
});

// Get reply votes
replyRouter.get('/:id/votes', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    
    const reply = await prisma.threadReply.findUnique({
      where: { id },
      select: {
        upvotes: true,
        downvotes: true
      }
    });
    
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }
    
    let userVote = null;
    if (userId) {
      const vote = await prisma.vote.findFirst({
        where: {
          commentId: id,
          userId: userId as string
        }
      });
      userVote = vote?.value || null;
    }
    
    res.json({
      upvotes: reply.upvotes,
      downvotes: reply.downvotes,
      userVote
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
});

export default replyRouter;
