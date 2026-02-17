"use strict";
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
}
exports.AdminService = AdminService;
exports.adminService = new AdminService();
