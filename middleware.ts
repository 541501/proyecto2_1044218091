/**
 * middleware.ts
 *
 * Middleware para proteger rutas y redireccionar segun autenticacion.
 */

import { NextResponse, type NextRequest } from 'next/server';

const publicRoutes = ['/login', '/registro'];
const protectedRoutes = ['/dashboard', '/admin', '/reservas'];
const sessionCookieNames = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
];

function hasSessionCookie(request: NextRequest) {
  return sessionCookieNames.some((cookieName) =>
    Boolean(request.cookies.get(cookieName)?.value)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = hasSessionCookie(request);

  if (publicRoutes.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (
    protectedRoutes.some((route) => pathname.startsWith(route)) &&
    !isAuthenticated
  ) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|.*\\..*|public).*)'],
};
