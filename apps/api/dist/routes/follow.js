"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.followRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../middleware/asyncHandler");
const follow_service_1 = require("../services/follow.service");
const router = (0, express_1.Router)();
exports.followRouter = router;
/**
 * Follow a user
 * POST /api/follow/:userId
 */
router.post('/:userId', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUserId = req.userId;
    const { userId } = req.params;
    try {
        const follow = await follow_service_1.followService.followUser(currentUserId, userId);
        res.status(201).json({
            success: true,
            data: follow,
            message: 'Successfully followed user',
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}));
/**
 * Unfollow a user
 * DELETE /api/follow/:userId
 */
router.delete('/:userId', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUserId = req.userId;
    const { userId } = req.params;
    try {
        await follow_service_1.followService.unfollowUser(currentUserId, userId);
        res.json({
            success: true,
            message: 'Successfully unfollowed user',
        });
    }
    catch (error) {
        return res.status(400).json({
            success: false,
            error: error.message,
        });
    }
}));
/**
 * Check if following a user
 * GET /api/follow/:userId/check
 */
router.get('/:userId/check', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUserId = req.userId;
    const { userId } = req.params;
    const isFollowing = await follow_service_1.followService.isFollowing(currentUserId, userId);
    res.json({
        success: true,
        data: { isFollowing },
    });
}));
/**
 * Get followers list
 * GET /api/follow/:userId/followers
 */
router.get('/:userId/followers', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    const { cursor, limit } = req.query;
    const result = await follow_service_1.followService.getFollowers(userId, cursor, limit ? parseInt(limit) : 20);
    res.json({
        success: true,
        data: result.followers,
        pagination: result.pagination,
    });
}));
/**
 * Get following list
 * GET /api/follow/:userId/following
 */
router.get('/:userId/following', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    const { cursor, limit } = req.query;
    const result = await follow_service_1.followService.getFollowing(userId, cursor, limit ? parseInt(limit) : 20);
    res.json({
        success: true,
        data: result.following,
        pagination: result.pagination,
    });
}));
/**
 * Get follow counts
 * GET /api/follow/:userId/counts
 */
router.get('/:userId/counts', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    const counts = await follow_service_1.followService.getFollowCounts(userId);
    res.json({
        success: true,
        data: counts,
    });
}));
/**
 * Get following feed (posts from followed users)
 * GET /api/follow/feed
 */
router.get('/feed', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUserId = req.userId;
    const { cursor, limit } = req.query;
    const result = await follow_service_1.followService.getFollowingFeed(currentUserId, cursor, limit ? parseInt(limit) : 20);
    res.json({
        success: true,
        data: result.posts,
        pagination: result.pagination,
    });
}));
/**
 * Get verified doctors to follow (recommendations)
 * GET /api/follow/discover
 */
router.get('/discover', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUserId = req.userId;
    const { specialty, cursor, limit } = req.query;
    const result = await follow_service_1.followService.getVerifiedDoctorsToFollow(currentUserId, specialty, cursor, limit ? parseInt(limit) : 20);
    res.json({
        success: true,
        data: result.doctors,
        pagination: result.pagination,
    });
}));
/**
 * Bulk check if following multiple users
 * POST /api/follow/check-multiple
 */
router.post('/check-multiple', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUserId = req.userId;
    const { userIds } = req.body;
    if (!Array.isArray(userIds)) {
        return res.status(400).json({
            success: false,
            error: 'userIds must be an array',
        });
    }
    const result = await follow_service_1.followService.checkFollowingMultiple(currentUserId, userIds);
    res.json({
        success: true,
        data: result,
    });
}));
