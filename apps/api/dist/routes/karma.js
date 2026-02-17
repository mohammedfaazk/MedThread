"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const karma_service_1 = require("../services/karma.service");
const asyncHandler_1 = require("../middleware/asyncHandler");
const router = (0, express_1.Router)();
/**
 * GET /api/v1/karma/me
 * Get current user's karma breakdown
 */
router.get('/me', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const karma = await karma_service_1.karmaService.getUserKarma(req.userId);
    res.json({
        success: true,
        data: karma
    });
}));
/**
 * GET /api/v1/karma/user/:userId
 * Get specific user's karma breakdown
 */
router.get('/user/:userId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const karma = await karma_service_1.karmaService.getUserKarma(req.params.userId);
    res.json({
        success: true,
        data: karma
    });
}));
/**
 * POST /api/v1/karma/update/:userId
 * Manually trigger karma recalculation (admin only or self)
 */
router.post('/update/:userId', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const targetUserId = req.params.userId;
    // Only allow users to update their own karma or admins to update anyone's
    if (req.userId !== targetUserId && req.userRole !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Forbidden: Can only update your own karma'
        });
    }
    const karma = await karma_service_1.karmaService.updateUserKarma(targetUserId);
    res.json({
        success: true,
        message: 'Karma updated successfully',
        data: karma
    });
}));
/**
 * GET /api/v1/karma/leaderboard
 * Get global karma leaderboard
 */
router.get('/leaderboard', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;
    const leaderboard = await karma_service_1.karmaService.getLeaderboard(limit, offset);
    res.json({
        success: true,
        data: leaderboard
    });
}));
/**
 * GET /api/v1/karma/leaderboard/doctors
 * Get doctor karma leaderboard
 */
router.get('/leaderboard/doctors', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;
    const leaderboard = await karma_service_1.karmaService.getDoctorLeaderboard(limit, offset);
    res.json({
        success: true,
        data: leaderboard
    });
}));
/**
 * GET /api/v1/karma/leaderboard/specialty/:specialty
 * Get specialty-specific leaderboard
 */
router.get('/leaderboard/specialty/:specialty', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const specialty = req.params.specialty;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const offset = parseInt(req.query.offset) || 0;
    const leaderboard = await karma_service_1.karmaService.getSpecialtyLeaderboard(specialty, limit, offset);
    res.json({
        success: true,
        data: leaderboard
    });
}));
/**
 * GET /api/v1/karma/rank/me
 * Get current user's karma rank
 */
router.get('/rank/me', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const rank = await karma_service_1.karmaService.getUserRank(req.userId);
    res.json({
        success: true,
        data: rank
    });
}));
/**
 * GET /api/v1/karma/rank/:userId
 * Get specific user's karma rank
 */
router.get('/rank/:userId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const rank = await karma_service_1.karmaService.getUserRank(req.params.userId);
    res.json({
        success: true,
        data: rank
    });
}));
/**
 * GET /api/v1/karma/milestones
 * Get all karma milestones
 */
router.get('/milestones', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const milestones = karma_service_1.karmaService.getAllMilestones();
    res.json({
        success: true,
        data: milestones
    });
}));
/**
 * GET /api/v1/karma/stats
 * Get platform-wide karma statistics
 */
router.get('/stats', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const stats = await karma_service_1.karmaService.getKarmaStats();
    res.json({
        success: true,
        data: stats
    });
}));
exports.default = router;
