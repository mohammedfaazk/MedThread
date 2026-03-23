"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformAnalyticsRouter = void 0;
const express_1 = require("express");
const platform_analytics_service_1 = require("../services/platform-analytics.service");
const auth_refactored_1 = require("../middleware/auth.refactored");
const asyncHandler_1 = require("../middleware/asyncHandler");
const router = (0, express_1.Router)();
exports.platformAnalyticsRouter = router;
/**
 * GET /api/platform-analytics/peak-usage
 * Get peak usage analytics
 */
router.get('/peak-usage', auth_refactored_1.authenticate, (0, auth_refactored_1.requireRole)('ADMIN'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { days = 30 } = req.query;
    const peakUsage = await platform_analytics_service_1.platformAnalyticsService.getPeakUsageAnalytics(parseInt(days));
    res.json({ success: true, data: peakUsage });
}));
/**
 * GET /api/platform-analytics/response-times
 * Get platform response time metrics
 */
router.get('/response-times', auth_refactored_1.authenticate, (0, auth_refactored_1.requireRole)('ADMIN'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const metrics = await platform_analytics_service_1.platformAnalyticsService.getResponseTimeMetrics();
    res.json({ success: true, data: metrics });
}));
/**
 * GET /api/platform-analytics/bottlenecks
 * Detect platform bottlenecks
 */
router.get('/bottlenecks', auth_refactored_1.authenticate, (0, auth_refactored_1.requireRole)('ADMIN'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const bottlenecks = await platform_analytics_service_1.platformAnalyticsService.detectBottlenecks();
    res.json({ success: true, data: bottlenecks });
}));
/**
 * GET /api/platform-analytics/resource-recommendations
 * Get resource allocation recommendations
 */
router.get('/resource-recommendations', auth_refactored_1.authenticate, (0, auth_refactored_1.requireRole)('ADMIN'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const recommendations = await platform_analytics_service_1.platformAnalyticsService.getResourceRecommendations();
    res.json({ success: true, data: recommendations });
}));
/**
 * POST /api/platform-analytics/calculate-daily
 * Calculate daily metrics (Admin only, typically run via cron)
 */
router.post('/calculate-daily', auth_refactored_1.authenticate, (0, auth_refactored_1.requireRole)('ADMIN'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { date } = req.body;
    const metrics = await platform_analytics_service_1.platformAnalyticsService.calculateDailyMetrics(date ? new Date(date) : new Date());
    res.json({ success: true, data: metrics });
}));
