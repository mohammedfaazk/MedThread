"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastPlatformMetrics = exports.broadcastDoctorRating = exports.broadcastDoctorPerformance = exports.broadcastGeographicAlert = exports.broadcastHealthTrends = exports.broadcastSymptomReport = exports.analyticsHandler = void 0;
const health_analytics_service_1 = require("../services/health-analytics.service");
const doctor_analytics_service_1 = require("../services/doctor-analytics.service");
const platform_analytics_service_1 = require("../services/platform-analytics.service");
const analyticsHandler = (io, socket) => {
    console.log(`[Analytics] Client connected: ${socket.id}`);
    // Join analytics room
    socket.on('analytics:subscribe', async (data) => {
        const room = `analytics:${data.type}`;
        socket.join(room);
        console.log(`[Analytics] Client ${socket.id} subscribed to ${room}`);
        // Send initial data
        try {
            if (data.type === 'health') {
                const trending = await health_analytics_service_1.healthAnalyticsService.getTrendingSymptoms('daily', 10);
                const alerts = await health_analytics_service_1.healthAnalyticsService.getGeographicAlerts();
                socket.emit('analytics:health:initial', { trending, alerts });
            }
            else if (data.type === 'doctor') {
                const leaderboard = await doctor_analytics_service_1.doctorAnalyticsService.getTopDoctors(10, 'helpfulnessScore');
                socket.emit('analytics:doctor:initial', { leaderboard });
            }
            else if (data.type === 'platform') {
                const peakUsage = await platform_analytics_service_1.platformAnalyticsService.getPeakUsageAnalytics(30);
                const bottlenecks = await platform_analytics_service_1.platformAnalyticsService.detectBottlenecks();
                socket.emit('analytics:platform:initial', { peakUsage, bottlenecks });
            }
        }
        catch (error) {
            console.error('[Analytics] Error sending initial data:', error);
        }
    });
    // Unsubscribe from analytics
    socket.on('analytics:unsubscribe', (data) => {
        const room = `analytics:${data.type}`;
        socket.leave(room);
        console.log(`[Analytics] Client ${socket.id} unsubscribed from ${room}`);
    });
    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`[Analytics] Client disconnected: ${socket.id}`);
    });
};
exports.analyticsHandler = analyticsHandler;
/**
 * Broadcast new symptom report to all health analytics subscribers
 */
const broadcastSymptomReport = (io, report) => {
    io.to('analytics:health').emit('analytics:health:symptom-report', report);
};
exports.broadcastSymptomReport = broadcastSymptomReport;
/**
 * Broadcast updated health trends
 */
const broadcastHealthTrends = (io, trends) => {
    io.to('analytics:health').emit('analytics:health:trends-update', trends);
};
exports.broadcastHealthTrends = broadcastHealthTrends;
/**
 * Broadcast geographic alert
 */
const broadcastGeographicAlert = (io, alert) => {
    io.to('analytics:health').emit('analytics:health:alert', alert);
};
exports.broadcastGeographicAlert = broadcastGeographicAlert;
/**
 * Broadcast doctor performance update
 */
const broadcastDoctorPerformance = (io, performance) => {
    io.to('analytics:doctor').emit('analytics:doctor:performance-update', performance);
};
exports.broadcastDoctorPerformance = broadcastDoctorPerformance;
/**
 * Broadcast new doctor rating
 */
const broadcastDoctorRating = (io, rating) => {
    io.to('analytics:doctor').emit('analytics:doctor:rating', rating);
};
exports.broadcastDoctorRating = broadcastDoctorRating;
/**
 * Broadcast platform metrics update
 */
const broadcastPlatformMetrics = (io, metrics) => {
    io.to('analytics:platform').emit('analytics:platform:metrics-update', metrics);
};
exports.broadcastPlatformMetrics = broadcastPlatformMetrics;
