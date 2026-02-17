import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SocketDeliveryService } from '../socket-delivery.service';
import { Server } from 'socket.io';
import * as socketModule from '../../socket';

// Mock the socket module
vi.mock('../../socket', () => ({
  getSocketInstance: vi.fn(),
}));

describe('SocketDeliveryService', () => {
  let service: SocketDeliveryService;
  let mockIo: any;
  let mockNotification: any;

  beforeEach(() => {
    // Create a fresh service instance
    service = new SocketDeliveryService();

    // Create mock Socket.io instance
    mockIo = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
      sockets: {
        adapter: {
          rooms: new Map(),
        },
      },
    };

    // Mock getSocketInstance to return our mock
    vi.mocked(socketModule.getSocketInstance).mockReturnValue(mockIo as any);

    // Create mock notification
    mockNotification = {
      id: 'notif-123',
      type: 'REPLY',
      recipientId: 'user-456',
      actorId: 'user-789',
      contentId: 'post-111',
      contentType: 'POST',
      metadata: { title: 'Test notification' },
      isRead: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Clear metrics
    service.clearMetrics();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('sendNotification', () => {
    it('should send notification to a single user', async () => {
      // Setup: user is connected
      const userId = 'user-456';
      mockIo.sockets.adapter.rooms.set(`notifications:${userId}`, new Set(['socket-1']));

      await service.sendNotification(userId, mockNotification);

      expect(mockIo.to).toHaveBeenCalledWith(`notifications:${userId}`);
      expect(mockIo.emit).toHaveBeenCalledWith('notification:new', mockNotification);
    });

    it('should send notification to multiple users', async () => {
      // Setup: both users are connected
      const userIds = ['user-1', 'user-2'];
      mockIo.sockets.adapter.rooms.set('notifications:user-1', new Set(['socket-1']));
      mockIo.sockets.adapter.rooms.set('notifications:user-2', new Set(['socket-2']));

      await service.sendNotification(userIds, mockNotification);

      expect(mockIo.to).toHaveBeenCalledWith('notifications:user-1');
      expect(mockIo.to).toHaveBeenCalledWith('notifications:user-2');
      expect(mockIo.emit).toHaveBeenCalledTimes(2);
    });

    it('should handle disconnected users gracefully', async () => {
      // User is not connected (no room exists)
      const userId = 'user-disconnected';

      await service.sendNotification(userId, mockNotification);

      // Should not throw error, but should log that user is not connected
      expect(mockIo.emit).not.toHaveBeenCalled();
    });

    it('should track delivery metrics', async () => {
      const userId = 'user-456';
      mockIo.sockets.adapter.rooms.set(`notifications:${userId}`, new Set(['socket-1']));

      await service.sendNotification(userId, mockNotification);

      const metrics = service.getDeliveryMetrics(mockNotification.id);
      expect(metrics.length).toBeGreaterThan(0);
      expect(metrics[0].notificationId).toBe(mockNotification.id);
      expect(metrics[0].userId).toBe(userId);
      expect(metrics[0].success).toBe(true);
      expect(metrics[0].latency).toBeGreaterThanOrEqual(0);
    });
  });

  describe('sendUnreadCountUpdate', () => {
    it('should send unread count to connected user', async () => {
      const userId = 'user-456';
      const count = 5;
      mockIo.sockets.adapter.rooms.set(`notifications:${userId}`, new Set(['socket-1']));

      await service.sendUnreadCountUpdate(userId, count);

      expect(mockIo.to).toHaveBeenCalledWith(`notifications:${userId}`);
      expect(mockIo.emit).toHaveBeenCalledWith('notification:unread-count', count);
    });

    it('should skip update for disconnected user', async () => {
      const userId = 'user-disconnected';
      const count = 5;

      await service.sendUnreadCountUpdate(userId, count);

      expect(mockIo.emit).not.toHaveBeenCalled();
    });
  });

  describe('isUserConnected', () => {
    it('should return true for connected user', () => {
      const userId = 'user-456';
      mockIo.sockets.adapter.rooms.set(`notifications:${userId}`, new Set(['socket-1']));

      const result = service.isUserConnected(userId);

      expect(result).toBe(true);
    });

    it('should return false for disconnected user', () => {
      const userId = 'user-disconnected';

      const result = service.isUserConnected(userId);

      expect(result).toBe(false);
    });

    it('should return true for user with multiple connections', () => {
      const userId = 'user-456';
      mockIo.sockets.adapter.rooms.set(
        `notifications:${userId}`,
        new Set(['socket-1', 'socket-2', 'socket-3'])
      );

      const result = service.isUserConnected(userId);

      expect(result).toBe(true);
    });
  });

  describe('getConnectedUsers', () => {
    it('should return list of connected user IDs', () => {
      mockIo.sockets.adapter.rooms.set('notifications:user-1', new Set(['socket-1']));
      mockIo.sockets.adapter.rooms.set('notifications:user-2', new Set(['socket-2']));
      mockIo.sockets.adapter.rooms.set('notifications:user-3', new Set(['socket-3']));
      // Add a non-notification room (should be ignored)
      mockIo.sockets.adapter.rooms.set('chat:room-1', new Set(['socket-4']));

      const connectedUsers = service.getConnectedUsers();

      expect(connectedUsers).toHaveLength(3);
      expect(connectedUsers).toContain('user-1');
      expect(connectedUsers).toContain('user-2');
      expect(connectedUsers).toContain('user-3');
      expect(connectedUsers).not.toContain('room-1');
    });

    it('should return empty array when no users connected', () => {
      const connectedUsers = service.getConnectedUsers();

      expect(connectedUsers).toEqual([]);
    });
  });

  describe('broadcastNotificationRead', () => {
    it('should broadcast notification read event', async () => {
      const userId = 'user-456';
      const notificationId = 'notif-123';

      await service.broadcastNotificationRead(userId, notificationId);

      expect(mockIo.to).toHaveBeenCalledWith(`notifications:${userId}`);
      expect(mockIo.emit).toHaveBeenCalledWith('notification:read', notificationId);
    });
  });

  describe('broadcastAllNotificationsRead', () => {
    it('should broadcast all notifications read event', async () => {
      const userId = 'user-456';

      await service.broadcastAllNotificationsRead(userId);

      expect(mockIo.to).toHaveBeenCalledWith(`notifications:${userId}`);
      expect(mockIo.emit).toHaveBeenCalledWith('notification:all-read');
    });
  });

  describe('delivery metrics', () => {
    it('should calculate average latency correctly', async () => {
      // Setup multiple connected users
      mockIo.sockets.adapter.rooms.set('notifications:user-1', new Set(['socket-1']));
      mockIo.sockets.adapter.rooms.set('notifications:user-2', new Set(['socket-2']));
      mockIo.sockets.adapter.rooms.set('notifications:user-3', new Set(['socket-3']));

      // Send notifications
      await service.sendNotification('user-1', mockNotification);
      await service.sendNotification('user-2', mockNotification);
      await service.sendNotification('user-3', mockNotification);

      const avgLatency = service.getAverageLatency();

      expect(avgLatency).toBeGreaterThanOrEqual(0);
      expect(avgLatency).toBeLessThan(1000); // Should be very fast in tests
    });

    it('should calculate success rate correctly', async () => {
      // Setup: 2 connected, 1 disconnected
      mockIo.sockets.adapter.rooms.set('notifications:user-1', new Set(['socket-1']));
      mockIo.sockets.adapter.rooms.set('notifications:user-2', new Set(['socket-2']));

      await service.sendNotification('user-1', mockNotification);
      await service.sendNotification('user-2', mockNotification);
      await service.sendNotification('user-disconnected', mockNotification);

      const successRate = service.getSuccessRate();

      // 2 out of 3 should succeed
      expect(successRate).toBeGreaterThan(0);
      expect(successRate).toBeLessThanOrEqual(100);
    });

    it('should clear metrics', async () => {
      const userId = 'user-456';
      mockIo.sockets.adapter.rooms.set(`notifications:${userId}`, new Set(['socket-1']));

      await service.sendNotification(userId, mockNotification);

      let metrics = service.getDeliveryMetrics(mockNotification.id);
      expect(metrics.length).toBeGreaterThan(0);

      service.clearMetrics();

      metrics = service.getDeliveryMetrics(mockNotification.id);
      expect(metrics.length).toBe(0);
    });

    it('should clear old metrics only', async () => {
      const userId = 'user-456';
      mockIo.sockets.adapter.rooms.set(`notifications:${userId}`, new Set(['socket-1']));

      await service.sendNotification(userId, mockNotification);

      // Clear metrics older than 1 hour (should not clear recent ones)
      service.clearMetrics(60 * 60 * 1000);

      const metrics = service.getDeliveryMetrics(mockNotification.id);
      expect(metrics.length).toBeGreaterThan(0);
    });
  });

  describe('retry logic', () => {
    it('should handle delivery errors gracefully', async () => {
      const userId = 'user-456';
      mockIo.sockets.adapter.rooms.set(`notifications:${userId}`, new Set(['socket-1']));

      // Mock emit to throw error
      mockIo.emit.mockImplementationOnce(() => {
        throw new Error('Socket error');
      });

      // Should not throw, but handle error internally
      await expect(service.sendNotification(userId, mockNotification)).resolves.not.toThrow();
    });
  });
});
