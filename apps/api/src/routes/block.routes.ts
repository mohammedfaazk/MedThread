import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { blockService } from '../services/block.service';

const router = Router();

/**
 * Block a user
 * POST /api/block/:userId
 */
router.post(
  '/:userId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const blockerId = req.userId!;
    const { userId: blockedId } = req.params;

    try {
      const block = await blockService.blockUser(blockerId, blockedId);

      res.status(201).json({
        success: true,
        data: block,
        message: 'User blocked successfully',
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  })
);

/**
 * Unblock a user
 * DELETE /api/block/:userId
 */
router.delete(
  '/:userId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const blockerId = req.userId!;
    const { userId: blockedId } = req.params;

    try {
      await blockService.unblockUser(blockerId, blockedId);

      res.json({
        success: true,
        message: 'User unblocked successfully',
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  })
);

/**
 * Check if user is blocked
 * GET /api/block/:userId/check
 */
router.get(
  '/:userId/check',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const currentUserId = req.userId!;
    const { userId: targetUserId } = req.params;

    const isBlocked = await blockService.isBlocked(currentUserId, targetUserId);
    const hasBlock = await blockService.hasBlockBetween(currentUserId, targetUserId);

    res.json({
      success: true,
      data: {
        isBlocked, // Current user blocked target
        hasBlock, // Any block exists between users
      },
    });
  })
);

/**
 * Get blocked users list
 * GET /api/block/list
 */
router.get(
  '/list',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.userId!;
    const { cursor, limit } = req.query;

    const result = await blockService.getBlockedUsers(
      userId,
      cursor as string | undefined,
      limit ? parseInt(limit as string) : 20
    );

    res.json({
      success: true,
      data: result.blocks,
      pagination: result.pagination,
    });
  })
);

export { router as blockRouter };
