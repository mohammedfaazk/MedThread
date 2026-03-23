"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmeCreditsService = exports.CmeCreditsService = void 0;
const database_1 = require("@medthread/database");
const errors_1 = require("../utils/errors");
class CmeCreditsService {
    constructor() {
        // Credit values for each activity type
        this.CREDIT_VALUES = {
            QUALITY_ANSWER: 0.5,
            PEER_REVIEWED_ANSWER: 1.0,
            CASE_DISCUSSION: 1.5,
            EDUCATIONAL_THREAD: 2.0,
            EXPERT_PANEL: 3.0,
            RESEARCH_CONTRIBUTION: 5.0,
            MENTORSHIP: 2.5
        };
    }
    /**
     * Award CME credits for an activity
     */
    async awardCredits(activity) {
        const doctor = await database_1.prisma.user.findUnique({
            where: { id: activity.doctorId },
            select: { role: true, doctorVerificationStatus: true }
        });
        if (!doctor || doctor.role !== 'DOCTOR') {
            throw new errors_1.ValidationError('Only doctors can earn CME credits');
        }
        if (doctor.doctorVerificationStatus !== 'APPROVED') {
            throw new errors_1.ValidationError('Doctor must be verified to earn CME credits');
        }
        const creditsEarned = this.CREDIT_VALUES[activity.activityType];
        // Store in user's verification documents for now
        // Will move to dedicated table when schema is updated
        const currentYear = new Date().getFullYear();
        const cmeRecord = {
            id: `cme_${Date.now()}`,
            activityType: activity.activityType,
            activityTitle: activity.activityTitle,
            activityDescription: activity.activityDescription,
            creditsEarned,
            sourceThreadId: activity.sourceThreadId,
            sourceReplyId: activity.sourceReplyId,
            qualityScore: activity.qualityScore,
            verificationStatus: 'PENDING',
            earnedAt: new Date(),
            year: currentYear
        };
        // Get existing CME records
        const user = await database_1.prisma.user.findUnique({
            where: { id: activity.doctorId },
            select: { verificationDocuments: true }
        });
        const existingData = user?.verificationDocuments || {};
        const cmeRecords = existingData.cmeRecords || [];
        await database_1.prisma.user.update({
            where: { id: activity.doctorId },
            data: {
                verificationDocuments: {
                    ...existingData,
                    cmeRecords: [...cmeRecords, cmeRecord],
                    totalCmeCredits: (existingData.totalCmeCredits || 0) + creditsEarned,
                    cmeCreditsThisYear: (existingData.cmeCreditsThisYear || 0) + creditsEarned,
                    lastCmeEarnedAt: new Date()
                }
            }
        });
        // Send notification
        await this.notifyCreditsEarned(activity.doctorId, creditsEarned, activity.activityType);
        return {
            creditsEarned,
            activityType: activity.activityType,
            message: `Earned ${creditsEarned} CME credits`,
            cmeRecord
        };
    }
    /**
     * Auto-award credits based on thread reply quality
     */
    async checkAndAwardForReply(replyId) {
        const reply = await database_1.prisma.threadReply.findUnique({
            where: { id: replyId },
            include: {
                author: {
                    select: {
                        id: true,
                        role: true,
                        doctorVerificationStatus: true
                    }
                },
                thread: {
                    select: {
                        id: true,
                        title: true,
                        tags: true
                    }
                }
            }
        });
        if (!reply || reply.author.role !== 'DOCTOR' || reply.author.doctorVerificationStatus !== 'APPROVED') {
            return null;
        }
        // Check if reply qualifies for credits
        const qualifies = await this.checkReplyQuality(reply);
        if (qualifies.eligible) {
            return await this.awardCredits({
                doctorId: reply.authorId,
                activityType: qualifies.activityType,
                activityTitle: `Response to: ${reply.thread.title}`,
                activityDescription: `Provided quality medical advice on ${reply.thread.tags.join(', ')}`,
                sourceThreadId: reply.threadId,
                sourceReplyId: reply.id,
                qualityScore: qualifies.score
            });
        }
        return null;
    }
    /**
     * Check if reply qualifies for CME credits
     */
    async checkReplyQuality(reply) {
        let score = 0;
        let activityType = 'QUALITY_ANSWER';
        // Check upvotes from verified doctors
        const doctorUpvotes = await database_1.prisma.vote.count({
            where: {
                commentId: reply.id,
                value: 1,
                user: {
                    role: 'DOCTOR',
                    doctorVerificationStatus: 'APPROVED'
                }
            }
        });
        score += doctorUpvotes * 10;
        // Check if marked as helpful
        if (reply.isHelpful) {
            score += 20;
            activityType = 'PEER_REVIEWED_ANSWER';
        }
        // Check if thread was resolved with this reply
        if (reply.thread.isResolved) {
            score += 15;
        }
        // Check reply length (comprehensive answers)
        if (reply.content.length > 500) {
            score += 10;
        }
        // Check if it's part of a discussion (multiple replies)
        const replyCount = await database_1.prisma.threadReply.count({
            where: { threadId: reply.threadId }
        });
        if (replyCount >= 10) {
            score += 15;
            activityType = 'CASE_DISCUSSION';
        }
        // Eligible if score >= 50
        return {
            eligible: score >= 50,
            activityType,
            score
        };
    }
    /**
     * Get doctor's CME credits summary
     */
    async getDoctorCmeCredits(doctorId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: doctorId },
            select: {
                verificationDocuments: true,
                createdAt: true
            }
        });
        if (!user) {
            throw new errors_1.NotFoundError('Doctor not found');
        }
        const cmeData = user.verificationDocuments || {};
        const cmeRecords = cmeData.cmeRecords || [];
        const currentYear = new Date().getFullYear();
        // Calculate credits by year
        const creditsByYear = cmeRecords.reduce((acc, record) => {
            const year = record.year || new Date(record.earnedAt).getFullYear();
            acc[year] = (acc[year] || 0) + record.creditsEarned;
            return acc;
        }, {});
        // Calculate credits by activity type
        const creditsByType = cmeRecords.reduce((acc, record) => {
            acc[record.activityType] = (acc[record.activityType] || 0) + record.creditsEarned;
            return acc;
        }, {});
        // Get pending verifications
        const pendingCredits = cmeRecords.filter((r) => r.verificationStatus === 'PENDING');
        return {
            totalCredits: cmeData.totalCmeCredits || 0,
            creditsThisYear: creditsByYear[currentYear] || 0,
            creditsByYear,
            creditsByType,
            recentActivities: cmeRecords.slice(-10).reverse(),
            pendingVerifications: pendingCredits.length,
            lastEarned: cmeData.lastCmeEarnedAt
        };
    }
    /**
     * Get CME leaderboard
     */
    async getCmeLeaderboard(timeframe = 'month', limit = 10) {
        const users = await database_1.prisma.user.findMany({
            where: {
                role: 'DOCTOR',
                doctorVerificationStatus: 'APPROVED'
            },
            select: {
                id: true,
                username: true,
                specialty: true,
                avatar: true,
                verificationDocuments: true
            }
        });
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const leaderboard = users.map((user) => {
            const cmeData = user.verificationDocuments || {};
            const cmeRecords = cmeData.cmeRecords || [];
            let credits = 0;
            if (timeframe === 'all') {
                credits = cmeData.totalCmeCredits || 0;
            }
            else if (timeframe === 'year') {
                credits = cmeRecords
                    .filter((r) => new Date(r.earnedAt).getFullYear() === currentYear)
                    .reduce((sum, r) => sum + r.creditsEarned, 0);
            }
            else {
                credits = cmeRecords
                    .filter((r) => {
                    const date = new Date(r.earnedAt);
                    return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
                })
                    .reduce((sum, r) => sum + r.creditsEarned, 0);
            }
            return {
                doctorId: user.id,
                username: user.username,
                specialty: user.specialty,
                avatar: user.avatar,
                credits
            };
        });
        return leaderboard
            .sort((a, b) => b.credits - a.credits)
            .slice(0, limit);
    }
    /**
     * Generate CME certificate
     */
    async generateCertificate(doctorId, activityId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: doctorId },
            select: {
                username: true,
                medicalLicenseNumber: true,
                specialty: true,
                verificationDocuments: true
            }
        });
        if (!user) {
            throw new errors_1.NotFoundError('Doctor not found');
        }
        const cmeData = user.verificationDocuments || {};
        const cmeRecords = cmeData.cmeRecords || [];
        const activity = cmeRecords.find((r) => r.id === activityId);
        if (!activity) {
            throw new errors_1.NotFoundError('CME activity not found');
        }
        // Generate certificate data
        const certificate = {
            certificateNumber: `CME-${Date.now()}-${doctorId.slice(0, 8)}`,
            doctorName: user.username,
            licenseNumber: user.medicalLicenseNumber,
            specialty: user.specialty,
            activityTitle: activity.activityTitle,
            activityType: activity.activityType,
            creditsEarned: activity.creditsEarned,
            earnedDate: activity.earnedAt,
            issuedDate: new Date(),
            accreditingBody: 'MedThread Medical Education',
            verificationUrl: `https://medthread.com/verify/${activity.id}`
        };
        // Update activity with certificate info
        activity.certificateNumber = certificate.certificateNumber;
        activity.certificateGenerated = true;
        activity.verificationStatus = 'APPROVED';
        await database_1.prisma.user.update({
            where: { id: doctorId },
            data: {
                verificationDocuments: {
                    ...cmeData,
                    cmeRecords
                }
            }
        });
        return certificate;
    }
    /**
     * Get CME opportunities for doctor
     */
    async getCmeOpportunities(doctorId) {
        const doctor = await database_1.prisma.user.findUnique({
            where: { id: doctorId },
            select: { specialty: true }
        });
        // Find high-quality threads in doctor's specialty that haven't been answered
        const opportunities = await database_1.prisma.medicalThread.findMany({
            where: {
                status: 'OPEN',
                tags: {
                    hasSome: doctor?.specialty ? [doctor.specialty] : []
                },
                replies: {
                    none: {
                        authorId: doctorId
                    }
                }
            },
            take: 10,
            orderBy: {
                createdAt: 'desc'
            },
            select: {
                id: true,
                title: true,
                tags: true,
                severityScore: true,
                createdAt: true,
                replies: {
                    select: {
                        id: true
                    }
                }
            }
        });
        return opportunities.map(thread => ({
            threadId: thread.id,
            title: thread.title,
            tags: thread.tags,
            severity: thread.severityScore,
            potentialCredits: thread.severityScore === 'HIGH' ? 1.0 : 0.5,
            replyCount: thread.replies.length,
            createdAt: thread.createdAt
        }));
    }
    async notifyCreditsEarned(doctorId, credits, activityType) {
        await database_1.prisma.notification.create({
            data: {
                userId: doctorId,
                type: 'CME_CREDITS_EARNED',
                content: `You earned ${credits} CME credits for ${activityType.replace(/_/g, ' ').toLowerCase()}`,
                link: '/dashboard/doctor/cme'
            }
        });
    }
}
exports.CmeCreditsService = CmeCreditsService;
exports.cmeCreditsService = new CmeCreditsService();
