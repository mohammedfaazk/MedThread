import { Router } from 'express';
import { platformAnalyticsService } from '../services/platform-analytics.service';
import { authenticate, requireRole } from '../middleware/auth.refactored';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * GET /api/platform-analytics/peak-usage
 * Get peak usage analytics
 */
router.get('/peak-usage', authenticate, requireRole('ADMIN'), asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  const peakUsage = await platformAnalyticsService.getPeakUsageAnalytics(
    parseInt(days as string)
  );

  res.json({ success: true, data: peakUsage });
}));

/**
 * GET /api/platform-analytics/peak-usage/public
 * Get peak usage analytics (public access)
 */
router.get('/peak-usage/public', asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  const peakUsage = await platformAnalyticsService.getPeakUsageAnalytics(
    parseInt(days as string)
  );

  res.json({ success: true, data: peakUsage });
}));

/**
 * GET /api/platform-analytics/response-times
 * Get platform response time metrics
 */
router.get('/response-times', authenticate, requireRole('ADMIN'), asyncHandler(async (req, res) => {
  const metrics = await platformAnalyticsService.getResponseTimeMetrics();

  res.json({ success: true, data: metrics });
}));

/**
 * GET /api/platform-analytics/bottlenecks
 * Detect platform bottlenecks
 */
router.get('/bottlenecks', authenticate, requireRole('ADMIN'), asyncHandler(async (req, res) => {
  const bottlenecks = await platformAnalyticsService.detectBottlenecks();

  res.json({ success: true, data: bottlenecks });
}));

/**
 * GET /api/platform-analytics/bottlenecks/public
 * Detect platform bottlenecks (public access)
 */
router.get('/bottlenecks/public', asyncHandler(async (req, res) => {
  const bottlenecks = await platformAnalyticsService.detectBottlenecks();

  res.json({ success: true, data: bottlenecks });
}));

/**
 * GET /api/platform-analytics/resource-recommendations
 * Get resource allocation recommendations
 */
router.get('/resource-recommendations', authenticate, requireRole('ADMIN'), asyncHandler(async (req, res) => {
  const recommendations = await platformAnalyticsService.getResourceRecommendations();

  res.json({ success: true, data: recommendations });
}));

/**
 * POST /api/platform-analytics/calculate-daily
 * Calculate daily metrics (Admin only, typically run via cron)
 */
router.post('/calculate-daily', authenticate, requireRole('ADMIN'), asyncHandler(async (req, res) => {
  const { date } = req.body;

  const metrics = await platformAnalyticsService.calculateDailyMetrics(
    date ? new Date(date) : new Date()
  );

  res.json({ success: true, data: metrics });
}));

export { router as platformAnalyticsRouter };
