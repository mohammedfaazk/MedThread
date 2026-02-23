import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';
import { notificationRateLimit } from '../middleware/rateLimit';

const router = Router();

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count for authenticated user
 * @access  Private
 */
router.get(
  '/unread-count',
  authenticate,
  notificationRateLimit,
  notificationController.getUnreadCount
);

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
router.get(
  '/',
  authenticate,
  notificationRateLimit,
  notificationController.getNotifications
);

/**
 * @route   POST /api/notifications/mark-all-read
 * @desc    Mark all notifications as read for authenticated user
 * @access  Private
 */
router.post(
  '/mark-all-read',
  authenticate,
  notificationRateLimit,
  notificationController.markAllAsRead
);

/**
 * @route   POST /api/notifications/:id/read
 * @desc    Mark a specific notification as read
 * @access  Private
 */
router.post(
  '/:id/read',
  authenticate,
  notificationRateLimit,
  notificationController.markAsRead
);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a specific notification (soft delete)
 * @access  Private
 */
router.delete(
  '/:id',
  authenticate,
  notificationRateLimit,
  notificationController.deleteNotification
);

/**
 * @route   GET /api/notifications/preferences
 * @desc    Get user's notification preferences
 * @access  Private
 */
router.get(
  '/preferences',
  authenticate,
  notificationRateLimit,
  notificationController.getPreferences
);

/**
 * @route   PUT /api/notifications/preferences
 * @desc    Update user's notification preferences
 * @access  Private
 */
router.put(
  '/preferences',
  authenticate,
  notificationRateLimit,
  notificationController.updatePreferences
);

/**
 * @route   POST /api/notifications/unsubscribe/:token
 * @desc    Unsubscribe from email notifications via token
 * @access  Public (token-based authentication)
 */
router.post(
  '/unsubscribe/:token',
  notificationController.unsubscribe
);

/**
 * @route   GET /api/notifications/queue/stats
 * @desc    Get email queue statistics
 * @access  Private (Admin only)
 */
router.get(
  '/queue/stats',
  authenticate,
  requireAdmin,
  notificationController.getQueueStats
);

/**
 * @route   POST /api/notifications/queue/retry-failed
 * @desc    Retry failed email jobs
 * @access  Private (Admin only)
 */
router.post(
  '/queue/retry-failed',
  authenticate,
  requireAdmin,
  notificationController.retryFailedJobs
);

/**
 * @route   POST /api/notifications/queue/reset-circuit-breaker
 * @desc    Reset email service circuit breaker
 * @access  Private (Admin only)
 */
router.post(
  '/queue/reset-circuit-breaker',
  authenticate,
  requireAdmin,
  notificationController.resetCircuitBreaker
);

export { router as notificationRouter };
