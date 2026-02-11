import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.refactored';
import { doctorVerificationService } from '../services/doctor-verification.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { z } from 'zod';

const submitVerificationSchema = z.object({
  medicalLicenseNumber: z.string().min(5, 'License number is required'),
  licenseIssuingAuthority: z.string().min(3, 'Issuing authority is required'),
  licenseExpiryDate: z.string().transform(str => new Date(str)),
  specialty: z.string().min(3, 'Specialty is required'),
  subSpecialty: z.string().optional(),
  yearsOfExperience: z.number().min(0).max(70),
  hospitalAffiliation: z.string().optional(),
  clinicAddress: z.string().optional(),
  documents: z.object({
    idProof: z.string().min(10, 'ID proof is required'),
    medicalDegree: z.string().min(10, 'Medical degree is required'),
    licenseDocument: z.string().min(10, 'License document is required'),
    additionalCertificates: z.array(z.string()).optional(),
  }),
});

export class DoctorVerificationController {
  /**
   * Doctor submits verification request
   */
  submitVerification = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const validatedData = submitVerificationSchema.parse(req.body);
    const { documents, ...registrationData } = validatedData;

    const result = await doctorVerificationService.submitVerificationRequest(
      req.userId,
      registrationData,
      documents
    );

    res.status(200).json({
      success: true,
      data: result,
      message: 'Verification request submitted successfully'
    });
  });

  /**
   * Get pending verifications (Admin only)
   */
  getPendingVerifications = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await doctorVerificationService.getPendingVerifications(page, limit);

    res.status(200).json({
      success: true,
      data: result
    });
  });

  /**
   * Get verified doctors
   */
  getVerifiedDoctors = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await doctorVerificationService.getVerifiedDoctors(page, limit);

    res.status(200).json({
      success: true,
      data: result
    });
  });

  /**
   * Get verification details (Admin only)
   */
  getVerificationDetails = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;

    const result = await doctorVerificationService.getVerificationDetails(userId);

    res.status(200).json({
      success: true,
      data: result
    });
  });

  /**
   * Approve verification (Admin only)
   */
  approveVerification = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { userId } = req.params;
    const { notes } = req.body;

    const result = await doctorVerificationService.approveVerification(
      userId,
      req.userId,
      notes
    );

    res.status(200).json({
      success: true,
      data: result,
      message: 'Doctor verified successfully'
    });
  });

  /**
   * Reject verification (Admin only)
   */
  rejectVerification = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Rejection reason must be at least 10 characters'
      });
    }

    const result = await doctorVerificationService.rejectVerification(
      userId,
      req.userId,
      reason
    );

    res.status(200).json({
      success: true,
      data: result,
      message: 'Verification rejected'
    });
  });

  /**
   * Suspend doctor (Admin only)
   */
  suspendDoctor = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { userId } = req.params;
    const { reason } = req.body;

    const result = await doctorVerificationService.suspendDoctor(
      userId,
      req.userId,
      reason
    );

    res.status(200).json({
      success: true,
      data: result,
      message: 'Doctor suspended successfully'
    });
  });

  /**
   * Get verification statistics (Admin only)
   */
  getVerificationStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await doctorVerificationService.getVerificationStats();

    res.status(200).json({
      success: true,
      data: result
    });
  });
}

export const doctorVerificationController = new DoctorVerificationController();
