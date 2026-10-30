// middleware.ts
// SchoolFix Authentication & Authorization Middleware
// Intercepts protected portal routes, validates session cookie presence,
// and enforces security headers across requests.

import { NextRequest, NextResponse } from 'next/server';

export const SESSION_COOKIE_NAME = 'schoolfix_session';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Intercept protected portal routes
  if (pathname.startsWith('/portal')) {
    const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);
    const token = sessionCookie?.value;

    // Unauthenticated access attempt: Redirect to login
    if (!token || token.trim() === '') {
      const loginUrl = new URL('/auth', req.url);
      loginUrl.searchParams.set('mode', 'login');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Attach verified session token to downstream request headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-schoolfix-session-token', token);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Enforce strict security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/portal/:path*'],
};
