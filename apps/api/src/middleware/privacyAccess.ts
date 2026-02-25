import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { checkPrivatePostAccess, PrivacyAccessResult } from '../utils/privacyCheck';

const prisma = new PrismaClient();

// Extend Express Request to include privacy access result
declare global {
  namespace Express {
    interface Request {
      privacyAccess?: PrivacyAccessResult;
    }
  }
}

/**
 * Middleware to check access to private posts
 * Attaches privacy access result to request object
 * Returns 404 if access is denied (to avoid information leakage)
 */
export async function requirePrivatePostAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const postId = req.params.id || req.params.postId;

    if (!postId) {
      return res.status(400).json({
        success: false,
        error: 'Post ID is required',
      });
    }

    // Fetch post with minimal data
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
        isPrivate: true,
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    // Get user from request (set by auth middleware)
    const user = (req as any).user
      ? {
          id: (req as any).user.id,
          role: (req as any).user.role,
          doctorVerificationStatus: (req as any).user.doctorVerificationStatus,
        }
      : null;

    // Check access
    const accessResult = checkPrivatePostAccess(user, post);

    if (!accessResult.hasAccess) {
      // Return 404 instead of 403 to avoid leaking information about private post existence
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    // Attach access result to request for use in route handlers
    req.privacyAccess = accessResult;

    next();
  } catch (error) {
    console.error('Privacy access check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
