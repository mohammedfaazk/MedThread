"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorVerificationService = exports.DoctorVerificationService = void 0;
const database_1 = require("@medthread/database");
const errors_1 = require("../utils/errors");
const email_service_1 = require("./email.service");
class DoctorVerificationService {
    /**
     * Doctor submits verification request with KYC documents
     */
    async submitVerificationRequest(userId, data, documents) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (user.role !== 'DOCTOR') {
            throw new errors_1.ForbiddenError('Only users with DOCTOR role can submit verification');
        }
        if (user.doctorVerificationStatus === 'APPROVED') {
            throw new errors_1.ValidationError('Doctor is already verified');
        }
        if (user.doctorVerificationStatus === 'UNDER_REVIEW') {
            throw new errors_1.ValidationError('Verification request is already under review');
        }
        // Validate license expiry date
        if (new Date(data.licenseExpiryDate) < new Date()) {
            throw new errors_1.ValidationError('Medical license has expired');
        }
        // Update user with verification data
        const updatedUser = await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                doctorVerificationStatus: 'UNDER_REVIEW',
                medicalLicenseNumber: data.medicalLicenseNumber,
                licenseIssuingAuthority: data.licenseIssuingAuthority,
                licenseExpiryDate: data.licenseExpiryDate,
                specialty: data.specialty,
                subSpecialty: data.subSpecialty,
                yearsOfExperience: data.yearsOfExperience,
                hospitalAffiliation: data.hospitalAffiliation,
                clinicAddress: data.clinicAddress,
                kycDocuments: documents,
                verificationDocuments: {},
                updatedAt: new Date(),
            },
            select: {
                id: true,
                username: true,
                email: true,
                doctorVerificationStatus: true,
                specialty: true,
            }
        });
        return {
            message: 'Verification request submitted successfully. You will be notified once reviewed.',
            user: updatedUser,
        };
    }
    /**
     * Get all pending verification requests (Admin only)
     */
    async getPendingVerifications(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [requests, total] = await Promise.all([
            database_1.prisma.user.findMany({
                where: {
                    role: 'DOCTOR',
                    doctorVerificationStatus: {
                        in: ['PENDING', 'UNDER_REVIEW']
                    }
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    doctorVerificationStatus: true,
                    medicalLicenseNumber: true,
                    licenseIssuingAuthority: true,
                    licenseExpiryDate: true,
                    specialty: true,
                    subSpecialty: true,
                    yearsOfExperience: true,
                    hospitalAffiliation: true,
                    clinicAddress: true,
                    kycDocuments: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit,
            }),
            database_1.prisma.user.count({
                where: {
                    role: 'DOCTOR',
                    doctorVerificationStatus: {
                        in: ['PENDING', 'UNDER_REVIEW']
                    }
                }
            })
        ]);
        return {
            requests,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    /**
     * Get all verified doctors
     */
    async getVerifiedDoctors(page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        const [doctors, total] = await Promise.all([
            database_1.prisma.user.findMany({
                where: {
                    role: 'DOCTOR',
                    doctorVerificationStatus: 'APPROVED'
                },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    specialty: true,
                    subSpecialty: true,
                    yearsOfExperience: true,
                    hospitalAffiliation: true,
                    avatar: true,
                    bio: true,
                    totalKarma: true,
                    verifiedAt: true,
                    createdAt: true,
                },
                orderBy: { verifiedAt: 'desc' },
                skip,
                take: limit,
            }),
            database_1.prisma.user.count({
                where: {
                    role: 'DOCTOR',
                    doctorVerificationStatus: 'APPROVED'
                }
            })
        ]);
        return {
            doctors,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    /**
     * Get verification request details (Admin only)
     */
    async getVerificationDetails(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                doctorVerificationStatus: true,
                medicalLicenseNumber: true,
                licenseIssuingAuthority: true,
                licenseExpiryDate: true,
                specialty: true,
                subSpecialty: true,
                yearsOfExperience: true,
                hospitalAffiliation: true,
                clinicAddress: true,
                kycDocuments: true,
                verificationDocuments: true,
                verificationNotes: true,
                verifiedAt: true,
                verifiedBy: true,
                rejectionReason: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (user.role !== 'DOCTOR') {
            throw new errors_1.ValidationError('User is not a doctor');
        }
        return user;
    }
    /**
     * Approve doctor verification (Admin only)
     */
    async approveVerification(userId, adminId, notes) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (user.role !== 'DOCTOR') {
            throw new errors_1.ValidationError('User is not a doctor');
        }
        if (user.doctorVerificationStatus === 'APPROVED') {
            throw new errors_1.ValidationError('Doctor is already verified');
        }
        const updatedUser = await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                doctorVerificationStatus: 'APPROVED',
                verified: true,
                verifiedAt: new Date(),
                verifiedBy: adminId,
                verificationNotes: notes,
                rejectionReason: null,
            },
            select: {
                id: true,
                username: true,
                email: true,
                doctorVerificationStatus: true,
                specialty: true,
                verifiedAt: true,
            }
        });
        // Send notification/email to doctor
        try {
            await email_service_1.emailService.sendVerificationApprovedEmail(updatedUser.email, updatedUser.username);
        }
        catch (emailError) {
            console.error('Failed to send approval email:', emailError);
        }
        return {
            message: 'Doctor verification approved successfully',
            user: updatedUser,
        };
    }
    /**
     * Reject doctor verification (Admin only)
     */
    async rejectVerification(userId, adminId, reason) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (user.role !== 'DOCTOR') {
            throw new errors_1.ValidationError('User is not a doctor');
        }
        if (!reason || reason.trim().length < 10) {
            throw new errors_1.ValidationError('Rejection reason must be at least 10 characters');
        }
        const updatedUser = await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                doctorVerificationStatus: 'REJECTED',
                verified: false,
                verifiedBy: adminId,
                rejectionReason: reason,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                username: true,
                email: true,
                doctorVerificationStatus: true,
                rejectionReason: true,
            }
        });
        // Send notification/email to doctor with rejection reason
        try {
            await email_service_1.emailService.sendVerificationRejectedEmail(updatedUser.email, updatedUser.username, reason);
        }
        catch (emailError) {
            console.error('Failed to send rejection email:', emailError);
        }
        return {
            message: 'Doctor verification rejected',
            user: updatedUser,
        };
    }
    /**
     * Suspend verified doctor (Admin only)
     */
    async suspendDoctor(userId, adminId, reason) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (user.role !== 'DOCTOR') {
            throw new errors_1.ValidationError('User is not a doctor');
        }
        if (user.doctorVerificationStatus !== 'APPROVED') {
            throw new errors_1.ValidationError('Doctor is not verified');
        }
        const updatedUser = await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                doctorVerificationStatus: 'SUSPENDED',
                verified: false,
                isSuspended: true,
                verificationNotes: reason,
                updatedAt: new Date(),
            },
            select: {
                id: true,
                username: true,
                email: true,
                doctorVerificationStatus: true,
                isSuspended: true,
            }
        });
        return {
            message: 'Doctor suspended successfully',
            user: updatedUser,
        };
    }
    /**
     * Get doctor verification statistics (Admin dashboard)
     */
    async getVerificationStats() {
        const [totalDoctors, pendingVerifications, approvedDoctors, rejectedDoctors, suspendedDoctors, recentApprovals,] = await Promise.all([
            database_1.prisma.user.count({ where: { role: 'DOCTOR' } }),
            database_1.prisma.user.count({
                where: {
                    role: 'DOCTOR',
                    doctorVerificationStatus: { in: ['PENDING', 'UNDER_REVIEW'] }
                }
            }),
            database_1.prisma.user.count({
                where: {
                    role: 'DOCTOR',
                    doctorVerificationStatus: 'APPROVED'
                }
            }),
            database_1.prisma.user.count({
                where: {
                    role: 'DOCTOR',
                    doctorVerificationStatus: 'REJECTED'
                }
            }),
            database_1.prisma.user.count({
                where: {
                    role: 'DOCTOR',
                    doctorVerificationStatus: 'SUSPENDED'
                }
            }),
            database_1.prisma.user.count({
                where: {
                    role: 'DOCTOR',
                    doctorVerificationStatus: 'APPROVED',
                    verifiedAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                    }
                }
            }),
        ]);
        return {
            totalDoctors,
            pendingVerifications,
            approvedDoctors,
            rejectedDoctors,
            suspendedDoctors,
            recentApprovals,
            approvalRate: totalDoctors > 0 ? ((approvedDoctors / totalDoctors) * 100).toFixed(2) : 0,
        };
    }
    /**
     * Check if doctor can perform doctor-specific actions
     */
    async canDoctorAct(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                role: true,
                doctorVerificationStatus: true,
                isSuspended: true,
            }
        });
        if (!user)
            return false;
        if (user.role !== 'DOCTOR')
            return false;
        if (user.isSuspended)
            return false;
        if (user.doctorVerificationStatus !== 'APPROVED')
            return false;
        return true;
    }
}
exports.DoctorVerificationService = DoctorVerificationService;
exports.doctorVerificationService = new DoctorVerificationService();
