interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

class SimpleCache {
  private cache: Map<string, CacheItem<any>> = new Map();

  async set<T>(key: string, data: T, ttl: number = 60000): Promise<void> {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new SimpleCache();

// Cleanup every 5 minutes
setInterval(() => cache.cleanup(), 5 * 60 * 1000);
