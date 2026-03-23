"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorAnalyticsRouter = void 0;
const express_1 = require("express");
const doctor_analytics_service_1 = require("../services/doctor-analytics.service");
const auth_refactored_1 = require("../middleware/auth.refactored");
const asyncHandler_1 = require("../middleware/asyncHandler");
const router = (0, express_1.Router)();
exports.doctorAnalyticsRouter = router;
/**
 * GET /api/doctor-analytics/leaderboard
 * Get top doctors leaderboard
 */
router.get('/leaderboard', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { limit = 10, sortBy = 'helpfulnessScore' } = req.query;
    const leaderboard = await doctor_analytics_service_1.doctorAnalyticsService.getTopDoctors(parseInt(limit), sortBy);
    res.json({ success: true, data: leaderboard });
}));
/**
 * GET /api/doctor-analytics/performance/:doctorId
 * Get doctor performance metrics
 */
router.get('/performance/:doctorId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { doctorId } = req.params;
    const metrics = await doctor_analytics_service_1.doctorAnalyticsService.calculateDoctorEngagement(doctorId);
    res.json({ success: true, data: metrics });
}));
/**
 * POST /api/doctor-analytics/rate
 * Rate a doctor
 */
router.post('/rate', auth_refactored_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { doctorId, appointmentId, threadId, rating, helpfulness, communication, expertise, feedback } = req.body;
    if (!doctorId || !rating) {
        return res.status(400).json({
            success: false,
            error: 'doctorId and rating are required'
        });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({
            success: false,
            error: 'rating must be between 1 and 5'
        });
    }
    const ratingRecord = await doctor_analytics_service_1.doctorAnalyticsService.trackDoctorRating({
        doctorId,
        patientId: req.userId,
        appointmentId,
        threadId,
        rating,
        helpfulness,
        communication,
        expertise,
        feedback
    });
    res.json({ success: true, data: ratingRecord });
}));
/**
 * GET /api/doctor-analytics/growth
 * Get doctor growth metrics (Admin only)
 */
router.get('/growth', auth_refactored_1.authenticate, (0, auth_refactored_1.requireRole)('ADMIN'), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
        return res.status(400).json({
            success: false,
            error: 'startDate and endDate are required'
        });
    }
    const growth = await doctor_analytics_service_1.doctorAnalyticsService.getDoctorGrowthMetrics({
        startDate: new Date(startDate),
        endDate: new Date(endDate)
    });
    res.json({ success: true, data: growth });
}));
/**
 * GET /api/doctor-analytics/response-times
 * Get doctor response time analytics
 */
router.get('/response-times', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { doctorId } = req.query;
    const responseTimes = await doctor_analytics_service_1.doctorAnalyticsService.getDoctorResponseTimes(doctorId);
    res.json({ success: true, data: responseTimes });
}));
