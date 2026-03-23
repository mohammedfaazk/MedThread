"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthInsightsRouter = void 0;
const express_1 = require("express");
const health_insights_service_1 = require("../services/health-insights.service");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../middleware/asyncHandler");
exports.healthInsightsRouter = (0, express_1.Router)();
/**
 * GET /api/health-insights/dashboard
 * Get complete insights dashboard for doctor
 */
exports.healthInsightsRouter.get('/dashboard', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const doctorId = req.user.userId;
    const { specialty } = req.query;
    const dashboard = await health_insights_service_1.healthInsightsService.getDoctorInsightsDashboard(doctorId, specialty);
    res.json(dashboard);
}));
/**
 * GET /api/health-insights/trending-symptoms
 * Get trending symptoms
 */
exports.healthInsightsRouter.get('/trending-symptoms', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { timeframe = 'week' } = req.query;
    const insights = await health_insights_service_1.healthInsightsService.generateTrendingSymptoms(timeframe);
    res.json(insights);
}));
/**
 * GET /api/health-insights/regional-alerts
 * Get regional health alerts
 */
exports.healthInsightsRouter.get('/regional-alerts', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const alerts = await health_insights_service_1.healthInsightsService.generateRegionalAlerts();
    res.json(alerts);
}));
/**
 * GET /api/health-insights/medication-patterns
 * Get medication usage patterns
 */
exports.healthInsightsRouter.get('/medication-patterns', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const patterns = await health_insights_service_1.healthInsightsService.analyzeMedicationPatterns();
    res.json(patterns);
}));
/**
 * GET /api/health-insights/diagnostic-patterns
 * Get diagnostic patterns and common misdiagnoses
 */
exports.healthInsightsRouter.get('/diagnostic-patterns', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const patterns = await health_insights_service_1.healthInsightsService.getDiagnosticPatterns();
    res.json(patterns);
}));
