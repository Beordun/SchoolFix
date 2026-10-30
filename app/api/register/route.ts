// app/api/register/route.ts
// SchoolFix Parent Registration Route — Hardened Server Boundary Implementation

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import argon2 from 'argon2';
import { prisma } from '@/lib/prisma';
import { RegisterSchema } from '@/lib/security/validation';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { checkBreachedPassword } from '@/lib/security/pwned';
import {
  generateVerificationOtp,
  getOtpExpiration,
  emailQueue,
  sendVerificationEmailSync,
} from '@/lib/security/email-worker';

export async function POST(req: NextRequest) {
  const reqStart = Date.now();

  try {
    // 1. Rate Limiting Check (5 attempts / minute per IP)
    const rateLimit = checkRateLimit(req, 'register', { maxRequests: 5, windowMs: 60000 });
    if (rateLimit.isLimited) {
      return NextResponse.json(
        {
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: `Too many registration attempts from this IP address (${rateLimit.clientIp}). Please retry in ${rateLimit.resetSeconds} seconds.`,
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

    // 2. Zod Schema Boundary Validation
    // Replaces raw body with parsed, trimmed, and normalized data
    const validationResult = RegisterSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_FAILED',
          message: 'The submitted registration data failed server boundary validation.',
          issues: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { fullName, email, password, phone, nin } = validationResult.data;

    // 3. Breached Password Check (k-Anonymity via HaveIBeenPwned API)
    const breachCheck = await checkBreachedPassword(password);
    if (breachCheck.isPwned) {
      return NextResponse.json(
        {
          success: false,
          error: 'PASSWORD_BREACHED',
          message: `This password has appeared in ${breachCheck.breachCount.toLocaleString()} known public data breaches and cannot be used. Please choose a different, unique password.`,
        },
        { status: 400 }
      );
    }

    // 4. Memory-Hard Argon2id Password Hashing (RFC 9106)
    // Parameters: 65,536 KiB (64 MiB), 3 iterations, 4 parallelism
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // 5. Cryptographic Verification OTP Generation (CSPRNG)
    const verificationCode = generateVerificationOtp();
    const codeExpiresAt = getOtpExpiration();

    // 6. Database Persistence
    const fallbackNin = nin || `NIN-${crypto.randomBytes(6).toString('hex')}`;

    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: email, // Already lowercased & trimmed by Zod schema
        passwordHash,
        nin: fallbackNin,
        role: 'PARENT',
        isVerified: false,
        verificationCode,
        codeExpiresAt,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isVerified: true,
        verificationCode: true,
        codeExpiresAt: true,
        createdAt: true,
      },
    });

    // 7. Verification Email Dispatch (Sync vs Background Job)
    const isSyncMode = req.nextUrl.searchParams.get('mode') === 'sync';
    let syncDurationMs = 0;

    const emailJob = {
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
      code: verificationCode,
      expiresAt: codeExpiresAt,
    };

    if (isSyncMode) {
      // Blocking synchronous dispatch (for Step 10 performance comparison)
      syncDurationMs = await sendVerificationEmailSync(emailJob);
    } else {
      // Asynchronous background queue worker (standard production flow)
      emailQueue.enqueue(emailJob);
    }

    const totalDurationMs = Date.now() - reqStart;

    console.log(
      `[HTTP 201 Created] New user: ID=${user.id}, Email=${user.email}, Duration=${totalDurationMs}ms (Mode=${isSyncMode ? 'SYNC' : 'ASYNC_JOB'})`
    );

    // 8. Return explicit HTTP 201 Created
    return NextResponse.json(
      {
        success: true,
        message: 'Registration successful. Please verify your email with the 6-digit confirmation code.',
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
        telemetry: {
          totalDurationMs,
          emailMode: isSyncMode ? 'synchronous' : 'background_job',
          syncDurationMs,
        },
      },
      {
        status: 201,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error: any) {
    console.error('[API Register Error]:', error);

    // Unique email constraint collision
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: 'DUPLICATE_EMAIL',
          message: 'An account with this email address already exists.',
        },
        { status: 409 }
      );
    }

    // CP Partition / Database Unavailable
    return NextResponse.json(
      {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Database unavailable. Write rejected to maintain CP consistency.',
      },
      { status: 503 }
    );
  }
}
