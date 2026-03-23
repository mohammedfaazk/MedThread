"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const notification_service_1 = require("../notification.service");
const database_1 = require("@medthread/database");
const client_1 = require("@prisma/client");
// Mock Prisma
vitest_1.vi.mock('@medthread/database', () => ({
    prisma: {
        notification: {
            create: vitest_1.vi.fn(),
            findMany: vitest_1.vi.fn(),
            findFirst: vitest_1.vi.fn(),
            count: vitest_1.vi.fn(),
            update: vitest_1.vi.fn(),
            updateMany: vitest_1.vi.fn(),
        },
        block: {
            findMany: vitest_1.vi.fn(),
        },
        $transaction: vitest_1.vi.fn(),
    },
}));
// Mock PreferencesService
vitest_1.vi.mock('../notification-preferences.service', () => ({
    PreferencesService: vitest_1.vi.fn().mockImplementation(() => ({
        isNotificationEnabled: vitest_1.vi.fn().mockResolvedValue(true),
    })),
}));
(0, vitest_1.describe)('NotificationService', () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        service = new notification_service_1.NotificationService();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.afterEach)(() => {
        service.clearCache();
    });
    (0, vitest_1.describe)('createNotification', () => {
        (0, vitest_1.it)('should create notifications for eligible recipients', async () => {
            const mockNotification = {
                id: 'notif-1',
                type: client_1.NotificationType.REPLY,
                recipientId: 'user-1',
                actorId: 'user-2',
                contentId: 'post-1',
                contentType: client_1.ContentType.POST,
                metadata: { title: 'Test' },
                isRead: false,
                isDeleted: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                readAt: null,
                deletedAt: null,
                actor: {
                    id: 'user-2',
                    username: 'actor',
                    avatar: null,
                    role: 'PATIENT',
                },
                recipient: {
                    id: 'user-1',
                    username: 'recipient',
                },
            };
            database_1.prisma.block.findMany.mockResolvedValue([]);
            database_1.prisma.$transaction.mockResolvedValue([mockNotification]);
            const result = await service.createNotification({
                type: client_1.NotificationType.REPLY,
                recipientIds: ['user-1'],
                actorId: 'user-2',
                metadata: { title: 'Test' },
                contentId: 'post-1',
                contentType: client_1.ContentType.POST,
            });
            (0, vitest_1.expect)(result).toHaveLength(1);
            (0, vitest_1.expect)(result[0]).toEqual(mockNotification);
            (0, vitest_1.expect)(database_1.prisma.$transaction).toHaveBeenCalled();
        });
        (0, vitest_1.it)('should filter out blocked users', async () => {
            database_1.prisma.block.findMany.mockResolvedValue([
                { blockerId: 'user-1' },
            ]);
            database_1.prisma.$transaction.mockResolvedValue([]);
            const result = await service.createNotification({
                type: client_1.NotificationType.REPLY,
                recipientIds: ['user-1'],
                actorId: 'user-2',
                metadata: { title: 'Test' },
            });
            (0, vitest_1.expect)(result).toHaveLength(0);
            (0, vitest_1.expect)(database_1.prisma.$transaction).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)('should handle errors gracefully', async () => {
            database_1.prisma.block.findMany.mockRejectedValue(new Error('DB error'));
            await (0, vitest_1.expect)(service.createNotification({
                type: client_1.NotificationType.REPLY,
                recipientIds: ['user-1'],
                actorId: 'user-2',
                metadata: { title: 'Test' },
            })).rejects.toThrow('Failed to create notification');
        });
    });
    (0, vitest_1.describe)('getNotifications', () => {
        (0, vitest_1.it)('should fetch notifications with pagination', async () => {
            const mockNotifications = [
                {
                    id: 'notif-1',
                    type: client_1.NotificationType.REPLY,
                    recipientId: 'user-1',
                    actorId: 'user-2',
                    metadata: {},
                    isRead: false,
                    isDeleted: false,
                    createdAt: new Date(),
                    actor: {
                        id: 'user-2',
                        username: 'actor',
                        avatar: null,
                        role: 'PATIENT',
                    },
                },
            ];
            database_1.prisma.notification.findMany.mockResolvedValue(mockNotifications);
            database_1.prisma.notification.count.mockResolvedValue(1);
            const result = await service.getNotifications('user-1', {
                page: 1,
                limit: 20,
            });
            (0, vitest_1.expect)(result.notifications).toEqual(mockNotifications);
            (0, vitest_1.expect)(result.total).toBe(1);
            (0, vitest_1.expect)(result.hasMore).toBe(false);
            (0, vitest_1.expect)(result.page).toBe(1);
            (0, vitest_1.expect)(result.limit).toBe(20);
        });
        (0, vitest_1.it)('should filter by notification type', async () => {
            database_1.prisma.notification.findMany.mockResolvedValue([]);
            database_1.prisma.notification.count.mockResolvedValue(0);
            await service.getNotifications('user-1', {
                type: client_1.NotificationType.MENTION,
            });
            (0, vitest_1.expect)(database_1.prisma.notification.findMany).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                where: vitest_1.expect.objectContaining({
                    type: client_1.NotificationType.MENTION,
                }),
            }));
        });
        (0, vitest_1.it)('should filter by read status', async () => {
            database_1.prisma.notification.findMany.mockResolvedValue([]);
            database_1.prisma.notification.count.mockResolvedValue(0);
            await service.getNotifications('user-1', {
                isRead: false,
            });
            (0, vitest_1.expect)(database_1.prisma.notification.findMany).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                where: vitest_1.expect.objectContaining({
                    isRead: false,
                }),
            }));
        });
    });
    (0, vitest_1.describe)('markAsRead', () => {
        (0, vitest_1.it)('should mark notification as read', async () => {
            const mockNotification = {
                id: 'notif-1',
                recipientId: 'user-1',
                isRead: false,
            };
            database_1.prisma.notification.findFirst.mockResolvedValue(mockNotification);
            database_1.prisma.notification.update.mockResolvedValue({
                ...mockNotification,
                isRead: true,
                readAt: new Date(),
            });
            await service.markAsRead('notif-1', 'user-1');
            (0, vitest_1.expect)(database_1.prisma.notification.update).toHaveBeenCalledWith({
                where: { id: 'notif-1' },
                data: {
                    isRead: true,
                    readAt: vitest_1.expect.any(Date),
                },
            });
        });
        (0, vitest_1.it)('should throw error if notification not found', async () => {
            database_1.prisma.notification.findFirst.mockResolvedValue(null);
            await (0, vitest_1.expect)(service.markAsRead('notif-1', 'user-1')).rejects.toThrow('Notification not found or access denied');
        });
        (0, vitest_1.it)('should not update if already read', async () => {
            const mockNotification = {
                id: 'notif-1',
                recipientId: 'user-1',
                isRead: true,
            };
            database_1.prisma.notification.findFirst.mockResolvedValue(mockNotification);
            await service.markAsRead('notif-1', 'user-1');
            (0, vitest_1.expect)(database_1.prisma.notification.update).not.toHaveBeenCalled();
        });
    });
    (0, vitest_1.describe)('markAllAsRead', () => {
        (0, vitest_1.it)('should mark all unread notifications as read', async () => {
            database_1.prisma.notification.updateMany.mockResolvedValue({ count: 5 });
            const count = await service.markAllAsRead('user-1');
            (0, vitest_1.expect)(count).toBe(5);
            (0, vitest_1.expect)(database_1.prisma.notification.updateMany).toHaveBeenCalledWith({
                where: {
                    recipientId: 'user-1',
                    isRead: false,
                    isDeleted: false,
                },
                data: {
                    isRead: true,
                    readAt: vitest_1.expect.any(Date),
                },
            });
        });
    });
    (0, vitest_1.describe)('deleteNotification', () => {
        (0, vitest_1.it)('should soft delete notification', async () => {
            const mockNotification = {
                id: 'notif-1',
                recipientId: 'user-1',
                isRead: false,
            };
            database_1.prisma.notification.findFirst.mockResolvedValue(mockNotification);
            database_1.prisma.notification.update.mockResolvedValue({
                ...mockNotification,
                isDeleted: true,
                deletedAt: new Date(),
            });
            await service.deleteNotification('notif-1', 'user-1');
            (0, vitest_1.expect)(database_1.prisma.notification.update).toHaveBeenCalledWith({
                where: { id: 'notif-1' },
                data: {
                    isDeleted: true,
                    deletedAt: vitest_1.expect.any(Date),
                },
            });
        });
        (0, vitest_1.it)('should throw error if notification not found', async () => {
            database_1.prisma.notification.findFirst.mockResolvedValue(null);
            await (0, vitest_1.expect)(service.deleteNotification('notif-1', 'user-1')).rejects.toThrow('Notification not found or access denied');
        });
    });
    (0, vitest_1.describe)('getUnreadCount', () => {
        (0, vitest_1.it)('should return unread count from database', async () => {
            database_1.prisma.notification.count.mockResolvedValue(3);
            const count = await service.getUnreadCount('user-1');
            (0, vitest_1.expect)(count).toBe(3);
            (0, vitest_1.expect)(database_1.prisma.notification.count).toHaveBeenCalledWith({
                where: {
                    recipientId: 'user-1',
                    isRead: false,
                    isDeleted: false,
                },
            });
        });
        (0, vitest_1.it)('should use cached value if available', async () => {
            database_1.prisma.notification.count.mockResolvedValue(3);
            // First call - should hit database
            const count1 = await service.getUnreadCount('user-1');
            (0, vitest_1.expect)(count1).toBe(3);
            (0, vitest_1.expect)(database_1.prisma.notification.count).toHaveBeenCalledTimes(1);
            // Second call - should use cache
            const count2 = await service.getUnreadCount('user-1');
            (0, vitest_1.expect)(count2).toBe(3);
            (0, vitest_1.expect)(database_1.prisma.notification.count).toHaveBeenCalledTimes(1);
        });
        (0, vitest_1.it)('should invalidate cache after marking as read', async () => {
            const mockNotification = {
                id: 'notif-1',
                recipientId: 'user-1',
                isRead: false,
            };
            database_1.prisma.notification.count.mockResolvedValue(3);
            database_1.prisma.notification.findFirst.mockResolvedValue(mockNotification);
            database_1.prisma.notification.update.mockResolvedValue({
                ...mockNotification,
                isRead: true,
            });
            // Get count - should cache
            await service.getUnreadCount('user-1');
            (0, vitest_1.expect)(database_1.prisma.notification.count).toHaveBeenCalledTimes(1);
            // Mark as read - should invalidate cache
            await service.markAsRead('notif-1', 'user-1');
            // Get count again - should hit database
            database_1.prisma.notification.count.mockResolvedValue(2);
            const count = await service.getUnreadCount('user-1');
            (0, vitest_1.expect)(count).toBe(2);
            (0, vitest_1.expect)(database_1.prisma.notification.count).toHaveBeenCalledTimes(2);
        });
    });
    (0, vitest_1.describe)('clearCache', () => {
        (0, vitest_1.it)('should clear cache for specific user', async () => {
            database_1.prisma.notification.count.mockResolvedValue(3);
            // Cache the count
            await service.getUnreadCount('user-1');
            (0, vitest_1.expect)(database_1.prisma.notification.count).toHaveBeenCalledTimes(1);
            // Clear cache
            service.clearCache('user-1');
            // Should hit database again
            await service.getUnreadCount('user-1');
            (0, vitest_1.expect)(database_1.prisma.notification.count).toHaveBeenCalledTimes(2);
        });
        (0, vitest_1.it)('should clear all cache when no userId provided', async () => {
            database_1.prisma.notification.count.mockResolvedValue(3);
            // Cache counts for multiple users
            await service.getUnreadCount('user-1');
            await service.getUnreadCount('user-2');
            (0, vitest_1.expect)(database_1.prisma.notification.count).toHaveBeenCalledTimes(2);
            // Clear all cache
            service.clearCache();
            // Should hit database again for both
            await service.getUnreadCount('user-1');
            await service.getUnreadCount('user-2');
            (0, vitest_1.expect)(database_1.prisma.notification.count).toHaveBeenCalledTimes(4);
        });
    });
    (0, vitest_1.describe)('aggregateNotifications', () => {
        (0, vitest_1.it)('should return single notification without aggregation', () => {
            const notification = {
                id: 'notif-1',
                type: client_1.NotificationType.REPLY,
                recipientId: 'user-1',
                actorId: 'user-2',
                contentId: 'post-1',
                contentType: client_1.ContentType.POST,
                metadata: {},
                isRead: false,
                isDeleted: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                readAt: null,
                deletedAt: null,
                actor: {
                    id: 'user-2',
                    username: 'actor',
                    avatar: null,
                    role: 'PATIENT',
                },
            };
            const result = service.aggregateNotifications([notification]);
            (0, vitest_1.expect)(result).toHaveLength(1);
            (0, vitest_1.expect)(result[0].aggregatedCount).toBe(1);
            (0, vitest_1.expect)(result[0].actors).toBeUndefined();
        });
        (0, vitest_1.it)('should aggregate notifications of same type and content within 1 hour', () => {
            const baseTime = new Date('2024-01-01T10:00:00Z');
            const notifications = [
                {
                    id: 'notif-1',
                    type: client_1.NotificationType.REPLY,
                    recipientId: 'user-1',
                    actorId: 'user-2',
                    contentId: 'post-1',
                    contentType: client_1.ContentType.POST,
                    metadata: {},
                    isRead: false,
                    isDeleted: false,
                    createdAt: baseTime,
                    updatedAt: baseTime,
                    readAt: null,
                    deletedAt: null,
                    actor: {
                        id: 'user-2',
                        username: 'actor1',
                        avatar: null,
                        role: 'PATIENT',
                    },
                },
                {
                    id: 'notif-2',
                    type: client_1.NotificationType.REPLY,
                    recipientId: 'user-1',
                    actorId: 'user-3',
                    contentId: 'post-1',
                    contentType: client_1.ContentType.POST,
                    metadata: {},
                    isRead: false,
                    isDeleted: false,
                    createdAt: new Date(baseTime.getTime() + 30 * 60 * 1000), // 30 minutes later
                    updatedAt: baseTime,
                    readAt: null,
                    deletedAt: null,
                    actor: {
                        id: 'user-3',
                        username: 'actor2',
                        avatar: null,
                        role: 'PATIENT',
                    },
                },
            ];
            const result = service.aggregateNotifications(notifications);
            (0, vitest_1.expect)(result).toHaveLength(1);
            (0, vitest_1.expect)(result[0].aggregatedCount).toBe(2);
            (0, vitest_1.expect)(result[0].actors).toHaveLength(2);
            (0, vitest_1.expect)(result[0].aggregatedIds).toEqual(['notif-1', 'notif-2']);
        });
        (0, vitest_1.it)('should not aggregate notifications beyond 1 hour window', () => {
            const baseTime = new Date('2024-01-01T10:00:00Z');
            const notifications = [
                {
                    id: 'notif-1',
                    type: client_1.NotificationType.REPLY,
                    recipientId: 'user-1',
                    actorId: 'user-2',
                    contentId: 'post-1',
                    contentType: client_1.ContentType.POST,
                    metadata: {},
                    isRead: false,
                    isDeleted: false,
                    createdAt: baseTime,
                    updatedAt: baseTime,
                    readAt: null,
                    deletedAt: null,
                    actor: {
                        id: 'user-2',
                        username: 'actor1',
                        avatar: null,
                        role: 'PATIENT',
                    },
                },
                {
                    id: 'notif-2',
                    type: client_1.NotificationType.REPLY,
                    recipientId: 'user-1',
                    actorId: 'user-3',
                    contentId: 'post-1',
                    contentType: client_1.ContentType.POST,
                    metadata: {},
                    isRead: false,
                    isDeleted: false,
                    createdAt: new Date(baseTime.getTime() + 90 * 60 * 1000), // 90 minutes later
                    updatedAt: baseTime,
                    readAt: null,
                    deletedAt: null,
                    actor: {
                        id: 'user-3',
                        username: 'actor2',
                        avatar: null,
                        role: 'PATIENT',
                    },
                },
            ];
            const result = service.aggregateNotifications(notifications);
            (0, vitest_1.expect)(result).toHaveLength(2);
            (0, vitest_1.expect)(result[0].aggregatedCount).toBe(1);
            (0, vitest_1.expect)(result[1].aggregatedCount).toBe(1);
        });
        (0, vitest_1.it)('should not aggregate notifications of different types', () => {
            const baseTime = new Date('2024-01-01T10:00:00Z');
            const notifications = [
                {
                    id: 'notif-1',
                    type: client_1.NotificationType.REPLY,
                    recipientId: 'user-1',
                    actorId: 'user-2',
                    contentId: 'post-1',
                    contentType: client_1.ContentType.POST,
                    metadata: {},
                    isRead: false,
                    isDeleted: false,
                    createdAt: baseTime,
                    updatedAt: baseTime,
                    readAt: null,
                    deletedAt: null,
                    actor: {
                        id: 'user-2',
                        username: 'actor1',
                        avatar: null,
                        role: 'PATIENT',
                    },
                },
                {
                    id: 'notif-2',
                    type: client_1.NotificationType.MENTION,
                    recipientId: 'user-1',
                    actorId: 'user-3',
                    contentId: 'post-1',
                    contentType: client_1.ContentType.POST,
                    metadata: {},
                    isRead: false,
                    isDeleted: false,
                    createdAt: baseTime,
                    updatedAt: baseTime,
                    readAt: null,
                    deletedAt: null,
                    actor: {
                        id: 'user-3',
                        username: 'actor2',
                        avatar: null,
                        role: 'PATIENT',
                    },
                },
            ];
            const result = service.aggregateNotifications(notifications);
            (0, vitest_1.expect)(result).toHaveLength(2);
            (0, vitest_1.expect)(result[0].aggregatedCount).toBe(1);
            (0, vitest_1.expect)(result[1].aggregatedCount).toBe(1);
        });
        (0, vitest_1.it)('should not aggregate notifications with different contentIds', () => {
            const baseTime = new Date('2024-01-01T10:00:00Z');
            const notifications = [
                {
                    id: 'notif-1',
                    type: client_1.NotificationType.REPLY,
                    recipientId: 'user-1',
                    actorId: 'user-2',
                    contentId: 'post-1',
                    contentType: client_1.ContentType.POST,
                    metadata: {},
                    isRead: false,
                    isDeleted: false,
                    createdAt: baseTime,
                    updatedAt: baseTime,
                    readAt: null,
                    deletedAt: null,
                    actor: {
                        id: 'user-2',
                        username: 'actor1',
                        avatar: null,
                        role: 'PATIENT',
                    },
                },
                {
                    id: 'notif-2',
                    type: client_1.NotificationType.REPLY,
                    recipientId: 'user-1',
                    actorId: 'user-3',
                    contentId: 'post-2',
                    contentType: client_1.ContentType.POST,
                    metadata: {},
                    isRead: false,
                    isDeleted: false,
                    createdAt: baseTime,
                    updatedAt: baseTime,
                    readAt: null,
                    deletedAt: null,
                    actor: {
                        id: 'user-3',
                        username: 'actor2',
                        avatar: null,
                        role: 'PATIENT',
                    },
                },
            ];
            const result = service.aggregateNotifications(notifications);
            (0, vitest_1.expect)(result).toHaveLength(2);
            (0, vitest_1.expect)(result[0].aggregatedCount).toBe(1);
            (0, vitest_1.expect)(result[1].aggregatedCount).toBe(1);
        });
        (0, vitest_1.it)('should limit actors to 50 maximum', () => {
            const baseTime = new Date('2024-01-01T10:00:00Z');
            // Create 60 notifications from different actors
            const notifications = Array.from({ length: 60 }, (_, i) => ({
                id: `notif-${i + 1}`,
                type: client_1.NotificationType.REPLY,
                recipientId: 'user-1',
                actorId: `user-${i + 2}`,
                contentId: 'post-1',
                contentType: client_1.ContentType.POST,
                metadata: {},
                isRead: false,
                isDeleted: false,
                createdAt: new Date(baseTime.getTime() + i * 1000), // 1 second apart
                updatedAt: baseTime,
                readAt: null,
                deletedAt: null,
                actor: {
                    id: `user-${i + 2}`,
                    username: `actor${i + 1}`,
                    avatar: null,
                    role: 'PATIENT',
                },
            }));
            const result = service.aggregateNotifications(notifications);
            (0, vitest_1.expect)(result).toHaveLength(1);
            (0, vitest_1.expect)(result[0].aggregatedCount).toBe(60);
            (0, vitest_1.expect)(result[0].actors).toHaveLength(50); // Limited to 50
            (0, vitest_1.expect)(result[0].aggregatedIds).toHaveLength(60); // All IDs included
        });
        (0, vitest_1.it)('should return empty array for empty input', () => {
            const result = service.aggregateNotifications([]);
            (0, vitest_1.expect)(result).toEqual([]);
        });
        (0, vitest_1.it)('should sort aggregated notifications by creation time (most recent first)', () => {
            const baseTime = new Date('2024-01-01T10:00:00Z');
            const notifications = [
                {
                    id: 'notif-1',
                    type: client_1.NotificationType.REPLY,
                    recipientId: 'user-1',
                    actorId: 'user-2',
                    contentId: 'post-1',
                    contentType: client_1.ContentType.POST,
                    metadata: {},
                    isRead: false,
                    isDeleted: false,
                    createdAt: baseTime,
                    updatedAt: baseTime,
                    readAt: null,
                    deletedAt: null,
                    actor: {
                        id: 'user-2',
                        username: 'actor1',
                        avatar: null,
                        role: 'PATIENT',
                    },
                },
                {
                    id: 'notif-2',
                    type: client_1.NotificationType.MENTION,
                    recipientId: 'user-1',
                    actorId: 'user-3',
                    contentId: 'post-2',
                    contentType: client_1.ContentType.POST,
                    metadata: {},
                    isRead: false,
                    isDeleted: false,
                    createdAt: new Date(baseTime.getTime() + 60 * 60 * 1000), // 1 hour later
                    updatedAt: baseTime,
                    readAt: null,
                    deletedAt: null,
                    actor: {
                        id: 'user-3',
                        username: 'actor2',
                        avatar: null,
                        role: 'PATIENT',
                    },
                },
            ];
            const result = service.aggregateNotifications(notifications);
            (0, vitest_1.expect)(result).toHaveLength(2);
            (0, vitest_1.expect)(result[0].id).toBe('notif-2'); // Most recent first
            (0, vitest_1.expect)(result[1].id).toBe('notif-1');
        });
    });
});
