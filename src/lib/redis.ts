import Redis from 'ioredis';

let redis: Redis | null = null;
let redisInitialized = false;
let redisDisabled = false;

function parseRedisUrl(rawUrl: string): string | null {
  let url = rawUrl.trim();

  if (!url) {
    return null;
  }

  // Handle common misconfiguration like REDIS_URL==redis://host:6379
  while (url.startsWith('=')) {
    url = url.slice(1);
  }

  if (!url.startsWith('redis://') && !url.startsWith('rediss://')) {
    url = `redis://${url}`;
  }

  try {
    const parsed = new URL(url);
    if (!parsed.hostname || parsed.hostname.startsWith('=')) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function disableRedis(reason: string) {
  if (!redisDisabled && process.env.NODE_ENV === 'development') {
    console.warn(`${reason} Redis caching and Redis rate limiting are disabled.`);
  }
  redisDisabled = true;
  redis = null;
}

function getRedisClient(): Redis | null {
  if (redisDisabled) {
    return null;
  }

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

  const redisUrl = parseRedisUrl(process.env.REDIS_URL);
  if (!redisUrl) {
    disableRedis(`Invalid REDIS_URL "${process.env.REDIS_URL}".`);
    redisInitialized = true;
    return null;
  }

  try {
    redis = new Redis(redisUrl, {
      retryStrategy: (times: number) => {
        if (times > 3) {
          disableRedis('Redis connection failed after 3 retries -');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
    });

    redis.on('error', (error: Error) => {
      const errorMessage = error.message || String(error);
      if (
        errorMessage.includes('ENOTFOUND') ||
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('=getaddrinfo')
      ) {
        disableRedis(`Redis connection error: ${errorMessage}.`);
        return;
      }

      if (process.env.NODE_ENV === 'development') {
        console.warn('Redis connection error:', errorMessage);
      }
    });

    redis.on('connect', () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Redis connected successfully');
      }
    });

    redisInitialized = true;
    return redis;
  } catch (error) {
    console.error('Failed to create Redis client:', error);
    disableRedis('Failed to create Redis client.');
    redisInitialized = true;
    return null;
  }
}

export { getRedisClient };

function shouldAttemptRedisOperation(client: Redis | null): boolean {
  if (!client || redisDisabled) {
    return false;
  }

  const status = (client as Redis & { status?: string }).status;
  if (
    !status ||
    status === 'ready' ||
    status === 'connect' ||
    status === 'wait' ||
    status === 'reconnecting'
  ) {
    return true;
  }

  return false;
}

export const getCache = async <T>(key: string): Promise<T | null> => {
  const client = getRedisClient();
  if (!client || !shouldAttemptRedisOperation(client)) {
    return null;
  }

  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      !errorMessage.includes("Stream isn't writeable") &&
      !errorMessage.includes('Connection') &&
      !errorMessage.includes('ENOTFOUND')
    ) {
      console.error('Redis get error:', errorMessage);
    }
    return null;
  }
};

export const setCache = async <T>(
  key: string,
  value: T,
  expirationInSeconds: number = 3600
): Promise<void> => {
  const client = getRedisClient();
  if (!client || !shouldAttemptRedisOperation(client)) {
    return;
  }

  try {
    await client.setex(key, expirationInSeconds, JSON.stringify(value));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      !errorMessage.includes("Stream isn't writeable") &&
      !errorMessage.includes('Connection') &&
      !errorMessage.includes('ENOTFOUND')
    ) {
      console.error('Redis set error:', errorMessage);
    }
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  const client = getRedisClient();
  if (!client || !shouldAttemptRedisOperation(client)) {
    return;
  }

  try {
    await client.del(key);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (
      !errorMessage.includes("Stream isn't writeable") &&
      !errorMessage.includes('Connection') &&
      !errorMessage.includes('ENOTFOUND')
    ) {
      console.error('Redis delete error:', errorMessage);
    }
  }
};

export const generateCacheKey = (
  prefix: string,
  params: Record<string, unknown>
): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce(
      (acc, key) => {
        acc[key] = params[key];
        return acc;
      },
      {} as Record<string, unknown>
    );

  return `${prefix}:${JSON.stringify(sortedParams)}`;
};
