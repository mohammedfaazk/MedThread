"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorProfileEnhancedRouter = void 0;
const express_1 = require("express");
const doctor_profile_enhanced_service_1 = require("../services/doctor-profile-enhanced.service");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../middleware/asyncHandler");
exports.doctorProfileEnhancedRouter = (0, express_1.Router)();
/**
 * GET /api/doctor-profile/:username
 * Get public doctor profile
 */
exports.doctorProfileEnhancedRouter.get('/:username', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { username } = req.params;
    const profile = await doctor_profile_enhanced_service_1.doctorProfileEnhancedService.getPublicProfile(username);
    res.json(profile);
}));
/**
 * PUT /api/doctor-profile/professional
 * Update professional profile (authenticated doctor only)
 */
exports.doctorProfileEnhancedRouter.put('/professional', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const doctorId = req.user.userId;
    const profileData = req.body;
    const updated = await doctor_profile_enhanced_service_1.doctorProfileEnhancedService.updateProfessionalProfile(doctorId, profileData);
    res.json({
        message: 'Professional profile updated successfully',
        profile: updated
    });
}));
/**
 * GET /api/doctor-profile/metrics/performance
 * Get doctor's performance metrics
 */
exports.doctorProfileEnhancedRouter.get('/metrics/performance', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const doctorId = req.user.userId;
    const metrics = await doctor_profile_enhanced_service_1.doctorProfileEnhancedService.calculatePerformanceMetrics(doctorId);
    res.json(metrics);
}));
/**
 * GET /api/doctor-profile/stats/contribution
 * Get doctor's contribution stats
 */
exports.doctorProfileEnhancedRouter.get('/stats/contribution', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const doctorId = req.user.userId;
    const stats = await doctor_profile_enhanced_service_1.doctorProfileEnhancedService.getContributionStats(doctorId);
    res.json(stats);
}));
/**
 * POST /api/doctor-profile/badge
 * Award badge to doctor (admin only)
 */
exports.doctorProfileEnhancedRouter.post('/badge', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // TODO: Add admin check
    const { doctorId, badge } = req.body;
    const awarded = await doctor_profile_enhanced_service_1.doctorProfileEnhancedService.awardBadge(doctorId, badge);
    res.json({
        message: 'Badge awarded successfully',
        badge: awarded
    });
}));
