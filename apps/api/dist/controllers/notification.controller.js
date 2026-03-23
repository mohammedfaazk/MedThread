"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
const notification_preferences_service_1 = require("../services/notification-preferences.service");
const email_queue_service_1 = require("../services/email-queue.service");
const asyncHandler_1 = require("../middleware/asyncHandler");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const socket_1 = require("../socket");
const notification_handler_1 = require("../handlers/notification.handler");
// Validation schemas
const getNotificationsSchema = zod_1.z.object({
    page: zod_1.z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: zod_1.z.string().optional().transform(val => val ? parseInt(val) : 20),
    type: zod_1.z.nativeEnum(client_1.NotificationType).optional(),
    isRead: zod_1.z.string().optional().transform(val => {
        if (val === undefined)
            return undefined;
        return val === 'true';
    }),
    startDate: zod_1.z.string().optional().transform(val => val ? new Date(val) : undefined),
    endDate: zod_1.z.string().optional().transform(val => val ? new Date(val) : undefined),
});
const updatePreferencesSchema = zod_1.z.object({
    inApp: zod_1.z.record(zod_1.z.nativeEnum(client_1.NotificationType), zod_1.z.boolean()).optional(),
    email: zod_1.z.record(zod_1.z.nativeEnum(client_1.NotificationType), zod_1.z.enum(['instant', 'digest', 'off'])).optional(),
    push: zod_1.z.record(zod_1.z.nativeEnum(client_1.NotificationType), zod_1.z.boolean()).optional(),
    quietHoursStart: zod_1.z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
    quietHoursEnd: zod_1.z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
    digestFrequency: zod_1.z.enum(['daily', 'weekly']).optional(),
    upvoteThreshold: zod_1.z.number().int().min(0).optional().nullable(),
});
class NotificationController {
    constructor() {
        /**
         * Get notifications for the authenticated user
         * @route GET /api/notifications
         */
        this.getNotifications = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }
            const validatedQuery = getNotificationsSchema.parse(req.query);
            const result = await notification_service_1.notificationService.getNotifications(req.userId, {
                page: validatedQuery.page,
                limit: validatedQuery.limit,
                type: validatedQuery.type,
                isRead: validatedQuery.isRead,
                startDate: validatedQuery.startDate,
                endDate: validatedQuery.endDate,
            });
            res.status(200).json({
                success: true,
                data: result
            });
        });
        /**
         * Get unread notification count
         * @route GET /api/notifications/unread-count
         */
        this.getUnreadCount = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }
            const count = await notification_service_1.notificationService.getUnreadCount(req.userId);
            res.status(200).json({
                success: true,
                data: { count }
            });
        });
        /**
         * Mark a notification as read
         * @route POST /api/notifications/:id/read
         */
        this.markAsRead = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }
            const { id } = req.params;
            await notification_service_1.notificationService.markAsRead(id, req.userId);
            // Broadcast to all user's connected clients via socket
            try {
                const io = (0, socket_1.getSocketInstance)();
                (0, notification_handler_1.broadcastNotificationRead)(io, req.userId, id);
                // Send updated unread count
                const unreadCount = await notification_service_1.notificationService.getUnreadCount(req.userId);
                (0, notification_handler_1.sendUnreadCountUpdate)(io, req.userId, unreadCount);
            }
            catch (error) {
                console.error('Failed to broadcast notification read event:', error);
                // Don't fail the request if socket broadcast fails
            }
            res.status(200).json({
                success: true,
                message: 'Notification marked as read'
            });
        });
        /**
         * Mark all notifications as read
         * @route POST /api/notifications/mark-all-read
         */
        this.markAllAsRead = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }
            const count = await notification_service_1.notificationService.markAllAsRead(req.userId);
            // Broadcast to all user's connected clients via socket
            try {
                const io = (0, socket_1.getSocketInstance)();
                (0, notification_handler_1.broadcastAllNotificationsRead)(io, req.userId);
                // Send updated unread count (should be 0)
                (0, notification_handler_1.sendUnreadCountUpdate)(io, req.userId, 0);
            }
            catch (error) {
                console.error('Failed to broadcast all notifications read event:', error);
                // Don't fail the request if socket broadcast fails
            }
            res.status(200).json({
                success: true,
                data: { count },
                message: `${count} notifications marked as read`
            });
        });
        /**
         * Delete a notification
         * @route DELETE /api/notifications/:id
         */
        this.deleteNotification = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }
            const { id } = req.params;
            await notification_service_1.notificationService.deleteNotification(id, req.userId);
            // Send updated unread count via socket
            try {
                const io = (0, socket_1.getSocketInstance)();
                const unreadCount = await notification_service_1.notificationService.getUnreadCount(req.userId);
                (0, notification_handler_1.sendUnreadCountUpdate)(io, req.userId, unreadCount);
            }
            catch (error) {
                console.error('Failed to send unread count update:', error);
                // Don't fail the request if socket broadcast fails
            }
            res.status(200).json({
                success: true,
                message: 'Notification deleted'
            });
        });
        /**
         * Get user's notification preferences
         * @route GET /api/notifications/preferences
         */
        this.getPreferences = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }
            const preferences = await notification_preferences_service_1.preferencesService.getPreferences(req.userId);
            res.status(200).json({
                success: true,
                data: preferences
            });
        });
        /**
         * Update user's notification preferences
         * @route PUT /api/notifications/preferences
         */
        this.updatePreferences = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }
            const validatedData = updatePreferencesSchema.parse(req.body);
            const preferences = await notification_preferences_service_1.preferencesService.updatePreferences(req.userId, validatedData);
            res.status(200).json({
                success: true,
                data: preferences,
                message: 'Preferences updated successfully'
            });
        });
        /**
         * Handle email unsubscribe via token
         * @route POST /api/notifications/unsubscribe/:token
         */
        this.unsubscribe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { token } = req.params;
            if (!token) {
                return res.status(400).json({
                    success: false,
                    error: 'Unsubscribe token is required'
                });
            }
            try {
                // Verify and decode the token
                const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
                // Get current preferences
                const preferences = await notification_preferences_service_1.preferencesService.getPreferences(decoded.userId);
                const emailPrefs = preferences.email;
                // Update the specific notification type to 'off'
                emailPrefs[decoded.notificationType] = 'off';
                // Save updated preferences
                await notification_preferences_service_1.preferencesService.updatePreferences(decoded.userId, {
                    email: emailPrefs
                });
                res.status(200).json({
                    success: true,
                    data: {
                        type: decoded.notificationType
                    },
                    message: `Successfully unsubscribed from ${decoded.notificationType} email notifications`
                });
            }
            catch (error) {
                if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid or expired unsubscribe token'
                    });
                }
                throw error;
            }
        });
        /**
         * Get email queue statistics (admin only)
         * @route GET /api/notifications/queue/stats
         */
        this.getQueueStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }
            // Admin check is handled by requireAdmin middleware
            const stats = await email_queue_service_1.emailQueueService.getQueueStats();
            const circuitBreakerStatus = email_queue_service_1.emailQueueService.getCircuitBreakerStatus();
            res.status(200).json({
                success: true,
                data: {
                    queue: stats,
                    circuitBreaker: circuitBreakerStatus
                }
            });
        });
        /**
         * Retry failed email jobs (admin only)
         * @route POST /api/notifications/queue/retry-failed
         */
        this.retryFailedJobs = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }
            // Admin check is handled by requireAdmin middleware
            const count = await email_queue_service_1.emailQueueService.retryFailedJobs();
            res.status(200).json({
                success: true,
                data: { count },
                message: `${count} failed jobs reset for retry`
            });
        });
        /**
         * Reset circuit breaker (admin only)
         * @route POST /api/notifications/queue/reset-circuit-breaker
         */
        this.resetCircuitBreaker = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }
            // Admin check is handled by requireAdmin middleware
            email_queue_service_1.emailQueueService.resetCircuitBreaker();
            res.status(200).json({
                success: true,
                message: 'Circuit breaker reset successfully'
            });
        });
    }
    /**
     * Generate an unsubscribe token for email notifications
     * This is a helper method used by the email service
     */
    generateUnsubscribeToken(userId, notificationType) {
        return jsonwebtoken_1.default.sign({ userId, notificationType }, config_1.config.jwtSecret, { expiresIn: '90d' } // Long expiration for unsubscribe links
        );
    }
}
exports.NotificationController = NotificationController;
exports.notificationController = new NotificationController();
