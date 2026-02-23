"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_refactored_1 = require("../middleware/auth.refactored");
const requireAdmin_1 = require("../middleware/requireAdmin");
const router = (0, express_1.Router)();
exports.adminRouter = router;
// All admin routes require authentication and admin role
router.use(auth_refactored_1.authenticate, requireAdmin_1.requireAdmin);
/**
 * @route   GET /api/v1/admin/stats
 * @desc    Get platform statistics
 * @access  Private (Admin only)
 */
router.get('/stats', admin_controller_1.adminController.getPlatformStats);
/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users with filters
 * @access  Private (Admin only)
 */
router.get('/users', admin_controller_1.adminController.getUsers);
/**
 * @route   POST /api/v1/admin/users/:userId/suspend
 * @desc    Suspend user account
 * @access  Private (Admin only)
 */
router.post('/users/:userId/suspend', admin_controller_1.adminController.suspendUser);
/**
 * @route   POST /api/v1/admin/users/:userId/unsuspend
 * @desc    Unsuspend user account
 * @access  Private (Admin only)
 */
router.post('/users/:userId/unsuspend', admin_controller_1.adminController.unsuspendUser);
/**
 * @route   DELETE /api/v1/admin/users/:userId
 * @desc    Delete user account
 * @access  Private (Admin only)
 */
router.delete('/users/:userId', admin_controller_1.adminController.deleteUser);
/**
 * @route   GET /api/v1/admin/reports
 * @desc    Get reported content
 * @access  Private (Admin only)
 */
router.get('/reports', admin_controller_1.adminController.getReports);
/**
 * @route   POST /api/v1/admin/reports/:reportId/resolve
 * @desc    Resolve a report
 * @access  Private (Admin only)
 */
router.post('/reports/:reportId/resolve', admin_controller_1.adminController.resolveReport);
