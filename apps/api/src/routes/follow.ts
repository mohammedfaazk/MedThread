import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';
import { followService } from '../services/follow.service';

const router = Router();

/**
 * Follow a user
 * POST /api/follow/:userId
 */
router.post(
  '/:userId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const currentUserId = req.userId!;
    const { userId } = req.params;

    try {
      const follow = await followService.followUser(currentUserId, userId);

      res.status(201).json({
        success: true,
        data: follow,
        message: 'Successfully followed user',
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
 * Unfollow a user
 * DELETE /api/follow/:userId
 */
router.delete(
  '/:userId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const currentUserId = req.userId!;
    const { userId } = req.params;

    try {
      await followService.unfollowUser(currentUserId, userId);

      res.json({
        success: true,
        message: 'Successfully unfollowed user',
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
 * Check if following a user
 * GET /api/follow/:userId/check
 */
router.get(
  '/:userId/check',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const currentUserId = req.userId!;
    const { userId } = req.params;

    const isFollowing = await followService.isFollowing(currentUserId, userId);

    res.json({
      success: true,
      data: { isFollowing },
    });
  })
);

/**
 * Get followers list
 * GET /api/follow/:userId/followers
 */
router.get(
  '/:userId/followers',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const { cursor, limit } = req.query;

    const result = await followService.getFollowers(
      userId,
      cursor as string | undefined,
      limit ? parseInt(limit as string) : 20
    );

    res.json({
      success: true,
      data: result.followers,
      pagination: result.pagination,
    });
  })
);

/**
 * Get following list
 * GET /api/follow/:userId/following
 */
router.get(
  '/:userId/following',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;
    const { cursor, limit } = req.query;

    const result = await followService.getFollowing(
      userId,
      cursor as string | undefined,
      limit ? parseInt(limit as string) : 20
    );

    res.json({
      success: true,
      data: result.following,
      pagination: result.pagination,
    });
  })
);

/**
 * Get follow counts
 * GET /api/follow/:userId/counts
 */
router.get(
  '/:userId/counts',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;

    const counts = await followService.getFollowCounts(userId);

    res.json({
      success: true,
      data: counts,
    });
  })
);

/**
 * Get following feed (posts from followed users)
 * GET /api/follow/feed
 */
router.get(
  '/feed',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const currentUserId = req.userId!;
    const { cursor, limit } = req.query;

    const result = await followService.getFollowingFeed(
      currentUserId,
      cursor as string | undefined,
      limit ? parseInt(limit as string) : 20
    );

    res.json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    });
  })
);

/**
 * Get verified doctors to follow (recommendations)
 * GET /api/follow/discover
 */
router.get(
  '/discover',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const currentUserId = req.userId!;
    const { specialty, cursor, limit } = req.query;

    const result = await followService.getVerifiedDoctorsToFollow(
      currentUserId,
      specialty as string | undefined,
      cursor as string | undefined,
      limit ? parseInt(limit as string) : 20
    );

    res.json({
      success: true,
      data: result.doctors,
      pagination: result.pagination,
    });
  })
);

/**
 * Bulk check if following multiple users
 * POST /api/follow/check-multiple
 */
router.post(
  '/check-multiple',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const currentUserId = req.userId!;
    const { userIds } = req.body;

    if (!Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        error: 'userIds must be an array',
      });
    }

    const result = await followService.checkFollowingMultiple(currentUserId, userIds);

    res.json({
      success: true,
      data: result,
    });
  })
);

export { router as followRouter };

