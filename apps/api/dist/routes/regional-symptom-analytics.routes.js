"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const regional_symptom_analytics_service_1 = require("../services/regional-symptom-analytics.service");
const auth_refactored_1 = require("../middleware/auth.refactored");
const router = (0, express_1.Router)();
/**
 * POST /api/regional-symptom-analytics/collect-reports
 * Collect symptom reports from recent posts (can be run as cron job)
 */
router.post('/collect-reports', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const data = await regional_symptom_analytics_service_1.regionalSymptomAnalyticsService.collectSymptomReports();
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Error collecting symptom reports:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/regional-symptom-analytics/heatmap
 * Get regional symptom heatmap data with filtering
 */
router.get('/heatmap', auth_refactored_1.optionalAuth, async (req, res) => {
    try {
        const { locationLevel, symptom, timeWindow, severity } = req.query;
        const data = await regional_symptom_analytics_service_1.regionalSymptomAnalyticsService.getRegionalSymptomHeatmap({
            locationLevel: locationLevel || 'city',
            symptomFilter: symptom,
            timeWindow: timeWindow || 'month',
            severityFilter: severity
        });
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Error fetching regional symptom heatmap:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/regional-symptom-analytics/trending
 * Get trending symptoms across regions
 */
router.get('/trending', auth_refactored_1.optionalAuth, async (req, res) => {
    try {
        const { days } = req.query;
        const data = await regional_symptom_analytics_service_1.regionalSymptomAnalyticsService.getTrendingSymptoms(days ? parseInt(days) : 7);
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Error fetching trending symptoms:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/regional-symptom-analytics/location/:location
 * Get detailed symptom data for specific location
 */
router.get('/location/:location', auth_refactored_1.optionalAuth, async (req, res) => {
    try {
        const { location } = req.params;
        const { level } = req.query;
        const data = await regional_symptom_analytics_service_1.regionalSymptomAnalyticsService.getLocationSymptomDetails(location, level || 'city');
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Error fetching location symptom details:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/regional-symptom-analytics/alerts
 * Get regional health alerts
 */
router.get('/alerts', auth_refactored_1.optionalAuth, async (req, res) => {
    try {
        const data = await regional_symptom_analytics_service_1.regionalSymptomAnalyticsService.generateRegionalHealthAlerts();
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Error generating regional health alerts:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/regional-symptom-analytics/by-pincode
 * Get symptom heatmap scoped to a user's pincode + chosen geographic scope
 * Query: pincode, scope (area|city|district|state|country), timeWindow
 */
router.get('/by-pincode', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const { pincode, scope, timeWindow } = req.query;
        if (!pincode)
            return res.status(400).json({ success: false, error: 'pincode is required' });
        const data = await regional_symptom_analytics_service_1.regionalSymptomAnalyticsService.getSymptomsByPincode(pincode, scope || 'city', timeWindow || 'month');
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching symptoms by pincode:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/regional-symptom-analytics/resolve-pincode
 * Resolve a pincode to its geographic hierarchy
 */
router.get('/resolve-pincode', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const { pincode } = req.query;
        if (!pincode)
            return res.status(400).json({ success: false, error: 'pincode is required' });
        const location = await regional_symptom_analytics_service_1.regionalSymptomAnalyticsService.resolveLocation(pincode);
        res.json({ success: !!location, data: location });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * POST /api/regional-symptom-analytics/report-from-post
 * Create a SymptomReport from a patient post using chip-selected symptoms.
 * Called immediately after post creation.
 * Body: { postId, symptoms: string[], duration?: string }
 */
router.post('/report-from-post', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const { postId, symptoms, duration } = req.body;
        if (!postId || !Array.isArray(symptoms) || symptoms.length === 0) {
            return res.status(400).json({ success: false, error: 'postId and symptoms[] are required' });
        }
        const report = await regional_symptom_analytics_service_1.regionalSymptomAnalyticsService.collectFromPatientPost(postId, req.userId, symptoms, duration);
        res.json({ success: true, data: report });
    }
    catch (error) {
        console.error('Error creating symptom report from post:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
