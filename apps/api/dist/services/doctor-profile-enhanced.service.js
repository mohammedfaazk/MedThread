"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorProfileEnhancedService = exports.DoctorProfileEnhancedService = void 0;
const database_1 = require("@medthread/database");
const errors_1 = require("../utils/errors");
class DoctorProfileEnhancedService {
    /**
     * Update doctor's professional profile
     */
    async updateProfessionalProfile(doctorId, profile) {
        const doctor = await database_1.prisma.user.findUnique({
            where: { id: doctorId },
            select: { role: true, doctorVerificationStatus: true }
        });
        if (!doctor || doctor.role !== 'DOCTOR') {
            throw new errors_1.ValidationError('Only doctors can update professional profile');
        }
        // For now, store in existing JSON fields until schema is updated
        const updatedDoctor = await database_1.prisma.user.update({
            where: { id: doctorId },
            data: {
                bio: profile.professionalBio,
                phone: profile.registrationNumber, // Temporary mapping
                verificationDocuments: {
                    ...profile,
                    updatedAt: new Date()
                }
            }
        });
        return updatedDoctor;
    }
    /**
     * Calculate and update doctor's performance metrics
     */
    async calculatePerformanceMetrics(doctorId) {
        // Get all threads where doctor replied
        const doctorReplies = await database_1.prisma.threadReply.findMany({
            where: { authorId: doctorId },
            include: {
                thread: {
                    select: {
                        isResolved: true,
                        status: true,
                        createdAt: true
                    }
                }
            }
        });
        // Calculate case resolution rate
        const totalCases = doctorReplies.length;
        const resolvedCases = doctorReplies.filter(r => r.thread.isResolved).length;
        const caseResolutionRate = totalCases > 0 ? (resolvedCases / totalCases) * 100 : 0;
        // Calculate average response time
        const responseTimes = await Promise.all(doctorReplies.map(async (reply) => {
            const threadCreatedAt = reply.thread.createdAt;
            const replyCreatedAt = reply.createdAt;
            return (replyCreatedAt.getTime() - threadCreatedAt.getTime()) / (1000 * 60); // minutes
        }));
        const averageResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
            : 0;
        // Calculate response accuracy (based on upvotes and helpful marks)
        const accurateResponses = doctorReplies.filter(r => r.isHelpful || r.upvotes > 5).length;
        const responseAccuracyRating = totalCases > 0 ? (accurateResponses / totalCases) * 100 : 0;
        // Calculate specialization depth (unique topics covered)
        const uniqueTopics = new Set(doctorReplies.map(r => r.thread.tags).flat()).size;
        const specializationDepthScore = Math.min(uniqueTopics * 2, 100); // Max 100
        // Get patient satisfaction from reviews (placeholder - will implement with reviews)
        const averagePatientSatisfaction = 0; // TODO: Calculate from PatientReview model
        const metrics = {
            caseResolutionRate: Math.round(caseResolutionRate * 10) / 10,
            averagePatientSatisfaction,
            responseAccuracyRating: Math.round(responseAccuracyRating * 10) / 10,
            specializationDepthScore,
            averageResponseTime: Math.round(averageResponseTime)
        };
        return metrics;
    }
    /**
     * Get doctor's contribution stats
     */
    async getContributionStats(doctorId) {
        const [totalCasesHandled, emergencyFlagsDetected, lastContribution] = await Promise.all([
            database_1.prisma.threadReply.count({
                where: { authorId: doctorId }
            }),
            database_1.prisma.threadReply.count({
                where: {
                    authorId: doctorId,
                    thread: {
                        severityScore: { in: ['HIGH', 'CRITICAL'] }
                    }
                }
            }),
            database_1.prisma.threadReply.findFirst({
                where: { authorId: doctorId },
                orderBy: { createdAt: 'desc' },
                select: { createdAt: true }
            })
        ]);
        // Calculate monthly streak
        const monthlyStreak = await this.calculateContributionStreak(doctorId);
        return {
            totalCasesHandled,
            emergencyFlagsDetected,
            monthlyContributionStreak: monthlyStreak,
            lastContributionDate: lastContribution?.createdAt
        };
    }
    /**
     * Calculate monthly contribution streak
     */
    async calculateContributionStreak(doctorId) {
        const now = new Date();
        let streak = 0;
        let currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        while (true) {
            const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
            const contributionsInMonth = await database_1.prisma.threadReply.count({
                where: {
                    authorId: doctorId,
                    createdAt: {
                        gte: currentMonth,
                        lt: nextMonth
                    }
                }
            });
            if (contributionsInMonth > 0) {
                streak++;
                currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
            }
            else {
                break;
            }
            // Limit to 24 months
            if (streak >= 24)
                break;
        }
        return streak;
    }
    /**
     * Get complete doctor profile for public view
     */
    async getPublicProfile(username) {
        const doctor = await database_1.prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                doctorVerificationStatus: true,
                specialty: true,
                subSpecialty: true,
                yearsOfExperience: true,
                hospitalAffiliation: true,
                clinicAddress: true,
                bio: true,
                avatar: true,
                totalKarma: true,
                verifiedAt: true,
                createdAt: true,
                verificationDocuments: true,
                medicalLicenseNumber: true,
                licenseIssuingAuthority: true
            }
        });
        if (!doctor || doctor.role !== 'DOCTOR') {
            throw new errors_1.NotFoundError('Doctor not found');
        }
        // Get performance metrics
        const metrics = await this.calculatePerformanceMetrics(doctor.id);
        // Get contribution stats
        const stats = await this.getContributionStats(doctor.id);
        // Get top conditions answered
        const topConditions = await this.getTopConditions(doctor.id);
        // Get recent activity
        const recentActivity = await database_1.prisma.threadReply.findMany({
            where: { authorId: doctor.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                thread: {
                    select: {
                        id: true,
                        title: true,
                        createdAt: true,
                        isResolved: true
                    }
                }
            }
        });
        return {
            profile: doctor,
            metrics,
            stats,
            topConditions,
            recentActivity,
            profileUrl: `/doctor/${username}`
        };
    }
    /**
     * Get top conditions answered by doctor
     */
    async getTopConditions(doctorId, limit = 5) {
        const replies = await database_1.prisma.threadReply.findMany({
            where: { authorId: doctorId },
            include: {
                thread: {
                    select: { tags: true }
                }
            }
        });
        const conditionCounts = new Map();
        replies.forEach(reply => {
            reply.thread.tags.forEach(tag => {
                conditionCounts.set(tag, (conditionCounts.get(tag) || 0) + 1);
            });
        });
        return Array.from(conditionCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([condition, count]) => ({ condition, count }));
    }
    /**
     * Award badge to doctor
     */
    async awardBadge(doctorId, badge) {
        const doctor = await database_1.prisma.user.findUnique({
            where: { id: doctorId },
            select: { verificationDocuments: true }
        });
        const currentBadges = doctor?.verificationDocuments?.badges || [];
        await database_1.prisma.user.update({
            where: { id: doctorId },
            data: {
                verificationDocuments: {
                    ...doctor?.verificationDocuments,
                    badges: [...currentBadges, badge]
                }
            }
        });
        return badge;
    }
}
exports.DoctorProfileEnhancedService = DoctorProfileEnhancedService;
exports.doctorProfileEnhancedService = new DoctorProfileEnhancedService();
