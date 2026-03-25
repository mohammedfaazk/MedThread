import express from 'express';
import { authenticate } from '../middleware/auth';
import { successStoriesService } from '../services/success-stories.service';

const router = express.Router();

// Get all approved stories
router.get('/', async (req, res) => {
  try {
    const filters = {
      condition: req.query.condition as string,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20
    };

    const result = await successStoriesService.getStories(filters);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get featured stories
router.get('/featured', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const stories = await successStoriesService.getFeaturedStories(limit);
    res.json({ success: true, data: stories });
  } catch (error: any) {
    console.error('Error fetching featured stories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get pending stories (moderator only)
router.get('/pending', authenticate, async (req, res) => {
  try {
    if ((req as any).userRole !== 'ADMIN' && (req as any).userRole !== 'DOCTOR') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const stories = await successStoriesService.getPendingStories();
    res.json({ success: true, data: stories });
  } catch (error: any) {
    console.error('Error fetching pending stories:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single story
router.get('/:id', async (req, res) => {
  try {
    const story = await successStoriesService.getStory(req.params.id);
    
    if (!story) {
      return res.status(404).json({ success: false, error: 'Story not found' });
    }

    res.json({ success: true, data: story });
  } catch (error: any) {
    console.error('Error fetching story:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create story
router.post('/', authenticate, async (req, res) => {
  try {
    const data = {
      ...req.body,
      authorId: (req as any).userId
    };

    const story = await successStoriesService.createStory(data);
    res.json({ success: true, data: story });
  } catch (error: any) {
    console.error('Error creating story:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Like story
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const result = await successStoriesService.likeStory(req.params.id, (req as any).userId);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error liking story:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add comment
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Comment content required' });
    }

    const comment = await successStoriesService.addComment(req.params.id, (req as any).userId, content);
    res.json({ success: true, data: comment });
  } catch (error: any) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Approve story (moderator only)
router.post('/:id/approve', authenticate, async (req, res) => {
  try {
    if ((req as any).userRole !== 'ADMIN' && (req as any).userRole !== 'DOCTOR') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const story = await successStoriesService.approveStory(req.params.id, (req as any).userId);
    res.json({ success: true, data: story });
  } catch (error: any) {
    console.error('Error approving story:', error);
    res.status(403).json({ success: false, error: error.message });
  }
});

// Reject story (moderator only)
router.post('/:id/reject', authenticate, async (req, res) => {
  try {
    if ((req as any).userRole !== 'ADMIN' && (req as any).userRole !== 'DOCTOR') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ success: false, error: 'Rejection reason required' });
    }

    const story = await successStoriesService.rejectStory(req.params.id, (req as any).userId, reason);
    res.json({ success: true, data: story });
  } catch (error: any) {
    console.error('Error rejecting story:', error);
    res.status(403).json({ success: false, error: error.message });
  }
});

// Verify story (admin only)
router.post('/:id/verify', authenticate, async (req, res) => {
  try {
    if ((req as any).userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const story = await successStoriesService.verifyStory(req.params.id, (req as any).userId);
    res.json({ success: true, data: story });
  } catch (error: any) {
    console.error('Error verifying story:', error);
    res.status(403).json({ success: false, error: error.message });
  }
});

export default router;
