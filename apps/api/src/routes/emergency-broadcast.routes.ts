import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.refactored';
import { emergencyBroadcastService } from '../services/emergency-broadcast.service';

const router = Router();

/**
 * POST /api/emergency-broadcast
 * Create new emergency broadcast (Admin only)
 */
router.post('/', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const adminId = (req as any).userId;
    const { title, message, priority, type, targetAudience, targetRegion, expiresAt } = req.body;

    if (!title || !message || !priority || !type) {
      return res.status(400).json({
        success: false,
        error: 'Title, message, priority, and type are required'
      });
    }

    const broadcast = await emergencyBroadcastService.createBroadcast(adminId, {
      title,
      message,
      priority,
      type,
      targetAudience,
      targetRegion,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    res.json({ success: true, data: broadcast });
  } catch (error: any) {
    console.error('Error creating broadcast:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/emergency-broadcast/active
 * Get all active broadcasts (Public)
 */
router.get('/active', async (req, res) => {
  try {
    const broadcasts = await emergencyBroadcastService.getActiveBroadcasts();
    res.json({ success: true, data: broadcasts });
  } catch (error: any) {
    console.error('Error getting active broadcasts:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/emergency-broadcast/history
 * Get broadcast history (Admin only)
 */
router.get('/history', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await emergencyBroadcastService.getBroadcastHistory(page, limit);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error getting broadcast history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/emergency-broadcast/:id
 * Deactivate a broadcast (Admin only)
 */
router.delete('/:id', authenticate, requireRole('ADMIN'), async (req, res) => {
  try {
    const adminId = (req as any).userId;
    const { id } = req.params;

    const broadcast = await emergencyBroadcastService.deactivateBroadcast(id, adminId);
    res.json({ success: true, data: broadcast });
  } catch (error: any) {
    console.error('Error deactivating broadcast:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
