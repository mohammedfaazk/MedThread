import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { karmaService } from '../services/karma.service';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * GET /api/v1/karma/me
 * Get current user's karma breakdown
 */
router.get('/me', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const karma = await karmaService.getUserKarma(req.userId!);
  
  res.json({
    success: true,
    data: karma
  });
}));

/**
 * GET /api/v1/karma/user/:userId
 * Get specific user's karma breakdown
 */
router.get('/user/:userId', asyncHandler(async (req: Request, res: Response) => {
  const karma = await karmaService.getUserKarma(req.params.userId);
  
  res.json({
    success: true,
    data: karma
  });
}));

/**
 * POST /api/v1/karma/update/:userId
 * Manually trigger karma recalculation (admin only or self)
 */
router.post('/update/:userId', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const targetUserId = req.params.userId;
  
  // Only allow users to update their own karma or admins to update anyone's
  if (req.userId !== targetUserId && req.userRole !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Can only update your own karma'
    });
  }

  const karma = await karmaService.updateUserKarma(targetUserId);
  
  res.json({
    success: true,
    message: 'Karma updated successfully',
    data: karma
  });
}));

/**
 * GET /api/v1/karma/leaderboard
 * Get global karma leaderboard
 */
router.get('/leaderboard', asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const offset = parseInt(req.query.offset as string) || 0;
  
  const leaderboard = await karmaService.getLeaderboard(limit, offset);
  
  res.json({
    success: true,
    data: leaderboard
  });
}));

/**
 * GET /api/v1/karma/leaderboard/doctors
 * Get doctor karma leaderboard
 */
router.get('/leaderboard/doctors', asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const offset = parseInt(req.query.offset as string) || 0;
  
  const leaderboard = await karmaService.getDoctorLeaderboard(limit, offset);
  
  res.json({
    success: true,
    data: leaderboard
  });
}));

/**
 * GET /api/v1/karma/leaderboard/specialty/:specialty
 * Get specialty-specific leaderboard
 */
router.get('/leaderboard/specialty/:specialty', asyncHandler(async (req: Request, res: Response) => {
  const specialty = req.params.specialty;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
  const offset = parseInt(req.query.offset as string) || 0;
  
  const leaderboard = await karmaService.getSpecialtyLeaderboard(specialty, limit, offset);
  
  res.json({
    success: true,
    data: leaderboard
  });
}));

/**
 * GET /api/v1/karma/rank/me
 * Get current user's karma rank
 */
router.get('/rank/me', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const rank = await karmaService.getUserRank(req.userId!);
  
  res.json({
    success: true,
    data: rank
  });
}));

/**
 * GET /api/v1/karma/rank/:userId
 * Get specific user's karma rank
 */
router.get('/rank/:userId', asyncHandler(async (req: Request, res: Response) => {
  const rank = await karmaService.getUserRank(req.params.userId);
  
  res.json({
    success: true,
    data: rank
  });
}));

/**
 * GET /api/v1/karma/milestones
 * Get all karma milestones
 */
router.get('/milestones', asyncHandler(async (req: Request, res: Response) => {
  const milestones = karmaService.getAllMilestones();
  
  res.json({
    success: true,
    data: milestones
  });
}));

/**
 * GET /api/v1/karma/stats
 * Get platform-wide karma statistics
 */
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  const stats = await karmaService.getKarmaStats();
  
  res.json({
    success: true,
    data: stats
  });
}));

export default router;
