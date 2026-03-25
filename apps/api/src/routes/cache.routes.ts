import { Router, Response } from 'express';
import { cacheService } from '../services/cache.service';
import { authenticate, AuthRequest } from '../middleware/auth.refactored';

const router = Router();

router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const stats = cacheService.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Stats failed' });
  }
});

router.post('/clear', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await cacheService.clear();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Clear failed' });
  }
});

export default router;
