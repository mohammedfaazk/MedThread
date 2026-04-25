import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/errors';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  user?: {
    id: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('[AUTH] Authorization header:', authHeader ? 'Present' : 'Missing');
    
    const token = authHeader?.split(' ')[1];
    
    if (!token) {
      console.log('[AUTH] No token found in request');
      throw new UnauthorizedError('Authentication required');
    }
    
    const secret = process.env.JWT_SECRET || 'dev-secret-change-in-production';
    console.log('[AUTH] Verifying token with secret:', secret.substring(0, 20) + '...');
    const decoded = jwt.verify(token, secret) as any;
    console.log('[AUTH] Token verified successfully for user:', decoded.userId);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    // Also set req.user for compatibility with route handlers
    req.user = {
      id: decoded.userId,
      role: decoded.role
    };
    next();
  } catch (error: any) {
    console.log('[AUTH] Token verification failed:', error.message);
    if (error instanceof UnauthorizedError) {
      next(error);
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else {
      next(error);
    }
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
