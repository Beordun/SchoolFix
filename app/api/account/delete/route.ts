// app/api/account/delete/route.ts
// SchoolFix NDPA Account Deletion Endpoint
// Implements Stage 1 (Soft Delete & Immediate Session Revocation)
// Schedules Stage 2 (7-Day Grace Period Holding Window)

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession, revokeAllUserSessions, clearSessionCookie, SESSION_COOKIE_NAME } from '@/lib/security/session';

export const GRACE_PERIOD_DAYS = 7;
export const GRACE_PERIOD_MS = GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const rawToken = req.cookies.get(SESSION_COOKIE_NAME)?.value || '';

    let session = rawToken ? await validateSession(rawToken) : null;

    // Optional: allow explicit email in body for testing/administrative triggers
    let targetUserId = session?.user.id;

    if (!targetUserId) {
      try {
        const body = await req.json();
        if (body.email) {
          const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase().trim() } });
          if (user) targetUserId = user.id;
        }
      } catch {}
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'Authentication required to initiate account erasure.' },
        { status: 401 }
      );
    }

    const now = new Date();
    const scheduledPurgeAt = new Date(now.getTime() + GRACE_PERIOD_MS);

    // 1. Stage 1: Soft Delete & Lock Account in PostgreSQL
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        deletedAt: now,
        scheduledPurgeAt,
      },
    });

    // 2. Immediate Session Revocation: Wipe all sessions across all devices
    const revokedSessions = await revokeAllUserSessions(targetUserId);

    console.log(
      `[NDPA Account Deletion]: User ${updatedUser.email} (ID: ${updatedUser.id}) scheduled for purge at ${scheduledPurgeAt.toISOString()}. Revoked ${revokedSessions} sessions.`
    );

    // 3. Clear browser cookie
    const response = NextResponse.json(
      {
        success: true,
        message: `Account successfully locked under NDPA 2023 regulations. A 7-day grace period is active until ${scheduledPurgeAt.toISOString()}.`,
        userId: updatedUser.id,
        deletedAt: updatedUser.deletedAt,
        scheduledPurgeAt: updatedUser.scheduledPurgeAt,
        revokedSessions,
      },
      { status: 200 }
    );

    clearSessionCookie(response);
    return response;
  } catch (error: any) {
    console.error('[API Deletion Error]:', error);
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: 'Failed to initiate account deletion.' },
      { status: 500 }
    );
  }
}
