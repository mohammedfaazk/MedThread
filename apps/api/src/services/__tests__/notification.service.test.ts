import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NotificationService } from '../notification.service';
import { PreferencesService } from '../notification-preferences.service';
import { prisma } from '@medthread/database';
import { NotificationType, ContentType } from '@prisma/client';

// Mock Prisma
vi.mock('@medthread/database', () => ({
  prisma: {
    notification: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    block: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Mock PreferencesService
vi.mock('../notification-preferences.service', () => ({
  PreferencesService: vi.fn().mockImplementation(() => ({
    isNotificationEnabled: vi.fn().mockResolvedValue(true),
  })),
}));

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    service.clearCache();
  });

  describe('createNotification', () => {
    it('should create notifications for eligible recipients', async () => {
      const mockNotification = {
        id: 'notif-1',
        type: NotificationType.REPLY,
        recipientId: 'user-1',
        actorId: 'user-2',
        contentId: 'post-1',
        contentType: ContentType.POST,
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
          role: 'PATIENT' as any,
        },
        recipient: {
          id: 'user-1',
          username: 'recipient',
        },
      };

      (prisma.block.findMany as any).mockResolvedValue([]);
      (prisma.$transaction as any).mockResolvedValue([mockNotification]);

      const result = await service.createNotification({
        type: NotificationType.REPLY,
        recipientIds: ['user-1'],
        actorId: 'user-2',
        metadata: { title: 'Test' },
        contentId: 'post-1',
        contentType: ContentType.POST,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockNotification);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should filter out blocked users', async () => {
      (prisma.block.findMany as any).mockResolvedValue([
        { blockerId: 'user-1' },
      ]);
      (prisma.$transaction as any).mockResolvedValue([]);

      const result = await service.createNotification({
        type: NotificationType.REPLY,
        recipientIds: ['user-1'],
        actorId: 'user-2',
        metadata: { title: 'Test' },
      });

      expect(result).toHaveLength(0);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      (prisma.block.findMany as any).mockRejectedValue(new Error('DB error'));

      await expect(
        service.createNotification({
          type: NotificationType.REPLY,
          recipientIds: ['user-1'],
          actorId: 'user-2',
          metadata: { title: 'Test' },
        })
      ).rejects.toThrow('Failed to create notification');
    });
  });

  describe('getNotifications', () => {
    it('should fetch notifications with pagination', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: NotificationType.REPLY,
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

      (prisma.notifications.findMany as any).mockResolvedValue(mockNotifications);
      (prisma.notifications.count as any).mockResolvedValue(1);

      const result = await service.getNotifications('user-1', {
        page: 1,
        limit: 20,
      });

      expect(result.notifications).toEqual(mockNotifications);
      expect(result.total).toBe(1);
      expect(result.hasMore).toBe(false);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should filter by notification type', async () => {
      (prisma.notifications.findMany as any).mockResolvedValue([]);
      (prisma.notifications.count as any).mockResolvedValue(0);

      await service.getNotifications('user-1', {
        type: NotificationType.MENTION,
      });

      expect(prisma.notifications.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: NotificationType.MENTION,
          }),
        })
      );
    });

    it('should filter by read status', async () => {
      (prisma.notifications.findMany as any).mockResolvedValue([]);
      (prisma.notifications.count as any).mockResolvedValue(0);

      await service.getNotifications('user-1', {
        isRead: false,
      });

      expect(prisma.notifications.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isRead: false,
          }),
        })
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockNotification = {
        id: 'notif-1',
        recipientId: 'user-1',
        isRead: false,
      };

      (prisma.notifications.findFirst as any).mockResolvedValue(mockNotification);
      (prisma.notifications.update as any).mockResolvedValue({
        ...mockNotification,
        isRead: true,
        readAt: new Date(),
      });

      await service.markAsRead('notif-1', 'user-1');

      expect(prisma.notifications.update).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
        data: {
          isRead: true,
          readAt: expect.any(Date),
        },
      });
    });

    it('should throw error if notification not found', async () => {
      (prisma.notifications.findFirst as any).mockResolvedValue(null);

      await expect(
        service.markAsRead('notif-1', 'user-1')
      ).rejects.toThrow('Notification not found or access denied');
    });

    it('should not update if already read', async () => {
      const mockNotification = {
        id: 'notif-1',
        recipientId: 'user-1',
        isRead: true,
      };

      (prisma.notifications.findFirst as any).mockResolvedValue(mockNotification);

      await service.markAsRead('notif-1', 'user-1');

      expect(prisma.notifications.update).not.toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      (prisma.notifications.updateMany as any).mockResolvedValue({ count: 5 });

      const count = await service.markAllAsRead('user-1');

      expect(count).toBe(5);
      expect(prisma.notifications.updateMany).toHaveBeenCalledWith({
        where: {
          recipientId: 'user-1',
          isRead: false,
          isDeleted: false,
        },
        data: {
          isRead: true,
          readAt: expect.any(Date),
        },
      });
    });
  });

  describe('deleteNotification', () => {
    it('should soft delete notification', async () => {
      const mockNotification = {
        id: 'notif-1',
        recipientId: 'user-1',
        isRead: false,
      };

      (prisma.notifications.findFirst as any).mockResolvedValue(mockNotification);
      (prisma.notifications.update as any).mockResolvedValue({
        ...mockNotification,
        isDeleted: true,
        deletedAt: new Date(),
      });

      await service.deleteNotification('notif-1', 'user-1');

      expect(prisma.notifications.update).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
        data: {
          isDeleted: true,
          deletedAt: expect.any(Date),
        },
      });
    });

    it('should throw error if notification not found', async () => {
      (prisma.notifications.findFirst as any).mockResolvedValue(null);

      await expect(
        service.deleteNotification('notif-1', 'user-1')
      ).rejects.toThrow('Notification not found or access denied');
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count from database', async () => {
      (prisma.notifications.count as any).mockResolvedValue(3);

      const count = await service.getUnreadCount('user-1');

      expect(count).toBe(3);
      expect(prisma.notifications.count).toHaveBeenCalledWith({
        where: {
          recipientId: 'user-1',
          isRead: false,
          isDeleted: false,
        },
      });
    });

    it('should use cached value if available', async () => {
      (prisma.notifications.count as any).mockResolvedValue(3);

      // First call - should hit database
      const count1 = await service.getUnreadCount('user-1');
      expect(count1).toBe(3);
      expect(prisma.notifications.count).toHaveBeenCalledTimes(1);

      // Second call - should use cache
      const count2 = await service.getUnreadCount('user-1');
      expect(count2).toBe(3);
      expect(prisma.notifications.count).toHaveBeenCalledTimes(1);
    });

    it('should invalidate cache after marking as read', async () => {
      const mockNotification = {
        id: 'notif-1',
        recipientId: 'user-1',
        isRead: false,
      };

      (prisma.notifications.count as any).mockResolvedValue(3);
      (prisma.notifications.findFirst as any).mockResolvedValue(mockNotification);
      (prisma.notifications.update as any).mockResolvedValue({
        ...mockNotification,
        isRead: true,
      });

      // Get count - should cache
      await service.getUnreadCount('user-1');
      expect(prisma.notifications.count).toHaveBeenCalledTimes(1);

      // Mark as read - should invalidate cache
      await service.markAsRead('notif-1', 'user-1');

      // Get count again - should hit database
      (prisma.notifications.count as any).mockResolvedValue(2);
      const count = await service.getUnreadCount('user-1');
      expect(count).toBe(2);
      expect(prisma.notifications.count).toHaveBeenCalledTimes(2);
    });
  });

  describe('clearCache', () => {
    it('should clear cache for specific user', async () => {
      (prisma.notifications.count as any).mockResolvedValue(3);

      // Cache the count
      await service.getUnreadCount('user-1');
      expect(prisma.notifications.count).toHaveBeenCalledTimes(1);

      // Clear cache
      service.clearCache('user-1');

      // Should hit database again
      await service.getUnreadCount('user-1');
      expect(prisma.notifications.count).toHaveBeenCalledTimes(2);
    });

    it('should clear all cache when no userId provided', async () => {
      (prisma.notifications.count as any).mockResolvedValue(3);

      // Cache counts for multiple users
      await service.getUnreadCount('user-1');
      await service.getUnreadCount('user-2');
      expect(prisma.notifications.count).toHaveBeenCalledTimes(2);

      // Clear all cache
      service.clearCache();

      // Should hit database again for both
      await service.getUnreadCount('user-1');
      await service.getUnreadCount('user-2');
      expect(prisma.notifications.count).toHaveBeenCalledTimes(4);
    });
  });

  describe('aggregateNotifications', () => {
    it('should return single notification without aggregation', () => {
      const notification = {
        id: 'notif-1',
        type: NotificationType.REPLY,
        recipientId: 'user-1',
        actorId: 'user-2',
        contentId: 'post-1',
        contentType: ContentType.POST,
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

      const result = service.aggregateNotifications([notification as any]);

      expect(result).toHaveLength(1);
      expect(result[0].aggregatedCount).toBe(1);
      expect(result[0].actors).toBeUndefined();
    });

    it('should aggregate notifications of same type and content within 1 hour', () => {
      const baseTime = new Date('2024-01-01T10:00:00Z');
      
      const notifications = [
        {
          id: 'notif-1',
          type: NotificationType.REPLY,
          recipientId: 'user-1',
          actorId: 'user-2',
          contentId: 'post-1',
          contentType: ContentType.POST,
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
          type: NotificationType.REPLY,
          recipientId: 'user-1',
          actorId: 'user-3',
          contentId: 'post-1',
          contentType: ContentType.POST,
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

      const result = service.aggregateNotifications(notifications as any);

      expect(result).toHaveLength(1);
      expect(result[0].aggregatedCount).toBe(2);
      expect(result[0].actors).toHaveLength(2);
      expect(result[0].aggregatedIds).toEqual(['notif-1', 'notif-2']);
    });

    it('should not aggregate notifications beyond 1 hour window', () => {
      const baseTime = new Date('2024-01-01T10:00:00Z');
      
      const notifications = [
        {
          id: 'notif-1',
          type: NotificationType.REPLY,
          recipientId: 'user-1',
          actorId: 'user-2',
          contentId: 'post-1',
          contentType: ContentType.POST,
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
          type: NotificationType.REPLY,
          recipientId: 'user-1',
          actorId: 'user-3',
          contentId: 'post-1',
          contentType: ContentType.POST,
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

      const result = service.aggregateNotifications(notifications as any);

      expect(result).toHaveLength(2);
      expect(result[0].aggregatedCount).toBe(1);
      expect(result[1].aggregatedCount).toBe(1);
    });

    it('should not aggregate notifications of different types', () => {
      const baseTime = new Date('2024-01-01T10:00:00Z');
      
      const notifications = [
        {
          id: 'notif-1',
          type: NotificationType.REPLY,
          recipientId: 'user-1',
          actorId: 'user-2',
          contentId: 'post-1',
          contentType: ContentType.POST,
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
          type: NotificationType.MENTION,
          recipientId: 'user-1',
          actorId: 'user-3',
          contentId: 'post-1',
          contentType: ContentType.POST,
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

      const result = service.aggregateNotifications(notifications as any);

      expect(result).toHaveLength(2);
      expect(result[0].aggregatedCount).toBe(1);
      expect(result[1].aggregatedCount).toBe(1);
    });

    it('should not aggregate notifications with different contentIds', () => {
      const baseTime = new Date('2024-01-01T10:00:00Z');
      
      const notifications = [
        {
          id: 'notif-1',
          type: NotificationType.REPLY,
          recipientId: 'user-1',
          actorId: 'user-2',
          contentId: 'post-1',
          contentType: ContentType.POST,
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
          type: NotificationType.REPLY,
          recipientId: 'user-1',
          actorId: 'user-3',
          contentId: 'post-2',
          contentType: ContentType.POST,
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

      const result = service.aggregateNotifications(notifications as any);

      expect(result).toHaveLength(2);
      expect(result[0].aggregatedCount).toBe(1);
      expect(result[1].aggregatedCount).toBe(1);
    });

    it('should limit actors to 50 maximum', () => {
      const baseTime = new Date('2024-01-01T10:00:00Z');
      
      // Create 60 notifications from different actors
      const notifications = Array.from({ length: 60 }, (_, i) => ({
        id: `notif-${i + 1}`,
        type: NotificationType.REPLY,
        recipientId: 'user-1',
        actorId: `user-${i + 2}`,
        contentId: 'post-1',
        contentType: ContentType.POST,
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

      const result = service.aggregateNotifications(notifications as any);

      expect(result).toHaveLength(1);
      expect(result[0].aggregatedCount).toBe(60);
      expect(result[0].actors).toHaveLength(50); // Limited to 50
      expect(result[0].aggregatedIds).toHaveLength(60); // All IDs included
    });

    it('should return empty array for empty input', () => {
      const result = service.aggregateNotifications([]);
      expect(result).toEqual([]);
    });

    it('should sort aggregated notifications by creation time (most recent first)', () => {
      const baseTime = new Date('2024-01-01T10:00:00Z');
      
      const notifications = [
        {
          id: 'notif-1',
          type: NotificationType.REPLY,
          recipientId: 'user-1',
          actorId: 'user-2',
          contentId: 'post-1',
          contentType: ContentType.POST,
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
          type: NotificationType.MENTION,
          recipientId: 'user-1',
          actorId: 'user-3',
          contentId: 'post-2',
          contentType: ContentType.POST,
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

      const result = service.aggregateNotifications(notifications as any);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('notif-2'); // Most recent first
      expect(result[1].id).toBe('notif-1');
    });
  });
});

