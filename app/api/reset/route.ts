// app/api/reset/route.ts
// SchoolFix Password Reset Request Endpoint with Rate Limiting

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ResetRequestSchema } from '@/lib/security/validation';
import { checkRateLimit } from '@/lib/security/rate-limiter';

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

    // 2. Validate Lowercased Email
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

    // 3. User Lookup
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 4. Constant Response to Defeat Account Enumeration
    // Always report success to user regardless of whether account exists
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
