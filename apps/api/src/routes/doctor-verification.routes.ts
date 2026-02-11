import { Router } from 'express';
import { doctorVerificationController } from '../controllers/doctor-verification.controller';
import { authenticate } from '../middleware/auth.refactored';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

/**
 * @route   POST /api/v1/doctor-verification/submit
 * @desc    Doctor submits verification request with KYC documents
 * @access  Private (Doctor only)
 */
router.post('/submit', authenticate, doctorVerificationController.submitVerification);

/**
 * @route   GET /api/v1/doctor-verification/verified
 * @desc    Get list of verified doctors
 * @access  Public
 */
router.get('/verified', doctorVerificationController.getVerifiedDoctors);

/**
 * @route   GET /api/v1/doctor-verification/pending
 * @desc    Get pending verification requests
 * @access  Private (Admin only)
 */
router.get('/pending', authenticate, requireAdmin, doctorVerificationController.getPendingVerifications);

/**
 * @route   GET /api/v1/doctor-verification/stats
 * @desc    Get verification statistics
 * @access  Private (Admin only)
 */
router.get('/stats', authenticate, requireAdmin, doctorVerificationController.getVerificationStats);

/**
 * @route   GET /api/v1/doctor-verification/:userId
 * @desc    Get verification details for a specific doctor
 * @access  Private (Admin only)
 */
router.get('/:userId', authenticate, requireAdmin, doctorVerificationController.getVerificationDetails);

/**
 * @route   POST /api/v1/doctor-verification/:userId/approve
 * @desc    Approve doctor verification
 * @access  Private (Admin only)
 */
router.post('/:userId/approve', authenticate, requireAdmin, doctorVerificationController.approveVerification);

/**
 * @route   POST /api/v1/doctor-verification/:userId/reject
 * @desc    Reject doctor verification
 * @access  Private (Admin only)
 */
router.post('/:userId/reject', authenticate, requireAdmin, doctorVerificationController.rejectVerification);

/**
 * @route   POST /api/v1/doctor-verification/:userId/suspend
 * @desc    Suspend verified doctor
 * @access  Private (Admin only)
 */
router.post('/:userId/suspend', authenticate, requireAdmin, doctorVerificationController.suspendDoctor);

export { router as doctorVerificationRouter };
