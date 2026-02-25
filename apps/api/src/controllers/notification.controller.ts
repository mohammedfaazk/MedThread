import { Response, Request } from 'express';
import { AuthRequest } from '../middleware/auth';
import { notificationService } from '../services/notification.service';
import { preferencesService } from '../services/notification-preferences.service';
import { emailQueueService } from '../services/email-queue.service';
import { asyncHandler } from '../middleware/asyncHandler';
import { z } from 'zod';
import { NotificationType } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { getSocketInstance } from '../socket';
import { 
  sendUnreadCountUpdate, 
  broadcastNotificationRead, 
  broadcastAllNotificationsRead 
} from '../handlers/notification.handler';

// Validation schemas
const getNotificationsSchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  type: z.nativeEnum(NotificationType).optional(),
  isRead: z.string().optional().transform(val => {
    if (val === undefined) return undefined;
    return val === 'true';
  }),
  startDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
});

const updatePreferencesSchema = z.object({
  inApp: z.record(z.nativeEnum(NotificationType), z.boolean()).optional(),
  email: z.record(z.nativeEnum(NotificationType), z.enum(['instant', 'digest', 'off'])).optional(),
  push: z.record(z.nativeEnum(NotificationType), z.boolean()).optional(),
  quietHoursStart: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
  quietHoursEnd: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
  digestFrequency: z.enum(['daily', 'weekly']).optional(),
  upvoteThreshold: z.number().int().min(0).optional().nullable(),
});

export class NotificationController {
  /**
   * Get notifications for the authenticated user
   * @route GET /api/notifications
   */
  getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const validatedQuery = getNotificationsSchema.parse(req.query);

    const result = await notificationService.getNotifications(req.userId, {
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
  getUnreadCount = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const count = await notificationService.getUnreadCount(req.userId);

    res.status(200).json({
      success: true,
      data: { count }
    });
  });

  /**
   * Mark a notification as read
   * @route POST /api/notifications/:id/read
   */
  markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { id } = req.params;

    await notificationService.markAsRead(id, req.userId);

    // Broadcast to all user's connected clients via socket
    try {
      const io = getSocketInstance();
      broadcastNotificationRead(io, req.userId, id);
      
      // Send updated unread count
      const unreadCount = await notificationService.getUnreadCount(req.userId);
      sendUnreadCountUpdate(io, req.userId, unreadCount);
    } catch (error) {
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
  markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const count = await notificationService.markAllAsRead(req.userId);

    // Broadcast to all user's connected clients via socket
    try {
      const io = getSocketInstance();
      broadcastAllNotificationsRead(io, req.userId);
      
      // Send updated unread count (should be 0)
      sendUnreadCountUpdate(io, req.userId, 0);
    } catch (error) {
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
  deleteNotification = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { id } = req.params;

    await notificationService.deleteNotification(id, req.userId);

    // Send updated unread count via socket
    try {
      const io = getSocketInstance();
      const unreadCount = await notificationService.getUnreadCount(req.userId);
      sendUnreadCountUpdate(io, req.userId, unreadCount);
    } catch (error) {
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
  getPreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const preferences = await preferencesService.getPreferences(req.userId);

    res.status(200).json({
      success: true,
      data: preferences
    });
  });

  /**
   * Update user's notification preferences
   * @route PUT /api/notifications/preferences
   */
  updatePreferences = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const validatedData = updatePreferencesSchema.parse(req.body);

    const preferences = await preferencesService.updatePreferences(
      req.userId,
      validatedData as any
    );

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
  unsubscribe = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Unsubscribe token is required'
      });
    }

    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, config.jwtSecret) as {
        userId: string;
        notificationType: NotificationType;
      };

      // Get current preferences
      const preferences = await preferencesService.getPreferences(decoded.userId);
      const emailPrefs = preferences.email as Record<NotificationType, string>;

      // Update the specific notification type to 'off'
      emailPrefs[decoded.notificationType] = 'off';

      // Save updated preferences
      await preferencesService.updatePreferences(decoded.userId, {
        email: emailPrefs as Record<NotificationType, 'instant' | 'digest' | 'off'>
      });

      res.status(200).json({
        success: true,
        data: {
          type: decoded.notificationType
        },
        message: `Successfully unsubscribed from ${decoded.notificationType} email notifications`
      });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired unsubscribe token'
        });
      }
      throw error;
    }
  });

  /**
   * Generate an unsubscribe token for email notifications
   * This is a helper method used by the email service
   */
  generateUnsubscribeToken(userId: string, notificationType: NotificationType): string {
    return jwt.sign(
      { userId, notificationType },
      config.jwtSecret,
      { expiresIn: '90d' } // Long expiration for unsubscribe links
    );
  }

  /**
   * Get email queue statistics (admin only)
   * @route GET /api/notifications/queue/stats
   */
  getQueueStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Admin check is handled by requireAdmin middleware

    const stats = await emailQueueService.getQueueStats();
    const circuitBreakerStatus = emailQueueService.getCircuitBreakerStatus();

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
  retryFailedJobs = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Admin check is handled by requireAdmin middleware

    const count = await emailQueueService.retryFailedJobs();

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
  resetCircuitBreaker = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Admin check is handled by requireAdmin middleware

    emailQueueService.resetCircuitBreaker();

    res.status(200).json({
      success: true,
      message: 'Circuit breaker reset successfully'
    });
  });
}

export const notificationController = new NotificationController();
