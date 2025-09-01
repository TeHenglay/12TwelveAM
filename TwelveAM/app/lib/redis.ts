import { Redis } from '@upstash/redis';

// Initialize Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Cache keys
export const CACHE_KEYS = {
  PRODUCTS: 'products',
  PRODUCT_DETAIL: (slug: string) => `product:${slug}`,
  CATEGORIES: 'categories',
  COLLECTIONS: 'collections',
};

// Get data from cache
export async function getCachedData(key: string) {
  try {
    const data = await redis.get(key);
    return data || null;
  } catch (error) {
    console.error(`Error getting cached data for key ${key}:`, error);
    return null;
  }
}

// Cache data with expiration time (in seconds)
export async function cacheData(key: string, data: any, expirySeconds: number = 3600) {
  try {
    await redis.set(key, data, { ex: expirySeconds });
    return true;
  } catch (error) {
    console.error(`Error caching data for key ${key}:`, error);
    return false;
  }
}

// Invalidate specific cache keys
export async function invalidateCache(key: string) {
  try {
    if (key === CACHE_KEYS.PRODUCTS) {
      // If invalidating products list, also invalidate all keys that start with 'products:'
      const keys = await redis.keys(`${CACHE_KEYS.PRODUCTS}:*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      await redis.del(key);
    } else {
      await redis.del(key);
    }
    return true;
  } catch (error) {
    console.error(`Error invalidating cache for key ${key}:`, error);
    return false;
  }
}

// Invalidate all cache
export async function invalidateAllCache() {
  try {
    await redis.flushall();
    return true;
  } catch (error) {
    console.error('Error invalidating all cache:', error);
    return false;
  }
}