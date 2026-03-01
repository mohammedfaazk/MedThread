import { Router } from 'express';
import { authenticate as auth } from '../middleware/auth';
import { requireVerifiedDoctor } from '../middleware/requireVerifiedDoctor';
import { commentService } from '../services/comment.service';
import { checkPrivatePostAccess } from '../utils/privacyCheck';
import { prisma } from '@medthread/database';

const router = Router();

// Create comment - requires authentication (all authenticated users can comment)
router.post('/', auth, async (req, res, next) => {
  try {
    const { content, postId, parentId } = req.body;

    if (!content || !postId) {
      return res.status(400).json({ error: 'Content and postId are required' });
    }

    // Check if post exists and get privacy status
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, isPrivate: true, authorId: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check privacy access for private posts
    if (post.isPrivate) {
      const userId = req.userId!;
      
      // Fetch full user data for privacy check
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true, 
          role: true, 
          doctorVerificationStatus: true 
        }
      });
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      const accessResult = checkPrivatePostAccess(user, post);
      
      if (!accessResult.hasAccess) {
        console.log('[Comments] Access denied:', accessResult.reason);
        return res.status(404).json({ error: 'Post not found' });
      }
      
      console.log('[Comments] Access granted:', accessResult.reason);
    }

    const comment = await commentService.createComment({
      content,
      authorId: req.userId!,
      postId,
      parentId,
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
});

// Get comments by post
router.get('/', async (req, res, next) => {
  try {
    const { postId } = req.query;

    if (!postId) {
      return res.status(400).json({ error: 'postId is required' });
    }

    // Extract userId from token if provided (optional auth)
    let userId: string | undefined;
    let user: any = null;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
        userId = decoded.userId;
        
        // Fetch full user data for privacy check
        user = await prisma.user.findUnique({
          where: { id: userId },
          select: { 
            id: true, 
            role: true, 
            doctorVerificationStatus: true 
          }
        });
      } catch (error) {
        // Invalid token, continue without userId
      }
    }

    // Get post to check privacy
    const post = await prisma.post.findUnique({
      where: { id: postId as string },
      select: { id: true, isPrivate: true, authorId: true }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check privacy access
    let filterForPrivacy = undefined;
    if (post.isPrivate && user) {
      const accessResult = checkPrivatePostAccess(user, post);
      
      if (!accessResult.hasAccess) {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      // Pass privacy filtering info to service
      filterForPrivacy = {
        isPostPrivate: post.isPrivate,
        isAuthor: accessResult.isAuthor,
        shouldFilterReplies: accessResult.shouldFilterReplies
      };
    }

    const comments = await commentService.getCommentsByPost(
      postId as string, 
      userId,
      filterForPrivacy
    );

    res.json(comments);
  } catch (error) {
    next(error);
  }
});

// Update comment - requires authentication (users can only update their own comments)
router.put('/:id', auth, async (req, res, next) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const comment = await commentService.updateComment(req.params.id, req.userId!, content);
    res.json(comment);
  } catch (error) {
    next(error);
  }
});

// Delete comment - requires authentication (users can only delete their own comments)
router.delete('/:id', auth, async (req, res, next) => {
  try {
    await commentService.deleteComment(req.params.id, req.userId!);
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
});

// Vote on comment - requires authentication (all authenticated users can vote)
router.post('/:id/vote', auth, async (req, res, next) => {
  try {
    const { value } = req.body;

    if (value !== 1 && value !== -1) {
      return res.status(400).json({ error: 'Vote value must be 1 or -1' });
    }

    const result = await commentService.voteComment(req.params.id, req.userId!, value);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
