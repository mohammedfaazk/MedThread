import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.refactored';
import { ForbiddenError } from '../utils/errors';

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.userRole || req.userRole !== 'ADMIN') {
    return next(new ForbiddenError('Admin access required'));
  }
  next();
};
