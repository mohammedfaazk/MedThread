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
    
    res.json(reply);
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

export default replyRouter;
