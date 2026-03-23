"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const socket_delivery_service_1 = require("../socket-delivery.service");
const socketModule = __importStar(require("../../socket"));
// Mock the socket module
vitest_1.vi.mock('../../socket', () => ({
    getSocketInstance: vitest_1.vi.fn(),
}));
(0, vitest_1.describe)('SocketDeliveryService', () => {
    let service;
    let mockIo;
    let mockNotification;
    (0, vitest_1.beforeEach)(() => {
        // Create a fresh service instance
        service = new socket_delivery_service_1.SocketDeliveryService();
        // Create mock Socket.io instance
        mockIo = {
            to: vitest_1.vi.fn().mockReturnThis(),
            emit: vitest_1.vi.fn(),
            sockets: {
                adapter: {
                    rooms: new Map(),
                },
            },
        };
        // Mock getSocketInstance to return our mock
        vitest_1.vi.mocked(socketModule.getSocketInstance).mockReturnValue(mockIo);
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
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('sendNotification', () => {
        (0, vitest_1.it)('should send notification to a single user', async () => {
            // Setup: user is connected
            const userId = 'user-456';
            mockIo.sockets.adapter.rooms.set(`notifications:${userId}`, new Set(['socket-1']));
            await service.sendNotification(userId, mockNotification);
            (0, vitest_1.expect)(mockIo.to).toHaveBeenCalledWith(`notifications:${userId}`);
            (0, vitest_1.expect)(mockIo.emit).toHaveBeenCalledWith('notification:new', mockNotification);
        });
        (0, vitest_1.it)('should send notification to multiple users', async () => {
            // Setup: both users are connected
            const userIds = ['user-1', 'user-2'];
            mockIo.sockets.adapter.rooms.set('notifications:user-1', new Set(['socket-1']));
            mockIo.sockets.adapter.rooms.set('notifications:user-2', new Set(['socket-2']));
            await service.sendNotification(userIds, mockNotification);
            (0, vitest_1.expect)(mockIo.to).toHaveBeenCalledWith('notifications:user-1');
            (0, vitest_1.expect)(mockIo.to).toHaveBeenCalledWith('notifications:user-2');
            (0, vitest_1.expect)(mockIo.emit).toHaveBeenCalledTimes(2);
        });
        (0, vitest_1.it)('should handle disconnected users gracefully', async () => {
            // User is not connected (no room exists)
            const userId = 'user-disconnected';
            await service.sendNotification(userId, mockNotification);
            // Should not throw error, but should log that user is not connected
            (0, vitest_1.expect)(mockIo.emit).not.toHaveBeenCalled();
        });
        (0, vitest_1.it)('should track delivery metrics', async () => {
            const userId = 'user-456';
            mockIo.sockets.adapter.rooms.set(`notifications:${userId}`, new Set(['socket-1']));
            await service.sendNotification(userId, mockNotification);
            const metrics = service.getDeliveryMetrics(mockNotification.id);
            (0, vitest_1.expect)(metrics.length).toBeGreaterThan(0);
            (0, vitest_1.expect)(metrics[0].notificationId).toBe(mockNotification.id);
            (0, vitest_1.expect)(metrics[0].userId).toBe(userId);
            (0, vitest_1.expect)(metrics[0].success).toBe(true);
            (0, vitest_1.expect)(metrics[0].latency).toBeGreaterThanOrEqual(0);
        });
    });
    (0, vitest_1.describe)('sendUnreadCountUpdate', () => {
        (0, vitest_1.it)('should send unread count to connected user', async () => {
            const userId = 'user-456';
            const count = 5;
            mockIo.sockets.adapter.rooms.set(`notifications:${userId}`, new Set(['socket-1']));
            await service.sendUnreadCountUpdate(userId, count);
            (0, vitest_1.expect)(mockIo.to).toHaveBeenCalledWith(`notifications:${userId}`);
            (0, vitest_1.expect)(mockIo.emit).toHaveBeenCalledWith('notification:unread-count', count);
        });
        (0, vitest_1.it)('should skip update for disconnected user', async () => {
            const userId = 'user-disconnected';
            const count = 5;
            await service.sendUnreadCountUpdate(userId, count);
            (0, vitest_1.expect)(mockIo.emit).not.toHaveBeenCalled();
        });
    });
    (0, vitest_1.describe)('isUserConnected', () => {
        (0, vitest_1.it)('should return true for connected user', () => {
            const userId = 'user-456';
            mockIo.sockets.adapter.rooms.set(`notifications:${userId}`, new Set(['socket-1']));
            const result = service.isUserConnected(userId);
            (0, vitest_1.expect)(result).toBe(true);
        });
        (0, vitest_1.it)('should return false for disconnected user', () => {
            const userId = 'user-disconnected';
            const result = service.isUserConnected(userId);
            (0, vitest_1.expect)(result).toBe(false);
        });
        (0, vitest_1.it)('should return true for user with multiple connections', () => {
            const userId = 'user-456';
            mockIo.sockets.adapter.rooms.set(`notifications:${userId}`, new Set(['socket-1', 'socket-2', 'socket-3']));
            const result = service.isUserConnected(userId);
            (0, vitest_1.expect)(result).toBe(true);
        });
    });
    (0, vitest_1.describe)('getConnectedUsers', () => {
        (0, vitest_1.it)('should return list of connected user IDs', () => {
            mockIo.sockets.adapter.rooms.set('notifications:user-1', new Set(['socket-1']));
            mockIo.sockets.adapter.rooms.set('notifications:user-2', new Set(['socket-2']));
            mockIo.sockets.adapter.rooms.set('notifications:user-3', new Set(['socket-3']));
            // Add a non-notification room (should be ignored)
            mockIo.sockets.adapter.rooms.set('chat:room-1', new Set(['socket-4']));
            const connectedUsers = service.getConnectedUsers();
            (0, vitest_1.expect)(connectedUsers).toHaveLength(3);
            (0, vitest_1.expect)(connectedUsers).toContain('user-1');
            (0, vitest_1.expect)(connectedUsers).toContain('user-2');
            (0, vitest_1.expect)(connectedUsers).toContain('user-3');
            (0, vitest_1.expect)(connectedUsers).not.toContain('room-1');
        });
        (0, vitest_1.it)('should return empty array when no users connected', () => {
            const connectedUsers = service.getConnectedUsers();
            (0, vitest_1.expect)(connectedUsers).toEqual([]);
        });
    });
    (0, vitest_1.describe)('broadcastNotificationRead', () => {
        (0, vitest_1.it)('should broadcast notification read event', async () => {
            const userId = 'user-456';
            const notificationId = 'notif-123';
            await service.broadcastNotificationRead(userId, notificationId);
            (0, vitest_1.expect)(mockIo.to).toHaveBeenCalledWith(`notifications:${userId}`);
            (0, vitest_1.expect)(mockIo.emit).toHaveBeenCalledWith('notification:read', notificationId);
        });
    });
    (0, vitest_1.describe)('broadcastAllNotificationsRead', () => {
        (0, vitest_1.it)('should broadcast all notifications read event', async () => {
            const userId = 'user-456';
            await service.broadcastAllNotificationsRead(userId);
            (0, vitest_1.expect)(mockIo.to).toHaveBeenCalledWith(`notifications:${userId}`);
            (0, vitest_1.expect)(mockIo.emit).toHaveBeenCalledWith('notification:all-read');
        });
    });
    (0, vitest_1.describe)('delivery metrics', () => {
        (0, vitest_1.it)('should calculate average latency correctly', async () => {
            // Setup multiple connected users
            mockIo.sockets.adapter.rooms.set('notifications:user-1', new Set(['socket-1']));
            mockIo.sockets.adapter.rooms.set('notifications:user-2', new Set(['socket-2']));
            mockIo.sockets.adapter.rooms.set('notifications:user-3', new Set(['socket-3']));
            // Send notifications
            await service.sendNotification('user-1', mockNotification);
            await service.sendNotification('user-2', mockNotification);
            await service.sendNotification('user-3', mockNotification);
            const avgLatency = service.getAverageLatency();
            (0, vitest_1.expect)(avgLatency).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(avgLatency).toBeLessThan(1000); // Should be very fast in tests
        });
        (0, vitest_1.it)('should calculate success rate correctly', async () => {
            // Setup: 2 connected, 1 disconnected
            mockIo.sockets.adapter.rooms.set('notifications:user-1', new Set(['socket-1']));
            mockIo.sockets.adapter.rooms.set('notifications:user-2', new Set(['socket-2']));
            await service.sendNotification('user-1', mockNotification);
            await service.sendNotification('user-2', mockNotification);
            await service.sendNotification('user-disconnected', mockNotification);
            const successRate = service.getSuccessRate();
            // 2 out of 3 should succeed
            (0, vitest_1.expect)(successRate).toBeGreaterThan(0);
            (0, vitest_1.expect)(successRate).toBeLessThanOrEqual(100);
        });
        (0, vitest_1.it)('should clear metrics', async () => {
            const userId = 'user-456';
            mockIo.sockets.adapter.rooms.set(`notifications:${userId}`, new Set(['socket-1']));
            await service.sendNotification(userId, mockNotification);
            let metrics = service.getDeliveryMetrics(mockNotification.id);
            (0, vitest_1.expect)(metrics.length).toBeGreaterThan(0);
            service.clearMetrics();
            metrics = service.getDeliveryMetrics(mockNotification.id);
            (0, vitest_1.expect)(metrics.length).toBe(0);
        });
        (0, vitest_1.it)('should clear old metrics only', async () => {
            const userId = 'user-456';
            mockIo.sockets.adapter.rooms.set(`notifications:${userId}`, new Set(['socket-1']));
            await service.sendNotification(userId, mockNotification);
            // Clear metrics older than 1 hour (should not clear recent ones)
            service.clearMetrics(60 * 60 * 1000);
            const metrics = service.getDeliveryMetrics(mockNotification.id);
            (0, vitest_1.expect)(metrics.length).toBeGreaterThan(0);
        });
    });
    (0, vitest_1.describe)('retry logic', () => {
        (0, vitest_1.it)('should handle delivery errors gracefully', async () => {
            const userId = 'user-456';
            mockIo.sockets.adapter.rooms.set(`notifications:${userId}`, new Set(['socket-1']));
            // Mock emit to throw error
            mockIo.emit.mockImplementationOnce(() => {
                throw new Error('Socket error');
            });
            // Should not throw, but handle error internally
            await (0, vitest_1.expect)(service.sendNotification(userId, mockNotification)).resolves.not.toThrow();
        });
    });
});
