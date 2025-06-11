import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory store for rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute

export async function rateLimit(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 
             request.headers.get('x-real-ip') ?? 
             '127.0.0.1';
  const key = `rate-limit:${ip}`;
  const now = Date.now();

  try {
    const current = rateLimitStore.get(key);
    
    if (!current || now > current.resetTime) {
      // First request or window expired
      rateLimitStore.set(key, { count: 1, resetTime: now + WINDOW_SIZE });
      return null;
    }

    if (current.count >= MAX_REQUESTS) {
      return new NextResponse(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Please try again later',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }

    // Increment request count
    current.count++;
    rateLimitStore.set(key, current);
    return null;
  } catch (error) {
    console.error('Rate limit error:', error);
    return null; // Fail open - allow the request if there's an error
  }
} 