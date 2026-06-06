import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { rateLimit } from "./middleware/rateLimit";

const isProduction = process.env.NODE_ENV === "production";

const protectedPaths = [
  "/dashboard",
  "/editor",
  "/users",
  "/blogs",
  "/projects",
  "/legal-documents",
  "/scheduled",
];

const sessionCookieName = isProduction
  ? "__Secure-next-auth.session-token"
  : "next-auth.session-token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const response = await rateLimit(request);
    if (response) {
      return response;
    }
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET!,
    cookieName: sessionCookieName,
    secureCookie: isProduction,
  });

  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/login")) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (!token && isProtected) {
    const callbackUrl = encodeURIComponent(request.url);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
