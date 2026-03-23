"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const requireVerifiedDoctor_1 = require("../middleware/requireVerifiedDoctor");
const award_service_1 = require("../services/award.service");
const asyncHandler_1 = require("../middleware/asyncHandler");
const router = (0, express_1.Router)();
/**
 * GET /api/v1/awards
 * Get all available awards
 */
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const awards = await award_service_1.awardService.getAllAwards();
    res.json({
        success: true,
        data: awards
    });
}));
/**
 * GET /api/v1/awards/:id
 * Get specific award details
 */
router.get('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const award = await award_service_1.awardService.getAwardById(req.params.id);
    res.json({
        success: true,
        data: award
    });
}));
/**
 * POST /api/v1/awards
 * Create a new award (admin only)
 */
router.post('/', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // Check if user is admin
    if (req.userRole !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Only admins can create awards'
        });
    }
    const { name, description, icon, cost, tier, color } = req.body;
    const award = await award_service_1.awardService.createAward({
        name,
        description,
        icon,
        cost,
        tier,
        color
    });
    res.status(201).json({
        success: true,
        data: award
    });
}));
/**
 * POST /api/v1/awards/give
 * Give an award to a post or comment - requires verified doctor
 */
router.post('/give', auth_1.authenticate, requireVerifiedDoctor_1.requireVerifiedDoctor, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { awardId, postId, commentId } = req.body;
    const result = await award_service_1.awardService.giveAward({
        awardId,
        giverId: req.userId,
        postId,
        commentId
    });
    res.json({
        success: true,
        message: 'Award given successfully',
        data: result
    });
}));
/**
 * GET /api/v1/awards/post/:postId
 * Get all awards for a specific post
 */
router.get('/post/:postId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const awards = await award_service_1.awardService.getPostAwards(req.params.postId);
    res.json({
        success: true,
        data: awards
    });
}));
/**
 * GET /api/v1/awards/comment/:commentId
 * Get all awards for a specific comment
 */
router.get('/comment/:commentId', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const awards = await award_service_1.awardService.getCommentAwards(req.params.commentId);
    res.json({
        success: true,
        data: awards
    });
}));
/**
 * GET /api/v1/awards/user/:userId/given
 * Get awards given by a user
 */
router.get('/user/:userId/given', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    const result = await award_service_1.awardService.getUserGivenAwards(req.params.userId, limit, offset);
    res.json({
        success: true,
        data: result
    });
}));
/**
 * GET /api/v1/awards/user/:userId/received
 * Get awards received by a user
 */
router.get('/user/:userId/received', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const awards = await award_service_1.awardService.getUserReceivedAwards(req.params.userId);
    res.json({
        success: true,
        data: awards
    });
}));
/**
 * GET /api/v1/awards/coins/me
 * Get current user's coin balance
 */
router.get('/coins/me', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const balance = await award_service_1.awardService.getUserCoins(req.userId);
    res.json({
        success: true,
        data: balance
    });
}));
/**
 * POST /api/v1/awards/coins/add
 * Add coins to a user (admin only or purchase)
 */
router.post('/coins/add', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, amount, reason } = req.body;
    // Only admins can add coins to other users
    if (userId !== req.userId && req.userRole !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Forbidden: Can only add coins to your own account or admin required'
        });
    }
    const targetUserId = userId || req.userId;
    const user = await award_service_1.awardService.addCoins(targetUserId, amount, reason);
    res.json({
        success: true,
        message: 'Coins added successfully',
        data: user
    });
}));
/**
 * GET /api/v1/awards/stats
 * Get platform-wide award statistics
 */
router.get('/stats/platform', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const stats = await award_service_1.awardService.getAwardStats();
    res.json({
        success: true,
        data: stats
    });
}));
/**
 * POST /api/v1/awards/initialize
 * Initialize default awards (admin only, one-time setup)
 */
router.post('/initialize', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (req.userRole !== 'ADMIN') {
        return res.status(403).json({
            success: false,
            error: 'Only admins can initialize awards'
        });
    }
    await award_service_1.awardService.initializeDefaultAwards();
    res.json({
        success: true,
        message: 'Default awards initialized'
    });
}));
exports.default = router;
