import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { getRedisClient } from './redis';

// Create rate limiter instances for different endpoints
// Returns null if Redis is not available (fail open)
const createRateLimiter = (keyPrefix: string, points: number, duration: number) => {
  const redis = getRedisClient();
  if (!redis) {
    console.warn(`Rate limiter ${keyPrefix} disabled: Redis not available`);
    return null;
  }

  try {
    return new RateLimiterRedis({
      storeClient: redis,
      keyPrefix,
      points, // Number of requests
      duration, // Per duration in seconds
    });
  } catch (error) {
    console.error(`Failed to create rate limiter ${keyPrefix}:`, error);
    return null;
  }
};

// Rate limiters for different endpoints
// These may be null if Redis is not available
export const rateLimiters = {
  // General API rate limiter
  api: createRateLimiter('api', 100, 60), // 100 requests per minute
  // Blog posts specific rate limiter
  blogs: createRateLimiter('blogs', 30, 60), // 30 requests per minute
  // Auth specific rate limiter
  auth: createRateLimiter('auth', 5, 60), // 5 requests per minute
};

export async function rateLimit(
  limiter: RateLimiterRedis | null,
  identifier: string
): Promise<{ success: boolean; message?: string }> {
  // If limiter is null (Redis not available), allow the request (fail open)
  if (!limiter) {
    return { success: true };
  }

  try {
    await limiter.consume(identifier);
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: 'Too many requests. Please try again later.',
      };
    }
    return {
      success: false,
      message: 'Rate limit error',
    };
  }
}

export async function withRateLimit<T>(
  limiter: RateLimiterRedis | null,
  handler: () => Promise<T>
): Promise<T> {
  // If limiter is null (Redis not available), skip rate limiting (fail open)
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
    return NextResponse.json(
      { error: result.message },
      { status: 429 }
    );
  }

  return handler();
} 