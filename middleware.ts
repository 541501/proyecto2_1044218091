/**
 * middleware.ts
 *
 * Middleware para proteger rutas y redireccionar según autenticación
 */

import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";

/**
 * Rutas públicas que no requieren autenticación
 */
const publicRoutes = ["/login", "/registro"];

/**
 * Rutas que requieren autenticación
 */
const protectedRoutes = ["/dashboard", "/admin", "/reservas"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Obtener sesión
  const session = await auth();

  // Si está en ruta pública pero está autenticado, redireccionar a dashboard
  if (publicRoutes.includes(pathname) && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Si está en ruta protegida pero no está autenticado, redireccionar a login
  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !session
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|.*\\..*|public).*)"],
};
