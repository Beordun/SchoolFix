// app/api/verify/route.ts
// SchoolFix Email Verification Endpoint — Supporting 3 Mandatory Failure States

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { VerifyOtpSchema } from '@/lib/security/validation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Validate OTP format (6 numeric digits + lowercased email)
    const validationResult = VerifyOtpSchema.safeParse(body);
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

    const { email, code } = validationResult.data;

    // 2. Fetch User Record
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'Account not found.',
        },
        { status: 404 }
      );
    }

    // 3. FAILURE CASE 3: CODE REUSED / ALREADY VERIFIED
    if (user.isVerified) {
      return NextResponse.json(
        {
          success: false,
          error: 'CODE_ALREADY_USED',
          message: 'This account has already been verified. Verification codes cannot be reused.',
        },
        { status: 409 }
      );
    }

    // 4. FAILURE CASE 1: EXPIRED CODE
    if (user.codeExpiresAt && new Date() > user.codeExpiresAt) {
      return NextResponse.json(
        {
          success: false,
          error: 'EXPIRED_CODE',
          message: 'Your 6-digit confirmation code has expired (10-minute window). Please request a new code.',
        },
        { status: 410 } // HTTP 410 Gone
      );
    }

    // 5. FAILURE CASE 2: WRONG CODE
    if (!user.verificationCode || user.verificationCode !== code) {
      return NextResponse.json(
        {
          success: false,
          error: 'WRONG_CODE',
          message: 'The confirmation code you entered is incorrect. Please check your email and try again.',
        },
        { status: 400 }
      );
    }

    // 6. SUCCESSFUL VERIFICATION STATE TRANSITION
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null, // Wipe OTP after successful consumption
        codeExpiresAt: null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        isVerified: true,
      },
    });

    console.log(`[HTTP 200 OK] User ${updatedUser.email} successfully verified.`);

    return NextResponse.json(
      {
        success: true,
        message: 'Account successfully confirmed. You now have full access to student records.',
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API Verify Error]:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'SERVER_ERROR',
        message: 'Internal error processing verification code.',
      },
      { status: 500 }
    );
  }
}
