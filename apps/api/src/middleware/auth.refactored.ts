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
    
    console.log('[AUTH] Authenticating request:', {
      path: req.path,
      method: req.method,
      hasToken: !!token,
      authHeader: req.headers.authorization ? 'present' : 'missing',
      authHeaderValue: req.headers.authorization ? req.headers.authorization.substring(0, 50) + '...' : 'none',
      cookies: req.cookies ? Object.keys(req.cookies) : 'no cookies',
      jwtSecret: config.jwtSecret ? config.jwtSecret.substring(0, 20) + '...' : 'NOT SET'
    });
    
    if (!token) {
      console.log('[AUTH] No token found - throwing UnauthorizedError');
      throw new UnauthorizedError('No token provided');
    }
    
    console.log('[AUTH] Token found, verifying with secret:', config.jwtSecret.substring(0, 20) + '...');
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    
    console.log('[AUTH] Token verified for user:', decoded.userId);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    
    next();
  } catch (error: any) {
    console.log('[AUTH] Error:', {
      type: error.constructor.name,
      message: error.message,
      jwtSecret: config.jwtSecret ? config.jwtSecret.substring(0, 20) + '...' : 'NOT SET'
    });
    
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
    }
    
    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};
