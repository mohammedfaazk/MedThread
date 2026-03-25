import { getSocketInstance } from '../socket';
import Redis from 'ioredis';

const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL)
  : null;

interface TypingUser {
  userId: string;
  username: string;
  timestamp: number;
}

export class TypingIndicatorService {
  private readonly TYPING_TIMEOUT = 3000; // 3 seconds
  private typingUsers: Map<string, Map<string, TypingUser>> = new Map();

  /**
   * User started typing
   */
  async startTyping(conversationId: string, userId: string, username: string) {
    try {
      const io = getSocketInstance();
      
      // Store in memory
      if (!this.typingUsers.has(conversationId)) {
        this.typingUsers.set(conversationId, new Map());
      }
      
      const conversationTyping = this.typingUsers.get(conversationId)!;
      conversationTyping.set(userId, {
        userId,
        username,
        timestamp: Date.now()
      });

      // Store in Redis for distributed systems
      if (redis) {
        const key = `typing:${conversationId}:${userId}`;
        await redis.setex(key, 5, JSON.stringify({ userId, username }));
      }

      // Emit to other users in conversation
      io.to(conversationId).emit('user:typing', {
        conversationId,
        userId,
        username,
        isTyping: true
      });

      // Auto-stop after timeout
      setTimeout(() => {
        this.stopTyping(conversationId, userId);
      }, this.TYPING_TIMEOUT);

      return { success: true };
    } catch (error) {
      console.error('[TypingIndicator] Error starting typing:', error);
      throw error;
    }
  }

  /**
   * User stopped typing
   */
  async stopTyping(conversationId: string, userId: string) {
    try {
      const io = getSocketInstance();

      // Remove from memory
      const conversationTyping = this.typingUsers.get(conversationId);
      if (conversationTyping) {
        conversationTyping.delete(userId);
        
        if (conversationTyping.size === 0) {
          this.typingUsers.delete(conversationId);
        }
      }

      // Remove from Redis
      if (redis) {
        const key = `typing:${conversationId}:${userId}`;
        await redis.del(key);
      }

      // Emit to other users
      io.to(conversationId).emit('user:typing', {
        conversationId,
        userId,
        isTyping: false
      });

      return { success: true };
    } catch (error) {
      console.error('[TypingIndicator] Error stopping typing:', error);
      throw error;
    }
  }

  /**
   * Get currently typing users in a conversation
   */
  async getTypingUsers(conversationId: string): Promise<TypingUser[]> {
    try {
      const now = Date.now();
      const conversationTyping = this.typingUsers.get(conversationId);

      if (!conversationTyping) {
        return [];
      }

      // Filter out stale typing indicators
      const activeTyping: TypingUser[] = [];
      
      conversationTyping.forEach((user, userId) => {
        if (now - user.timestamp < this.TYPING_TIMEOUT) {
          activeTyping.push(user);
        } else {
          conversationTyping.delete(userId);
        }
      });

      return activeTyping;
    } catch (error) {
      console.error('[TypingIndicator] Error getting typing users:', error);
      return [];
    }
  }

  /**
   * Clean up stale typing indicators
   */
  async cleanupStaleIndicators() {
    try {
      const now = Date.now();

      this.typingUsers.forEach((conversationTyping, conversationId) => {
        conversationTyping.forEach((user, userId) => {
          if (now - user.timestamp >= this.TYPING_TIMEOUT) {
            this.stopTyping(conversationId, userId);
          }
        });
      });
    } catch (error) {
      console.error('[TypingIndicator] Error cleaning up stale indicators:', error);
    }
  }

  /**
   * Initialize cleanup interval
   */
  startCleanupInterval() {
    setInterval(() => {
      this.cleanupStaleIndicators();
    }, 5000); // Clean up every 5 seconds
  }
}

export const typingIndicatorService = new TypingIndicatorService();

// Start cleanup interval
typingIndicatorService.startCleanupInterval();
