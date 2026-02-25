import { Router, Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service';
import { sessionService } from '../services/session.service';
import { authenticate, AuthRequest } from '../middleware/auth.refactored';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * POST /api/analytics/event
 * Track custom event
 */
router.post('/event', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { eventName, eventCategory, properties, sessionId, page } = req.body;

  if (!eventName || !eventCategory || !sessionId) {
    return res.status(400).json({
      success: false,
      error: 'eventName, eventCategory, and sessionId are required',
    });
  }

  // Ensure session exists
  await sessionService.createSession(sessionId, req.userId, {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  await analyticsService.trackEvent({
    eventName,
    eventCategory,
    userId: req.userId,
    sessionId,
    properties,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    referrer: req.headers.referer,
    page,
  });

  res.json({ success: true });
}));

/**
 * POST /api/analytics/pageview
 * Track page view
 */
router.post('/pageview', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, title, sessionId, referrer, duration } = req.body;

  if (!page || !sessionId) {
    return res.status(400).json({
      success: false,
      error: 'page and sessionId are required',
    });
  }

  // Ensure session exists
  await sessionService.createSession(sessionId, req.userId, {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  await analyticsService.trackPageView({
    userId: req.userId,
    sessionId,
    page,
    title,
    referrer,
    duration,
  });

  res.json({ success: true });
}));

/**
 * POST /api/analytics/conversion
 * Track conversion event
 */
router.post('/conversion', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { conversionType, value, metadata, sessionId } = req.body;

  if (!conversionType || !sessionId) {
    return res.status(400).json({
      success: false,
      error: 'conversionType and sessionId are required',
    });
  }

  await analyticsService.trackConversion({
    userId: req.userId,
    sessionId,
    conversionType,
    value,
    metadata,
  });

  res.json({ success: true });
}));

/**
 * POST /api/analytics/post-view/:postId
 * Track post view
 */
router.post('/post-view/:postId', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { postId } = req.params;

  await analyticsService.trackPostView(postId, req.userId);

  res.json({ success: true });
}));

/**
 * GET /api/analytics/user/:userId
 * Get user analytics
 */
router.get('/user/:userId', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  // Only allow users to view their own analytics or admins
  if (req.userId !== userId && req.userRole !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
    });
  }

  const analytics = await analyticsService.getUserAnalytics(userId);

  res.json({
    success: true,
    data: analytics,
  });
}));

/**
 * GET /api/analytics/post/:postId
 * Get post analytics
 */
router.get('/post/:postId', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { postId } = req.params;

  const analytics = await analyticsService.getPostAnalytics(postId);

  res.json({
    success: true,
    data: analytics,
  });
}));

/**
 * GET /api/analytics/dashboard
 * Get dashboard analytics (Admin only)
 */
router.get('/dashboard', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
  }

  const { startDate, endDate } = req.query;

  const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate as string) : new Date();

  const analytics = await analyticsService.getDashboardAnalytics(start, end);

  res.json({
    success: true,
    data: analytics,
  });
}));

export { router as analyticsRouter };


