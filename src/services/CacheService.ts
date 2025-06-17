
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  enableCompression: boolean;
}

class CacheManager {
  private config: CacheConfig;
  private memoryCache = new Map<string, CacheItem<any>>();
  private cacheHits = 0;
  private cacheMisses = 0;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 100,
      enableCompression: false,
      ...config
    };

    // Clean up expired items every minute
    setInterval(() => this.cleanup(), 60000);
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL
    };

    // Memory cache
    this.memoryCache.set(key, item);

    // LocalStorage cache (with error handling)
    try {
      localStorage.setItem(
        `cache_${key}`, 
        JSON.stringify(item)
      );
    } catch (error) {
      console.warn('LocalStorage cache failed:', error);
    }

    // Enforce max size
    if (this.memoryCache.size > this.config.maxSize) {
      this.evictOldest();
    }
  }

  get<T>(key: string): T | null {
    // Try memory cache first
    let item = this.memoryCache.get(key);
    
    // Fallback to localStorage
    if (!item) {
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          item = JSON.parse(stored);
          // Restore to memory cache
          if (item) {
            this.memoryCache.set(key, item);
          }
        }
      } catch (error) {
        console.warn('LocalStorage read failed:', error);
      }
    }

    if (!item) {
      this.cacheMisses++;
      return null;
    }

    // Check TTL
    if (Date.now() - item.timestamp > item.ttl) {
      this.delete(key);
      this.cacheMisses++;
      return null;
    }

    this.cacheHits++;
    return item.data;
  }

  delete(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('LocalStorage delete failed:', error);
    }
  }

  clear(): void {
    this.memoryCache.clear();
    // Clear all cache items from localStorage
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith('cache_'))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('LocalStorage clear failed:', error);
    }
  }

  getStats() {
    const total = this.cacheHits + this.cacheMisses;
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: total > 0 ? (this.cacheHits / total) * 100 : 0,
      size: this.memoryCache.size
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.memoryCache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.delete(key));
  }

  private evictOldest(): void {
    const oldestKey = Array.from(this.memoryCache.entries())
      .sort(([,a], [,b]) => a.timestamp - b.timestamp)[0]?.[0];
    
    if (oldestKey) {
      this.delete(oldestKey);
    }
  }
}

export const cacheService = new CacheManager({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 150,
  enableCompression: false
});
