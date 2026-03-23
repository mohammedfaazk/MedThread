"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const doctor_profile_analytics_service_1 = require("../services/doctor-profile-analytics.service");
const auth_refactored_1 = require("../middleware/auth.refactored");
const router = (0, express_1.Router)();
/**
 * GET /api/doctor-profile-analytics/patient-acquisition/:doctorId
 * Get patient acquisition graph data for doctor's public profile
 */
router.get('/patient-acquisition/:doctorId', auth_refactored_1.optionalAuth, async (req, res) => {
    try {
        const { doctorId } = req.params;
        const data = await doctor_profile_analytics_service_1.doctorProfileAnalyticsService.getPatientAcquisitionGraph(doctorId);
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Error fetching patient acquisition data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/doctor-profile-analytics/reply-time/:doctorId
 * Get average reply time for doctor's public profile
 */
router.get('/reply-time/:doctorId', auth_refactored_1.optionalAuth, async (req, res) => {
    try {
        const { doctorId } = req.params;
        const data = await doctor_profile_analytics_service_1.doctorProfileAnalyticsService.getAverageReplyTime(doctorId);
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Error fetching reply time data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/doctor-profile-analytics/daily-activity/:doctorId
 * Get daily activity pattern for doctor's public profile
 */
router.get('/daily-activity/:doctorId', auth_refactored_1.optionalAuth, async (req, res) => {
    try {
        const { doctorId } = req.params;
        const data = await doctor_profile_analytics_service_1.doctorProfileAnalyticsService.getDailyActivityGraph(doctorId);
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Error fetching daily activity data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
/**
 * GET /api/doctor-profile-analytics/comprehensive/:doctorId
 * Get all doctor profile analytics in one call
 */
router.get('/comprehensive/:doctorId', auth_refactored_1.optionalAuth, async (req, res) => {
    try {
        const { doctorId } = req.params;
        const data = await doctor_profile_analytics_service_1.doctorProfileAnalyticsService.getComprehensiveDoctorStats(doctorId);
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Error fetching comprehensive doctor stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
exports.default = router;
