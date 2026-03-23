"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const auth_refactored_1 = require("../middleware/auth.refactored");
const requireAdmin_1 = require("../middleware/requireAdmin");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
exports.adminRouter = router;
// All admin routes require authentication and admin role
router.use(auth_refactored_1.authenticate);
router.use(requireAdmin_1.requireAdmin);
// Platform Statistics
router.get('/stats', admin_controller_1.adminController.getPlatformStats);
// User Management
router.get('/users', admin_controller_1.adminController.getUsers);
router.put('/users/:id/suspend', admin_controller_1.adminController.suspendUser);
router.put('/users/:id/unsuspend', admin_controller_1.adminController.unsuspendUser);
router.delete('/users/:id', admin_controller_1.adminController.deleteUser);
// Post Management
router.get('/posts', admin_controller_1.adminController.getPosts);
router.delete('/posts/:id', admin_controller_1.adminController.deletePost);
router.put('/posts/:id/pin', admin_controller_1.adminController.togglePinPost);
router.put('/posts/:id/lock', admin_controller_1.adminController.toggleLockPost);
// Comment Management
router.get('/comments', admin_controller_1.adminController.getComments);
router.delete('/comments/:id', admin_controller_1.adminController.deleteComment);
// Report Management
router.get('/reports', admin_controller_1.adminController.getReports);
router.put('/reports/:id/resolve', admin_controller_1.adminController.resolveReport);
// Audit Logs
router.get('/audit-logs', admin_controller_1.adminController.getAuditLogs);
router.get('/audit-logs/stats', admin_controller_1.adminController.getAuditLogStats);
/**
 * @route   POST /api/v1/admin/announcements
 * @desc    Create system announcement notification
 * @access  Private (Admin only)
 */
router.post('/announcements', admin_controller_1.adminController.createSystemAnnouncement);
