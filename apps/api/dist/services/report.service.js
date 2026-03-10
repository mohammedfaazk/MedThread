"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportService = exports.ReportService = void 0;
const database_1 = require("@medthread/database");
const errors_1 = require("../utils/errors");
const crypto_1 = require("crypto");
// Generate a cuid-like ID
function generateId() {
    return 'c' + (0, crypto_1.randomBytes)(12).toString('base64').replace(/[+/=]/g, '').substring(0, 24);
}
class ReportService {
    /**
     * Report a post
     */
    async reportPost(userId, postId, reason, details) {
        // Check if user already reported this post
        const existingReport = await database_1.prisma.report.findFirst({
            where: {
                userId,
                postId,
                status: 'PENDING'
            }
        });
        if (existingReport) {
            throw new errors_1.ConflictError('You have already reported this post');
        }
        // Use raw SQL to bypass foreign key validation
        const result = await database_1.prisma.$queryRaw `
      INSERT INTO "Report" (id, "userId", "postId", reason, details, status, "createdAt")
      VALUES (
        ${generateId()},
        ${userId},
        ${postId},
        ${reason},
        ${details || null},
        'PENDING',
        NOW()
      )
      RETURNING *
    `;
        return Array.isArray(result) ? result[0] : result;
    }
    /**
     * Report a comment
     */
    async reportComment(userId, commentId, reason, details) {
        // Check if user already reported this comment
        const existingReport = await database_1.prisma.report.findFirst({
            where: {
                userId,
                commentId,
                status: 'PENDING'
            }
        });
        if (existingReport) {
            throw new errors_1.ConflictError('You have already reported this comment');
        }
        // Use raw SQL to bypass foreign key validation
        const result = await database_1.prisma.$queryRaw `
      INSERT INTO "Report" (id, "userId", "commentId", reason, details, status, "createdAt")
      VALUES (
        ${generateId()},
        ${userId},
        ${commentId},
        ${reason},
        ${details || null},
        'PENDING',
        NOW()
      )
      RETURNING *
    `;
        return Array.isArray(result) ? result[0] : result;
    }
    /**
     * Report a user
     */
    async reportUser(reporterId, reportedUserId, reason, details) {
        // Cannot report yourself
        if (reporterId === reportedUserId) {
            throw new errors_1.BadRequestError('You cannot report yourself');
        }
        // Check if user exists
        const user = await database_1.prisma.user.findUnique({
            where: { id: reportedUserId }
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        // Check if user already reported this user
        const existingReport = await database_1.prisma.report.findFirst({
            where: {
                userId: reporterId,
                reportedUserId,
                status: 'PENDING'
            }
        });
        if (existingReport) {
            throw new errors_1.ConflictError('You have already reported this user');
        }
        // Create report
        const report = await database_1.prisma.report.create({
            data: {
                userId: reporterId,
                reportedUserId,
                reason,
                details,
                status: 'PENDING',
            },
            include: {
                reportedUser: {
                    select: {
                        username: true,
                        email: true,
                    }
                }
            }
        });
        return report;
    }
    /**
     * Get user's reports
     */
    async getUserReports(userId, filters) {
        const { page = 1, limit = 20 } = filters;
        const skip = (page - 1) * limit;
        const [reports, total] = await Promise.all([
            database_1.prisma.report.findMany({
                where: { userId },
                include: {
                    post: {
                        select: {
                            id: true,
                            title: true,
                        }
                    },
                    comment: {
                        select: {
                            id: true,
                            content: true,
                        }
                    },
                    reportedUser: {
                        select: {
                            id: true,
                            username: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            database_1.prisma.report.count({ where: { userId } })
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
}
exports.ReportService = ReportService;
exports.reportService = new ReportService();
