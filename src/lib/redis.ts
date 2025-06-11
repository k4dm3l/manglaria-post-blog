import Redis from 'ioredis';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL is not defined');
}

const redis = new Redis(process.env.REDIS_URL);

export default redis;

// Cache helper functions
export const getCache = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

export const setCache = async <T>(
  key: string,
  value: T,
  expirationInSeconds: number = 3600 // 1 hour default
): Promise<void> => {
  try {
    await redis.setex(key, expirationInSeconds, JSON.stringify(value));
  } catch (error) {
    console.error('Redis set error:', error);
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Redis delete error:', error);
  }
};

export const generateCacheKey = (prefix: string, params: Record<string, unknown>): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, unknown>);
  
  return `${prefix}:${JSON.stringify(sortedParams)}`;
}; 