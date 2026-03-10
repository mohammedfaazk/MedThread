"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogService = exports.AuditLogService = void 0;
const database_1 = require("@medthread/database");
class AuditLogService {
    /**
     * Create an audit log entry
     */
    async createLog(input) {
        try {
            // Use raw query if AuditLog model not available yet
            const log = await database_1.prisma.$executeRaw `
        INSERT INTO "AuditLog" (id, action, "adminId", "targetType", "targetId", details, "ipAddress", "userAgent", "createdAt")
        VALUES (
          ${this.generateId()},
          ${input.action}::"AuditAction",
          ${input.adminId},
          ${input.targetType || null},
          ${input.targetId || null},
          ${input.details ? JSON.stringify(input.details) : null}::jsonb,
          ${input.ipAddress || null},
          ${input.userAgent || null},
          NOW()
        )
      `;
            return { success: true };
        }
        catch (error) {
            console.error('Failed to create audit log:', error);
            // Don't throw - audit logging should not break the main flow
            return null;
        }
    }
    generateId() {
        return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Get audit logs with filters
     */
    async getLogs(filters) {
        const { adminId, action, targetType, targetId, startDate, endDate, page = 1, limit = 50, } = filters;
        const where = {};
        if (adminId)
            where.adminId = adminId;
        if (action)
            where.action = action;
        if (targetType)
            where.targetType = targetType;
        if (targetId)
            where.targetId = targetId;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const [logs, total] = await Promise.all([
            database_1.prisma.auditLog.findMany({
                where,
                include: {
                    admin: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            avatar: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            database_1.prisma.auditLog.count({ where }),
        ]);
        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get audit log statistics
     */
    async getStats(filters) {
        const { adminId, startDate, endDate } = filters;
        const where = {};
        if (adminId)
            where.adminId = adminId;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const [totalLogs, actionCounts, adminActivity] = await Promise.all([
            database_1.prisma.auditLog.count({ where }),
            database_1.prisma.auditLog.groupBy({
                by: ['action'],
                where,
                _count: true,
            }),
            database_1.prisma.auditLog.groupBy({
                by: ['adminId'],
                where,
                _count: true,
                orderBy: {
                    _count: {
                        adminId: 'desc',
                    },
                },
                take: 10,
            }),
        ]);
        return {
            totalLogs,
            actionCounts: actionCounts.map((item) => ({
                action: item.action,
                count: item._count,
            })),
            topAdmins: adminActivity.map((item) => ({
                adminId: item.adminId,
                count: item._count,
            })),
        };
    }
    /**
     * Delete old audit logs (for cleanup)
     */
    async deleteOldLogs(daysToKeep = 90) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const result = await database_1.prisma.auditLog.deleteMany({
            where: {
                createdAt: {
                    lt: cutoffDate,
                },
            },
        });
        return result.count;
    }
}
exports.AuditLogService = AuditLogService;
exports.auditLogService = new AuditLogService();
