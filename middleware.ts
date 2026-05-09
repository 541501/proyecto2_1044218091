import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes - no auth needed
  if (pathname === '/login' || pathname === '/') {
    return NextResponse.next();
  }

  // Get session cookie
  const sessionCookie = request.cookies.get('session')?.value;

  if (!sessionCookie) {
    // No session - redirect to login
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify JWT
    const verified = await jwtVerify(sessionCookie, JWT_SECRET);
    const userRole = (verified.payload as any)?.role;

    // Route protection by role
    if (pathname.startsWith('/admin/')) {
      if (userRole !== 'admin') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    if (pathname.startsWith('/reports')) {
      if (userRole !== 'coordinador' && userRole !== 'admin') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Professor: redirect /reservations to /reservations/my
    if (pathname === '/reservations' && userRole === 'profesor') {
      return NextResponse.redirect(new URL('/reservations/my', request.url));
    }

    if (pathname.startsWith('/reservations') && !pathname.startsWith('/reservations/my')) {
      if (userRole !== 'coordinador' && userRole !== 'admin') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/reservations/my', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid JWT - redirect to login
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    // Include everything except static files and api paths we want to skip
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
