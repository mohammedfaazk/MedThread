"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachBlockedUsers = exports.checkBlock = void 0;
const block_service_1 = require("../services/block.service");
/**
 * Middleware to check if there's a block between current user and target user
 * Attach to routes that involve user-to-user interactions
 */
const checkBlock = (targetUserIdParam = 'userId') => {
    return async (req, res, next) => {
        try {
            const currentUserId = req.userId;
            const targetUserId = req.params[targetUserIdParam] || req.body[targetUserIdParam];
            if (!currentUserId || !targetUserId) {
                return next();
            }
            // Skip check if same user
            if (currentUserId === targetUserId) {
                return next();
            }
            const hasBlock = await block_service_1.blockService.hasBlockBetween(currentUserId, targetUserId);
            if (hasBlock) {
                return res.status(403).json({
                    success: false,
                    error: 'Cannot interact with this user due to blocking',
                });
            }
            next();
        }
        catch (error) {
            console.error('[BLOCK_CHECK] Error:', error);
            next(); // Continue on error to avoid breaking the app
        }
    };
};
exports.checkBlock = checkBlock;
/**
 * Attach blocked user IDs to request for query filtering
 */
const attachBlockedUsers = async (req, res, next) => {
    try {
        const currentUserId = req.userId;
        if (!currentUserId) {
            return next();
        }
        const blockedUserIds = await block_service_1.blockService.getBlockedUserIds(currentUserId);
        req.blockedUserIds = blockedUserIds;
        next();
    }
    catch (error) {
        console.error('[ATTACH_BLOCKED] Error:', error);
        req.blockedUserIds = [];
        next();
    }
};
exports.attachBlockedUsers = attachBlockedUsers;
