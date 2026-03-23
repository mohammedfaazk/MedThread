"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.badgeRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../middleware/asyncHandler");
const badge_service_1 = require("../services/badge.service");
const router = (0, express_1.Router)();
exports.badgeRouter = router;
/**
 * Get all available badges
 * GET /api/badges
 */
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const badges = badge_service_1.badgeService.getAllBadges();
    res.json({
        success: true,
        data: badges
    });
}));
/**
 * Get user's badges
 * GET /api/badges/user/:userId
 */
router.get('/user/:userId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    const badges = await badge_service_1.badgeService.getUserBadges(userId);
    res.json({
        success: true,
        data: badges
    });
}));
/**
 * Get current user's badges
 * GET /api/badges/me
 */
router.get('/me', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const badges = await badge_service_1.badgeService.getUserBadges(userId);
    res.json({
        success: true,
        data: badges
    });
}));
/**
 * Get user's badge statistics
 * GET /api/badges/user/:userId/stats
 */
router.get('/user/:userId/stats', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    const stats = await badge_service_1.badgeService.getUserBadgeStats(userId);
    res.json({
        success: true,
        data: stats
    });
}));
/**
 * Get current user's badge statistics
 * GET /api/badges/me/stats
 */
router.get('/me/stats', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const stats = await badge_service_1.badgeService.getUserBadgeStats(userId);
    res.json({
        success: true,
        data: stats
    });
}));
/**
 * Manually trigger badge evaluation (for testing/admin)
 * POST /api/badges/evaluate
 */
router.post('/evaluate', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    // Run in background
    badge_service_1.badgeService.evaluateAllBadges(userId).catch(error => {
        console.error('[BADGE] Background evaluation failed:', error);
    });
    res.json({
        success: true,
        message: 'Badge evaluation started'
    });
}));
