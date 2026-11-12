// app/api/teachers/invite/route.ts
// SchoolFix Teacher Invitation Endpoint — Administrator-Initiated Only
//
// Enforces AGENTS.md §4.7:
//   1. No open teacher self-registration and no admin-assigned passwords.
//   2. A single-use, 72-hour setup code is generated with a CSPRNG and stored
//      only as a SHA-256 digest (frozen schema: User.verificationCode).
//   3. The administrator receives a WhatsApp-ready message plus a 6-digit code
//      that can be handed over on paper for low-connectivity teachers.

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/security/session';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { TeacherInviteSchema } from '@/lib/security/validation';
import {
  INVITE_TTL_MS,
  buildInviteLink,
  buildUnusablePasswordHash,
  buildWhatsAppText,
  generateSetupCode,
  hashSetupCode,
  inviteExpiryFrom,
  normalizeSetupCode,
} from '@/lib/security/invite';

const INVITE_RATE_LIMIT = { maxRequests: 10, windowMs: 60_000 };

function appOrigin(req: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (configured) return configured.replace(/\/+$/, '');

  // Derive from the request so the link works on the machine that issued it.
  const forwardedHost = req.headers.get('x-forwarded-host');
  const forwardedProto = req.headers.get('x-forwarded-proto');
  if (forwardedHost) {
    return `${forwardedProto || 'https'}://${forwardedHost}`;
  }

  return req.nextUrl.origin;
}

export async function POST(req: NextRequest) {
  try {
    const rateLimit = checkRateLimit(req, 'teacher-invite', INVITE_RATE_LIMIT);
    if (rateLimit.isLimited) {
      return NextResponse.json(
        {
          success: false,
          error: 'RATE_LIMIT_EXCEEDED',
          message: `Too many invitation attempts. Please retry in ${rateLimit.resetSeconds} seconds.`,
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

    // 1. Authentication
    const rawToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = rawToken ? await validateSession(rawToken) : null;

    if (!session) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    // 2. Authorization — only the school administrator may create staff identities
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: 'FORBIDDEN',
          message: 'Only the school administrator can invite teachers.',
        },
        { status: 403 }
      );
    }

    // 3. Boundary validation
    const body = await req.json();
    const validation = TeacherInviteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_FAILED',
          message: 'The teacher invitation details failed validation.',
          issues: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { fullName, email, phone, classArmName } = validation.data;

    // 4. Identity collision checks — an invite must never hijack a live account
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing && existing.role !== 'TEACHER') {
      return NextResponse.json(
        {
          success: false,
          error: 'EMAIL_IN_USE',
          message: 'This email already belongs to a parent or administrator account. Use a distinct staff email address.',
        },
        { status: 409 }
      );
    }

    if (existing && existing.isVerified) {
      return NextResponse.json(
        {
          success: false,
          error: 'ALREADY_ACTIVE',
          message: 'This teacher account is already active. Re-sending an invite would overwrite a private credential, which non-repudiation forbids.',
        },
        { status: 409 }
      );
    }

    // 5. Mint the secret. The raw code lives only in this response.
    const setupCode = generateSetupCode();
    const codeHash = hashSetupCode(setupCode);
    const expiresAt = inviteExpiryFrom();
    const passwordHash = await buildUnusablePasswordHash();
    const fallbackNin = `NIN-TEA-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const assignedClassArm = classArmName?.trim() || null;

    const result = await prisma.$transaction(async (tx) => {
      // 6a. Create or refresh the unverified staff placeholder.
      const teacher = existing
        ? await tx.user.update({
            where: { id: existing.id },
            data: {
              fullName: fullName.trim(),
              role: 'TEACHER',
              isVerified: false,
              verificationCode: codeHash,
              codeExpiresAt: expiresAt,
              passwordHash,
            },
            select: { id: true, fullName: true, email: true },
          })
        : await tx.user.create({
            data: {
              fullName: fullName.trim(),
              email,
              nin: fallbackNin,
              passwordHash,
              role: 'TEACHER',
              isVerified: false,
              verificationCode: codeHash,
              codeExpiresAt: expiresAt,
            },
            select: { id: true, fullName: true, email: true },
          });

      // 6b. Class arm assignment is server-authoritative (the teacher never picks it).
      let classArm: { id: string; name: string } | null = null;

      if (assignedClassArm) {
        classArm =
          (await tx.classArm.findFirst({
            where: { name: assignedClassArm },
            select: { id: true, name: true },
          })) ||
          (await tx.classArm.create({
            data: { name: assignedClassArm },
            select: { id: true, name: true },
          }));

        await tx.teacherClassAssignment.upsert({
          where: {
            teacherId_classArmId: {
              teacherId: teacher.id,
              classArmId: classArm.id,
            },
          },
          update: {},
          create: {
            teacherId: teacher.id,
            classArmId: classArm.id,
          },
        });
      }

      return { teacher, classArm };
    });

    // 7. Delivery artefacts for the administrator
    const inviteLink = buildInviteLink(appOrigin(req), setupCode);
    const whatsappText = buildWhatsAppText({
      teacherName: result.teacher.fullName,
      classArmName: result.classArm?.name || null,
      inviteLink,
      setupCode,
      expiresAt,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Invitation created for ${result.teacher.fullName}. The setup code expires in 72 hours.`,
        teacher: {
          id: result.teacher.id,
          fullName: result.teacher.fullName,
          email: result.teacher.email,
          classArm: result.classArm?.name || null,
        },
        setupCode: normalizeSetupCode(setupCode),
        expiresAt: expiresAt.toISOString(),
        ttlHours: INVITE_TTL_MS / 3_600_000,
        inviteLink,
        whatsappText,
        // Phone is not persisted: the frozen User model has no phone column.
        // It is echoed back so the administrator can confirm the delivery target.
        deliveryPhone: phone,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Teacher invite error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'SERVER_ERROR',
        message: 'An unexpected error occurred while creating the invitation.',
      },
      { status: 500 }
    );
  }
}
