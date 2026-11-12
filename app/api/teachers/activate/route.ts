// app/api/teachers/activate/route.ts
// SchoolFix Teacher Account Activation — Non-Repudiation Enforced
//
// A teacher account can only be activated from an administrator-issued invite
// (see /api/teachers/invite). This route:
//   1. Requires a matching unverified TEACHER placeholder (no open self-signup).
//   2. Verifies the 6-digit setup code in constant time against its SHA-256 digest.
//   3. Enforces the 72-hour window and single use (atomic conditional update).
//   4. Takes identity and class-arm assignment from the server, never the client.
//   5. Hashes the teacher's privately chosen password with Argon2id.

import { NextRequest, NextResponse } from 'next/server';
import argon2 from 'argon2';
import { prisma } from '@/lib/prisma';
import { TeacherActivationSchema } from '@/lib/security/validation';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { checkBreachedPassword } from '@/lib/security/pwned';
import { createSession, attachSessionCookie } from '@/lib/security/session';
import { normalizeSetupCode, verifySetupCode } from '@/lib/security/invite';

const ACTIVATION_RATE_LIMIT = { maxRequests: 10, windowMs: 60_000 };

/**
 * One message for "no such invite", "wrong code" and "expired code".
 * A distinct response per branch would turn the activation screen into an
 * email/code oracle, so the failure surface is deliberately indistinguishable.
 */
function invalidInviteResponse() {
  return NextResponse.json(
    {
      success: false,
      error: 'INVALID_OR_EXPIRED_INVITE',
      message:
        'This setup code is invalid or has expired. Ask your school administrator to issue a new invitation.',
    },
    { status: 400 }
  );
}

function inactiveInviteResponse() {
  return NextResponse.json(
    {
      success: false,
      error: 'INVITE_NOT_ACTIVE',
      message:
        'This invitation has already been used or is no longer active. Sign in with your password, or ask your administrator for a new invitation.',
    },
    { status: 409 }
  );
}

export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting (10 attempts / minute / IP)
    const rateLimit = checkRateLimit(req, 'teacher-activate', ACTIVATION_RATE_LIMIT);
    if (rateLimit.isLimited) {
      return NextResponse.json(
        {
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: `Too many activation attempts. Please retry in ${rateLimit.resetSeconds} seconds.`,
          retryAfter: rateLimit.resetSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.resetSeconds.toString(),
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const body = await req.json();

    // 2. Boundary validation
    const validation = TeacherActivationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_FAILED',
          message: 'The submitted teacher activation details failed validation.',
          issues: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { code, email, password } = validation.data;
    const setupCode = normalizeSetupCode(code);

    // 3. Resolve the invitation (by email, then verify the code)
    const invited = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        fullName: true,
        role: true,
        isVerified: true,
        verificationCode: true,
        codeExpiresAt: true,
        deletedAt: true,
      },
    });

    if (!invited || invited.deletedAt) {
      return invalidInviteResponse();
    }

    if (invited.role !== 'TEACHER') {
      // A parent/administrator email must never be promoted through this screen.
      return invalidInviteResponse();
    }

    if (invited.isVerified) {
      return inactiveInviteResponse();
    }

    if (!invited.verificationCode || !invited.codeExpiresAt) {
      return inactiveInviteResponse();
    }

    if (invited.codeExpiresAt.getTime() <= Date.now()) {
      // Expired invites are cleaned up so the stale digest cannot linger.
      await prisma.user
        .update({
          where: { id: invited.id },
          data: { verificationCode: null, codeExpiresAt: null },
        })
        .catch(() => {});
      return invalidInviteResponse();
    }

    if (!verifySetupCode(setupCode, invited.verificationCode)) {
      // Deliberately does not reveal whether the code or the email was wrong.
      return invalidInviteResponse();
    }

    // 4. Breached-password check (k-Anonymity) before any expensive hashing
    const breachCheck = await checkBreachedPassword(password);
    if (breachCheck.isPwned) {
      return NextResponse.json(
        {
          success: false,
          error: 'PASSWORD_BREACHED',
          message: `This password has appeared in ${breachCheck.breachCount.toLocaleString()} known public data breaches and cannot be used for classroom ledger security. Please choose a unique password.`,
        },
        { status: 400 }
      );
    }

    // 5. Memory-hard Argon2id hashing (64 MiB, 3 iterations, 4 lanes)
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // 6. Atomic single-use consumption.
    // The conditional updateMany guarantees that two concurrent requests holding
    // the same code cannot both activate: only one row still matches the digest.
    const consumed = await prisma.user.updateMany({
      where: {
        id: invited.id,
        isVerified: false,
        verificationCode: invited.verificationCode,
        codeExpiresAt: { gt: new Date() },
      },
      data: {
        passwordHash,
        isVerified: true,
        verificationCode: null,
        codeExpiresAt: null,
      },
    });

    if (consumed.count !== 1) {
      return inactiveInviteResponse();
    }

    // 7. Class arm is whatever the administrator assigned — never client input.
    const assignment = await prisma.teacherClassAssignment.findFirst({
      where: { teacherId: invited.id },
      select: { classArm: { select: { id: true, name: true } } },
    });

    // 8. Establish the cryptographic session
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown User-Agent';

    const session = await createSession(invited.id, clientIp, userAgent);

    const response = NextResponse.json(
      {
        success: true,
        message: `Welcome, ${invited.fullName}! Your teacher account has been successfully activated.`,
        user: {
          id: invited.id,
          fullName: invited.fullName,
          email,
          role: 'TEACHER',
          assignedClassArm: assignment?.classArm.name || null,
        },
        redirectUrl: '/portal/teacher',
      },
      { status: 200 }
    );

    attachSessionCookie(response, session.rawToken, session.expiresAt);

    return response;
  } catch (error: any) {
    console.error('Teacher activation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'SERVER_ERROR',
        message: 'An unexpected error occurred during account activation.',
      },
      { status: 500 }
    );
  }
}
