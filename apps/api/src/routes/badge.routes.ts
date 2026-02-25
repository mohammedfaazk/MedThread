import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { badgeService } from '../services/badge.service';

const router = Router();

/**
 * Get all available badges
 * GET /api/badges
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const badges = badgeService.getAllBadges();
    
    res.json({
      success: true,
      data: badges
    });
  })
);

/**
 * Get user's badges
 * GET /api/badges/user/:userId
 */
router.get(
  '/user/:userId',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    
    const badges = await badgeService.getUserBadges(userId);
    
    res.json({
      success: true,
      data: badges
    });
  })
);

/**
 * Get current user's badges
 * GET /api/badges/me
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    
    const badges = await badgeService.getUserBadges(userId);
    
    res.json({
      success: true,
      data: badges
    });
  })
);

/**
 * Get user's badge statistics
 * GET /api/badges/user/:userId/stats
 */
router.get(
  '/user/:userId/stats',
  asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    
    const stats = await badgeService.getUserBadgeStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  })
);

/**
 * Get current user's badge statistics
 * GET /api/badges/me/stats
 */
router.get(
  '/me/stats',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    
    const stats = await badgeService.getUserBadgeStats(userId);
    
    res.json({
      success: true,
      data: stats
    });
  })
);

/**
 * Manually trigger badge evaluation (for testing/admin)
 * POST /api/badges/evaluate
 */
router.post(
  '/evaluate',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    
    // Run in background
    badgeService.evaluateAllBadges(userId).catch(error => {
      console.error('[BADGE] Background evaluation failed:', error);
    });
    
    res.json({
      success: true,
      message: 'Badge evaluation started'
    });
  })
);

export { router as badgeRouter };
