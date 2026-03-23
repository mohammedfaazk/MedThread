"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformAnalyticsService = exports.PlatformAnalyticsService = void 0;
const database_1 = require("@medthread/database");
class PlatformAnalyticsService {
    /**
     * Calculate and store daily platform metrics
     */
    async calculateDailyMetrics(date = new Date()) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        // Total users
        const totalUsers = await database_1.prisma.user.count();
        // Active users (logged in today)
        const activeUsers = await database_1.prisma.userSession.count({
            where: {
                startTime: { gte: startOfDay, lte: endOfDay }
            }
        });
        // New users
        const newUsers = await database_1.prisma.user.count({
            where: {
                createdAt: { gte: startOfDay, lte: endOfDay }
            }
        });
        // Doctor metrics
        const totalDoctors = await database_1.prisma.user.count({
            where: { role: 'DOCTOR' }
        });
        const activeDoctors = await database_1.prisma.doctorPerformance.count({
            where: {
                lastActiveAt: { gte: startOfDay, lte: endOfDay }
            }
        });
        const newDoctors = await database_1.prisma.user.count({
            where: {
                role: 'DOCTOR',
                createdAt: { gte: startOfDay, lte: endOfDay }
            }
        });
        // Content metrics
        const totalPosts = await database_1.prisma.post.count({
            where: {
                createdAt: { gte: startOfDay, lte: endOfDay }
            }
        });
        const totalAppointments = await database_1.prisma.appointment.count({
            where: {
                createdAt: { gte: startOfDay, lte: endOfDay }
            }
        });
        const totalSymptomReports = await database_1.prisma.symptomReport.count({
            where: {
                createdAt: { gte: startOfDay, lte: endOfDay }
            }
        });
        // Peak usage hour
        const hourlyActivity = await this.getHourlyActivity(startOfDay, endOfDay);
        const peakUsageHour = hourlyActivity.indexOf(Math.max(...hourlyActivity));
        // Store metrics
        return await database_1.prisma.platformMetrics.upsert({
            where: { date: startOfDay },
            create: {
                date: startOfDay,
                totalUsers,
                activeUsers,
                newUsers,
                totalDoctors,
                activeDoctors,
                newDoctors,
                totalPosts,
                totalAppointments,
                totalSymptomReports,
                peakUsageHour
            },
            update: {
                totalUsers,
                activeUsers,
                newUsers,
                totalDoctors,
                activeDoctors,
                newDoctors,
                totalPosts,
                totalAppointments,
                totalSymptomReports,
                peakUsageHour
            }
        });
    }
    /**
     * Get hourly activity distribution
     */
    async getHourlyActivity(startOfDay, endOfDay) {
        const sessions = await database_1.prisma.userSession.findMany({
            where: {
                startTime: { gte: startOfDay, lte: endOfDay }
            },
            select: { startTime: true }
        });
        const hourCounts = new Array(24).fill(0);
        sessions.forEach(session => {
            const hour = new Date(session.startTime).getHours();
            hourCounts[hour]++;
        });
        return hourCounts;
    }
    /**
     * Get peak usage analytics
     */
    async getPeakUsageAnalytics(days = 30) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const metrics = await database_1.prisma.platformMetrics.findMany({
            where: {
                date: { gte: startDate }
            },
            orderBy: { date: 'asc' }
        });
        return {
            peakHours: this.aggregatePeakHours(metrics),
            peakDays: this.aggregatePeakDays(metrics),
            averageActiveUsers: metrics.reduce((sum, m) => sum + m.activeUsers, 0) / metrics.length
        };
    }
    aggregatePeakHours(metrics) {
        const hourCounts = {};
        metrics.forEach(m => {
            if (m.peakUsageHour !== null) {
                hourCounts[m.peakUsageHour] = (hourCounts[m.peakUsageHour] || 0) + 1;
            }
        });
        return hourCounts;
    }
    aggregatePeakDays(metrics) {
        const dayCounts = {};
        metrics.forEach(m => {
            const day = new Date(m.date).getDay();
            dayCounts[day] = (dayCounts[day] || 0) + m.activeUsers;
        });
        return dayCounts;
    }
    /**
     * Get response time metrics
     */
    async getResponseTimeMetrics() {
        const avgResponseTime = await database_1.prisma.doctorPerformance.aggregate({
            _avg: { avgResponseTime: true }
        });
        return {
            platformAverage: avgResponseTime._avg.avgResponseTime || 0
        };
    }
    /**
     * Detect platform bottlenecks
     */
    async detectBottlenecks() {
        const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        // High bounce rate pages
        const highBouncePosts = await database_1.prisma.postAnalytics.findMany({
            where: {
                bounceRate: { gte: 70 },
                lastUpdated: { gte: last7Days }
            },
            take: 10,
            orderBy: { bounceRate: 'desc' }
        });
        // Slow response times
        const slowDoctors = await database_1.prisma.doctorPerformance.findMany({
            where: {
                avgResponseTime: { gte: 120 } // 2+ hours
            },
            take: 10,
            orderBy: { avgResponseTime: 'desc' }
        });
        return {
            highBouncePosts,
            slowDoctors
        };
    }
    /**
     * Get resource allocation recommendations
     */
    async getResourceRecommendations() {
        // Find specialties with high demand but low doctor count
        const symptomReports = await database_1.prisma.symptomReport.findMany({
            where: {
                createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            }
        });
        // Analyze which specialties are most needed
        const specialtyDemand = {};
        symptomReports.forEach(report => {
            const symptoms = report.symptoms;
            symptoms.forEach(s => {
                const specialty = this.mapSymptomToSpecialty(s.name);
                specialtyDemand[specialty] = (specialtyDemand[specialty] || 0) + 1;
            });
        });
        // Get current doctor distribution
        const doctorsBySpecialty = await database_1.prisma.user.groupBy({
            by: ['specialty'],
            where: {
                role: 'DOCTOR',
                specialty: { not: null }
            },
            _count: true
        });
        const recommendations = Object.entries(specialtyDemand)
            .map(([specialty, demand]) => {
            const doctorCount = doctorsBySpecialty.find(d => d.specialty === specialty)?._count || 0;
            const ratio = doctorCount > 0 ? demand / doctorCount : demand;
            return { specialty, demand, doctorCount, ratio };
        })
            .sort((a, b) => b.ratio - a.ratio)
            .slice(0, 5);
        return recommendations;
    }
    mapSymptomToSpecialty(symptom) {
        const mapping = {
            'fever': 'General Medicine',
            'cough': 'Pulmonology',
            'headache': 'Neurology',
            'chest pain': 'Cardiology',
            'skin rash': 'Dermatology'
        };
        return mapping[symptom.toLowerCase()] || 'General Medicine';
    }
}
exports.PlatformAnalyticsService = PlatformAnalyticsService;
exports.platformAnalyticsService = new PlatformAnalyticsService();
