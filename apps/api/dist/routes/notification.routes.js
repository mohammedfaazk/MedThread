"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRouter = void 0;
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const router = (0, express_1.Router)();
exports.notificationRouter = router;
/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count for authenticated user
 * @access  Private
 */
router.get('/unread-count', auth_1.authenticate, rateLimit_1.notificationRateLimit, notification_controller_1.notificationController.getUnreadCount);
/**
 * @route   GET /api/notifications
 * @desc    Get notifications for authenticated user with filtering and pagination
 * @access  Private
 * @query   page - Page number (default: 1)
 * @query   limit - Items per page (default: 20)
 * @query   type - Filter by notification type
 * @query   isRead - Filter by read status (true/false)
 * @query   startDate - Filter by start date (ISO string)
 * @query   endDate - Filter by end date (ISO string)
 */
router.get('/', auth_1.authenticate, rateLimit_1.notificationRateLimit, notification_controller_1.notificationController.getNotifications);
/**
 * @route   POST /api/notifications/mark-all-read
 * @desc    Mark all notifications as read for authenticated user
 * @access  Private
 */
router.post('/mark-all-read', auth_1.authenticate, rateLimit_1.notificationRateLimit, notification_controller_1.notificationController.markAllAsRead);
/**
 * @route   POST /api/notifications/:id/read
 * @desc    Mark a specific notification as read
 * @access  Private
 */
router.post('/:id/read', auth_1.authenticate, rateLimit_1.notificationRateLimit, notification_controller_1.notificationController.markAsRead);
/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a specific notification (soft delete)
 * @access  Private
 */
router.delete('/:id', auth_1.authenticate, rateLimit_1.notificationRateLimit, notification_controller_1.notificationController.deleteNotification);
/**
 * @route   GET /api/notifications/preferences
 * @desc    Get user's notification preferences
 * @access  Private
 */
router.get('/preferences', auth_1.authenticate, rateLimit_1.notificationRateLimit, notification_controller_1.notificationController.getPreferences);
/**
 * @route   PUT /api/notifications/preferences
 * @desc    Update user's notification preferences
 * @access  Private
 */
router.put('/preferences', auth_1.authenticate, rateLimit_1.notificationRateLimit, notification_controller_1.notificationController.updatePreferences);
/**
 * @route   POST /api/notifications/unsubscribe/:token
 * @desc    Unsubscribe from email notifications via token
 * @access  Public (token-based authentication)
 */
router.post('/unsubscribe/:token', notification_controller_1.notificationController.unsubscribe);
