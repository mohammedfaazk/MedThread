import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  console.log('[AUTH] Authorization header:', authHeader ? 'Present' : 'Missing');
  
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    console.log('[AUTH] No token found in request');
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const secret = process.env.JWT_SECRET || 'secret';
    console.log('[AUTH] Verifying token with secret length:', secret.length);
    const decoded = jwt.verify(token, secret) as any;
    console.log('[AUTH] Token verified successfully for user:', decoded.userId);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error: any) {
    console.log('[AUTH] Token verification failed:', error.message);
    res.status(401).json({ error: 'Invalid token', details: error.message });
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
