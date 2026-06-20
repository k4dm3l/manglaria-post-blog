import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { getRedisClient, isRedisOperational } from './redis';

const createRateLimiter = (
  keyPrefix: string,
  points: number,
  duration: number
) => {
  const redis = getRedisClient();
  if (!redis) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Rate limiter ${keyPrefix} disabled: Redis not available`);
    }
    return null;
  }

  try {
    return new RateLimiterRedis({
      storeClient: redis,
      keyPrefix,
      points,
      duration,
    });
  } catch (error) {
    console.error(`Failed to create rate limiter ${keyPrefix}:`, error);
    return null;
  }
};

export const rateLimiters = {
  api: createRateLimiter('api', 100, 60),
  blogs: createRateLimiter('blogs', 30, 60),
  auth: createRateLimiter('auth', 5, 60),
};

function isRateLimiterRejection(
  error: unknown
): error is { msBeforeNext: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'msBeforeNext' in error &&
    typeof (error as { msBeforeNext: unknown }).msBeforeNext === 'number'
  );
}

export async function rateLimit(
  limiter: RateLimiterRedis | null,
  identifier: string
): Promise<{ success: boolean; message?: string }> {
  if (!limiter || !isRedisOperational()) {
    return { success: true };
  }

  try {
    await limiter.consume(identifier);
    return { success: true };
  } catch (error) {
    if (isRateLimiterRejection(error)) {
      return {
        success: false,
        message: 'Too many requests. Please try again later.',
      };
    }

    return { success: true };
  }
}

export async function withRateLimit<T>(
  limiter: RateLimiterRedis | null,
  handler: () => Promise<T>
): Promise<T> {
  if (!limiter) {
    return handler();
  }

  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';
  const identifier = `${ip}-${userAgent}`;

  const result = await rateLimit(limiter, identifier);

  if (!result.success) {
    // @ts-expect-error: T may not match this shape, but this is only for error cases
    return NextResponse.json({ error: result.message }, { status: 429 });
  }

  return handler();
}
