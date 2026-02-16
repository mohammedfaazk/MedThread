import { Request, Response, NextFunction } from 'express';
import { prisma } from '@medthread/database';

/**
 * Middleware to check if user is a verified doctor
 * Allows:
 * - Patients and other non-doctor roles (full access)
 * - Doctors with APPROVED verification status
 * 
 * Blocks:
 * - Doctors with PENDING, UNDER_REVIEW, REJECTED, or SUSPENDED status
 * - Doctors without verification status
 */
export async function requireVerifiedDoctor(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Get user with verification status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        doctorVerificationStatus: true,
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user is a doctor
    const isDoctorRole = user.role === 'DOCTOR' || user.role === 'VERIFIED_DOCTOR';

    // If not a doctor role, allow access (patients, nurses, etc. can post/comment)
    if (!isDoctorRole) {
      return next();
    }

    // If doctor role, check verification status
    if (!user.doctorVerificationStatus || user.doctorVerificationStatus !== 'APPROVED') {
      return res.status(403).json({
        success: false,
        error: 'Doctor verification required',
        message: 'Your doctor account must be verified before you can post or comment. Please complete the verification process.',
        verificationStatus: user.doctorVerificationStatus || 'NOT_SUBMITTED',
        action: 'Please visit the doctor verification page to submit your credentials.'
      });
    }

    // Doctor is verified, allow access
    next();
  } catch (error) {
    console.error('Error in requireVerifiedDoctor middleware:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

/**
 * Middleware variant that only checks for write operations
 * Use this for endpoints that should allow reading but not writing
 */
export function requireVerifiedDoctorForWrite(req: Request, res: Response, next: NextFunction) {
  // Only apply verification check for POST, PUT, PATCH, DELETE
  const writeOperations = ['POST', 'PUT', 'PATCH', 'DELETE'];
  
  if (writeOperations.includes(req.method)) {
    return requireVerifiedDoctor(req, res, next);
  }
  
  // For GET requests, allow access
  next();
}
