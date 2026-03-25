import Redis from 'ioredis';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class CacheManager {
  private memoryCache: Map<string, CacheItem<any>>;
  private redis: Redis | null = null;
  private defaultTTL: number;
  private useRedis: boolean = false;

  constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default
    this.memoryCache = new Map();
    this.defaultTTL = defaultTTL;
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      const redisUrl = process.env.REDIS_URL;
      if (redisUrl) {
        this.redis = new Redis(redisUrl);
        this.useRedis = true;
        console.log('[CacheManager] Redis connected successfully');
        
        // Test Redis connection
        await this.redis.ping();
      } else {
        console.log('[CacheManager] Redis not configured, using memory cache only');
      }
    } catch (error) {
      console.error('[CacheManager] Redis connection failed, falling back to memory cache:', error);
      this.useRedis = false;
    }
  }

  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const timestamp = Date.now();
    const expiresAt = timestamp + (ttl || this.defaultTTL);

    const cacheItem: CacheItem<T> = {
      data,
      timestamp,
      expiresAt,
    };

    // Store in memory cache
    this.memoryCache.set(key, cacheItem);

    // Store in Redis if available
    if (this.useRedis && this.redis) {
      try {
        const serialized = JSON.stringify(cacheItem);
        const ttlSeconds = Math.ceil((ttl || this.defaultTTL) / 1000);
        await this.redis.setex(key, ttlSeconds, serialized);
      } catch (error) {
        console.error('[CacheManager] Redis set failed:', error);
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    // Try Redis first if available
    if (this.useRedis && this.redis) {
      try {
        const cached = await this.redis.get(key);
        if (cached) {
          const item: CacheItem<T> = JSON.parse(cached);
          
          // Check if expired
          if (Date.now() <= item.expiresAt) {
            // Update memory cache
            this.memoryCache.set(key, item);
            return item.data;
          } else {
            // Remove expired item
            await this.redis.del(key);
          }
        }
      } catch (error) {
        console.error('[CacheManager] Redis get failed:', error);
      }
    }

    // Fallback to memory cache
    const item = this.memoryCache.get(key);
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.data as T;
  }

  async has(key: string): Promise<boolean> {
    // Check Redis first
    if (this.useRedis && this.redis) {
      try {
        const exists = await this.redis.exists(key);
        if (exists) return true;
      } catch (error) {
        console.error('[CacheManager] Redis exists check failed:', error);
      }
    }

    // Check memory cache
    const item = this.memoryCache.get(key);
    if (!item) {
      return false;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return false;
    }

    return true;
  }

  async delete(key: string): Promise<void> {
    // Delete from memory cache
    this.memoryCache.delete(key);

    // Delete from Redis
    if (this.useRedis && this.redis) {
      try {
        await this.redis.del(key);
      } catch (error) {
        console.error('[CacheManager] Redis delete failed:', error);
      }
    }
  }

  async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();

    // Clear Redis (be careful with this in production)
    if (this.useRedis && this.redis) {
      try {
        await this.redis.flushdb();
      } catch (error) {
        console.error('[CacheManager] Redis clear failed:', error);
      }
    }
  }

  // Clear expired items from memory cache
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (now > item.expiresAt) {
        this.memoryCache.delete(key);
      }
    }
  }

  // Advanced caching methods
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await this.set(key, data, ttl);
    return data;
  }

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    if (this.useRedis && this.redis) {
      try {
        const values = await this.redis.mget(...keys);
        return values.map(value => {
          if (!value) return null;
          try {
            const item: CacheItem<T> = JSON.parse(value);
            return Date.now() <= item.expiresAt ? item.data : null;
          } catch {
            return null;
          }
        });
      } catch (error) {
        console.error('[CacheManager] Redis mget failed:', error);
      }
    }

    // Fallback to individual gets
    return Promise.all(keys.map(key => this.get<T>(key)));
  }

  async mset<T>(items: Array<{ key: string; data: T; ttl?: number }>): Promise<void> {
    if (this.useRedis && this.redis) {
      try {
        const pipeline = this.redis.pipeline();
        
        for (const item of items) {
          const timestamp = Date.now();
          const expiresAt = timestamp + (item.ttl || this.defaultTTL);
          const cacheItem: CacheItem<T> = {
            data: item.data,
            timestamp,
            expiresAt,
          };
          
          const serialized = JSON.stringify(cacheItem);
          const ttlSeconds = Math.ceil((item.ttl || this.defaultTTL) / 1000);
          pipeline.setex(item.key, ttlSeconds, serialized);
        }
        
        await pipeline.exec();
      } catch (error) {
        console.error('[CacheManager] Redis mset failed:', error);
      }
    }

    // Also set in memory cache
    for (const item of items) {
      await this.set(item.key, item.data, item.ttl);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (this.useRedis && this.redis) {
      try {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } catch (error) {
        console.error('[CacheManager] Redis pattern invalidation failed:', error);
      }
    }

    // Invalidate from memory cache
    for (const key of this.memoryCache.keys()) {
      if (this.matchesPattern(key, pattern)) {
        this.memoryCache.delete(key);
      }
    }
  }

  private matchesPattern(key: string, pattern: string): boolean {
    // Simple pattern matching (supports * wildcard)
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(key);
  }

  // Get cache statistics
  async getStats() {
    const memoryStats = {
      size: this.memoryCache.size,
      keys: Array.from(this.memoryCache.keys()),
    };

    let redisStats = null;
    if (this.useRedis && this.redis) {
      try {
        const info = await this.redis.info('memory');
        const keyspace = await this.redis.info('keyspace');
        redisStats = {
          connected: true,
          memory: info,
          keyspace: keyspace
        };
      } catch (error) {
        redisStats = { connected: false, error: error.message };
      }
    }

    return {
      memory: memoryStats,
      redis: redisStats,
      useRedis: this.useRedis
    };
  }

  // Cache warming
  async warmCache(warmers: Array<{
    key: string;
    fetcher: () => Promise<any>;
    ttl?: number;
  }>) {
    console.log('[CacheManager] Warming cache with', warmers.length, 'items');
    
    const promises = warmers.map(async warmer => {
      try {
        const data = await warmer.fetcher();
        await this.set(warmer.key, data, warmer.ttl);
        console.log(`[CacheManager] Warmed cache for key: ${warmer.key}`);
      } catch (error) {
        console.error(`[CacheManager] Failed to warm cache for key ${warmer.key}:`, error);
      }
    });

    await Promise.allSettled(promises);
    console.log('[CacheManager] Cache warming completed');
  }
}

// Create singleton instance
export const cache = new CacheManager();

// Run cleanup every 5 minutes for memory cache
if (typeof window !== 'undefined') {
  setInterval(() => cache.cleanup(), 5 * 60 * 1000);
}

// Enhanced cache key generators
export const cacheKeys = {
  posts: (page: number, limit: number, filters?: Record<string, any>) =>
    `posts:${page}:${limit}:${JSON.stringify(filters || {})}`,
  post: (id: string) => `post:${id}`,
  postWithComments: (id: string) => `post:${id}:comments`,
  user: (id: string) => `user:${id}`,
  userProfile: (id: string) => `user:${id}:profile`,
  comments: (postId: string, page: number) => `comments:${postId}:${page}`,
  threads: (page: number) => `threads:${page}`,
  doctorSearch: (params: Record<string, any>) => `doctors:search:${JSON.stringify(params)}`,
  symptoms: (query: string) => `symptoms:${query}`,
  notifications: (userId: string) => `notifications:${userId}`,
  analytics: (type: string, period: string) => `analytics:${type}:${period}`,
  healthCheck: () => 'health:check',
  
  // Pattern-based keys for invalidation
  userPattern: (userId: string) => `user:${userId}*`,
  postPattern: (postId: string) => `post:${postId}*`,
  analyticsPattern: () => 'analytics:*',
};
