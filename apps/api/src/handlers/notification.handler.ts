import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { notificationService } from '../services/notification.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

/**
 * Authenticate socket connection using JWT token
 */
const authenticateSocket = (socket: AuthenticatedSocket): boolean => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.error(`Socket ${socket.id}: No authentication token provided`);
      return false;
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-change-in-production') as any;
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    
    console.log(`Socket ${socket.id} authenticated for user: ${socket.userId}`);
    return true;
  } catch (error) {
    console.error(`Socket ${socket.id}: Authentication failed`, error);
    return false;
  }
};

/**
 * Track connected users for delivery status
 */
const connectedUsers = new Map<string, Set<string>>(); // userId -> Set of socket IDs

/**
 * Notification handler for Socket.io
 */
export const notificationHandler = (io: Server, socket: AuthenticatedSocket) => {
  // Authenticate socket on connection
  if (!authenticateSocket(socket)) {
    socket.emit('error', { message: 'Authentication required' });
    socket.disconnect();
    return;
  }

  const userId = socket.userId!;

  /**
   * Join user's notification room
   * Client emits: { userId: string }
   */
  socket.on('notification:join', async (data: { userId: string }) => {
    try {
      // Verify user can only join their own room
      if (data.userId !== userId) {
        socket.emit('error', { message: 'Unauthorized: Cannot join another user\'s notification room' });
        return;
      }

      const roomName = `notifications:${userId}`;
      socket.join(roomName);
      
      // Track connection
      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, new Set());
      }
      connectedUsers.get(userId)!.add(socket.id);
      
      console.log(`Socket ${socket.id} joined notification room: ${roomName}`);

      // Send current unread count on join
      const unreadCount = await notificationService.getUnreadCount(userId);
      socket.emit('notification:unread-count', unreadCount);
    } catch (error) {
      console.error(`Error joining notification room:`, error);
      socket.emit('error', { message: 'Failed to join notification room' });
    }
  });

  /**
   * Leave notification room
   */
  socket.on('notification:leave', () => {
    try {
      const roomName = `notifications:${userId}`;
      socket.leave(roomName);
      
      // Remove from connection tracking
      if (connectedUsers.has(userId)) {
        connectedUsers.get(userId)!.delete(socket.id);
        if (connectedUsers.get(userId)!.size === 0) {
          connectedUsers.delete(userId);
        }
      }
      
      console.log(`Socket ${socket.id} left notification room: ${roomName}`);
    } catch (error) {
      console.error(`Error leaving notification room:`, error);
    }
  });

  /**
   * Mark notification as read (for cross-tab sync)
   * Client emits: { notificationId: string }
   */
  socket.on('notification:read', async (data: { notificationId: string }) => {
    try {
      const { notificationId } = data;
      
      // Mark as read in database
      await notificationService.markAsRead([notificationId], userId);
      
      // Broadcast to all user's connected clients (cross-tab sync)
      const roomName = `notifications:${userId}`;
      io.to(roomName).emit('notification:read', notificationId);
      
      // Send updated unread count
      const unreadCount = await notificationService.getUnreadCount(userId);
      io.to(roomName).emit('notification:unread-count', unreadCount);
      
      console.log(`Notification ${notificationId} marked as read for user ${userId}`);
    } catch (error) {
      console.error(`Error marking notification as read:`, error);
      socket.emit('error', { message: 'Failed to mark notification as read' });
    }
  });

  /**
   * Handle disconnect
   */
  socket.on('disconnect', () => {
    // Remove from connection tracking
    if (connectedUsers.has(userId)) {
      connectedUsers.get(userId)!.delete(socket.id);
      if (connectedUsers.get(userId)!.size === 0) {
        connectedUsers.delete(userId);
      }
    }
    
    console.log(`User disconnected: ${socket.id} (userId: ${userId})`);
  });
};

/**
 * Server-side helper to send new notification to user
 */
export const sendNotificationToUser = (io: Server, userId: string, notification: any) => {
  const roomName = `notifications:${userId}`;
  io.to(roomName).emit('notification:new', notification);
  console.log(`Sent notification to user ${userId} in room ${roomName}`);
};

/**
 * Server-side helper to send unread count update
 */
export const sendUnreadCountUpdate = (io: Server, userId: string, count: number) => {
  const roomName = `notifications:${userId}`;
  io.to(roomName).emit('notification:unread-count', count);
  console.log(`Sent unread count (${count}) to user ${userId}`);
};

/**
 * Server-side helper to broadcast notification read event
 */
export const broadcastNotificationRead = (io: Server, userId: string, notificationId: string) => {
  const roomName = `notifications:${userId}`;
  io.to(roomName).emit('notification:read', notificationId);
  console.log(`Broadcast notification read (${notificationId}) to user ${userId}`);
};

/**
 * Server-side helper to broadcast all notifications read event
 */
export const broadcastAllNotificationsRead = (io: Server, userId: string) => {
  const roomName = `notifications:${userId}`;
  io.to(roomName).emit('notification:all-read');
  console.log(`Broadcast all notifications read to user ${userId}`);
};

/**
 * Check if user is currently connected
 */
export const isUserConnected = (userId: string): boolean => {
  return connectedUsers.has(userId) && connectedUsers.get(userId)!.size > 0;
};

/**
 * Get all connected user IDs
 */
export const getConnectedUsers = (): string[] => {
  return Array.from(connectedUsers.keys());
};
