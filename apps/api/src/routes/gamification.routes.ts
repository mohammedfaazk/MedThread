import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { GamificationService } from '../services/gamification.service';

const router = Router();
const gamificationService = new GamificationService();

/**
 * Get doctor's badges
 * GET /api/gamification/badges
 */
router.get(
  '/badges',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const badges = await gamificationService.getDoctorBadges(userId);
    
    res.json({
      success: true,
      data: badges
    });
  })
);

/**
 * Get all available badges
 * GET /api/gamification/badges/all
 */
router.get(
  '/badges/all',
  asyncHandler(async (req: Request, res: Response) => {
    const badges = await gamificationService.getAllBadges();
    
    res.json({
      success: true,
      data: badges
    });
  })
);

/**
 * Get doctor's achievements
 * GET /api/gamification/achievements
 */
router.get(
  '/achievements',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const achievements = await gamificationService.getDoctorAchievements(userId);
    
    res.json({
      success: true,
      data: achievements
    });
  })
);

/**
 * Get leaderboard
 * GET /api/gamification/leaderboard
 */
router.get(
  '/leaderboard',
  asyncHandler(async (req: Request, res: Response) => {
    const { period = 'all_time', limit = '50' } = req.query;
    const leaderboard = await gamificationService.getLeaderboard(
      period as string,
      parseInt(limit as string)
    );
    
    res.json({
      success: true,
      data: leaderboard
    });
  })
);

/**
 * Get doctor's rank
 * GET /api/gamification/rank
 */
router.get(
  '/rank',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    const { leaderboard = 'weekly_top_doctors' } = req.query;
    const rank = await gamificationService.getDoctorRank(userId, leaderboard as string);
    
    res.json({
      success: true,
      data: rank
    });
  })
);

/**
 * Manually check and award badges (for testing)
 * POST /api/gamification/check-badges
 */
router.post(
  '/check-badges',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;
    await gamificationService.checkAndAwardBadges(userId);
    
    res.json({
      success: true,
      message: 'Badge check completed'
    });
  })
);

export { router as gamificationRouter };
