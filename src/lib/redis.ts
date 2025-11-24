import Redis from 'ioredis';

let redis: Redis | null = null;
let redisInitialized = false;

// Lazy initialization of Redis connection
function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) {
    if (!redisInitialized) {
      console.warn('REDIS_URL is not defined, Redis caching will be disabled');
      redisInitialized = true;
    }
    return null;
  }

  if (redis) {
    return redis;
  }

  try {
    // Normalize Redis URL - ensure it starts with redis://
    let redisUrl = process.env.REDIS_URL;
    if (redisUrl && !redisUrl.startsWith('redis://') && !redisUrl.startsWith('rediss://')) {
      redisUrl = `redis://${redisUrl}`;
    }

    // Create Redis instance with proper typing
    redis = new Redis(redisUrl, {
      retryStrategy: (times: number) => {
        // Retry with exponential backoff, max 3 times
        if (times > 3) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Redis connection failed after 3 retries - caching disabled');
          }
          return null; // Stop retrying
        }
        return Math.min(times * 200, 2000);
      },
      maxRetriesPerRequest: 3,
      enableOfflineQueue: true, // Queue commands when offline (they'll execute when connected)
      lazyConnect: true, // Don't connect immediately
      connectTimeout: 10000, // 10 second timeout
      commandTimeout: 5000, // 5 second command timeout
    });

    // Handle connection errors gracefully - prevent unhandled errors
    // These event handlers must be set up before any connection attempt
    redis.on('error', (error: Error) => {
      // Only log connection errors in development, or if they're not common connection issues
      const errorMessage = error.message || String(error);
      if (process.env.NODE_ENV === 'development' && 
          !errorMessage.includes('ENOENT') && 
          !errorMessage.includes('ECONNREFUSED')) {
        console.warn('Redis connection error:', errorMessage);
      }
      // Don't throw - just log the error
    });

    redis.on('connect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Redis connected successfully');
      }
    });

    redis.on('ready', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Redis is ready');
      }
    });

    redis.on('close', () => {
      // Don't log close events - they're normal during reconnection attempts
    });

    // With lazyConnect: true, connection happens on first command
    // No need to call connect() manually, but if we do, errors are handled

    redisInitialized = true;
    return redis;
  } catch (error) {
    console.error('Failed to create Redis client:', error);
    redisInitialized = true;
    return null;
  }
}

// Export the client getter function
export { getRedisClient };

// Default export for backward compatibility (used by rate-limit.ts)
// This is a getter that will be called when rate limiter initializes
// Returns null if Redis is not available, which rate limiter should handle
export default getRedisClient();

// Helper to check if Redis operations should be attempted
function shouldAttemptRedisOperation(client: Redis | null): boolean {
  if (!client) {
    return false;
  }
  // Check connection status - using type assertion for status property
  // which exists on ioredis but isn't in our type definitions
  const status = (client as Redis & { status?: string }).status;
  // 'ready' = connected and ready for commands
  // 'connect' = connecting (with offline queue, we can queue commands)
  // 'wait' = waiting to connect (with offline queue, we can queue commands)
  // 'reconnecting' = reconnecting (with offline queue, we can queue commands)
  // 'end' = permanently closed (don't try)
  // 'close' = closed (might reconnect, so with offline queue we can try)
  // undefined/null = not initialized yet (with lazyConnect, we can try)
  if (!status || status === 'ready' || status === 'connect' || status === 'wait' || status === 'reconnecting') {
    return true;
  }
  // For 'close' or 'end', skip to avoid queuing commands that will never execute
  return false;
}

// Cache helper functions
export const getCache = async <T>(key: string): Promise<T | null> => {
  const client = getRedisClient();
  if (!client || !shouldAttemptRedisOperation(client)) {
    return null; // Redis not available or not ready
  }

  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    // Only log if it's not a connection error (those are expected when offline)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('Stream isn\'t writeable') && 
        !errorMessage.includes('Connection') && 
        !errorMessage.includes('ENOENT')) {
      console.error('Redis get error:', errorMessage);
    }
    return null;
  }
};

export const setCache = async <T>(
  key: string,
  value: T,
  expirationInSeconds: number = 3600 // 1 hour default
): Promise<void> => {
  const client = getRedisClient();
  if (!client || !shouldAttemptRedisOperation(client)) {
    return; // Redis not available or not ready, silently fail
  }

  try {
    await client.setex(key, expirationInSeconds, JSON.stringify(value));
  } catch (error) {
    // Only log if it's not a connection/writeable error (those are expected when offline)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('Stream isn\'t writeable') && 
        !errorMessage.includes('Connection') && 
        !errorMessage.includes('ENOENT')) {
      console.error('Redis set error:', errorMessage);
    }
    // Silently fail - don't throw
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  const client = getRedisClient();
  if (!client || !shouldAttemptRedisOperation(client)) {
    return; // Redis not available or not ready, silently fail
  }

  try {
    await client.del(key);
  } catch (error) {
    // Only log if it's not a connection error (those are expected when offline)
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!errorMessage.includes('Stream isn\'t writeable') && 
        !errorMessage.includes('Connection') && 
        !errorMessage.includes('ENOENT')) {
      console.error('Redis delete error:', errorMessage);
    }
    // Silently fail - don't throw
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