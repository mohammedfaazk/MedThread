import { Router, Request, Response } from 'express';
import { contentModerationService } from '../services/content-moderation.service';
import { authenticate, AuthRequest } from '../middleware/auth.refactored';

const router = Router();

router.post('/moderate', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { content, contentType } = req.body;
    const result = await contentModerationService.moderateContent(content, req.userId, contentType);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Moderation failed' });
  }
});

router.post('/analyze-sentiment', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;
    const result = await contentModerationService.analyzeSentiment(text);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Analysis failed' });
  }
});

router.get('/queue', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { action, page = 1, limit = 20 } = req.query;
    const result = await contentModerationService.getModerationQueue({
      action: action as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get queue' });
  }
});

router.post('/flag/:postId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    await contentModerationService.autoFlagContent(req.params.postId, reason);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Flag failed' });
  }
});

export default router;
