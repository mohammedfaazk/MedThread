import { Router } from 'express';
import { authenticate as auth } from '../middleware/auth';
import { requireVerifiedDoctor } from '../middleware/requireVerifiedDoctor';
import { commentService } from '../services/comment.service';

const router = Router();

// Create comment - requires verified doctor
router.post('/', auth, requireVerifiedDoctor, async (req, res, next) => {
  try {
    const { content, postId, parentId } = req.body;

    if (!content || !postId) {
      return res.status(400).json({ error: 'Content and postId are required' });
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
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
        userId = decoded.userId;
      } catch (error) {
        // Invalid token, continue without userId
      }
    }

    const comments = await commentService.getCommentsByPost(postId as string, userId);

    res.json(comments);
  } catch (error) {
    next(error);
  }
});

// Update comment - requires verified doctor
router.put('/:id', auth, requireVerifiedDoctor, async (req, res, next) => {
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

// Delete comment - requires verified doctor
router.delete('/:id', auth, requireVerifiedDoctor, async (req, res, next) => {
  try {
    await commentService.deleteComment(req.params.id, req.userId!);
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
});

// Vote on comment - requires verified doctor
router.post('/:id/vote', auth, requireVerifiedDoctor, async (req, res, next) => {
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
