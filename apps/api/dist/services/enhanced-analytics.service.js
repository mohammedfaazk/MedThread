"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enhancedAnalyticsService = exports.EnhancedAnalyticsService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class EnhancedAnalyticsService {
    /**
     * Feature 1: Get doctor specialty distribution for pie chart
     */
    async getDoctorSpecialtyDistribution() {
        const doctors = await prisma.user.findMany({
            where: {
                role: 'DOCTOR',
                doctorVerificationStatus: 'APPROVED',
                specialty: { not: null }
            },
            select: { specialty: true }
        });
        const distribution = doctors.reduce((acc, doctor) => {
            const specialty = doctor.specialty || 'Other';
            acc[specialty] = (acc[specialty] || 0) + 1;
            return acc;
        }, {});
        const total = doctors.length;
        const percentages = Object.entries(distribution).map(([specialty, count]) => ({
            specialty,
            count: count,
            percentage: ((count / total) * 100).toFixed(2)
        }));
        return {
            total,
            distribution: percentages.sort((a, b) => b.count - a.count)
        };
    }
    /**
     * Feature 2: Analyze community activity tiers
     */
    async analyzeCommunityActivity(communityId) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const communities = communityId
            ? await prisma.community.findMany({ where: { id: communityId } })
            : await prisma.community.findMany();
        const results = [];
        for (const community of communities) {
            const posts = await prisma.post.count({
                where: {
                    communityId: community.id,
                    createdAt: { gte: thirtyDaysAgo }
                }
            });
            const comments = await prisma.comment.count({
                where: {
                    post: { communityId: community.id },
                    createdAt: { gte: thirtyDaysAgo }
                }
            });
            const avgPostsPerDay = posts / 30;
            const avgCommentsPerPost = posts > 0 ? comments / posts : 0;
            let activityTier = 'INACTIVE';
            if (avgPostsPerDay >= 5 && avgCommentsPerPost >= 3) {
                activityTier = 'HIGHLY_ACTIVE';
            }
            else if (avgPostsPerDay >= 1 || avgCommentsPerPost >= 1) {
                activityTier = 'MODERATELY_ACTIVE';
            }
            // Upsert community activity
            await prisma.communityActivity.upsert({
                where: { communityId: community.id },
                create: {
                    communityId: community.id,
                    activityTier,
                    totalPosts: posts,
                    totalComments: comments,
                    totalMembers: community.memberCount,
                    avgPostsPerDay,
                    avgCommentsPerPost,
                    lastActivityAt: new Date(),
                    calculatedAt: new Date()
                },
                update: {
                    activityTier,
                    totalPosts: posts,
                    totalComments: comments,
                    totalMembers: community.memberCount,
                    avgPostsPerDay,
                    avgCommentsPerPost,
                    lastActivityAt: new Date(),
                    calculatedAt: new Date()
                }
            });
            results.push({
                communityId: community.id,
                communityName: community.name,
                displayName: community.displayName,
                activityTier,
                totalPosts: posts,
                totalComments: comments,
                avgPostsPerDay: avgPostsPerDay.toFixed(2),
                avgCommentsPerPost: avgCommentsPerPost.toFixed(2)
            });
        }
        return results;
    }
    /**
     * Feature 3: Get real-time stats for doctor's public profile
     */
    async getDoctorPublicStats(doctorId) {
        const [posts, comments, performance] = await Promise.all([
            prisma.post.count({ where: { authorId: doctorId } }),
            prisma.comment.count({ where: { authorId: doctorId } }),
            prisma.doctorPerformance.findUnique({ where: { doctorId } })
        ]);
        return {
            totalPosts: posts,
            totalComments: comments,
            conversionCount: performance?.conversionCount || 0,
            curedPatientCount: performance?.curedPatientCount || 0,
            portfolioScore: performance?.portfolioScore || 0,
            clinicVisitCount: performance?.clinicVisitCount || 0,
            helpfulnessScore: performance?.helpfulnessScore || 0
        };
    }
    /**
     * Feature 4: Track comment conversion (profile visit -> message click)
     */
    async trackCommentConversion(data) {
        const { commentId, doctorId, patientId, postId, action } = data;
        let conversion = await prisma.commentConversion.findFirst({
            where: { commentId, patientId }
        });
        if (!conversion) {
            conversion = await prisma.commentConversion.create({
                data: {
                    commentId,
                    doctorId,
                    patientId,
                    postId,
                    profileVisited: action === 'profile_visit',
                    visitedAt: action === 'profile_visit' ? new Date() : undefined
                }
            });
        }
        else if (action === 'message_click' && !conversion.messageClicked) {
            conversion = await prisma.commentConversion.update({
                where: { id: conversion.id },
                data: {
                    messageClicked: true,
                    messageClickedAt: new Date()
                }
            });
            // Increment doctor's conversion count
            await prisma.doctorPerformance.upsert({
                where: { doctorId },
                create: {
                    doctorId,
                    conversionCount: 1,
                    totalPostsCommented: 0,
                    totalCommentsCount: 0
                },
                update: {
                    conversionCount: { increment: 1 }
                }
            });
        }
        return conversion;
    }
    /**
     * Calculate comprehensive portfolio score (0-100 scale)
     */
    calculatePortfolioScore(performance) {
        const { curedPatientCount = 0, notYetCount = 0, consultNewDoctorCount = 0, conversionCount = 0, clinicVisitCount = 0, totalCommentsCount = 0, totalPostsCommented = 0, totalResponses = 0, appointmentsCompleted = 0, helpfulnessScore = 0 } = performance;
        // Calculate totals for normalization
        const totalPatients = curedPatientCount + notYetCount + consultNewDoctorCount;
        const totalEngagements = conversionCount + clinicVisitCount + totalCommentsCount;
        const totalActivity = totalPostsCommented + totalResponses + appointmentsCompleted;
        // 1. Patient Outcomes (40% weight)
        const patientOutcomeRaw = totalPatients > 0 ? ((curedPatientCount * 10) + // +10 per cured patient
            (notYetCount * 2) + // +2 per ongoing case
            (consultNewDoctorCount * -8) // -8 per lost patient
        ) / totalPatients : 0;
        const patientOutcomeScore = Math.min(Math.max(patientOutcomeRaw, 0) * 4, 40); // Scale to 40 max
        // 2. Engagement Quality (25% weight)  
        const engagementRaw = totalEngagements > 0 ? ((conversionCount * 3) + // +3 per conversion
            (clinicVisitCount * 5) + // +5 per clinic visit
            (totalCommentsCount * 0.5) // +0.5 per comment
        ) / totalEngagements : 0;
        const engagementScore = Math.min(engagementRaw * 2.5, 25); // Scale to 25 max
        // 3. Professional Activity (20% weight)
        const activityRaw = totalActivity > 0 ? ((totalPostsCommented * 1) + // +1 per post engagement
            (totalResponses * 0.8) + // +0.8 per response  
            (appointmentsCompleted * 2) // +2 per completed appointment
        ) / totalActivity : 0;
        const activityScore = Math.min(activityRaw * 2, 20); // Scale to 20 max
        // 4. Patient Satisfaction (15% weight)
        const helpfulnessNormalized = (helpfulnessScore || 0) / 5 * 10; // 0-5 → 0-10
        const cureRate = totalPatients > 0 ? (curedPatientCount / totalPatients) * 5 : 0; // 0-5
        const satisfactionScore = Math.min((helpfulnessNormalized + cureRate) * 0.75, 15); // Scale to 15 max
        // 5. Consistency Multiplier (experience bonus)
        const consistencyMultiplier = Math.min(1 + (Math.log(totalPatients + 1) / 10), // Logarithmic bonus for experience
        1.2 // Max 20% bonus
        );
        // 6. Final Score Calculation
        const rawScore = (patientOutcomeScore +
            engagementScore +
            activityScore +
            satisfactionScore) * consistencyMultiplier;
        return Math.min(Math.max(Math.round(rawScore), 0), 100);
    }
    /**
     * Feature 5: Handle patient feedback loop (updated with new portfolio calculation)
     */
    async submitPatientFeedback(data) {
        const { patientId, doctorId, conversationId, appointmentId, status, wasClinicVisit } = data;
        const feedback = await prisma.patientFeedback.upsert({
            where: {
                id: conversationId || appointmentId || `${patientId}-${doctorId}`
            },
            create: {
                patientId,
                doctorId,
                conversationId,
                appointmentId,
                status,
                feedbackCount: 1,
                lastFeedbackAt: new Date(),
                curedAt: status === 'CURED' ? new Date() : undefined,
                wasClinicVisit: wasClinicVisit || false
            },
            update: {
                status,
                feedbackCount: { increment: 1 },
                lastFeedbackAt: new Date(),
                curedAt: status === 'CURED' ? new Date() : undefined
            }
        });
        // Update doctor performance counts
        const updateData = {};
        if (status === 'CURED') {
            updateData.curedPatientCount = { increment: 1 };
            if (wasClinicVisit) {
                updateData.postClinicCureCount = { increment: 1 };
            }
        }
        else if (status === 'NOT_YET') {
            updateData.notYetCount = { increment: 1 };
        }
        else if (status === 'CONSULT_NEW_DOCTOR') {
            updateData.consultNewDoctorCount = { increment: 1 };
        }
        // Get current performance to recalculate portfolio score
        const currentPerformance = await prisma.doctorPerformance.findUnique({
            where: { doctorId }
        });
        // Calculate new portfolio score using the updated data
        const updatedPerformance = {
            ...currentPerformance,
            ...Object.keys(updateData).reduce((acc, key) => {
                if (updateData[key].increment) {
                    acc[key] = (currentPerformance?.[key] || 0) + updateData[key].increment;
                }
                return acc;
            }, {})
        };
        const newPortfolioScore = this.calculatePortfolioScore(updatedPerformance);
        updateData.portfolioScore = newPortfolioScore;
        await prisma.doctorPerformance.upsert({
            where: { doctorId },
            create: {
                doctorId,
                portfolioScore: newPortfolioScore,
                totalPostsCommented: 0,
                totalCommentsCount: 0,
                ...updateData
            },
            update: updateData
        });
        return feedback;
    }
    /**
     * Feature 6: Get doctor portfolio deep-dive for admin
     */
    async getDoctorPortfolio(doctorId) {
        const [performance, comments, conversions, feedbacks] = await Promise.all([
            prisma.doctorPerformance.findUnique({ where: { doctorId } }),
            prisma.comment.findMany({
                where: { authorId: doctorId },
                include: {
                    post: { select: { id: true, title: true, communityId: true } }
                },
                orderBy: { createdAt: 'desc' },
                take: 50
            }),
            prisma.commentConversion.findMany({
                where: { doctorId, messageClicked: true },
                include: {
                    comment: { select: { id: true, content: true } },
                    post: { select: { id: true, title: true } }
                }
            }),
            prisma.patientFeedback.findMany({
                where: { doctorId },
                include: {
                    patient: { select: { id: true, username: true } }
                }
            })
        ]);
        const conversionsByComment = conversions.reduce((acc, conv) => {
            acc[conv.commentId] = (acc[conv.commentId] || 0) + 1;
            return acc;
        }, {});
        const commentsWithConversions = comments.map(comment => ({
            ...comment,
            conversionCount: conversionsByComment[comment.id] || 0
        }));
        const curedCount = feedbacks.filter(f => f.status === 'CURED').length;
        const totalFeedbacks = feedbacks.length;
        const satisfactionRatio = totalFeedbacks > 0 ? (curedCount / totalFeedbacks * 100).toFixed(2) : '0';
        return {
            performance,
            commentsWithConversions,
            totalConversions: conversions.length,
            feedbacks,
            satisfactionRatio,
            curedCount,
            totalFeedbacks
        };
    }
    /**
     * Feature 7: Track clinic visit conversion
     */
    async trackClinicVisit(doctorId, patientId) {
        await prisma.doctorPerformance.upsert({
            where: { doctorId },
            create: {
                doctorId,
                clinicVisitCount: 1,
                totalPostsCommented: 0,
                totalCommentsCount: 0
            },
            update: {
                clinicVisitCount: { increment: 1 }
            }
        });
        return { success: true };
    }
    /**
     * Recalculate portfolio scores for all doctors (maintenance method)
     */
    async recalculateAllPortfolioScores() {
        const performances = await prisma.doctorPerformance.findMany();
        const updates = [];
        for (const performance of performances) {
            const newScore = this.calculatePortfolioScore(performance);
            updates.push(prisma.doctorPerformance.update({
                where: { id: performance.id },
                data: { portfolioScore: newScore }
            }));
        }
        await Promise.all(updates);
        return { updated: performances.length };
    }
    /**
     * Feature 8 & 9: Get top doctors (regional or global, optionally filtered by specialty)
     */
    async getTopDoctors(options) {
        const { region, specialty, limit = 10 } = options;
        const where = {
            role: 'DOCTOR',
            doctorVerificationStatus: 'APPROVED'
        };
        if (specialty) {
            where.specialty = specialty;
        }
        // Regional filtering by pincode
        if (region) {
            where.pincode = region;
        }
        const doctors = await prisma.user.findMany({
            where,
            include: {
                UserAnalytics: true
            },
            take: limit * 2 // Get more to filter
        });
        const doctorIds = doctors.map(d => d.id);
        const performances = await prisma.doctorPerformance.findMany({
            where: { doctorId: { in: doctorIds } }
        });
        const performanceMap = performances.reduce((acc, p) => {
            acc[p.doctorId] = p;
            return acc;
        }, {});
        const doctorsWithStats = doctors.map(doctor => ({
            id: doctor.id,
            username: doctor.username,
            specialty: doctor.specialty,
            avatar: doctor.avatar,
            pincode: doctor.pincode,
            curedPatientCount: performanceMap[doctor.id]?.curedPatientCount || 0,
            conversionCount: performanceMap[doctor.id]?.conversionCount || 0,
            portfolioScore: performanceMap[doctor.id]?.portfolioScore || 0,
            helpfulnessScore: performanceMap[doctor.id]?.helpfulnessScore || 0
        }));
        return doctorsWithStats
            .sort((a, b) => b.portfolioScore - a.portfolioScore)
            .slice(0, limit);
    }
}
exports.EnhancedAnalyticsService = EnhancedAnalyticsService;
exports.enhancedAnalyticsService = new EnhancedAnalyticsService();
