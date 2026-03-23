"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorProfileAnalyticsService = exports.DoctorProfileAnalyticsService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class DoctorProfileAnalyticsService {
    /**
     * Feature 1a: Patient Acquisition Graph
     * Tracks cumulative patient growth from doctor's registration date
     */
    async getPatientAcquisitionGraph(doctorId) {
        // Get doctor's registration date
        const doctor = await prisma.user.findUnique({
            where: { id: doctorId },
            select: { createdAt: true }
        });
        if (!doctor) {
            throw new Error('Doctor not found');
        }
        // Get all patient feedbacks chronologically
        const feedbacks = await prisma.patientFeedback.findMany({
            where: { doctorId },
            select: { createdAt: true, patientId: true },
            orderBy: { createdAt: 'asc' }
        });
        // Get unique patients and their first interaction date
        const uniquePatients = new Map();
        feedbacks.forEach(feedback => {
            if (!uniquePatients.has(feedback.patientId)) {
                uniquePatients.set(feedback.patientId, feedback.createdAt);
            }
        });
        // Generate monthly data points from registration to now
        const startDate = new Date(doctor.createdAt);
        const endDate = new Date();
        const monthlyData = [];
        let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        let cumulativePatients = 0;
        while (currentDate <= endDate) {
            const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            // Count new patients acquired in this month
            const newPatients = Array.from(uniquePatients.values()).filter(date => date >= currentDate && date <= monthEnd).length;
            cumulativePatients += newPatients;
            monthlyData.push({
                month: currentDate.toISOString().substring(0, 7), // YYYY-MM format
                monthName: currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
                cumulativePatients,
                newPatients
            });
            // Move to next month
            currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        }
        return {
            registrationDate: doctor.createdAt,
            totalPatients: cumulativePatients,
            monthlyGrowth: monthlyData
        };
    }
    /**
     * Feature 1b: Average Reply Time
     * Calculate rolling average response time between patient message and doctor's first response
     */
    async getAverageReplyTime(doctorId) {
        // Get conversations where doctor participated
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: { id: doctorId }
                }
            },
            include: {
                messages: {
                    select: {
                        id: true,
                        senderId: true,
                        createdAt: true
                    },
                    orderBy: { createdAt: 'asc' }
                },
                participants: {
                    select: { id: true, role: true }
                }
            }
        });
        const replyTimes = [];
        for (const conversation of conversations) {
            const messages = conversation.messages;
            const patientIds = conversation.participants
                .filter(p => p.role === 'PATIENT')
                .map(p => p.id);
            // Find patient message -> doctor reply pairs
            for (let i = 0; i < messages.length - 1; i++) {
                const currentMessage = messages[i];
                // If current message is from patient
                if (patientIds.includes(currentMessage.senderId)) {
                    // Find next message from doctor
                    for (let j = i + 1; j < messages.length; j++) {
                        const nextMessage = messages[j];
                        if (nextMessage.senderId === doctorId) {
                            const replyTimeMs = nextMessage.createdAt.getTime() - currentMessage.createdAt.getTime();
                            const replyTimeHours = replyTimeMs / (1000 * 60 * 60);
                            replyTimes.push(replyTimeHours);
                            break; // Only count first reply
                        }
                    }
                }
            }
        }
        if (replyTimes.length === 0) {
            return {
                averageReplyHours: 0,
                displayText: "No reply data available",
                totalReplies: 0,
                medianReplyHours: 0
            };
        }
        const averageHours = replyTimes.reduce((sum, time) => sum + time, 0) / replyTimes.length;
        const sortedTimes = replyTimes.sort((a, b) => a - b);
        const medianHours = sortedTimes[Math.floor(sortedTimes.length / 2)];
        // Generate display text
        let displayText = "";
        if (averageHours < 1) {
            displayText = `Generally replies within ${Math.round(averageHours * 60)} minutes`;
        }
        else if (averageHours < 24) {
            displayText = `Generally replies within ${Math.round(averageHours)} hours`;
        }
        else {
            displayText = `Generally replies within ${Math.round(averageHours / 24)} days`;
        }
        return {
            averageReplyHours: Math.round(averageHours * 100) / 100,
            displayText,
            totalReplies: replyTimes.length,
            medianReplyHours: Math.round(medianHours * 100) / 100
        };
    }
    /**
     * Feature 1c: Daily Activity Graph
     * Show doctor's activity pattern by hour of day (0-23)
     */
    async getDailyActivityGraph(doctorId) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        // Get all doctor activities in last 30 days
        const [messages, comments, posts] = await Promise.all([
            prisma.message.findMany({
                where: {
                    senderId: doctorId,
                    createdAt: { gte: thirtyDaysAgo }
                },
                select: { createdAt: true }
            }),
            prisma.comment.findMany({
                where: {
                    authorId: doctorId,
                    createdAt: { gte: thirtyDaysAgo }
                },
                select: { createdAt: true }
            }),
            prisma.post.findMany({
                where: {
                    authorId: doctorId,
                    createdAt: { gte: thirtyDaysAgo }
                },
                select: { createdAt: true }
            })
        ]);
        // Combine all activities
        const allActivities = [
            ...messages.map(m => ({ type: 'message', createdAt: m.createdAt })),
            ...comments.map(c => ({ type: 'comment', createdAt: c.createdAt })),
            ...posts.map(p => ({ type: 'post', createdAt: p.createdAt }))
        ];
        // Group by hour of day (0-23)
        const hourlyActivity = Array.from({ length: 24 }, (_, hour) => ({
            hour,
            hourLabel: `${hour.toString().padStart(2, '0')}:00`,
            totalActivity: 0,
            messages: 0,
            comments: 0,
            posts: 0
        }));
        allActivities.forEach(activity => {
            const hour = activity.createdAt.getHours();
            hourlyActivity[hour].totalActivity++;
            hourlyActivity[hour][activity.type + 's']++;
        });
        // Get last active timestamp
        const lastActivity = allActivities.length > 0
            ? Math.max(...allActivities.map(a => a.createdAt.getTime()))
            : null;
        let lastActiveText = "No recent activity";
        if (lastActivity) {
            const hoursAgo = (Date.now() - lastActivity) / (1000 * 60 * 60);
            if (hoursAgo < 1) {
                lastActiveText = "Active now";
            }
            else if (hoursAgo < 24) {
                lastActiveText = `Last active ${Math.round(hoursAgo)} hours ago`;
            }
            else {
                lastActiveText = `Last active ${Math.round(hoursAgo / 24)} days ago`;
            }
        }
        return {
            hourlyPattern: hourlyActivity,
            totalActivities: allActivities.length,
            lastActiveText,
            peakHour: hourlyActivity.reduce((max, current) => current.totalActivity > max.totalActivity ? current : max)
        };
    }
    /**
     * Get comprehensive doctor profile stats for public display
     */
    async getComprehensiveDoctorStats(doctorId) {
        const [acquisition, replyTime, activity, performance] = await Promise.all([
            this.getPatientAcquisitionGraph(doctorId),
            this.getAverageReplyTime(doctorId),
            this.getDailyActivityGraph(doctorId),
            prisma.doctorPerformance.findUnique({ where: { doctorId } })
        ]);
        return {
            patientAcquisition: acquisition,
            averageReplyTime: replyTime,
            dailyActivity: activity,
            performance: {
                curedPatientCount: performance?.curedPatientCount || 0,
                conversionCount: performance?.conversionCount || 0,
                portfolioScore: performance?.portfolioScore || 0,
                clinicVisitCount: performance?.clinicVisitCount || 0,
                helpfulnessScore: performance?.helpfulnessScore || 0
            }
        };
    }
}
exports.DoctorProfileAnalyticsService = DoctorProfileAnalyticsService;
exports.doctorProfileAnalyticsService = new DoctorProfileAnalyticsService();
