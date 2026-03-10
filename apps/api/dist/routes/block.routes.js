"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const asyncHandler_1 = require("../middleware/asyncHandler");
const block_service_1 = require("../services/block.service");
const router = (0, express_1.Router)();
exports.blockRouter = router;
/**
 * Block a user
 * POST /api/block/:userId
 */
router.post('/:userId', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const blockerId = req.userId;
    const { userId: blockedId } = req.params;
    try {
        const block = await block_service_1.blockService.blockUser(blockerId, blockedId);
        res.status(201).json({
            success: true,
            data: block,
            message: 'User blocked successfully',
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
 * Unblock a user
 * DELETE /api/block/:userId
 */
router.delete('/:userId', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const blockerId = req.userId;
    const { userId: blockedId } = req.params;
    try {
        await block_service_1.blockService.unblockUser(blockerId, blockedId);
        res.json({
            success: true,
            message: 'User unblocked successfully',
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
 * Check if user is blocked
 * GET /api/block/:userId/check
 */
router.get('/:userId/check', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const currentUserId = req.userId;
    const { userId: targetUserId } = req.params;
    const isBlocked = await block_service_1.blockService.isBlocked(currentUserId, targetUserId);
    const hasBlock = await block_service_1.blockService.hasBlockBetween(currentUserId, targetUserId);
    res.json({
        success: true,
        data: {
            isBlocked, // Current user blocked target
            hasBlock, // Any block exists between users
        },
    });
}));
/**
 * Get blocked users list
 * GET /api/block/list
 */
router.get('/list', auth_1.authenticate, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.userId;
    const { cursor, limit } = req.query;
    const result = await block_service_1.blockService.getBlockedUsers(userId, cursor, limit ? parseInt(limit) : 20);
    res.json({
        success: true,
        data: result.blocks,
        pagination: result.pagination,
    });
}));
