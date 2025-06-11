import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { rateLimit } from '@/middleware/rateLimit';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    return rateLimit(request);
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET!,
    cookieName: 
      process.env.NODE_ENV === "production" 
        ? "__Secure-next-auth.session-token" 
        : "next-auth.session-token"
  });

  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  const protectedPaths = ["/dashboard", "/editor", "/users", "/blogs", "/projects"];

  if (!token && protectedPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL(`/login?from=${pathname}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};