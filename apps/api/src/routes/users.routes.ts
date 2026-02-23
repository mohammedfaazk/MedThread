import { Router } from 'express';
import { prisma } from '@medthread/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

/**
 * Get user by username
 * GET /api/users/by-username/:username
 */
router.get(
  '/by-username/:username',
  asyncHandler(async (req, res) => {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        avatar: true,
        banner: true,
        bio: true,
        role: true,
        specialty: true,
        doctorVerificationStatus: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            followers: true,
            following: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  })
);

export { router as usersRouter };
