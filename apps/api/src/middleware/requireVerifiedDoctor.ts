import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.refactored';
import { UnauthorizedError } from '../utils/errors';
import { prisma } from '@medthread/database';

export const requireVerifiedDoctor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      throw new UnauthorizedError('Authentication required');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        role: true,
        doctorVerificationStatus: true,
      }
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.role !== 'DOCTOR') {
      throw new UnauthorizedError('Doctor role required');
    }

    if (user.doctorVerificationStatus !== 'APPROVED') {
      throw new UnauthorizedError(
        'Doctor verification required. Your account is pending verification.'
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
