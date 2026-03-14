import { Router } from 'express';
import { adminUserActivityService } from '../services/admin-user-activity.service';
import { authenticate, requireRole } from '../middleware/auth.refactored';

const router = Router();

/**
 * GET /api/admin-user-activity/user/:userId
 * Get user activity time graphs (admin only)
 */
router.get('/user/:userId', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe } = req.query;
    
    const data = await adminUserActivityService.getUserActivityTimeGraphs(
      userId,
      (timeframe as 'hourly' | 'weekly') || 'hourly'
    );
    
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching user activity graphs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/admin-user-activity/compare
 * Compare activity between multiple users (admin only)
 */
router.post('/compare', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const { userIds, timeframe } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'userIds must be a non-empty array' 
      });
    }
    
    const data = await adminUserActivityService.compareUserActivities(
      userIds,
      timeframe || 'hourly'
    );
    
    res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error comparing user activities:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;