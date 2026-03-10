"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketDeliveryService = exports.SocketDeliveryService = void 0;
const socket_1 = require("../socket");
/**
 * Socket Delivery Service
 * Handles real-time notification delivery via Socket.io
 * Implements retry logic and latency tracking
 */
class SocketDeliveryService {
    constructor() {
        this.io = null;
        this.MAX_RETRIES = 3;
        this.RETRY_DELAY_MS = 1000; // 1 second base delay
        this.DELIVERY_TIMEOUT_MS = 5000; // 5 seconds timeout
        this.deliveryMetrics = new Map();
    }
    /**
     * Initialize the service with Socket.io instance
     */
    getSocketIO() {
        if (!this.io) {
            this.io = (0, socket_1.getSocketInstance)();
        }
        return this.io;
    }
    /**
     * Send notification to user(s) via socket with retry logic
     * @param userIds - Array of user IDs to send notification to
     * @param notification - Notification object to send
     * @returns Promise that resolves when delivery is complete
     */
    async sendNotification(userIds, notification) {
        const recipients = Array.isArray(userIds) ? userIds : [userIds];
        const io = this.getSocketIO();
        const deliveryPromises = recipients.map((userId) => this.deliverToUser(io, userId, notification));
        await Promise.allSettled(deliveryPromises);
    }
    /**
     * Deliver notification to a single user with retry logic
     */
    async deliverToUser(io, userId, notification, retryCount = 0) {
        const metricId = `${notification.id}-${userId}-${Date.now()}`;
        const startTime = Date.now();
        // Initialize metrics
        this.deliveryMetrics.set(metricId, {
            notificationId: notification.id,
            userId,
            startTime,
            success: false,
            retryCount,
        });
        try {
            // Check if user is connected
            if (!this.isUserConnected(userId)) {
                console.log(`User ${userId} not connected, notification ${notification.id} will be queued for later delivery`);
                // Update metrics
                const endTime = Date.now();
                this.updateMetrics(metricId, {
                    endTime,
                    latency: endTime - startTime,
                    success: false,
                    error: 'User not connected',
                });
                return;
            }
            // Send notification to user's room
            const roomName = `notifications:${userId}`;
            // Create a promise that resolves when delivery is confirmed or times out
            await Promise.race([
                this.emitNotification(io, roomName, notification),
                this.createTimeout(this.DELIVERY_TIMEOUT_MS),
            ]);
            // Update metrics on success
            const endTime = Date.now();
            this.updateMetrics(metricId, {
                endTime,
                latency: endTime - startTime,
                success: true,
            });
            console.log(`Notification ${notification.id} delivered to user ${userId} (latency: ${endTime - startTime}ms)`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`Failed to deliver notification ${notification.id} to user ${userId} (attempt ${retryCount + 1}):`, errorMessage);
            // Retry logic
            if (retryCount < this.MAX_RETRIES) {
                const delay = this.calculateRetryDelay(retryCount);
                console.log(`Retrying delivery in ${delay}ms...`);
                await this.sleep(delay);
                return this.deliverToUser(io, userId, notification, retryCount + 1);
            }
            // Max retries reached, update metrics
            const endTime = Date.now();
            this.updateMetrics(metricId, {
                endTime,
                latency: endTime - startTime,
                success: false,
                error: errorMessage,
            });
            console.error(`Failed to deliver notification ${notification.id} to user ${userId} after ${this.MAX_RETRIES} retries`);
        }
    }
    /**
     * Emit notification to socket room
     */
    async emitNotification(io, roomName, notification) {
        return new Promise((resolve, reject) => {
            try {
                io.to(roomName).emit('notification:new', notification);
                resolve();
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Send unread count update to user
     * @param userId - User ID to send update to
     * @param count - New unread count
     */
    async sendUnreadCountUpdate(userId, count) {
        try {
            const io = this.getSocketIO();
            const roomName = `notifications:${userId}`;
            if (!this.isUserConnected(userId)) {
                console.log(`User ${userId} not connected, skipping unread count update`);
                return;
            }
            io.to(roomName).emit('notification:unread-count', count);
            console.log(`Sent unread count (${count}) to user ${userId}`);
        }
        catch (error) {
            console.error(`Error sending unread count update to user ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Check if user is currently connected to socket
     * @param userId - User ID to check
     * @returns true if user has at least one active socket connection
     */
    isUserConnected(userId) {
        try {
            const io = this.getSocketIO();
            const roomName = `notifications:${userId}`;
            // Get all sockets in the user's notification room
            const sockets = io.sockets.adapter.rooms.get(roomName);
            return sockets !== undefined && sockets.size > 0;
        }
        catch (error) {
            console.error(`Error checking user connection status for ${userId}:`, error);
            return false;
        }
    }
    /**
     * Get all currently connected user IDs
     * @returns Array of user IDs that have active socket connections
     */
    getConnectedUsers() {
        try {
            const io = this.getSocketIO();
            const connectedUsers = [];
            // Iterate through all rooms to find notification rooms
            io.sockets.adapter.rooms.forEach((sockets, roomName) => {
                if (roomName.startsWith('notifications:')) {
                    const userId = roomName.replace('notifications:', '');
                    if (sockets.size > 0) {
                        connectedUsers.push(userId);
                    }
                }
            });
            return connectedUsers;
        }
        catch (error) {
            console.error('Error getting connected users:', error);
            return [];
        }
    }
    /**
     * Broadcast notification read event to all user's connected clients
     * @param userId - User ID to broadcast to
     * @param notificationId - Notification ID that was read
     */
    async broadcastNotificationRead(userId, notificationId) {
        try {
            const io = this.getSocketIO();
            const roomName = `notifications:${userId}`;
            io.to(roomName).emit('notification:read', notificationId);
            console.log(`Broadcast notification read (${notificationId}) to user ${userId}`);
        }
        catch (error) {
            console.error(`Error broadcasting notification read for user ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Broadcast all notifications read event to user's connected clients
     * @param userId - User ID to broadcast to
     */
    async broadcastAllNotificationsRead(userId) {
        try {
            const io = this.getSocketIO();
            const roomName = `notifications:${userId}`;
            io.to(roomName).emit('notification:all-read');
            console.log(`Broadcast all notifications read to user ${userId}`);
        }
        catch (error) {
            console.error(`Error broadcasting all notifications read for user ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Get delivery metrics for a specific notification
     * @param notificationId - Notification ID to get metrics for
     * @returns Array of delivery metrics for the notification
     */
    getDeliveryMetrics(notificationId) {
        const metrics = [];
        this.deliveryMetrics.forEach((metric) => {
            if (metric.notificationId === notificationId) {
                metrics.push(metric);
            }
        });
        return metrics;
    }
    /**
     * Get average delivery latency across all deliveries
     * @returns Average latency in milliseconds
     */
    getAverageLatency() {
        const latencies = [];
        this.deliveryMetrics.forEach((metric) => {
            if (metric.success && metric.latency !== undefined) {
                latencies.push(metric.latency);
            }
        });
        if (latencies.length === 0) {
            return 0;
        }
        const sum = latencies.reduce((acc, latency) => acc + latency, 0);
        return sum / latencies.length;
    }
    /**
     * Get delivery success rate
     * @returns Success rate as a percentage (0-100)
     */
    getSuccessRate() {
        if (this.deliveryMetrics.size === 0) {
            return 100;
        }
        let successCount = 0;
        this.deliveryMetrics.forEach((metric) => {
            if (metric.success) {
                successCount++;
            }
        });
        return (successCount / this.deliveryMetrics.size) * 100;
    }
    /**
     * Clear delivery metrics (useful for testing or periodic cleanup)
     * @param olderThanMs - Optional: only clear metrics older than this many milliseconds
     */
    clearMetrics(olderThanMs) {
        if (!olderThanMs) {
            this.deliveryMetrics.clear();
            return;
        }
        const cutoffTime = Date.now() - olderThanMs;
        const keysToDelete = [];
        this.deliveryMetrics.forEach((metric, key) => {
            if (metric.startTime < cutoffTime) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach((key) => this.deliveryMetrics.delete(key));
    }
    /**
     * Update metrics for a delivery
     */
    updateMetrics(metricId, updates) {
        const existing = this.deliveryMetrics.get(metricId);
        if (existing) {
            this.deliveryMetrics.set(metricId, {
                ...existing,
                ...updates,
            });
        }
    }
    /**
     * Calculate retry delay with exponential backoff
     * @param retryCount - Current retry attempt (0-indexed)
     * @returns Delay in milliseconds
     */
    calculateRetryDelay(retryCount) {
        // Exponential backoff: 1s, 2s, 4s
        return this.RETRY_DELAY_MS * Math.pow(2, retryCount);
    }
    /**
     * Sleep for specified milliseconds
     */
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    /**
     * Create a timeout promise that rejects after specified milliseconds
     */
    createTimeout(ms) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Delivery timeout')), ms);
        });
    }
}
exports.SocketDeliveryService = SocketDeliveryService;
// Export singleton instance
exports.socketDeliveryService = new SocketDeliveryService();
