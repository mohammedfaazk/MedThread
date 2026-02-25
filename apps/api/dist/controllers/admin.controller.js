"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = exports.AdminController = void 0;
const admin_service_1 = require("../services/admin.service");
const audit_log_service_1 = require("../services/audit-log.service");
const asyncHandler_1 = require("../middleware/asyncHandler");
class AdminController {
    constructor() {
        // Platform Statistics
        this.getPlatformStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const stats = await admin_service_1.adminService.getPlatformStats();
            res.json({
                success: true,
                data: stats,
            });
        });
        // User Management
        this.getUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { role, suspended, search, page, limit } = req.query;
            const users = await admin_service_1.adminService.getUsers({
                role: role,
                isSuspended: suspended === 'true',
                search: search,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
            });
            res.json({
                success: true,
                data: users,
            });
        });
        this.suspendUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { reason } = req.body;
            const user = await admin_service_1.adminService.suspendUser(id, reason);
            // Log action
            await audit_log_service_1.auditLogService.createLog({
                action: 'USER_SUSPEND',
                adminId: req.userId,
                targetType: 'USER',
                targetId: id,
                details: { reason },
                ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress,
                userAgent: req.headers['user-agent'],
            });
            res.json({
                success: true,
                data: user,
                message: 'User suspended successfully',
            });
        });
        this.unsuspendUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const user = await admin_service_1.adminService.unsuspendUser(id);
            // Log action
            await audit_log_service_1.auditLogService.createLog({
                action: 'USER_UNSUSPEND',
                adminId: req.userId,
                targetType: 'USER',
                targetId: id,
                ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress,
                userAgent: req.headers['user-agent'],
            });
            res.json({
                success: true,
                data: user,
                message: 'User unsuspended successfully',
            });
        });
        this.deleteUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            await admin_service_1.adminService.deleteUser(id);
            // Log action
            await audit_log_service_1.auditLogService.createLog({
                action: 'USER_DELETE',
                adminId: req.userId,
                targetType: 'USER',
                targetId: id,
                ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress,
                userAgent: req.headers['user-agent'],
            });
            res.json({
                success: true,
                message: 'User deleted successfully',
            });
        });
        // Post Management
        this.getPosts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { communityId, authorId, isRemoved, isPinned, isLocked, search, page, limit } = req.query;
            const posts = await admin_service_1.adminService.getPosts({
                communityId: communityId,
                authorId: authorId,
                isRemoved: isRemoved === 'true',
                isPinned: isPinned === 'true',
                isLocked: isLocked === 'true',
                search: search,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
            });
            res.json({
                success: true,
                data: posts,
            });
        });
        this.deletePost = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { reason } = req.body;
            await admin_service_1.adminService.deletePost(id);
            // Log action
            await audit_log_service_1.auditLogService.createLog({
                action: 'POST_DELETE',
                adminId: req.userId,
                targetType: 'POST',
                targetId: id,
                details: { reason },
                ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress,
                userAgent: req.headers['user-agent'],
            });
            res.json({
                success: true,
                message: 'Post deleted successfully',
            });
        });
        this.togglePinPost = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const post = await admin_service_1.adminService.togglePinPost(id);
            // Log action
            await audit_log_service_1.auditLogService.createLog({
                action: (post.isPinned ? 'POST_PIN' : 'POST_UNPIN'),
                adminId: req.userId,
                targetType: 'POST',
                targetId: id,
                ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress,
                userAgent: req.headers['user-agent'],
            });
            res.json({
                success: true,
                data: post,
                message: `Post ${post.isPinned ? 'pinned' : 'unpinned'} successfully`,
            });
        });
        this.toggleLockPost = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const post = await admin_service_1.adminService.toggleLockPost(id);
            // Log action
            await audit_log_service_1.auditLogService.createLog({
                action: (post.isLocked ? 'POST_LOCK' : 'POST_UNLOCK'),
                adminId: req.userId,
                targetType: 'POST',
                targetId: id,
                ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress,
                userAgent: req.headers['user-agent'],
            });
            res.json({
                success: true,
                data: post,
                message: `Post ${post.isLocked ? 'locked' : 'unlocked'} successfully`,
            });
        });
        // Comment Management
        this.getComments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { postId, authorId, isRemoved, search, page, limit } = req.query;
            const comments = await admin_service_1.adminService.getComments({
                postId: postId,
                authorId: authorId,
                isRemoved: isRemoved === 'true',
                search: search,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
            });
            res.json({
                success: true,
                data: comments,
            });
        });
        this.deleteComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { reason } = req.body;
            await admin_service_1.adminService.deleteComment(id);
            // Log action
            await audit_log_service_1.auditLogService.createLog({
                action: 'COMMENT_DELETE',
                adminId: req.userId,
                targetType: 'COMMENT',
                targetId: id,
                details: { reason },
                ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress,
                userAgent: req.headers['user-agent'],
            });
            res.json({
                success: true,
                message: 'Comment deleted successfully',
            });
        });
        // Report Management
        this.getReports = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { status, targetType, page, limit } = req.query;
            const reports = await admin_service_1.adminService.getReports({
                status: status,
                targetType: targetType,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
            });
            res.json({
                success: true,
                data: reports,
            });
        });
        this.resolveReport = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            const { action, notes } = req.body;
            const report = await admin_service_1.adminService.resolveReport(id, action, notes);
            // Log action
            await audit_log_service_1.auditLogService.createLog({
                action: 'REPORT_RESOLVE',
                adminId: req.userId,
                targetType: 'REPORT',
                targetId: id,
                details: { action, notes },
                ipAddress: req.headers['x-forwarded-for']?.toString().split(',')[0].trim() || req.socket.remoteAddress,
                userAgent: req.headers['user-agent'],
            });
            res.json({
                success: true,
                data: report,
                message: 'Report resolved successfully',
            });
        });
        // Audit Logs
        this.getAuditLogs = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { adminId, action, targetType, targetId, startDate, endDate, page, limit } = req.query;
            const logs = await audit_log_service_1.auditLogService.getLogs({
                adminId: adminId,
                action: action,
                targetType: targetType,
                targetId: targetId,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                page: page ? parseInt(page) : undefined,
                limit: limit ? parseInt(limit) : undefined,
            });
            res.json({
                success: true,
                data: logs,
            });
        });
        this.getAuditLogStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { adminId, startDate, endDate } = req.query;
            const stats = await audit_log_service_1.auditLogService.getStats({
                adminId: adminId,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            });
            res.json({
                success: true,
                data: stats,
            });
        });
        /**
         * Create system announcement notification
         */
        this.createSystemAnnouncement = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { title, body, link } = req.body;
            if (!title || title.trim().length < 5) {
                return res.status(400).json({
                    success: false,
                    error: 'Announcement title must be at least 5 characters'
                });
            }
            if (!body || body.trim().length < 10) {
                return res.status(400).json({
                    success: false,
                    error: 'Announcement body must be at least 10 characters'
                });
            }
            const result = await admin_service_1.adminService.createSystemAnnouncement(req.user.id, { title, body, link });
            res.status(201).json({
                success: true,
                data: result,
                message: 'System announcement created successfully'
            });
        });
    }
}
exports.AdminController = AdminController;
exports.adminController = new AdminController();
