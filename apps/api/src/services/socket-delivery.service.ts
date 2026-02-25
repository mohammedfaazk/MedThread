import { Server } from 'socket.io';
import type { notifications as Notification } from '@prisma/client';
import { getSocketInstance } from '../socket';

/**
 * Delivery metrics for tracking performance
 */
interface DeliveryMetrics {
  notificationId: string;
  userId: string;
  startTime: number;
  endTime?: number;
  latency?: number;
  success: boolean;
  retryCount: number;
  error?: string;
}

/**
 * Socket Delivery Service
 * Handles real-time notification delivery via Socket.io
 * Implements retry logic and latency tracking
 */
export class SocketDeliveryService {
  private io: Server | null = null;
  private deliveryMetrics: Map<string, DeliveryMetrics>;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000; // 1 second base delay
  private readonly DELIVERY_TIMEOUT_MS = 5000; // 5 seconds timeout

  constructor() {
    this.deliveryMetrics = new Map();
  }

  /**
   * Initialize the service with Socket.io instance
   */
  private getSocketIO(): Server {
    if (!this.io) {
      this.io = getSocketInstance();
    }
    return this.io;
  }

  /**
   * Send notification to user(s) via socket with retry logic
   * @param userIds - Array of user IDs to send notification to
   * @param notification - Notification object to send
   * @returns Promise that resolves when delivery is complete
   */
  async sendNotification(
    userIds: string | string[],
    notification: Notification
  ): Promise<void> {
    const recipients = Array.isArray(userIds) ? userIds : [userIds];
    const io = this.getSocketIO();

    const deliveryPromises = recipients.map((userId) =>
      this.deliverToUser(io, userId, notification)
    );

    await Promise.allSettled(deliveryPromises);
  }

  /**
   * Deliver notification to a single user with retry logic
   */
  private async deliverToUser(
    io: Server,
    userId: string,
    notification: Notification,
    retryCount: number = 0
  ): Promise<void> {
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
        console.log(
          `User ${userId} not connected, notification ${notification.id} will be queued for later delivery`
        );
        
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

      console.log(
        `Notification ${notification.id} delivered to user ${userId} (latency: ${endTime - startTime}ms)`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(
        `Failed to deliver notification ${notification.id} to user ${userId} (attempt ${retryCount + 1}):`,
        errorMessage
      );

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

      console.error(
        `Failed to deliver notification ${notification.id} to user ${userId} after ${this.MAX_RETRIES} retries`
      );
    }
  }

  /**
   * Emit notification to socket room
   */
  private async emitNotification(
    io: Server,
    roomName: string,
    notification: Notification
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        io.to(roomName).emit('notification:new', notification);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send unread count update to user
   * @param userId - User ID to send update to
   * @param count - New unread count
   */
  async sendUnreadCountUpdate(userId: string, count: number): Promise<void> {
    try {
      const io = this.getSocketIO();
      const roomName = `notifications:${userId}`;

      if (!this.isUserConnected(userId)) {
        console.log(`User ${userId} not connected, skipping unread count update`);
        return;
      }

      io.to(roomName).emit('notification:unread-count', count);
      console.log(`Sent unread count (${count}) to user ${userId}`);
    } catch (error) {
      console.error(`Error sending unread count update to user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Check if user is currently connected to socket
   * @param userId - User ID to check
   * @returns true if user has at least one active socket connection
   */
  isUserConnected(userId: string): boolean {
    try {
      const io = this.getSocketIO();
      const roomName = `notifications:${userId}`;
      
      // Get all sockets in the user's notification room
      const sockets = io.sockets.adapter.rooms.get(roomName);
      
      return sockets !== undefined && sockets.size > 0;
    } catch (error) {
      console.error(`Error checking user connection status for ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get all currently connected user IDs
   * @returns Array of user IDs that have active socket connections
   */
  getConnectedUsers(): string[] {
    try {
      const io = this.getSocketIO();
      const connectedUsers: string[] = [];

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
    } catch (error) {
      console.error('Error getting connected users:', error);
      return [];
    }
  }

  /**
   * Broadcast notification read event to all user's connected clients
   * @param userId - User ID to broadcast to
   * @param notificationId - Notification ID that was read
   */
  async broadcastNotificationRead(
    userId: string,
    notificationId: string
  ): Promise<void> {
    try {
      const io = this.getSocketIO();
      const roomName = `notifications:${userId}`;

      io.to(roomName).emit('notification:read', notificationId);
      console.log(`Broadcast notification read (${notificationId}) to user ${userId}`);
    } catch (error) {
      console.error(
        `Error broadcasting notification read for user ${userId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Broadcast all notifications read event to user's connected clients
   * @param userId - User ID to broadcast to
   */
  async broadcastAllNotificationsRead(userId: string): Promise<void> {
    try {
      const io = this.getSocketIO();
      const roomName = `notifications:${userId}`;

      io.to(roomName).emit('notification:all-read');
      console.log(`Broadcast all notifications read to user ${userId}`);
    } catch (error) {
      console.error(
        `Error broadcasting all notifications read for user ${userId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get delivery metrics for a specific notification
   * @param notificationId - Notification ID to get metrics for
   * @returns Array of delivery metrics for the notification
   */
  getDeliveryMetrics(notificationId: string): DeliveryMetrics[] {
    const metrics: DeliveryMetrics[] = [];

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
  getAverageLatency(): number {
    const latencies: number[] = [];

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
  getSuccessRate(): number {
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
  clearMetrics(olderThanMs?: number): void {
    if (!olderThanMs) {
      this.deliveryMetrics.clear();
      return;
    }

    const cutoffTime = Date.now() - olderThanMs;
    const keysToDelete: string[] = [];

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
  private updateMetrics(
    metricId: string,
    updates: Partial<DeliveryMetrics>
  ): void {
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
  private calculateRetryDelay(retryCount: number): number {
    // Exponential backoff: 1s, 2s, 4s
    return this.RETRY_DELAY_MS * Math.pow(2, retryCount);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create a timeout promise that rejects after specified milliseconds
   */
  private createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Delivery timeout')), ms);
    });
  }
}

// Export singleton instance
export const socketDeliveryService = new SocketDeliveryService();
