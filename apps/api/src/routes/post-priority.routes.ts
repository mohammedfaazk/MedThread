import { Router } from 'express';
import { postPriorityService } from '../services/post-priority.service';
import { authenticate, requireRole } from '../middleware/auth.refactored';

const router = Router();

/**
 * POST /api/post-priority/analyze/:postId
 * Analyze post priority (can be called when post is created)
 */
router.post('/analyze/:postId', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content } = req.body;
    
    const analysis = await postPriorityService.analyzePostPriority(postId, title, content);
    res.json({ success: true, data: analysis });
  } catch (error: any) {
    console.error('Error analyzing post priority:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/post-priority/doctor-feed
 * Get prioritized feed for doctors with urgency-based sorting
 */
router.get('/doctor-feed', authenticate, async (req, res) => {
  try {
    const { page, limit, priority, communityId } = req.query;
    
    const data = await postPriorityService.getDoctorPrioritizedFeed(
      (req as any).userId,
      {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
        priorityFilter: (priority as 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW') || 'ALL',
        communityId: communityId as string
      }
    );
    
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching doctor prioritized feed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/post-priority/stats
 * Get priority distribution statistics
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const { communityId } = req.query;
    const stats = await postPriorityService.getPriorityStats(communityId as string);
    res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Error fetching priority stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/post-priority/trending-symptoms
 * Get trending symptoms from recent high-priority posts
 */
router.get('/trending-symptoms', authenticate, async (req, res) => {
  try {
    const { days } = req.query;
    const data = await postPriorityService.getTrendingSymptoms(
      days ? parseInt(days as string) : 7
    );
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching trending symptoms:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/post-priority/bulk-analyze
 * Bulk analyze existing posts (admin only)
 */
router.post('/bulk-analyze', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { limit } = req.body;
    const result = await postPriorityService.bulkAnalyzePosts(limit);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error bulk analyzing posts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;