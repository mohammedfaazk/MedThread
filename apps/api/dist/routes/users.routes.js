"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const database_1 = require("@medthread/database");
const asyncHandler_1 = require("../middleware/asyncHandler");
const router = (0, express_1.Router)();
exports.usersRouter = router;
/**
 * Get user by username
 * GET /api/users/by-username/:username
 */
router.get('/by-username/:username', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { username } = req.params;
    const user = await database_1.prisma.user.findUnique({
        where: { username },
        select: {
            id: true,
            username: true,
            avatar: true,
            banner: true,
            bio: true,
            role: true,
            specialty: true,
            doctorVerificationStatus: true,
            totalKarma: true,
            createdAt: true,
            _count: {
                select: {
                    posts: true,
                    comments: true,
                    followers: true,
                    following: true
                }
            }
        }
    });
    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }
    res.json({
        success: true,
        data: user
    });
}));
/**
 * Get user by ID
 * GET /api/users/:id
 */
router.get('/:id', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const user = await database_1.prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            avatar: true,
            banner: true,
            bio: true,
            role: true,
            specialty: true,
            doctorVerificationStatus: true,
            totalKarma: true,
            createdAt: true,
            _count: {
                select: {
                    posts: true,
                    comments: true,
                    followers: true,
                    following: true
                }
            }
        }
    });
    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }
    res.json({
        success: true,
        data: user
    });
}));
