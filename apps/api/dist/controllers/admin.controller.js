"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = exports.AdminController = void 0;
const admin_service_1 = require("../services/admin.service");
const asyncHandler_1 = require("../middleware/asyncHandler");
class AdminController {
    constructor() {
        /**
         * Get platform statistics
         */
        this.getPlatformStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const stats = await admin_service_1.adminService.getPlatformStats();
            res.status(200).json({
                success: true,
                data: stats
            });
        });
        /**
         * Get all users with filters
         */
        this.getUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const filters = {
                role: req.query.role,
                search: req.query.search,
                isSuspended: req.query.isSuspended === 'true',
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 50,
            };
            const result = await admin_service_1.adminService.getUsers(filters);
            res.status(200).json({
                success: true,
                data: result
            });
        });
        /**
         * Suspend user
         */
        this.suspendUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { userId } = req.params;
            const { reason } = req.body;
            if (!reason || reason.trim().length < 10) {
                return res.status(400).json({
                    success: false,
                    error: 'Suspension reason must be at least 10 characters'
                });
            }
            const result = await admin_service_1.adminService.suspendUser(userId, reason);
            res.status(200).json({
                success: true,
                data: result,
                message: 'User suspended successfully'
            });
        });
        /**
         * Unsuspend user
         */
        this.unsuspendUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { userId } = req.params;
            const result = await admin_service_1.adminService.unsuspendUser(userId);
            res.status(200).json({
                success: true,
                data: result,
                message: 'User unsuspended successfully'
            });
        });
        /**
         * Delete user
         */
        this.deleteUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { userId } = req.params;
            const result = await admin_service_1.adminService.deleteUser(userId);
            res.status(200).json({
                success: true,
                data: result,
                message: 'User deleted successfully'
            });
        });
        /**
         * Get reports
         */
        this.getReports = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const filters = {
                status: req.query.status,
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 50,
            };
            const result = await admin_service_1.adminService.getReports(filters);
            res.status(200).json({
                success: true,
                data: result
            });
        });
        /**
         * Resolve report
         */
        this.resolveReport = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { reportId } = req.params;
            const { action, notes } = req.body;
            if (!['APPROVED', 'REJECTED'].includes(action)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid action. Must be APPROVED or REJECTED'
                });
            }
            const result = await admin_service_1.adminService.resolveReport(reportId, action, notes);
            res.status(200).json({
                success: true,
                data: result,
                message: `Report ${action.toLowerCase()} successfully`
            });
        });
    }
}
exports.AdminController = AdminController;
exports.adminController = new AdminController();
