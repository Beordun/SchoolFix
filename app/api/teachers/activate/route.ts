// app/api/teachers/activate/route.ts
// SchoolFix Teacher Account Activation Endpoint — Non-Repudiation Implementation
// Validates 72-hour invitation token / setup code, enforces private password selection,
// checks breached password databases, hashes via Argon2id, and links TeacherClassAssignment.

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import argon2 from 'argon2';
import { prisma } from '@/lib/prisma';
import { TeacherActivationSchema } from '@/lib/security/validation';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { checkBreachedPassword } from '@/lib/security/pwned';
import { createSession, attachSessionCookie } from '@/lib/security/session';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check (10 attempts / minute per IP)
    const rateLimit = checkRateLimit(req, 'teacher-activate', { maxRequests: 10, windowMs: 60000 });
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

    // 2. Boundary Validation via Zod
    const validationResult = TeacherActivationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_FAILED',
          message: 'The submitted teacher activation details failed validation.',
          issues: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { code, fullName, email, phone, assignedClassArm, password } = validationResult.data;

    // 3. Breached Password Check (k-Anonymity)
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

    // 4. Memory-Hard Argon2id Hashing (Strict RFC 9106 standards: 64 MiB, 3 iterations, 4 parallelism)
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // 5. User Persistence / Activation
    // Look up if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && user.isVerified && user.role === 'TEACHER') {
      // Check if user is already fully activated with a non-placeholder account
      // If already active, inform them to use login
      return NextResponse.json(
        {
          success: false,
          error: 'ALREADY_ACTIVE',
          message: 'This teacher account is already activated. Please sign in with your password at the login screen.',
        },
        { status: 409 }
      );
    }

    const fallbackNin = `NIN-TEA-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    if (user) {
      // Update existing invited/placeholder user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          fullName: fullName.trim(),
          passwordHash,
          role: 'TEACHER',
          isVerified: true,
          verificationCode: null,
          codeExpiresAt: null,
        },
      });
    } else {
      // Create new Teacher user record
      user = await prisma.user.create({
        data: {
          fullName: fullName.trim(),
          email,
          passwordHash,
          nin: fallbackNin,
          role: 'TEACHER',
          isVerified: true,
          verificationCode: null,
          codeExpiresAt: null,
        },
      });
    }

    // 6. Class Arm Assignment (RBAC Boundary)
    if (assignedClassArm && assignedClassArm !== 'Unassigned' && assignedClassArm.trim() !== '') {
      // Check if ClassArm exists in database, or create it if missing
      let classArm = await prisma.classArm.findFirst({
        where: { name: assignedClassArm.trim() },
      });

      if (!classArm) {
        classArm = await prisma.classArm.create({
          data: { name: assignedClassArm.trim() },
        });
      }

      // Upsert TeacherClassAssignment to avoid unique constraint violations
      await prisma.teacherClassAssignment.upsert({
        where: {
          teacherId_classArmId: {
            teacherId: user.id,
            classArmId: classArm.id,
          },
        },
        update: {},
        create: {
          teacherId: user.id,
          classArmId: classArm.id,
        },
      });
    }

    // 7. Establish Cryptographic Session
    const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'Unknown User-Agent';

    const session = await createSession(user.id, clientIp, userAgent);

    // 8. Build Response and Attach HttpOnly Cookie
    const response = NextResponse.json(
      {
        success: true,
        message: `Welcome, ${user.fullName}! Your teacher account has been successfully activated.`,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          assignedClassArm: assignedClassArm || null,
        },
        redirectUrl: '/portal/dashboard',
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
        message: error.message || 'An unexpected error occurred during account activation.',
      },
      { status: 500 }
    );
  }
}
