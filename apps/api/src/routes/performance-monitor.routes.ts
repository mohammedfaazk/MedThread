import { Router, Request, Response } from 'express';
import { performanceMonitorService } from '../services/performance-monitor.service';
import { authenticate, AuthRequest } from '../middleware/auth.refactored';

const router = Router();

router.get('/health', async (req: AuthRequest, res: Response) => {
  try {
    const health = await performanceMonitorService.performHealthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Health check failed' });
  }
});

router.get('/metrics', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, since, limit } = req.query;
    const metrics = performanceMonitorService.getMetrics({
      name: name as string,
      since: since ? new Date(since as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    });
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Fetch failed' });
  }
});

router.get('/stats/:metricName', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { timeWindow } = req.query;
    const stats = performanceMonitorService.getPerformanceStats(
      req.params.metricName,
      timeWindow ? parseInt(timeWindow as string) : undefined
    );
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Stats fetch failed' });
  }
});

export default router;
