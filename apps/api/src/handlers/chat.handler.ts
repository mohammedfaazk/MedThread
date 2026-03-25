import { Server, Socket } from 'socket.io';
import { canAccessConversation } from '../middleware/chatPermission';
import { chatService } from '../services/chat.service';

interface SocketWithAuth extends Socket {
  userId?: string;
  username?: string;
}

// Track active users in conversations
const activeUsers = new Map<string, Set<string>>(); // conversationId -> Set of userIds

export const chatHandler = (io: Server, socket: SocketWithAuth) => {
  console.log(`[Chat] User connected: ${socket.id}`);

  /**
   * Authenticate socket connection
   */
  socket.on('authenticate', async (data: { userId: string; token?: string }) => {
    try {
      // In production, validate JWT token here
      socket.userId = data.userId;
      
      // Join user's personal room for notifications
      socket.join(`user:${data.userId}`);
      
      console.log(`[Chat] User authenticated: ${data.userId}`);
      socket.emit('authenticated', { success: true });
    } catch (error) {
      console.error('[Chat] Authentication error:', error);
      socket.emit('auth_error', { error: 'Authentication failed' });
    }
  });

  /**
   * Join a conversation room with permission check
   */
  socket.on('join_conversation', async (data: { conversationId: string }) => {
    try {
      const { conversationId } = data;
      
      if (!socket.userId) {
        socket.emit('error', { 
          code: 'AUTH_REQUIRED',
          message: 'Authentication required' 
        });
        return;
      }

      // Join the conversation room
      socket.join(conversationId);
      console.log(`[Chat] Socket ${socket.id} joined room: ${conversationId}`);
      
      // Track active user
      if (!activeUsers.has(conversationId)) {
        activeUsers.set(conversationId, new Set());
      }
      activeUsers.get(conversationId)!.add(socket.userId);
      console.log(`[Chat] Active users in ${conversationId}:`, Array.from(activeUsers.get(conversationId)!));

      // Notify others in the room
      socket.to(conversationId).emit('user_joined', {
        userId: socket.userId,
        conversationId
      });

      // Send current active users to the joining user
      const activeInConversation = Array.from(activeUsers.get(conversationId) || []);
      socket.emit('conversation_joined', {
        conversationId,
        activeUsers: activeInConversation
      });

      // Mark messages as read
      await chatService.markAsRead(conversationId, socket.userId);

      console.log(`[Chat] User ${socket.userId} joined conversation: ${conversationId}`);
    } catch (error) {
      console.error('[Chat] Join conversation error:', error);
      socket.emit('error', { 
        code: 'JOIN_FAILED',
        message: 'Failed to join conversation' 
      });
    }
  });

  /**
   * Leave a conversation room
   */
  socket.on('leave_conversation', (data: { conversationId: string }) => {
    try {
      const { conversationId } = data;
      
      if (!socket.userId) return;

      socket.leave(conversationId);
      
      // Remove from active users
      if (activeUsers.has(conversationId)) {
        activeUsers.get(conversationId)!.delete(socket.userId);
        if (activeUsers.get(conversationId)!.size === 0) {
          activeUsers.delete(conversationId);
        }
      }

      // Notify others
      socket.to(conversationId).emit('user_left', {
        userId: socket.userId,
        conversationId
      });

      console.log(`[Chat] User ${socket.userId} left conversation: ${conversationId}`);
    } catch (error) {
      console.error('[Chat] Leave conversation error:', error);
    }
  });

  /**
   * Typing indicator
   */
  socket.on('typing', async (data: { conversationId: string; isTyping: boolean }) => {
    try {
      const { conversationId, isTyping } = data;
      
      if (!socket.userId) return;

      // Validate access
      const permission = await canAccessConversation(socket.userId, conversationId);
      if (!permission.allowed) return;

      // Broadcast to others in the conversation
      socket.to(conversationId).emit('user_typing', {
        userId: socket.userId,
        conversationId,
        isTyping
      });
    } catch (error) {
      console.error('[Chat] Typing indicator error:', error);
    }
  });

  /**
   * Mark messages as read
   */
  socket.on('mark_read', async (data: { conversationId: string }) => {
    try {
      const { conversationId } = data;
      
      if (!socket.userId) return;

      await chatService.markAsRead(conversationId, socket.userId);
      
      console.log(`[Chat] Messages marked as read in ${conversationId} by ${socket.userId}`);
    } catch (error) {
      console.error('[Chat] Mark read error:', error);
    }
  });

  /**
   * Request unread counts
   */
  socket.on('get_unread_counts', async () => {
    try {
      if (!socket.userId) return;

      const counts = await chatService.getAllUnreadCounts(socket.userId);
      socket.emit('unread_counts', counts);
    } catch (error) {
      console.error('[Chat] Get unread counts error:', error);
    }
  });

  /**
   * Handle disconnection
   */
  socket.on('disconnect', () => {
    if (socket.userId) {
      // Remove from all active conversations
      activeUsers.forEach((users, conversationId) => {
        if (users.has(socket.userId!)) {
          users.delete(socket.userId!);
          
          // Notify others
          io.to(conversationId).emit('user_left', {
            userId: socket.userId,
            conversationId
          });
          
          if (users.size === 0) {
            activeUsers.delete(conversationId);
          }
        }
      });
    }
    
    console.log(`[Chat] User disconnected: ${socket.id}`);
  });

  /**
   * Handle reconnection
   */
  socket.on('reconnect', async (data: { conversationIds: string[] }) => {
    try {
      if (!socket.userId) return;

      // Rejoin all conversations
      for (const conversationId of data.conversationIds) {
        const permission = await canAccessConversation(socket.userId, conversationId);
        if (permission.allowed) {
          socket.join(conversationId);
          
          if (!activeUsers.has(conversationId)) {
            activeUsers.set(conversationId, new Set());
          }
          activeUsers.get(conversationId)!.add(socket.userId);
        }
      }

      socket.emit('reconnected', { success: true });
    } catch (error) {
      console.error('[Chat] Reconnect error:', error);
    }
  });
};

