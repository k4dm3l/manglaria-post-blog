import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuthenticated = !!req.auth;
  const { pathname } = req.nextUrl;

  // Permitir acceso público a la API de autenticación
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // Redirigir usuarios autenticados que intentan acceder al login
  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/editor", req.url));
  }

  // Proteger rutas bajo /editor
  if (pathname.startsWith("/editor") && !isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.delete("error"); // Limpiar parámetros de error
    return NextResponse.redirect(loginUrl);
  }

  // Proteger rutas de edición específicas
  if (pathname.match(/^\/editor\/(blog|projects)\/[^/]+$/) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/editor/:path*",
    "/login",
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ], 
};