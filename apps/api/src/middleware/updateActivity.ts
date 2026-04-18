import { Request, Response, NextFunction } from 'express';
import { prisma } from '@medthread/database';
import jwt from 'jsonwebtoken';
import { config } from '../config';

/**
 * Middleware to update user's last activity timestamp on any authenticated request
 * This keeps the updatedAt field fresh for active users
 */
export const updateUserActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Try to get token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.cookies?.auth_token;

    if (token) {
      try {
        // Verify and decode token
        const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
        
        if (decoded.userId) {
          // Update user's updatedAt timestamp asynchronously (don't block the request)
          prisma.user.update({
            where: { id: decoded.userId },
            data: { updatedAt: new Date() }
          }).then(() => {
            console.log(`✅ Updated activity for user: ${decoded.userId}`);
          }).catch(err => {
            // Log error but don't fail the request
            console.error('⚠️ Failed to update user activity:', err);
          });
        }
      } catch (jwtError) {
        // Invalid token - silently ignore
      }
    }
  } catch (error) {
    // Silently fail - don't block the request
    // console.error('⚠️ Error in updateUserActivity middleware:', error);
  }
  
  next();
};
