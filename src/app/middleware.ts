import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { rateLimit } from '@/middleware/rateLimit';

const isProduction = process.env.NODE_ENV === "production";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/')) {
    return rateLimit(request);
  }

  console.log("Middleware - Environment:", process.env.NODE_ENV);
  console.log("Middleware - NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
  console.log("Middleware - Request URL:", request.url);

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET!,
    cookieName: isProduction 
      ? "__Secure-next-auth.session-token" 
      : "next-auth.session-token",
    secureCookie: isProduction
  });

  console.log("Middleware - Token exists:", !!token);

  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  const protectedPaths = ["/dashboard", "/editor", "/users", "/blogs", "/projects"];

  if (!token && protectedPaths.some(path => pathname.startsWith(path))) {
    const callbackUrl = encodeURIComponent(request.url);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, request.url));
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