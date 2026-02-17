"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorVerificationController = exports.DoctorVerificationController = void 0;
const doctor_verification_service_1 = require("../services/doctor-verification.service");
const asyncHandler_1 = require("../middleware/asyncHandler");
const zod_1 = require("zod");
const submitVerificationSchema = zod_1.z.object({
    medicalLicenseNumber: zod_1.z.string().min(5, 'License number is required'),
    licenseIssuingAuthority: zod_1.z.string().min(3, 'Issuing authority is required'),
    licenseExpiryDate: zod_1.z.string().transform(str => new Date(str)),
    specialty: zod_1.z.string().min(3, 'Specialty is required'),
    subSpecialty: zod_1.z.string().optional(),
    yearsOfExperience: zod_1.z.number().min(0).max(70),
    hospitalAffiliation: zod_1.z.string().optional(),
    clinicAddress: zod_1.z.string().optional(),
    documents: zod_1.z.object({
        idProof: zod_1.z.string().min(10, 'ID proof is required'),
        medicalDegree: zod_1.z.string().min(10, 'Medical degree is required'),
        licenseDocument: zod_1.z.string().min(10, 'License document is required'),
        additionalCertificates: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
class DoctorVerificationController {
    constructor() {
        /**
         * Doctor submits verification request
         */
        this.submitVerification = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }
            const validatedData = submitVerificationSchema.parse(req.body);
            const { documents, ...registrationData } = validatedData;
            const result = await doctor_verification_service_1.doctorVerificationService.submitVerificationRequest(req.userId, registrationData, documents);
            res.status(200).json({
                success: true,
                data: result,
                message: 'Verification request submitted successfully'
            });
        });
        /**
         * Get pending verifications (Admin only)
         */
        this.getPendingVerifications = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await doctor_verification_service_1.doctorVerificationService.getPendingVerifications(page, limit);
            res.status(200).json({
                success: true,
                data: result
            });
        });
        /**
         * Get verified doctors
         */
        this.getVerifiedDoctors = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const result = await doctor_verification_service_1.doctorVerificationService.getVerifiedDoctors(page, limit);
            res.status(200).json({
                success: true,
                data: result
            });
        });
        /**
         * Get verification details (Admin only)
         */
        this.getVerificationDetails = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { userId } = req.params;
            const result = await doctor_verification_service_1.doctorVerificationService.getVerificationDetails(userId);
            res.status(200).json({
                success: true,
                data: result
            });
        });
        /**
         * Approve verification (Admin only)
         */
        this.approveVerification = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }
            const { userId } = req.params;
            const { notes } = req.body;
            const result = await doctor_verification_service_1.doctorVerificationService.approveVerification(userId, req.userId, notes);
            res.status(200).json({
                success: true,
                data: result,
                message: 'Doctor verified successfully'
            });
        });
        /**
         * Reject verification (Admin only)
         */
        this.rejectVerification = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
            const result = await doctor_verification_service_1.doctorVerificationService.rejectVerification(userId, req.userId, reason);
            res.status(200).json({
                success: true,
                data: result,
                message: 'Verification rejected'
            });
        });
        /**
         * Suspend doctor (Admin only)
         */
        this.suspendDoctor = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }
            const { userId } = req.params;
            const { reason } = req.body;
            const result = await doctor_verification_service_1.doctorVerificationService.suspendDoctor(userId, req.userId, reason);
            res.status(200).json({
                success: true,
                data: result,
                message: 'Doctor suspended successfully'
            });
        });
        /**
         * Get verification statistics (Admin only)
         */
        this.getVerificationStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const result = await doctor_verification_service_1.doctorVerificationService.getVerificationStats();
            res.status(200).json({
                success: true,
                data: result
            });
        });
    }
}
exports.DoctorVerificationController = DoctorVerificationController;
exports.doctorVerificationController = new DoctorVerificationController();
