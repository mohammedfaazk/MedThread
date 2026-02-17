"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const database_1 = require("@medthread/database");
const notification_preferences_service_1 = require("./notification-preferences.service");
class NotificationService {
    constructor() {
        this.CACHE_TTL = 60000; // 1 minute
        this.preferencesService = new notification_preferences_service_1.PreferencesService();
        this.unreadCountCache = new Map();
    }
    /**
     * Create notifications for one or more recipients
     * Filters recipients based on preferences, blocked users, and quiet hours
     */
    async createNotification(params) {
        const { type, recipientIds, actorId, metadata, contentId, contentType } = params;
        try {
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
            const notifications = await database_1.prisma.$transaction(unblockedRecipients.map((recipientId) => database_1.prisma.notification.create({
                data: {
                    type,
                    recipientId,
                    actorId,
                    contentId,
                    contentType,
                    metadata: metadata,
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
            })));
            // 4. Invalidate unread count cache for recipients
            unblockedRecipients.forEach((recipientId) => {
                this.unreadCountCache.delete(recipientId);
            });
            console.log(`Created ${notifications.length} notifications of type ${type}`);
            return notifications;
        }
        catch (error) {
            console.error('Error creating notification:', error);
            throw new Error(`Failed to create notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get notifications for a user with filtering and pagination
     */
    async getNotifications(userId, options = {}) {
        const { page = 1, limit = 20, type, isRead, startDate, endDate, } = options;
        try {
            const skip = (page - 1) * limit;
            // Build where clause
            const where = {
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
                database_1.prisma.notification.findMany({
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
                database_1.prisma.notification.count({ where }),
            ]);
            return {
                notifications,
                total,
                hasMore: skip + notifications.length < total,
                page,
                limit,
            };
        }
        catch (error) {
            console.error('Error fetching notifications:', error);
            throw new Error(`Failed to fetch notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Mark a single notification as read
     */
    async markAsRead(notificationId, userId) {
        try {
            // Verify the notification belongs to the user
            const notification = await database_1.prisma.notification.findFirst({
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
            await database_1.prisma.notification.update({
                where: { id: notificationId },
                data: {
                    isRead: true,
                    readAt: new Date(),
                },
            });
            // Invalidate cache
            this.unreadCountCache.delete(userId);
            console.log(`Marked notification ${notificationId} as read for user ${userId}`);
        }
        catch (error) {
            console.error('Error marking notification as read:', error);
            throw new Error(`Failed to mark notification as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId) {
        try {
            const result = await database_1.prisma.notification.updateMany({
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
        }
        catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw new Error(`Failed to mark all notifications as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Delete a notification (soft delete)
     */
    async deleteNotification(notificationId, userId) {
        try {
            // Verify the notification belongs to the user
            const notification = await database_1.prisma.notification.findFirst({
                where: {
                    id: notificationId,
                    recipientId: userId,
                },
            });
            if (!notification) {
                throw new Error('Notification not found or access denied');
            }
            await database_1.prisma.notification.update({
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
        }
        catch (error) {
            console.error('Error deleting notification:', error);
            throw new Error(`Failed to delete notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get unread notification count for a user with caching
     */
    async getUnreadCount(userId) {
        try {
            // Check cache
            const cached = this.unreadCountCache.get(userId);
            if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
                return cached.count;
            }
            // Fetch from database
            const count = await database_1.prisma.notification.count({
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
        }
        catch (error) {
            console.error('Error fetching unread count:', error);
            throw new Error(`Failed to fetch unread count: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Filter recipients based on their notification preferences
     */
    async filterRecipientsByPreferences(recipientIds, type) {
        try {
            const eligibleRecipients = [];
            for (const recipientId of recipientIds) {
                const isEnabled = await this.preferencesService.isNotificationEnabled(recipientId, type, 'in-app');
                if (isEnabled) {
                    eligibleRecipients.push(recipientId);
                }
            }
            return eligibleRecipients;
        }
        catch (error) {
            console.error('Error filtering recipients by preferences:', error);
            // On error, return all recipients to avoid blocking notifications
            return recipientIds;
        }
    }
    /**
     * Filter out recipients who have blocked the actor
     */
    async filterBlockedUsers(recipientIds, actorId) {
        try {
            const blocks = await database_1.prisma.block.findMany({
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
        }
        catch (error) {
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
    aggregateNotifications(notifications) {
        if (notifications.length === 0) {
            return [];
        }
        // Group notifications by type + contentId + 1-hour time window
        const groups = new Map();
        for (const notification of notifications) {
            // Create a grouping key based on type, contentId, and hour bucket
            const hourBucket = this.getHourBucket(notification.createdAt);
            const key = `${notification.type}-${notification.contentId || 'null'}-${hourBucket}`;
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key).push(notification);
        }
        // Process each group and create aggregated notifications
        const aggregated = [];
        for (const group of groups.values()) {
            if (group.length === 1) {
                // Single notification, no aggregation needed
                aggregated.push({
                    ...group[0],
                    aggregatedCount: 1,
                });
            }
            else {
                // Multiple notifications, aggregate them
                // Sort by creation time to get the earliest one as the base
                const sorted = group.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                // Use the first notification as the base
                const baseNotification = sorted[0];
                // Collect unique actors (limit to 50)
                const actorMap = new Map();
                const allIds = [];
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
        return aggregated.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    /**
     * Get hour bucket for time-based grouping
     * Returns timestamp rounded down to the nearest hour
     */
    getHourBucket(date) {
        const timestamp = new Date(date).getTime();
        const hourInMs = 60 * 60 * 1000;
        return Math.floor(timestamp / hourInMs) * hourInMs;
    }
    /**
     * Clear the unread count cache for a user (useful for testing or manual cache invalidation)
     */
    clearCache(userId) {
        if (userId) {
            this.unreadCountCache.delete(userId);
        }
        else {
            this.unreadCountCache.clear();
        }
    }
}
exports.NotificationService = NotificationService;
// Export singleton instance
exports.notificationService = new NotificationService();
