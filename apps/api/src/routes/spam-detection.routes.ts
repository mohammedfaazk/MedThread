import { Router, Response } from 'express';
import { spamDetectionService } from '../services/spam-detection.service';
import { authenticate, AuthRequest } from '../middleware/auth.refactored';

const router = Router();

router.post('/check', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { content, contentType } = req.body;
    const result = await spamDetectionService.checkSpam(content, req.userId!, contentType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Check failed' });
  }
});

router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await spamDetectionService.getSpamStats(req.userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Stats failed' });
  }
});

export default router;
