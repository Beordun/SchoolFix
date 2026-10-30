// app/api/login/route.ts
// SchoolFix Login Endpoint — Secure Authentication with Rate Limiting & Generic Errors

import { NextRequest, NextResponse } from 'next/server';
import argon2 from 'argon2';
import { prisma } from '@/lib/prisma';
import { LoginSchema } from '@/lib/security/validation';
import { checkRateLimit } from '@/lib/security/rate-limiter';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check (5 attempts per minute)
    const rateLimit = checkRateLimit(req, 'login', { maxRequests: 5, windowMs: 60000 });
    if (rateLimit.isLimited) {
      return NextResponse.json(
        {
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: `Too many login attempts from IP (${rateLimit.clientIp}). Locked for ${rateLimit.resetSeconds} seconds.`,
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

    // 2. Schema Boundary Validation
    const validationResult = LoginSchema.safeParse(body);
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

    const { email, password } = validationResult.data;

    // 3. User Lookup by Normalized Lowercase Email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 4. Constant-Time Verification & Generic Error Handling
    // To defeat account enumeration attacks, return identical error message for missing user and wrong password
    const DUMMY_HASH = '$argon2id$v=19$m=65536,p=4,t=3$bnFP56JCLQwHYJk/Z13XNQ$Ba4McKFoyAu0tZHH/X2/XEWNYen10o6e4byloEALR8Y';
    const hashToVerify = user ? user.passwordHash : DUMMY_HASH;

    let isPasswordValid = false;
    try {
      isPasswordValid = await argon2.verify(hashToVerify, password);
    } catch {
      isPasswordValid = false;
    }

    if (!user || !isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Incorrect email or password.',
        },
        { status: 401 }
      );
    }

    // 5. Verification Check (Soft Warning per Step 3 Specification)
    const isVerified = user.isVerified;

    return NextResponse.json(
      {
        success: true,
        message: 'Authentication successful.',
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
        warning: isVerified ? undefined : 'Your email is not yet verified. Please verify your account to view tuition balances.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API Login Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'SERVER_ERROR',
        message: 'An unexpected server error occurred.',
      },
      { status: 500 }
    );
  }
}
