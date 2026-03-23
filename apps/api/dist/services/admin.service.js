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
exports.adminService = exports.AdminService = void 0;
const database_1 = require("@medthread/database");
const bcrypt_1 = __importDefault(require("bcrypt"));
const errors_1 = require("../utils/errors");
class AdminService {
    /**
     * Create initial admin user (should be run once during setup)
     */
    async createAdminUser(data) {
        // Check if admin already exists
        const existingAdmin = await database_1.prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });
        if (existingAdmin) {
            throw new errors_1.ConflictError('Admin user already exists');
        }
        const passwordHash = await bcrypt_1.default.hash(data.password, 12);
        const admin = await database_1.prisma.user.create({
            data: {
                email: data.email,
                username: data.username,
                passwordHash,
                role: 'ADMIN',
                verified: true,
                emailVerified: true,
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
            }
        });
        return admin;
    }
    /**
     * Get platform statistics for admin dashboard
     */
    async getPlatformStats() {
        const [totalUsers, totalPosts, totalComments, totalCommunities, activeUsers24h, newUsersToday, totalDoctors, verifiedDoctors, pendingVerifications,] = await Promise.all([
            database_1.prisma.user.count(),
            database_1.prisma.post.count(),
            database_1.prisma.comment.count(),
            database_1.prisma.community.count(),
            database_1.prisma.user.count({
                where: {
                    updatedAt: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                }
            }),
            database_1.prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            }),
            database_1.prisma.user.count({ where: { role: 'DOCTOR' } }),
            database_1.prisma.user.count({
                where: {
                    role: 'DOCTOR',
                    doctorVerificationStatus: 'APPROVED'
                }
            }),
            database_1.prisma.user.count({
                where: {
                    role: 'DOCTOR',
                    doctorVerificationStatus: { in: ['PENDING', 'UNDER_REVIEW'] }
                }
            }),
        ]);
        return {
            users: {
                total: totalUsers,
                active24h: activeUsers24h,
                newToday: newUsersToday,
            },
            content: {
                totalPosts,
                totalComments,
                totalCommunities,
            },
            doctors: {
                total: totalDoctors,
                verified: verifiedDoctors,
                pendingVerification: pendingVerifications,
            },
        };
    }
    /**
     * Get all users with filters (Admin only)
     */
    async getUsers(filters) {
        const { role, search, isSuspended, page = 1, limit = 50 } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (role)
            where.role = role;
        if (isSuspended !== undefined)
            where.isSuspended = isSuspended;
        if (search) {
            where.OR = [
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [users, total] = await Promise.all([
            database_1.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                    verified: true,
                    doctorVerificationStatus: true,
                    specialty: true,
                    totalKarma: true,
                    isSuspended: true,
                    isShadowBanned: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            posts: true,
                            comments: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            database_1.prisma.user.count({ where })
        ]);
        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    /**
     * Suspend user account (Admin only)
     */
    async suspendUser(userId, reason) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (user.role === 'ADMIN') {
            throw new errors_1.ForbiddenError('Cannot suspend admin users');
        }
        const updatedUser = await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                isSuspended: true,
                verificationNotes: reason,
            },
            select: {
                id: true,
                username: true,
                email: true,
                isSuspended: true,
            }
        });
        return {
            message: 'User suspended successfully',
            user: updatedUser,
        };
    }
    /**
     * Unsuspend user account (Admin only)
     */
    async unsuspendUser(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        const updatedUser = await database_1.prisma.user.update({
            where: { id: userId },
            data: {
                isSuspended: false,
            },
            select: {
                id: true,
                username: true,
                email: true,
                isSuspended: true,
            }
        });
        return {
            message: 'User unsuspended successfully',
            user: updatedUser,
        };
    }
    /**
     * Delete user account (Admin only)
     */
    async deleteUser(userId) {
        const user = await database_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        if (user.role === 'ADMIN') {
            throw new errors_1.ForbiddenError('Cannot delete admin users');
        }
        await database_1.prisma.user.delete({
            where: { id: userId }
        });
        return {
            message: 'User deleted successfully',
        };
    }
    /**
     * Get posts with filters (Admin only)
     */
    async getPosts(filters) {
        const { communityId, authorId, isRemoved, isPinned, isLocked, search, page = 1, limit = 50 } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (communityId)
            where.communityId = communityId;
        if (authorId)
            where.authorId = authorId;
        if (isRemoved !== undefined)
            where.isRemoved = isRemoved;
        if (isPinned !== undefined)
            where.isPinned = isPinned;
        if (isLocked !== undefined)
            where.isLocked = isLocked;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [posts, total] = await Promise.all([
            database_1.prisma.post.findMany({
                where,
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            role: true,
                        }
                    },
                    community: {
                        select: {
                            id: true,
                            name: true,
                        }
                    },
                    _count: {
                        select: {
                            comments: true,
                            reports: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            database_1.prisma.post.count({ where })
        ]);
        return {
            posts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    /**
     * Delete post (Admin only)
     */
    async deletePost(postId) {
        const post = await database_1.prisma.post.findUnique({
            where: { id: postId }
        });
        if (!post) {
            throw new errors_1.NotFoundError('Post not found');
        }
        await database_1.prisma.post.delete({
            where: { id: postId }
        });
        return {
            message: 'Post deleted successfully',
        };
    }
    /**
     * Toggle pin status of post (Admin only)
     */
    async togglePinPost(postId) {
        const post = await database_1.prisma.post.findUnique({
            where: { id: postId }
        });
        if (!post) {
            throw new errors_1.NotFoundError('Post not found');
        }
        const updatedPost = await database_1.prisma.post.update({
            where: { id: postId },
            data: {
                isPinned: !post.isPinned,
            }
        });
        return updatedPost;
    }
    /**
     * Toggle lock status of post (Admin only)
     */
    async toggleLockPost(postId) {
        const post = await database_1.prisma.post.findUnique({
            where: { id: postId }
        });
        if (!post) {
            throw new errors_1.NotFoundError('Post not found');
        }
        const updatedPost = await database_1.prisma.post.update({
            where: { id: postId },
            data: {
                isLocked: !post.isLocked,
            }
        });
        return updatedPost;
    }
    /**
     * Get comments with filters (Admin only)
     */
    async getComments(filters) {
        const { postId, authorId, isRemoved, search, page = 1, limit = 50 } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (postId)
            where.postId = postId;
        if (authorId)
            where.authorId = authorId;
        if (isRemoved !== undefined)
            where.isRemoved = isRemoved;
        if (search) {
            where.content = { contains: search, mode: 'insensitive' };
        }
        const [comments, total] = await Promise.all([
            database_1.prisma.comment.findMany({
                where,
                include: {
                    author: {
                        select: {
                            id: true,
                            username: true,
                            role: true,
                        }
                    },
                    post: {
                        select: {
                            id: true,
                            title: true,
                        }
                    },
                    _count: {
                        select: {
                            replies: true,
                            reports: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            database_1.prisma.comment.count({ where })
        ]);
        return {
            comments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    /**
     * Delete comment (Admin only)
     */
    async deleteComment(commentId) {
        const comment = await database_1.prisma.comment.findUnique({
            where: { id: commentId }
        });
        if (!comment) {
            throw new errors_1.NotFoundError('Comment not found');
        }
        await database_1.prisma.comment.delete({
            where: { id: commentId }
        });
        return {
            message: 'Comment deleted successfully',
        };
    }
    /**
     * Get reported content (Admin only)
     */
    async getReports(filters) {
        const { status = 'PENDING', page = 1, limit = 50 } = filters;
        const skip = (page - 1) * limit;
        const [reports, total] = await Promise.all([
            database_1.prisma.report.findMany({
                where: { status },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                        }
                    },
                    post: {
                        select: {
                            id: true,
                            title: true,
                            author: {
                                select: {
                                    username: true,
                                }
                            }
                        }
                    },
                    comment: {
                        select: {
                            id: true,
                            content: true,
                            author: {
                                select: {
                                    username: true,
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            database_1.prisma.report.count({ where: { status } })
        ]);
        return {
            reports,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    /**
     * Resolve report (Admin only)
     */
    async resolveReport(reportId, action, notes) {
        const report = await database_1.prisma.report.findUnique({
            where: { id: reportId }
        });
        if (!report) {
            throw new errors_1.NotFoundError('Report not found');
        }
        const updatedReport = await database_1.prisma.report.update({
            where: { id: reportId },
            data: {
                status: action,
                details: notes,
            }
        });
        return {
            message: `Report ${action.toLowerCase()} successfully`,
            report: updatedReport,
        };
    }
    /**
     * Create system announcement notification for all users
     */
    async createSystemAnnouncement(adminId, announcement) {
        // Get all active (non-suspended) user IDs
        const users = await database_1.prisma.user.findMany({
            where: {
                isSuspended: false,
            },
            select: {
                id: true,
            },
        });
        const recipientIds = users.map(u => u.id);
        // Import notification service dynamically to avoid circular dependency
        const { notificationService } = await Promise.resolve().then(() => __importStar(require('./notification.service')));
        // Create notifications for all users
        const notifications = await notificationService.createNotification({
            type: 'SYSTEM_ANNOUNCEMENT',
            recipientIds,
            actorId: adminId,
            metadata: {
                title: announcement.title,
                body: announcement.body,
                link: announcement.link,
            },
        });
        // Broadcast via socket to all connected users
        try {
            const { socketDeliveryService } = await Promise.resolve().then(() => __importStar(require('./socket-delivery.service')));
            for (const notification of notifications) {
                await socketDeliveryService.sendNotification([notification.recipientId], notification);
            }
        }
        catch (error) {
            console.error('Error broadcasting system announcement via socket:', error);
        }
        return {
            message: 'System announcement created successfully',
            recipientCount: notifications.length,
            totalUsers: recipientIds.length,
        };
    }
}
exports.AdminService = AdminService;
exports.adminService = new AdminService();
