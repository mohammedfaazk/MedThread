import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { blockService } from '../services/block.service';

/**
 * Middleware to check if there's a block between current user and target user
 * Attach to routes that involve user-to-user interactions
 */
export const checkBlock = (targetUserIdParam: string = 'userId') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const currentUserId = req.userId;
      const targetUserId = req.params[targetUserIdParam] || req.body[targetUserIdParam];

      if (!currentUserId || !targetUserId) {
        return next();
      }

      // Skip check if same user
      if (currentUserId === targetUserId) {
        return next();
      }

      const hasBlock = await blockService.hasBlockBetween(currentUserId, targetUserId);

      if (hasBlock) {
        return res.status(403).json({
          success: false,
          error: 'Cannot interact with this user due to blocking',
        });
      }

      next();
    } catch (error) {
      console.error('[BLOCK_CHECK] Error:', error);
      next(); // Continue on error to avoid breaking the app
    }
  };
};

/**
 * Attach blocked user IDs to request for query filtering
 */
export const attachBlockedUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUserId = req.userId;

    if (!currentUserId) {
      return next();
    }

    const blockedUserIds = await blockService.getBlockedUserIds(currentUserId);
    req.blockedUserIds = blockedUserIds;

    next();
  } catch (error) {
    console.error('[ATTACH_BLOCKED] Error:', error);
    req.blockedUserIds = [];
    next();
  }
};

// Extend AuthRequest interface
declare module './auth' {
  interface AuthRequest {
    blockedUserIds?: string[];
  }
}
