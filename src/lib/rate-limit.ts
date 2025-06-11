import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import redis from './redis';

// Create rate limiter instances for different endpoints
const createRateLimiter = (keyPrefix: string, points: number, duration: number) => {
  return new RateLimiterRedis({
    storeClient: redis,
    keyPrefix,
    points, // Number of requests
    duration, // Per duration in seconds
  });
};

// Rate limiters for different endpoints
export const rateLimiters = {
  // General API rate limiter
  api: createRateLimiter('api', 100, 60), // 100 requests per minute
  // Blog posts specific rate limiter
  blogs: createRateLimiter('blogs', 30, 60), // 30 requests per minute
  // Auth specific rate limiter
  auth: createRateLimiter('auth', 5, 60), // 5 requests per minute
};

export async function rateLimit(
  limiter: RateLimiterRedis,
  identifier: string
): Promise<{ success: boolean; message?: string }> {
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
  limiter: RateLimiterRedis,
  handler: () => Promise<T>
): Promise<T> {
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