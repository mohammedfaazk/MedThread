import { prisma } from '@medthread/database';
import Redis from 'ioredis';

// Initialize Redis client
const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL)
  : null;

interface CachedMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: any[];
}

export class MessageCacheService {
  private readonly CACHE_TTL = 86400; // 24 hours
  private readonly MAX_CACHED_MESSAGES = 100;

  /**
   * Cache messages for offline viewing
   */
  async cacheConversationMessages(conversationId: string, userId: string) {
    try {
      // Get recent messages
      const messages = await prisma.message.findMany({
        where: {
          conversationId,
          OR: [
            { senderId: userId },
            { recipientId: userId }
          ]
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              fullName: true,
              profilePicture: true,
              role: true
            }
          },
          attachments: true
        },
        orderBy: { createdAt: 'desc' },
        take: this.MAX_CACHED_MESSAGES
      });

      const cacheKey = `messages:${userId}:${conversationId}`;
      
      if (redis) {
        // Store in Redis
        await redis.setex(
          cacheKey,
          this.CACHE_TTL,
          JSON.stringify(messages)
        );
      }

      // Also store in local database cache table
      await this.storeInDatabaseCache(userId, conversationId, messages);

      return messages;
    } catch (error) {
      console.error('[MessageCache] Error caching messages:', error);
      throw error;
    }
  }

  /**
   * Get cached messages
   */
  async getCachedMessages(conversationId: string, userId: string) {
    try {
      const cacheKey = `messages:${userId}:${conversationId}`;

      // Try Redis first
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      // Fallback to database cache
      const dbCache = await prisma.messageCache.findFirst({
        where: {
          userId,
          conversationId
        }
      });

      if (dbCache) {
        return dbCache.messages;
      }

      // If no cache, fetch and cache
      return await this.cacheConversationMessages(conversationId, userId);
    } catch (error) {
      console.error('[MessageCache] Error getting cached messages:', error);
      return [];
    }
  }

  /**
   * Store messages in database cache
   */
  private async storeInDatabaseCache(userId: string, conversationId: string, messages: any[]) {
    try {
      await prisma.messageCache.upsert({
        where: {
          userId_conversationId: {
            userId,
            conversationId
          }
        },
        update: {
          messages: messages as any,
          lastUpdated: new Date()
        },
        create: {
          userId,
          conversationId,
          messages: messages as any,
          lastUpdated: new Date()
        }
      });
    } catch (error) {
      console.error('[MessageCache] Error storing in database cache:', error);
    }
  }

  /**
   * Invalidate cache when new message arrives
   */
  async invalidateCache(conversationId: string, userIds: string[]) {
    try {
      for (const userId of userIds) {
        const cacheKey = `messages:${userId}:${conversationId}`;
        
        if (redis) {
          await redis.del(cacheKey);
        }

        // Update database cache
        await this.cacheConversationMessages(conversationId, userId);
      }
    } catch (error) {
      console.error('[MessageCache] Error invalidating cache:', error);
    }
  }

  /**
   * Cache user's recent conversations
   */
  async cacheUserConversations(userId: string) {
    try {
      const conversations = await prisma.conversation.findMany({
        where: {
          participants: {
            some: { userId }
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                  profilePicture: true,
                  role: true
                }
              }
            }
          },
          lastMessage: {
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                  fullName: true
                }
              }
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        take: 50
      });

      const cacheKey = `conversations:${userId}`;

      if (redis) {
        await redis.setex(
          cacheKey,
          this.CACHE_TTL,
          JSON.stringify(conversations)
        );
      }

      // Store in database
      await prisma.conversationCache.upsert({
        where: { userId },
        update: {
          conversations: conversations as any,
          lastUpdated: new Date()
        },
        create: {
          userId,
          conversations: conversations as any,
          lastUpdated: new Date()
        }
      });

      return conversations;
    } catch (error) {
      console.error('[MessageCache] Error caching conversations:', error);
      throw error;
    }
  }

  /**
   * Get cached conversations
   */
  async getCachedConversations(userId: string) {
    try {
      const cacheKey = `conversations:${userId}`;

      // Try Redis first
      if (redis) {
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      // Fallback to database cache
      const dbCache = await prisma.conversationCache.findUnique({
        where: { userId }
      });

      if (dbCache) {
        return dbCache.conversations;
      }

      // If no cache, fetch and cache
      return await this.cacheUserConversations(userId);
    } catch (error) {
      console.error('[MessageCache] Error getting cached conversations:', error);
      return [];
    }
  }

  /**
   * Prefetch messages for offline use
   */
  async prefetchForOffline(userId: string, conversationIds: string[]) {
    try {
      const results = await Promise.all(
        conversationIds.map(convId => 
          this.cacheConversationMessages(convId, userId)
        )
      );

      return {
        success: true,
        cachedConversations: conversationIds.length,
        totalMessages: results.reduce((sum, msgs) => sum + msgs.length, 0)
      };
    } catch (error) {
      console.error('[MessageCache] Error prefetching for offline:', error);
      throw error;
    }
  }

  /**
   * Clear old cache entries
   */
  async clearOldCache(daysOld: number = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      await prisma.messageCache.deleteMany({
        where: {
          lastUpdated: {
            lt: cutoffDate
          }
        }
      });

      await prisma.conversationCache.deleteMany({
        where: {
          lastUpdated: {
            lt: cutoffDate
          }
        }
      });

      return { success: true };
    } catch (error) {
      console.error('[MessageCache] Error clearing old cache:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(userId: string) {
    try {
      const [messageCache, conversationCache] = await Promise.all([
        prisma.messageCache.count({ where: { userId } }),
        prisma.conversationCache.findUnique({ where: { userId } })
      ]);

      return {
        cachedConversations: messageCache,
        totalConversations: conversationCache ? (conversationCache.conversations as any[]).length : 0,
        lastUpdated: conversationCache?.lastUpdated
      };
    } catch (error) {
      console.error('[MessageCache] Error getting cache stats:', error);
      return null;
    }
  }
}

export const messageCacheService = new MessageCacheService();
