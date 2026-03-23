"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthAnalyticsRouter = void 0;
const express_1 = require("express");
const health_analytics_service_1 = require("../services/health-analytics.service");
const auth_refactored_1 = require("../middleware/auth.refactored");
const asyncHandler_1 = require("../middleware/asyncHandler");
const router = (0, express_1.Router)();
exports.healthAnalyticsRouter = router;
/**
 * POST /api/health-analytics/symptom-report
 * Track symptom report
 */
router.post('/symptom-report', auth_refactored_1.optionalAuth, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { sessionId, symptoms, location, age, gender, temperature, duration } = req.body;
    if (!sessionId || !symptoms || !Array.isArray(symptoms)) {
        return res.status(400).json({
            success: false,
            error: 'sessionId and symptoms array are required'
        });
    }
    const report = await health_analytics_service_1.healthAnalyticsService.trackSymptomReport({
        userId: req.userId,
        sessionId,
        symptoms,
        location,
        age,
        gender,
        temperature,
        duration
    });
    res.json({ success: true, data: report });
}));
/**
 * GET /api/health-analytics/trending
 * Get trending symptoms
 */
router.get('/trending', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { timeWindow = 'daily', limit = 10 } = req.query;
    const trending = await health_analytics_service_1.healthAnalyticsService.getTrendingSymptoms(timeWindow, parseInt(limit));
    res.json({ success: true, data: trending });
}));
/**
 * GET /api/health-analytics/geographic-alerts
 * Get geographic health alerts
 */
router.get('/geographic-alerts', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { region } = req.query;
    const alerts = await health_analytics_service_1.healthAnalyticsService.getGeographicAlerts(region);
    res.json({ success: true, data: alerts });
}));
/**
 * GET /api/health-analytics/advisory/:symptom
 * Get health advisory for symptom
 */
router.get('/advisory/:symptom', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { symptom } = req.params;
    const { region } = req.query;
    const advisory = await health_analytics_service_1.healthAnalyticsService.generateHealthAdvisory(symptom, region);
    if (!advisory) {
        return res.status(404).json({
            success: false,
            error: 'No data available for this symptom'
        });
    }
    res.json({ success: true, data: advisory });
}));
/**
 * GET /api/health-analytics/patterns
 * Get symptom patterns
 */
router.get('/patterns', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        return res.status(400).json({
            success: false,
            error: 'startDate and endDate are required'
        });
    }
    const patterns = await health_analytics_service_1.healthAnalyticsService.getSymptomPatterns({
        startDate: new Date(startDate),
        endDate: new Date(endDate)
    });
    res.json({ success: true, data: patterns });
}));
/**
 * GET /api/health-analytics/top-issues
 * Get top health issues
 */
router.get('/top-issues', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { limit = 10 } = req.query;
    const issues = await health_analytics_service_1.healthAnalyticsService.getTopHealthIssues(parseInt(limit));
    res.json({ success: true, data: issues });
}));
