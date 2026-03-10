"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileController = exports.ProfileController = void 0;
const user_service_1 = require("../services/user.service");
const file_upload_service_1 = require("../services/file-upload.service");
const two_factor_service_1 = require("../services/two-factor.service");
const errors_1 = require("../utils/errors");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("@medthread/database");
class ProfileController {
    /**
     * Check username availability
     */
    async checkUsernameAvailability(req, res) {
        try {
            const { username } = req.query;
            if (!username || typeof username !== 'string') {
                throw new errors_1.ValidationError('Username is required');
            }
            // Validate username format
            if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
                return res.json({
                    success: true,
                    data: {
                        available: false,
                        message: 'Username must be 3-20 characters and contain only letters, numbers, and underscores'
                    }
                });
            }
            const existingUser = await database_1.prisma.user.findUnique({
                where: { username },
                select: { id: true }
            });
            res.json({
                success: true,
                data: {
                    available: !existingUser,
                    message: existingUser ? 'Username is already taken' : 'Username is available'
                }
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message
            });
        }
    }
    /**
     * Get user profile by username
     */
    async getProfileByUsername(req, res) {
        try {
            const { username } = req.params;
            const currentUserId = req.userId;
            const user = await user_service_1.userService.getUserByUsername(username);
            // Check if blocked (if user is authenticated)
            if (currentUserId && user.id !== currentUserId) {
                const { blockService } = await Promise.resolve().then(() => __importStar(require('../services/block.service')));
                const hasBlock = await blockService.hasBlockBetween(currentUserId, user.id);
                if (hasBlock) {
                    return res.status(403).json({
                        success: false,
                        error: 'Profile not accessible',
                    });
                }
            }
            res.json({ success: true, data: user });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message
            });
        }
    }
    /**
     * Get current user profile
     */
    async getCurrentProfile(req, res) {
        try {
            const user = await user_service_1.userService.getUserById(req.userId);
            res.json({ success: true, data: user });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message
            });
        }
    }
    /**
     * Update user profile
     */
    async updateProfile(req, res) {
        try {
            const { bio, specialty, website, location, username, address, pincode } = req.body;
            // Validate bio length
            if (bio && bio.length > 500) {
                throw new errors_1.ValidationError('Bio must be 500 characters or less');
            }
            // Validate website URL
            if (website && !this.isValidUrl(website)) {
                throw new errors_1.ValidationError('Invalid website URL');
            }
            // Validate pincode format
            if (pincode && !/^\d{6}$/.test(pincode)) {
                throw new errors_1.ValidationError('Pincode must be 6 digits');
            }
            // Validate username if provided
            if (username) {
                if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
                    throw new errors_1.ValidationError('Username must be 3-20 characters and contain only letters, numbers, and underscores');
                }
                // Check if username is already taken by another user
                const existingUser = await database_1.prisma.user.findUnique({
                    where: { username },
                    select: { id: true }
                });
                if (existingUser && existingUser.id !== req.userId) {
                    throw new errors_1.ValidationError('Username is already taken');
                }
            }
            const updateData = {
                bio,
                specialty,
                address,
                pincode,
            };
            if (username) {
                updateData.username = username;
            }
            const user = await user_service_1.userService.updateUser(req.userId, updateData);
            res.json({ success: true, data: user });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message
            });
        }
    }
    /**
     * Upload avatar
     */
    async uploadAvatar(req, res) {
        try {
            const { image } = req.body;
            if (!image) {
                throw new errors_1.ValidationError('Image data is required');
            }
            // Validate file size (2MB)
            if (!file_upload_service_1.fileUploadService.validateFileSize(image, 2)) {
                throw new errors_1.ValidationError('Avatar must be 2MB or less');
            }
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!file_upload_service_1.fileUploadService.validateFileType(image, allowedTypes)) {
                throw new errors_1.ValidationError('Only JPEG, PNG, and WebP images are allowed');
            }
            const result = await file_upload_service_1.fileUploadService.uploadAvatar(image, req.userId);
            const user = await user_service_1.userService.updateUser(req.userId, {
                avatar: result.url
            });
            res.json({ success: true, data: { avatar: result.url } });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message
            });
        }
    }
    /**
     * Upload banner
     */
    async uploadBanner(req, res) {
        try {
            const { image } = req.body;
            if (!image) {
                throw new errors_1.ValidationError('Image data is required');
            }
            // Validate file size (5MB)
            if (!file_upload_service_1.fileUploadService.validateFileSize(image, 5)) {
                throw new errors_1.ValidationError('Banner must be 5MB or less');
            }
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!file_upload_service_1.fileUploadService.validateFileType(image, allowedTypes)) {
                throw new errors_1.ValidationError('Only JPEG, PNG, and WebP images are allowed');
            }
            const result = await file_upload_service_1.fileUploadService.uploadFromBase64(image, `banner-${req.userId}`, 'avatars');
            const user = await user_service_1.userService.updateUser(req.userId, {
                banner: result.url
            });
            res.json({ success: true, data: { banner: result.url } });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message
            });
        }
    }
    /**
     * Change password
     */
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                throw new errors_1.ValidationError('Current and new passwords are required');
            }
            // Validate new password strength
            if (newPassword.length < 8) {
                throw new errors_1.ValidationError('New password must be at least 8 characters');
            }
            // Get user with password hash
            const user = await database_1.prisma.user.findUnique({
                where: { id: req.userId },
                select: { passwordHash: true }
            });
            if (!user) {
                throw new errors_1.ValidationError('User not found');
            }
            // Verify current password
            const isValid = await bcryptjs_1.default.compare(currentPassword, user.passwordHash);
            if (!isValid) {
                throw new errors_1.ValidationError('Current password is incorrect');
            }
            // Hash new password
            const newPasswordHash = await bcryptjs_1.default.hash(newPassword, 10);
            // Update password
            await database_1.prisma.user.update({
                where: { id: req.userId },
                data: { passwordHash: newPasswordHash }
            });
            res.json({ success: true, message: 'Password changed successfully' });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message
            });
        }
    }
    /**
     * Setup 2FA - Generate secret and QR code
     */
    async setup2FA(req, res) {
        try {
            const user = await database_1.prisma.user.findUnique({
                where: { id: req.userId },
                select: { username: true, twoFactorEnabled: true }
            });
            if (!user) {
                throw new errors_1.ValidationError('User not found');
            }
            if (user.twoFactorEnabled) {
                throw new errors_1.ValidationError('2FA is already enabled');
            }
            const { secret, qrCode } = two_factor_service_1.twoFactorService.generateSecret(user.username);
            res.json({
                success: true,
                data: { secret, qrCode }
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message
            });
        }
    }
    /**
     * Enable 2FA - Verify token and enable
     */
    async enable2FA(req, res) {
        try {
            const { secret, token } = req.body;
            if (!secret || !token) {
                throw new errors_1.ValidationError('Secret and token are required');
            }
            await two_factor_service_1.twoFactorService.enable2FA(req.userId, secret, token);
            res.json({
                success: true,
                message: '2FA enabled successfully'
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message
            });
        }
    }
    /**
     * Disable 2FA
     */
    async disable2FA(req, res) {
        try {
            const { token } = req.body;
            if (!token) {
                throw new errors_1.ValidationError('Token is required');
            }
            await two_factor_service_1.twoFactorService.disable2FA(req.userId, token);
            res.json({
                success: true,
                message: '2FA disabled successfully'
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message
            });
        }
    }
    /**
     * Get user's posts
     */
    async getUserPosts(req, res) {
        try {
            const { username } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            const user = await database_1.prisma.user.findUnique({
                where: { username },
                select: { id: true }
            });
            if (!user) {
                throw new errors_1.ValidationError('User not found');
            }
            const [posts, total] = await Promise.all([
                database_1.prisma.post.findMany({
                    where: {
                        authorId: user.id,
                        isDraft: false,
                        isRemoved: false
                    },
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true,
                                role: true,
                                verified: true
                            }
                        },
                        community: {
                            select: {
                                name: true,
                                displayName: true,
                                icon: true
                            }
                        },
                        _count: {
                            select: {
                                comments: true,
                                awards: true
                            }
                        }
                    },
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' }
                }),
                database_1.prisma.post.count({
                    where: {
                        authorId: user.id,
                        isDraft: false,
                        isRemoved: false
                    }
                })
            ]);
            res.json({
                success: true,
                data: {
                    posts,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit)
                    }
                }
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message
            });
        }
    }
    /**
     * Get user's comments
     */
    async getUserComments(req, res) {
        try {
            const { username } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            const user = await database_1.prisma.user.findUnique({
                where: { username },
                select: { id: true }
            });
            if (!user) {
                throw new errors_1.ValidationError('User not found');
            }
            const [comments, total] = await Promise.all([
                database_1.prisma.comment.findMany({
                    where: {
                        authorId: user.id,
                        isRemoved: false
                    },
                    include: {
                        author: {
                            select: {
                                id: true,
                                username: true,
                                avatar: true,
                                role: true,
                                verified: true
                            }
                        },
                        post: {
                            select: {
                                id: true,
                                title: true,
                                community: {
                                    select: {
                                        name: true,
                                        displayName: true
                                    }
                                }
                            }
                        }
                    },
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' }
                }),
                database_1.prisma.comment.count({
                    where: {
                        authorId: user.id,
                        isRemoved: false
                    }
                })
            ]);
            res.json({
                success: true,
                data: {
                    comments,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit)
                    }
                }
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message
            });
        }
    }
    /**
     * Get current user's statistics
     */
    async getUserStats(req, res) {
        try {
            const userId = req.userId;
            // Get user info
            const user = await database_1.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    createdAt: true,
                    role: true
                }
            });
            if (!user) {
                throw new errors_1.ValidationError('User not found');
            }
            // Get appointment stats
            const now = new Date();
            const [totalAppointments, upcomingAppointments, completedAppointments] = await Promise.all([
                database_1.prisma.appointment.count({
                    where: {
                        OR: [
                            { patientId: userId },
                            { doctorId: userId }
                        ]
                    }
                }),
                database_1.prisma.appointment.count({
                    where: {
                        OR: [
                            { patientId: userId },
                            { doctorId: userId }
                        ],
                        startTime: { gte: now },
                        status: { in: ['PENDING', 'APPROVED'] }
                    }
                }),
                database_1.prisma.appointment.count({
                    where: {
                        OR: [
                            { patientId: userId },
                            { doctorId: userId }
                        ],
                        status: 'COMPLETED'
                    }
                })
            ]);
            // Get community stats
            const [totalPosts, totalComments] = await Promise.all([
                database_1.prisma.post.count({
                    where: {
                        authorId: userId,
                        isDraft: false,
                        isRemoved: false
                    }
                }),
                database_1.prisma.comment.count({
                    where: {
                        authorId: userId,
                        isRemoved: false
                    }
                })
            ]);
            // Calculate karma (sum of upvotes on posts and comments)
            const postKarma = await database_1.prisma.vote.count({
                where: {
                    post: {
                        authorId: userId
                    },
                    value: 1
                }
            });
            const commentKarma = await database_1.prisma.vote.count({
                where: {
                    comment: {
                        authorId: userId
                    },
                    value: 1
                }
            });
            const karma = postKarma + commentKarma;
            res.json({
                success: true,
                data: {
                    totalAppointments,
                    upcomingAppointments,
                    completedAppointments,
                    totalPosts,
                    totalComments,
                    karma,
                    joinedDate: user.createdAt
                }
            });
        }
        catch (error) {
            res.status(error.statusCode || 500).json({
                success: false,
                error: error.message
            });
        }
    }
    /**
     * Helper: Validate URL
     */
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.ProfileController = ProfileController;
exports.profileController = new ProfileController();
