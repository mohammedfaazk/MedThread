"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthAnalyticsService = exports.HealthAnalyticsService = void 0;
const database_1 = require("@medthread/database");
const socket_1 = require("../socket");
const analytics_handler_1 = require("../handlers/analytics.handler");
class HealthAnalyticsService {
    /**
     * Track symptom report from patient
     */
    async trackSymptomReport(input) {
        const report = await database_1.prisma.symptomReport.create({
            data: {
                userId: input.userId,
                sessionId: input.sessionId,
                symptoms: input.symptoms,
                location: input.location || {},
                age: input.age,
                gender: input.gender,
                temperature: input.temperature,
                duration: input.duration,
                metadata: {}
            }
        });
        // Broadcast real-time update
        const io = (0, socket_1.getSocketInstance)();
        if (io) {
            (0, analytics_handler_1.broadcastSymptomReport)(io, report);
            // Trigger immediate trend recalculation
            this.calculateHealthTrendsRealtime();
        }
        return report;
    }
    /**
     * Get trending health issues
     */
    async getTrendingSymptoms(timeWindow = 'daily', limit = 10) {
        const now = new Date();
        let startDate = new Date();
        switch (timeWindow) {
            case 'hourly':
                startDate.setHours(now.getHours() - 1);
                break;
            case 'daily':
                startDate.setDate(now.getDate() - 1);
                break;
            case 'weekly':
                startDate.setDate(now.getDate() - 7);
                break;
            default:
                startDate.setDate(now.getDate() - 1);
        }
        const reports = await database_1.prisma.symptomReport.findMany({
            where: {
                createdAt: { gte: startDate }
            },
            select: { symptoms: true }
        });
        // Aggregate symptoms
        const symptomCounts = {};
        reports.forEach(report => {
            const symptoms = report.symptoms;
            symptoms.forEach(s => {
                symptomCounts[s.name] = (symptomCounts[s.name] || 0) + 1;
            });
        });
        return Object.entries(symptomCounts)
            .map(([symptom, count]) => ({ symptom, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
    /**
     * Get geographic health alerts
     */
    async getGeographicAlerts(region) {
        const where = region ? { region } : {};
        return await database_1.prisma.geographicHealthData.findMany({
            where: {
                ...where,
                alertLevel: { in: ['HIGH', 'CRITICAL'] }
            },
            orderBy: { calculatedAt: 'desc' },
            take: 20
        });
    }
    /**
     * Generate health advisory based on trends
     */
    async generateHealthAdvisory(symptom, region) {
        const trends = await database_1.prisma.healthTrend.findMany({
            where: {
                symptom,
                region: region || undefined,
                calculatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            },
            orderBy: { calculatedAt: 'desc' },
            take: 1
        });
        if (trends.length === 0)
            return null;
        const trend = trends[0];
        return {
            symptom,
            region: region || 'All regions',
            count: trend.count,
            severity: trend.severity,
            trend: trend.trendDirection,
            percentChange: trend.percentChange,
            advisory: this.generateAdvisoryText(symptom, trend)
        };
    }
    generateAdvisoryText(symptom, trend) {
        const direction = trend.trendDirection === 'rising' ? 'increasing' : 'decreasing';
        return `${symptom} cases are ${direction} by ${Math.abs(trend.percentChange || 0).toFixed(1)}%. Take preventive measures and consult a doctor if symptoms persist.`;
    }
    /**
     * Calculate and update health trends
     */
    async calculateHealthTrends(timeWindow = 'daily') {
        const trending = await this.getTrendingSymptoms(timeWindow, 50);
        for (const item of trending) {
            await database_1.prisma.healthTrend.create({
                data: {
                    symptom: item.symptom,
                    count: item.count,
                    timeWindow,
                    calculatedAt: new Date(),
                    metadata: {}
                }
            });
        }
        // Broadcast update
        const io = (0, socket_1.getSocketInstance)();
        if (io) {
            (0, analytics_handler_1.broadcastHealthTrends)(io, trending);
        }
    }
    /**
     * Calculate trends in real-time (lightweight)
     */
    async calculateHealthTrendsRealtime() {
        const trending = await this.getTrendingSymptoms('hourly', 10);
        const io = (0, socket_1.getSocketInstance)();
        if (io) {
            (0, analytics_handler_1.broadcastHealthTrends)(io, trending);
        }
    }
    /**
     * Get symptom pattern analysis
     */
    async getSymptomPatterns(timeRange) {
        const reports = await database_1.prisma.symptomReport.findMany({
            where: {
                createdAt: {
                    gte: timeRange.startDate,
                    lte: timeRange.endDate
                }
            }
        });
        // Analyze patterns by time of day, day of week, etc.
        const patterns = {
            byHour: new Array(24).fill(0),
            byDayOfWeek: new Array(7).fill(0),
            byAge: {},
            byGender: {}
        };
        reports.forEach(report => {
            const hour = new Date(report.createdAt).getHours();
            const day = new Date(report.createdAt).getDay();
            patterns.byHour[hour]++;
            patterns.byDayOfWeek[day]++;
            if (report.age) {
                const ageGroup = Math.floor(report.age / 10) * 10;
                patterns.byAge[`${ageGroup}-${ageGroup + 9}`] = (patterns.byAge[`${ageGroup}-${ageGroup + 9}`] || 0) + 1;
            }
            if (report.gender) {
                patterns.byGender[report.gender] = (patterns.byGender[report.gender] || 0) + 1;
            }
        });
        return patterns;
    }
    /**
     * Get top health issues dashboard
     */
    async getTopHealthIssues(limit = 10) {
        const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const trends = await database_1.prisma.healthTrend.findMany({
            where: {
                calculatedAt: { gte: last30Days }
            },
            orderBy: { count: 'desc' },
            take: limit
        });
        return trends;
    }
}
exports.HealthAnalyticsService = HealthAnalyticsService;
exports.healthAnalyticsService = new HealthAnalyticsService();
