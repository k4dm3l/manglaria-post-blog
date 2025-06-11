import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from './middleware/rateLimit';

export async function middleware(request: NextRequest) {
  // Only apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = await rateLimit(request);
    if (response) {
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}; 