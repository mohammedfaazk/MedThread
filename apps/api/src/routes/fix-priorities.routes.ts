import { Router } from 'express';
import { prisma } from '@medthread/database';
import { postPriorityService } from '../services/post-priority.service';
import { authenticate } from '../middleware/auth.refactored';

export const fixPrioritiesRouter = Router();

/**
 * POST /api/fix-priorities/post/:id
 * Manually re-analyze priority for a specific post
 */
fixPrioritiesRouter.post('/post/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Get the post
    const post = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: true,
        priority: true,
      }
    });

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    console.log(`[Fix Priority] Analyzing post: "${post.title}"`);

    // Re-analyze priority
    const result = await postPriorityService.analyzePostPriority(
      post.id,
      post.title,
      post.content || ''
    );

    console.log(`[Fix Priority] Result: ${result.priorityLevel} (score: ${result.urgencyScore})`);

    // Fetch updated post
    const updatedPost = await prisma.post.findUnique({
      where: { id },
      include: {
        priority: true,
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            role: true,
            verified: true,
          }
        },
        community: {
          select: {
            id: true,
            name: true,
            icon: true,
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Priority re-analyzed successfully',
      data: {
        post: updatedPost,
        analysis: result
      }
    });

  } catch (error) {
    console.error('[Fix Priority] Error:', error);
    res.status(500).json({ success: false, error: 'Failed to re-analyze priority' });
  }
});

/**
 * POST /api/fix-priorities/bulk
 * Re-analyze priorities for all posts (admin only)
 */
fixPrioritiesRouter.post('/bulk', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.userRole !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { limit = 100 } = req.body;

    console.log(`[Fix Priority] Starting bulk analysis (limit: ${limit})`);

    const result = await postPriorityService.bulkAnalyzePosts(limit);

    res.json({
      success: true,
      message: `Analyzed ${result.analyzed} posts`,
      data: result
    });

  } catch (error) {
    console.error('[Fix Priority] Bulk analysis error:', error);
    res.status(500).json({ success: false, error: 'Failed to bulk analyze priorities' });
  }
});

/**
 * GET /api/fix-priorities/stats
 * Get priority distribution statistics
 */
fixPrioritiesRouter.get('/stats', async (req, res) => {
  try {
    const stats = await postPriorityService.getPriorityStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('[Fix Priority] Stats error:', error);
    res.status(500).json({ success: false, error: 'Failed to get priority stats' });
  }
});

export default fixPrioritiesRouter;
