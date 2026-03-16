import { prisma } from '@medthread/database';
import { NotificationType, ContentType, Notification, Prisma } from '@prisma/client';
import { PreferencesService } from './notification-preferences.service';
import { sanitizeNotificationMetadata, sanitizeUrl } from '../utils/sanitize';

export interface CreateNotificationParams {
  type: NotificationType;
  recipientIds: string[];
  actorId: string;
  metadata: NotificationMetadata;
  contentId?: string;
  contentType?: ContentType;
}

export interface NotificationMetadata {
  title?: string;
  body?: string;
  preview?: string;
  link?: string;
  communityName?: string;
  postTitle?: string;
  [key: string]: any;
}

export interface GetNotificationsOptions {
  page?: number;
  limit?: number;
  type?: NotificationType;
  isRead?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface PaginatedNotifications {
  notifications: Notification[];
  total: number;
  hasMore: boolean;
  page: number;
  limit: number;
}

export interface AggregatedNotification extends Notification {
  actors?: Array<{
    id: string;
    username: string;
    avatar: string | null;
    role: string;
  }>;
  aggregatedCount: number;
  aggregatedIds?: string[];
}

export class NotificationService {
  private preferencesService: PreferencesService;
  private unreadCountCache: Map<string, { count: number; timestamp: number }>;
  private readonly CACHE_TTL = 60000; // 1 minute

  constructor() {
    this.preferencesService = new PreferencesService();
    this.unreadCountCache = new Map();
  }

  /**
   * Create notifications for one or more recipients
   * Filters recipients based on preferences, blocked users, and quiet hours
   */
  async createNotification(params: CreateNotificationParams): Promise<Notification[]> {
    const { type, recipientIds, actorId, metadata, contentId, contentType } = params;

    try {
      // Sanitize metadata to prevent XSS attacks
      const sanitizedMetadata = sanitizeNotificationMetadata(metadata);
      
      // Sanitize URL if present
      if (sanitizedMetadata.link) {
        sanitizedMetadata.link = sanitizeUrl(sanitizedMetadata.link);
      }

      // 1. Filter recipients based on preferences
      const eligibleRecipients = await this.filterRecipientsByPreferences(recipientIds, type);

      if (eligibleRecipients.length === 0) {
        console.log(`No eligible recipients for notification type ${type}`);
        return [];
      }

      // 2. Filter out blocked users
      const unblockedRecipients = await this.filterBlockedUsers(eligibleRecipients, actorId);

      if (unblockedRecipients.length === 0) {
        console.log(`All recipients have blocked actor ${actorId}`);
        return [];
      }

      // 3. Create notification records
      const notifications = await prisma.$transaction(
        unblockedRecipients.map((recipientId) =>
          prisma.notifications.create({
            data: {
              type,
              recipientId,
              actorId,
              contentId,
              contentType,
              metadata: sanitizedMetadata as Prisma.JsonObject,
            },
            include: {
              actor: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                  role: true,
                },
              },
              recipient: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          })
        )
      );

      // 4. Invalidate unread count cache for recipients
      unblockedRecipients.forEach((recipientId) => {
        this.unreadCountCache.delete(recipientId);
      });

      // 5. Enqueue email delivery jobs (use dynamic import to avoid circular dependency)
      try {
        const { emailQueueService } = await import('./email-queue.service');
        await emailQueueService.enqueueInstantEmailBatch(notifications);
      } catch (error) {
        console.error('Error enqueueing email delivery:', error);
        // Don't fail notification creation if email queueing fails
      }

      console.log(`Created ${notifications.length} notifications of type ${type}`);

      return notifications;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error(`Failed to create notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get notifications for a user with filtering and pagination
   */
  async getNotifications(
    userId: string,
    options: GetNotificationsOptions = {}
  ): Promise<PaginatedNotifications> {
    const {
      page = 1,
      limit = 20,
      type,
      isRead,
      startDate,
      endDate,
    } = options;

    try {
      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.NotificationWhereInput = {
        recipientId: userId,
        isDeleted: false,
      };

      if (type) {
        where.type = type;
      }

      if (isRead !== undefined) {
        where.isRead = isRead;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt.gte = startDate;
        }
        if (endDate) {
          where.createdAt.lte = endDate;
        }
      }

      // Execute queries in parallel
      const [notifications, total] = await Promise.all([
        prisma.notifications.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            actor: {
              select: {
                id: true,
                username: true,
                avatar: true,
                role: true,
              },
            },
          },
        }),
        prisma.notifications.count({ where }),
      ]);

      return {
        notifications,
        total,
        hasMore: skip + notifications.length < total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error(`Failed to fetch notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      // Verify the notification belongs to the user
      const notification = await prisma.notifications.findFirst({
        where: {
          id: notificationId,
          recipientId: userId,
        },
      });

      if (!notification) {
        throw new Error('Notification not found or access denied');
      }

      if (notification.isRead) {
        return; // Already read
      }

      await prisma.notifications.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      // Invalidate cache
      this.unreadCountCache.delete(userId);

      console.log(`Marked notification ${notificationId} as read for user ${userId}`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error(`Failed to mark notification as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await prisma.notifications.updateMany({
        where: {
          recipientId: userId,
          isRead: false,
          isDeleted: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      // Invalidate cache
      this.unreadCountCache.delete(userId);

      console.log(`Marked ${result.count} notifications as read for user ${userId}`);

      return result.count;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error(`Failed to mark all notifications as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a notification (soft delete)
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    try {
      // Verify the notification belongs to the user
      const notification = await prisma.notifications.findFirst({
        where: {
          id: notificationId,
          recipientId: userId,
        },
      });

      if (!notification) {
        throw new Error('Notification not found or access denied');
      }

      await prisma.notifications.update({
        where: { id: notificationId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      // Invalidate cache if it was unread
      if (!notification.isRead) {
        this.unreadCountCache.delete(userId);
      }

      console.log(`Deleted notification ${notificationId} for user ${userId}`);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw new Error(`Failed to delete notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get unread notification count for a user with caching
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      // Check cache
      const cached = this.unreadCountCache.get(userId);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.count;
      }

      // Fetch from database
      const count = await prisma.notifications.count({
        where: {
          recipientId: userId,
          isRead: false,
          isDeleted: false,
        },
      });

      // Update cache
      this.unreadCountCache.set(userId, {
        count,
        timestamp: Date.now(),
      });

      return count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw new Error(`Failed to fetch unread count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Filter recipients based on their notification preferences
   */
  private async filterRecipientsByPreferences(
    recipientIds: string[],
    type: NotificationType
  ): Promise<string[]> {
    try {
      const eligibleRecipients: string[] = [];

      for (const recipientId of recipientIds) {
        const isEnabled = await this.preferencesService.isNotificationEnabled(
          recipientId,
          type,
          'in-app'
        );

        if (isEnabled) {
          eligibleRecipients.push(recipientId);
        }
      }

      return eligibleRecipients;
    } catch (error) {
      console.error('Error filtering recipients by preferences:', error);
      // On error, return all recipients to avoid blocking notifications
      return recipientIds;
    }
  }

  /**
   * Filter out recipients who have blocked the actor
   */
  private async filterBlockedUsers(
    recipientIds: string[],
    actorId: string
  ): Promise<string[]> {
    try {
      const blocks = await prisma.block.findMany({
        where: {
          blockerId: { in: recipientIds },
          blockedId: actorId,
        },
        select: {
          blockerId: true,
        },
      });

      const blockerIds = new Set(blocks.map((b) => b.blockerId));

      return recipientIds.filter((id) => !blockerIds.has(id));
    } catch (error) {
      console.error('Error filtering blocked users:', error);
      // On error, return all recipients to avoid blocking notifications
      return recipientIds;
    }
  }

  /**
   * Aggregate similar notifications by type, content, and time window
   * Groups notifications that occurred within 1 hour of each other
   * Limits to 50 actors per aggregated notification
   */
  aggregateNotifications(notifications: Notification[]): AggregatedNotification[] {
    if (notifications.length === 0) {
      return [];
    }

    // Group notifications by type + contentId + 1-hour time window
    const groups = new Map<string, Notification[]>();

    for (const notification of notifications) {
      // Create a grouping key based on type, contentId, and hour bucket
      const hourBucket = this.getHourBucket(notification.createdAt);
      const key = `${notification.type}-${notification.contentId || 'null'}-${hourBucket}`;

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(notification);
    }

    // Process each group and create aggregated notifications
    const aggregated: AggregatedNotification[] = [];

    for (const group of groups.values()) {
      if (group.length === 1) {
        // Single notification, no aggregation needed
        aggregated.push({
          ...group[0],
          aggregatedCount: 1,
        });
      } else {
        // Multiple notifications, aggregate them
        // Sort by creation time to get the earliest one as the base
        const sorted = group.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        // Use the first notification as the base
        const baseNotification = sorted[0];

        // Collect unique actors (limit to 50)
        const actorMap = new Map<string, any>();
        const allIds: string[] = [];

        for (const notif of sorted) {
          allIds.push(notif.id);
          
          // Only add actors up to the limit of 50
          if (actorMap.size < 50 && notif.actor) {
            actorMap.set(notif.actorId, {
              id: notif.actor.id,
              username: notif.actor.username,
              avatar: notif.actor.avatar,
              role: notif.actor.role,
            });
          }
        }

        const actors = Array.from(actorMap.values());

        // Create aggregated notification
        aggregated.push({
          ...baseNotification,
          actors,
          aggregatedCount: sorted.length,
          aggregatedIds: allIds,
        });
      }
    }

    // Sort aggregated notifications by creation time (most recent first)
    return aggregated.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Get hour bucket for time-based grouping
   * Returns timestamp rounded down to the nearest hour
   */
  private getHourBucket(date: Date): number {
    const timestamp = new Date(date).getTime();
    const hourInMs = 60 * 60 * 1000;
    return Math.floor(timestamp / hourInMs) * hourInMs;
  }

  /**
   * Clear the unread count cache for a user (useful for testing or manual cache invalidation)
   */
  clearCache(userId?: string): void {
    if (userId) {
      this.unreadCountCache.delete(userId);
    } else {
      this.unreadCountCache.clear();
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

