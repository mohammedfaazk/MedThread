"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorVerificationRouter = void 0;
const express_1 = require("express");
const doctor_verification_controller_1 = require("../controllers/doctor-verification.controller");
const auth_refactored_1 = require("../middleware/auth.refactored");
const requireAdmin_1 = require("../middleware/requireAdmin");
const router = (0, express_1.Router)();
exports.doctorVerificationRouter = router;
/**
 * @route   POST /api/v1/doctor-verification/submit
 * @desc    Doctor submits verification request with KYC documents
 * @access  Private (Doctor only)
 */
router.post('/submit', auth_refactored_1.authenticate, doctor_verification_controller_1.doctorVerificationController.submitVerification);
/**
 * @route   GET /api/v1/doctor-verification/verified
 * @desc    Get list of verified doctors
 * @access  Public
 */
router.get('/verified', doctor_verification_controller_1.doctorVerificationController.getVerifiedDoctors);
/**
 * @route   GET /api/v1/doctor-verification/pending
 * @desc    Get pending verification requests
 * @access  Private (Admin only)
 */
router.get('/pending', auth_refactored_1.authenticate, requireAdmin_1.requireAdmin, doctor_verification_controller_1.doctorVerificationController.getPendingVerifications);
/**
 * @route   GET /api/v1/doctor-verification/stats
 * @desc    Get verification statistics
 * @access  Private (Admin only)
 */
router.get('/stats', auth_refactored_1.authenticate, requireAdmin_1.requireAdmin, doctor_verification_controller_1.doctorVerificationController.getVerificationStats);
/**
 * @route   GET /api/v1/doctor-verification/:userId
 * @desc    Get verification details for a specific doctor
 * @access  Private (Admin only)
 */
router.get('/:userId', auth_refactored_1.authenticate, requireAdmin_1.requireAdmin, doctor_verification_controller_1.doctorVerificationController.getVerificationDetails);
/**
 * @route   POST /api/v1/doctor-verification/:userId/approve
 * @desc    Approve doctor verification
 * @access  Private (Admin only)
 */
router.post('/:userId/approve', auth_refactored_1.authenticate, requireAdmin_1.requireAdmin, doctor_verification_controller_1.doctorVerificationController.approveVerification);
/**
 * @route   POST /api/v1/doctor-verification/:userId/reject
 * @desc    Reject doctor verification
 * @access  Private (Admin only)
 */
router.post('/:userId/reject', auth_refactored_1.authenticate, requireAdmin_1.requireAdmin, doctor_verification_controller_1.doctorVerificationController.rejectVerification);
/**
 * @route   POST /api/v1/doctor-verification/:userId/suspend
 * @desc    Suspend verified doctor
 * @access  Private (Admin only)
 */
router.post('/:userId/suspend', auth_refactored_1.authenticate, requireAdmin_1.requireAdmin, doctor_verification_controller_1.doctorVerificationController.suspendDoctor);
