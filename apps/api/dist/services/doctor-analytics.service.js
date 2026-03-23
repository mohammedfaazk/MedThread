"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorAnalyticsService = exports.DoctorAnalyticsService = void 0;
const database_1 = require("@medthread/database");
const socket_1 = require("../socket");
const analytics_handler_1 = require("../handlers/analytics.handler");
class DoctorAnalyticsService {
    /**
     * Update doctor performance metrics
     */
    async updateDoctorPerformance(metrics) {
        const existing = await database_1.prisma.doctorPerformance.findUnique({
            where: { doctorId: metrics.doctorId }
        });
        if (existing) {
            return await database_1.prisma.doctorPerformance.update({
                where: { doctorId: metrics.doctorId },
                data: {
                    ...metrics,
                    calculatedAt: new Date()
                }
            });
        }
        return await database_1.prisma.doctorPerformance.create({
            data: {
                doctorId: metrics.doctorId,
                totalResponses: metrics.totalResponses || 0,
                totalPatientsHelped: metrics.totalPatientsHelped || 0,
                avgResponseTime: metrics.avgResponseTime,
                helpfulnessScore: metrics.helpfulnessScore,
                appointmentsCompleted: metrics.appointmentsCompleted || 0,
                calculatedAt: new Date()
            }
        });
    }
    /**
     * Calculate doctor engagement metrics
     */
    async calculateDoctorEngagement(doctorId) {
        const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        // Get thread replies
        const replies = await database_1.prisma.threadReply.count({
            where: {
                authorId: doctorId,
                createdAt: { gte: last30Days }
            }
        });
        // Get appointments
        const appointments = await database_1.prisma.appointment.findMany({
            where: {
                doctorId,
                createdAt: { gte: last30Days }
            }
        });
        const completed = appointments.filter(a => a.status === 'COMPLETED').length;
        const cancelled = appointments.filter(a => a.status === 'CANCELLED').length;
        // Get ratings
        const ratings = await database_1.prisma.doctorRating.findMany({
            where: {
                doctorId,
                createdAt: { gte: last30Days }
            }
        });
        const avgRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : 0;
        // Calculate engagement score (0-100)
        const engagementScore = Math.min(100, (replies * 2) + (completed * 5) + (avgRating * 10));
        await this.updateDoctorPerformance({
            doctorId,
            totalResponses: replies,
            totalPatientsHelped: completed,
            appointmentsCompleted: completed,
            appointmentsCancelled: cancelled,
            helpfulnessScore: avgRating,
            totalRatings: ratings.length
        });
        // Broadcast real-time update
        const io = (0, socket_1.getSocketInstance)();
        if (io) {
            const performance = await database_1.prisma.doctorPerformance.findUnique({
                where: { doctorId }
            });
            if (performance) {
                (0, analytics_handler_1.broadcastDoctorPerformance)(io, performance);
            }
        }
        return {
            replies,
            appointments: appointments.length,
            completed,
            cancelled,
            avgRating,
            engagementScore
        };
    }
    /**
     * Get top doctors leaderboard
     */
    async getTopDoctors(limit = 10, sortBy = 'helpfulnessScore') {
        const orderBy = {};
        orderBy[sortBy] = 'desc';
        const topDoctors = await database_1.prisma.doctorPerformance.findMany({
            orderBy,
            take: limit
        });
        // Enrich with user data
        const doctorIds = topDoctors.map(d => d.doctorId);
        const users = await database_1.prisma.user.findMany({
            where: { id: { in: doctorIds } },
            select: {
                id: true,
                username: true,
                avatar: true,
                specialty: true,
                yearsOfExperience: true
            }
        });
        return topDoctors.map(perf => ({
            ...perf,
            doctor: users.find(u => u.id === perf.doctorId)
        }));
    }
    /**
     * Get doctor growth metrics
     */
    async getDoctorGrowthMetrics(timeRange) {
        const newDoctors = await database_1.prisma.user.count({
            where: {
                role: 'DOCTOR',
                createdAt: {
                    gte: timeRange.startDate,
                    lte: timeRange.endDate
                }
            }
        });
        const activeDoctors = await database_1.prisma.doctorPerformance.count({
            where: {
                lastActiveAt: {
                    gte: timeRange.startDate,
                    lte: timeRange.endDate
                }
            }
        });
        return { newDoctors, activeDoctors };
    }
    /**
     * Track doctor rating
     */
    async trackDoctorRating(data) {
        const rating = await database_1.prisma.doctorRating.create({
            data
        });
        // Update doctor performance immediately
        await this.calculateDoctorEngagement(data.doctorId);
        // Broadcast real-time update
        const io = (0, socket_1.getSocketInstance)();
        if (io) {
            (0, analytics_handler_1.broadcastDoctorRating)(io, rating);
        }
        return rating;
    }
    /**
     * Get doctor response time analytics
     */
    async getDoctorResponseTimes(doctorId) {
        const where = doctorId ? { doctorId } : {};
        return await database_1.prisma.doctorPerformance.findMany({
            where,
            select: {
                doctorId: true,
                avgResponseTime: true
            },
            orderBy: { avgResponseTime: 'asc' }
        });
    }
}
exports.DoctorAnalyticsService = DoctorAnalyticsService;
exports.doctorAnalyticsService = new DoctorAnalyticsService();
