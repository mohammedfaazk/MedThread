"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const enhanced_analytics_service_1 = require("../services/enhanced-analytics.service");
const auth_refactored_1 = require("../middleware/auth.refactored");
const router = express_1.default.Router();
// Feature 1: Doctor specialty distribution
router.get('/doctor-specialty-distribution', async (req, res) => {
    try {
        const data = await enhanced_analytics_service_1.enhancedAnalyticsService.getDoctorSpecialtyDistribution();
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Error fetching doctor specialty distribution:', error);
        res.status(500).json({ error: error.message });
    }
});
// Feature 2: Community activity analysis
router.get('/community-activity', async (req, res) => {
    try {
        const { communityId } = req.query;
        const data = await enhanced_analytics_service_1.enhancedAnalyticsService.analyzeCommunityActivity(communityId);
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Error analyzing community activity:', error);
        res.status(500).json({ error: error.message });
    }
});
// Feature 3: Doctor public stats (real-time)
router.get('/doctor-stats/:doctorId', async (req, res) => {
    try {
        const { doctorId } = req.params;
        const data = await enhanced_analytics_service_1.enhancedAnalyticsService.getDoctorPublicStats(doctorId);
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Error fetching doctor stats:', error);
        res.status(500).json({ error: error.message });
    }
});
// Feature 4: Track comment conversion
router.post('/track-conversion', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const { commentId, doctorId, postId, action } = req.body;
        const patientId = req.userId;
        const data = await enhanced_analytics_service_1.enhancedAnalyticsService.trackCommentConversion({
            commentId,
            doctorId,
            patientId,
            postId,
            action
        });
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Error tracking conversion:', error);
        res.status(500).json({ error: error.message });
    }
});
// Feature 5: Submit patient feedback
router.post('/patient-feedback', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const { doctorId, conversationId, appointmentId, status, wasClinicVisit } = req.body;
        const patientId = req.userId;
        const data = await enhanced_analytics_service_1.enhancedAnalyticsService.submitPatientFeedback({
            patientId,
            doctorId,
            conversationId,
            appointmentId,
            status,
            wasClinicVisit
        });
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Error submitting patient feedback:', error);
        res.status(500).json({ error: error.message });
    }
});
// Feature 6: Doctor portfolio (admin only)
router.get('/doctor-portfolio/:doctorId', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const userRole = req.userRole;
        if (userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { doctorId } = req.params;
        const data = await enhanced_analytics_service_1.enhancedAnalyticsService.getDoctorPortfolio(doctorId);
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Error fetching doctor portfolio:', error);
        res.status(500).json({ error: error.message });
    }
});
// Feature 7: Track clinic visit
router.post('/track-clinic-visit', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const { doctorId } = req.body;
        const patientId = req.userId;
        const data = await enhanced_analytics_service_1.enhancedAnalyticsService.trackClinicVisit(doctorId, patientId);
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Error tracking clinic visit:', error);
        res.status(500).json({ error: error.message });
    }
});
// Feature 8 & 9: Get top doctors
router.get('/top-doctors', async (req, res) => {
    try {
        const { region, specialty, limit } = req.query;
        const data = await enhanced_analytics_service_1.enhancedAnalyticsService.getTopDoctors({
            region: region,
            specialty: specialty,
            limit: limit ? parseInt(limit) : 10
        });
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Error fetching top doctors:', error);
        res.status(500).json({ error: error.message });
    }
});
// Check if feedback is needed
router.get('/check-feedback-needed', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const { conversationId, appointmentId } = req.query;
        const patientId = req.userId;
        const { feedbackNotificationService } = require('../services/feedback-notification.service');
        const result = await feedbackNotificationService.checkFeedbackNeeded(patientId, conversationId, appointmentId);
        res.json({ success: true, ...result });
    }
    catch (error) {
        console.error('Error checking feedback needed:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
// Recalculate portfolio scores (admin only)
router.post('/recalculate-portfolio-scores', auth_refactored_1.authenticate, async (req, res) => {
    try {
        const userRole = req.userRole;
        if (userRole !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const data = await enhanced_analytics_service_1.enhancedAnalyticsService.recalculateAllPortfolioScores();
        res.json({ success: true, data });
    }
    catch (error) {
        console.error('Error recalculating portfolio scores:', error);
        res.status(500).json({ error: error.message });
    }
});
