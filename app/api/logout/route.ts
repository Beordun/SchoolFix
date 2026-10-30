// app/api/logout/route.ts
// SchoolFix Server-Side Logout Endpoint
// Atomically destroys session row in PostgreSQL and sends cookie clearing header

import { NextRequest, NextResponse } from 'next/server';
import { revokeSession, clearSessionCookie, SESSION_COOKIE_NAME } from '@/lib/security/session';

export async function POST(req: NextRequest) {
  try {
    const rawToken = req.cookies.get(SESSION_COOKIE_NAME)?.value || '';

    if (!rawToken) {
      const response = NextResponse.json(
        {
          success: true,
          message: 'No active session token provided; cookie cleared.',
        },
        { status: 200 }
      );
      clearSessionCookie(response);
      return response;
    }

    // 1. Invalidate and delete the session in PostgreSQL
    await revokeSession(rawToken);

    // 2. Clear cookie from client browser
    const response = NextResponse.json(
      {
        success: true,
        message: 'Session successfully revoked on server. Cookie cleared.',
      },
      { status: 200 }
    );

    clearSessionCookie(response);
    return response;
  } catch (error: any) {
    console.error('[API Logout Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'SERVER_LOGOUT_FAILED',
        message: 'Failed to revoke session on server. Client state must remain active.',
      },
      { status: 500 }
    );
  }
}
