import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { getTokenFromRequest } from '../utils/cookies';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

interface JwtPayload {
  userId: string;
  role: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Get token from cookie or Authorization header
    const token = getTokenFromRequest(req);
    
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }
    
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
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
    if (!req.userRole) {
      return next(new UnauthorizedError('Authentication required'));
    }
    
    if (!roles.includes(req.userRole)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    
    next();
  };
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      req.userId = decoded.userId;
      req.userRole = decoded.role;
      console.log('[OptionalAuth] Authenticated user:', { userId: req.userId, userRole: req.userRole });
    } else {
      console.log('[OptionalAuth] No auth header provided - guest user');
    }
    
    next();
  } catch (error) {
    console.log('[OptionalAuth] Token verification failed:', error);
    // Silently fail for optional auth
    next();
  }
};
