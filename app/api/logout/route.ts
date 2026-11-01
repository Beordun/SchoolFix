// app/api/logout/route.ts
// SchoolFix Server-Side Logout Endpoint
// Atomically destroys session row in PostgreSQL and sends cookie clearing header

import { NextRequest, NextResponse } from 'next/server';
import { revokeSession, clearSessionCookie, SESSION_COOKIE_NAME } from '@/lib/security/session';

export async function POST(req: NextRequest) {
  try {
    const rawToken = req.cookies.get(SESSION_COOKIE_NAME)?.value || '';

    // 1. Invalidate and delete the session in PostgreSQL
    if (rawToken) {
      await revokeSession(rawToken);
    }

    // 2. Check if this is a standard HTML form submission or browser request
    const contentType = req.headers.get('content-type') || '';
    const acceptHeader = req.headers.get('accept') || '';
    const isBrowserForm =
      contentType.includes('application/x-www-form-urlencoded') ||
      acceptHeader.includes('text/html');

    if (isBrowserForm) {
      const response = NextResponse.redirect(new URL('/', req.url), 303);
      clearSessionCookie(response);
      return response;
    }

    // 3. API JSON response for fetch callers
    const response = NextResponse.json(
      {
        success: true,
        message: 'Session successfully revoked on server. Cookie cleared.',
        redirectUrl: '/',
      },
      { status: 200 }
    );

    clearSessionCookie(response);
    return response;
  } catch (error: any) {
    console.error('[API Logout Error]:', error);
    // On unexpected error, defensive fallback clears client cookie and redirects to homepage
    const response = NextResponse.redirect(new URL('/', req.url), 303);
    clearSessionCookie(response);
    return response;
  }
}

export async function GET(req: NextRequest) {
  try {
    const rawToken = req.cookies.get(SESSION_COOKIE_NAME)?.value || '';
    if (rawToken) {
      await revokeSession(rawToken).catch(() => {});
    }
  } finally {
    const response = NextResponse.redirect(new URL('/', req.url), 303);
    clearSessionCookie(response);
    return response;
  }
}
