import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { requireVerifiedDoctor } from '../middleware/requireVerifiedDoctor';
import { awardService } from '../services/award.service';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * GET /api/v1/awards
 * Get all available awards
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const awards = await awardService.getAllAwards();
  
  res.json({
    success: true,
    data: awards
  });
}));

/**
 * GET /api/v1/awards/:id
 * Get specific award details
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const award = await awardService.getAwardById(req.params.id);
  
  res.json({
    success: true,
    data: award
  });
}));

/**
 * POST /api/v1/awards
 * Create a new award (admin only)
 */
router.post('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  // Check if user is admin
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Only admins can create awards'
    });
  }

  const { name, description, icon, cost, tier, color } = req.body;

  const award = await awardService.createAward({
    name,
    description,
    icon,
    cost,
    tier,
    color
  });

  res.status(201).json({
    success: true,
    data: award
  });
}));

/**
 * POST /api/v1/awards/give
 * Give an award to a post or comment - requires verified doctor
 */
router.post('/give', authenticate, requireVerifiedDoctor, asyncHandler(async (req: Request, res: Response) => {
  const { awardId, postId, commentId } = req.body;

  const result = await awardService.giveAward({
    awardId,
    giverId: req.userId!,
    postId,
    commentId
  });

  res.json({
    success: true,
    message: 'Award given successfully',
    data: result
  });
}));

/**
 * GET /api/v1/awards/post/:postId
 * Get all awards for a specific post
 */
router.get('/post/:postId', asyncHandler(async (req: Request, res: Response) => {
  const awards = await awardService.getPostAwards(req.params.postId);
  
  res.json({
    success: true,
    data: awards
  });
}));

/**
 * GET /api/v1/awards/comment/:commentId
 * Get all awards for a specific comment
 */
router.get('/comment/:commentId', asyncHandler(async (req: Request, res: Response) => {
  const awards = await awardService.getCommentAwards(req.params.commentId);
  
  res.json({
    success: true,
    data: awards
  });
}));

/**
 * GET /api/v1/awards/user/:userId/given
 * Get awards given by a user
 */
router.get('/user/:userId/given', asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = parseInt(req.query.offset as string) || 0;

  const result = await awardService.getUserGivenAwards(req.params.userId, limit, offset);
  
  res.json({
    success: true,
    data: result
  });
}));

/**
 * GET /api/v1/awards/user/:userId/received
 * Get awards received by a user
 */
router.get('/user/:userId/received', asyncHandler(async (req: Request, res: Response) => {
  const awards = await awardService.getUserReceivedAwards(req.params.userId);
  
  res.json({
    success: true,
    data: awards
  });
}));

/**
 * GET /api/v1/awards/coins/me
 * Get current user's coin balance
 */
router.get('/coins/me', authenticate, asyncHandler(async (req: Request, res: Response) => {
  const balance = await awardService.getUserCoins(req.userId!);
  
  res.json({
    success: true,
    data: balance
  });
}));

/**
 * POST /api/v1/awards/coins/add
 * Add coins to a user (admin only or purchase)
 */
router.post('/coins/add', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId, amount, reason } = req.body;

  // Only admins can add coins to other users
  if (userId !== req.userId && req.userRole !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Can only add coins to your own account or admin required'
    });
  }

  const targetUserId = userId || req.userId!;
  const user = await awardService.addCoins(targetUserId, amount, reason);

  res.json({
    success: true,
    message: 'Coins added successfully',
    data: user
  });
}));

/**
 * GET /api/v1/awards/stats
 * Get platform-wide award statistics
 */
router.get('/stats/platform', asyncHandler(async (req: Request, res: Response) => {
  const stats = await awardService.getAwardStats();
  
  res.json({
    success: true,
    data: stats
  });
}));

/**
 * POST /api/v1/awards/initialize
 * Initialize default awards (admin only, one-time setup)
 */
router.post('/initialize', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Only admins can initialize awards'
    });
  }

  await awardService.initializeDefaultAwards();

  res.json({
    success: true,
    message: 'Default awards initialized'
  });
}));

export default router;


