import express from 'express';
import { authenticate } from '../middleware/auth';
import { qaForumService } from '../services/qa-forum.service';

const router = express.Router();

// Get all questions
router.get('/questions', async (req, res) => {
  try {
    const filters = {
      category: req.query.category as string,
      status: req.query.status as string,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20
    };

    const result = await qaForumService.getQuestions(filters);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get trending questions
router.get('/questions/trending', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const questions = await qaForumService.getTrendingQuestions(limit);
    res.json({ success: true, data: questions });
  } catch (error: any) {
    console.error('Error fetching trending questions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single question
router.get('/questions/:id', async (req, res) => {
  try {
    const question = await qaForumService.getQuestion(req.params.id);
    
    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    res.json({ success: true, data: question });
  } catch (error: any) {
    console.error('Error fetching question:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create question
router.post('/questions', authenticate, async (req, res) => {
  try {
    const data = {
      ...req.body,
      authorId: (req as any).userId
    };

    const question = await qaForumService.createQuestion(data);
    res.json({ success: true, data: question });
  } catch (error: any) {
    console.error('Error creating question:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create answer
router.post('/questions/:id/answers', authenticate, async (req, res) => {
  try {
    const data = {
      content: req.body.content,
      authorId: (req as any).userId,
      questionId: req.params.id
    };

    const answer = await qaForumService.createAnswer(data);
    res.json({ success: true, data: answer });
  } catch (error: any) {
    console.error('Error creating answer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Accept answer
router.post('/answers/:id/accept', authenticate, async (req, res) => {
  try {
    const answer = await qaForumService.acceptAnswer(req.params.id, (req as any).userId);
    res.json({ success: true, data: answer });
  } catch (error: any) {
    console.error('Error accepting answer:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Vote on question
router.post('/questions/:id/vote', authenticate, async (req, res) => {
  try {
    const { voteType } = req.body;
    
    if (!['up', 'down'].includes(voteType)) {
      return res.status(400).json({ success: false, error: 'Invalid vote type' });
    }

    await qaForumService.voteQuestion(req.params.id, (req as any).userId, voteType);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error voting question:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vote on answer
router.post('/answers/:id/vote', authenticate, async (req, res) => {
  try {
    const { voteType } = req.body;
    
    if (!['up', 'down'].includes(voteType)) {
      return res.status(400).json({ success: false, error: 'Invalid vote type' });
    }

    await qaForumService.voteAnswer(req.params.id, (req as any).userId, voteType);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error voting answer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Pin/unpin question
router.post('/questions/:id/pin', authenticate, async (req, res) => {
  try {
    const question = await qaForumService.togglePin(req.params.id, (req as any).userId);
    res.json({ success: true, data: question });
  } catch (error: any) {
    console.error('Error toggling pin:', error);
    res.status(403).json({ success: false, error: error.message });
  }
});

export default router;
