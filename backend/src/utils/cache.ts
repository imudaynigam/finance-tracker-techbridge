import { createClient, RedisClientType } from 'redis';

class CacheService {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD,
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      console.log('Redis Client Disconnected');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.client.connect();
      } catch (error) {
        console.error('Failed to connect to Redis:', error);
        // Continue without Redis - app will work without caching
      }
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected) return null;
    
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      const serializedValue = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  async deletePattern(pattern: string): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Redis delete pattern error:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  // Cache analytics data for 15 minutes
  async cacheAnalytics(userId: number, data: any): Promise<boolean> {
    const key = `analytics:${userId}`;
    return this.set(key, data, 15 * 60); // 15 minutes
  }

  async getCachedAnalytics(userId: number): Promise<any | null> {
    const key = `analytics:${userId}`;
    return this.get(key);
  }

  // Cache category list for 1 hour
  async cacheCategories(data: any): Promise<boolean> {
    const key = 'categories:all';
    return this.set(key, data, 60 * 60); // 1 hour
  }

  async getCachedCategories(): Promise<any | null> {
    const key = 'categories:all';
    return this.get(key);
  }

  // Invalidate user-specific caches when transactions change
  async invalidateUserCache(userId: number): Promise<void> {
    await this.deletePattern(`analytics:${userId}`);
    await this.deletePattern(`transactions:${userId}:*`);
  }

  // Invalidate all caches (admin function)
  async invalidateAllCaches(): Promise<void> {
    await this.deletePattern('analytics:*');
    await this.deletePattern('categories:*');
    await this.deletePattern('transactions:*');
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }
}

// Create singleton instance
export const cacheService = new CacheService();

// Initialize connection
cacheService.connect().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  await cacheService.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cacheService.disconnect();
  process.exit(0);
}); 