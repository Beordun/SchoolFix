// app/api/reset/route.ts
// SchoolFix Password Reset Request Endpoint with Rate Limiting

import { NextRequest, NextResponse } from 'next/server';
import argon2 from 'argon2';
import { prisma } from '@/lib/prisma';
import { ResetRequestSchema } from '@/lib/security/validation';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { revokeAllUserSessions, clearSessionCookie } from '@/lib/security/session';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check (3 reset requests per minute)
    const rateLimit = checkRateLimit(req, 'reset', { maxRequests: 3, windowMs: 60000 });
    if (rateLimit.isLimited) {
      return NextResponse.json(
        {
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: `Too many password reset requests from this IP. Please wait ${rateLimit.resetSeconds} seconds.`,
          retryAfter: rateLimit.resetSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.resetSeconds.toString(),
          },
        }
      );
    }

    const body = await req.json();

    // 2. Check if this is a Password Reset Execution (with newPassword)
    if (body.newPassword) {
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const newPassword = typeof body.newPassword === 'string' ? body.newPassword.trim() : '';

      if (!email || !newPassword || newPassword.length < 8) {
        return NextResponse.json(
          {
            success: false,
            error: 'INVALID_RESET_PAYLOAD',
            message: 'Valid email and new password (minimum 8 characters) are required.',
          },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'USER_NOT_FOUND', message: 'Account not found.' },
          { status: 404 }
        );
      }

      // Hash with Argon2id
      const newHash = await argon2.hash(newPassword, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });

      // Update password hash
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });

      // INVIOLABLE SECURITY REQUIREMENT:
      // Password reset kills EVERYTHING. Wipe all existing sessions across all browsers/devices.
      const revokedCount = await revokeAllUserSessions(user.id);

      console.log(`[Password Reset Success]: User ${user.email} updated password. Revoked ${revokedCount} active sessions.`);

      const response = NextResponse.json(
        {
          success: true,
          message: 'Password reset successful. All active sessions across all devices have been terminated.',
          revokedSessions: revokedCount,
        },
        { status: 200 }
      );

      clearSessionCookie(response);
      return response;
    }

    // 3. Password Reset Request Flow (Dispatch instructions)
    const validationResult = ResetRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_FAILED',
          issues: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      console.log(`[Password Reset]: Initiated reset flow for user ${user.id} (${user.email})`);
    } else {
      console.log(`[Password Reset]: Account ${email} not found. Simulated dispatch.`);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'If an account exists for this email address, password reset instructions have been dispatched.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API Reset Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'SERVER_ERROR',
        message: 'Failed to process password reset request.',
      },
      { status: 500 }
    );
  }
}
