import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import argon2 from 'argon2';
import { prisma } from '@/lib/prisma';

// Boundary validation schema
const RegisterSchema = z.object({
  fullName: z
    .string()
    .min(3, 'Full name must be at least 3 characters')
    .refine((val) => val.trim().split(/\s+/).length >= 2, {
      message: 'Please provide at least first and last name',
    }),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Zod Boundary Validation
    const validationResult = RegisterSchema.safeParse(body);
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

    const { fullName, email, password } = validationResult.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Argon2id Password Hashing (PRD Parameters: 64MiB, 3 iterations, 4 parallelism)
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // 3. Database Persistence via Prisma
    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        passwordHash,
        role: 'PARENT',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    console.log(`[HTTP 201 Created] New parent user registered: ID=${user.id}, Email=${user.email}, CreatedAt=${user.createdAt.toISOString()}`);

    // 4. Return explicit HTTP 201 Created
    return NextResponse.json(
      {
        success: true,
        message: 'Parent registration successfully recorded.',
        user,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API Register Error]:', error);

    // Duplicate email constraint check
    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: 'DUPLICATE_EMAIL',
          message: 'An account with this email already exists.',
        },
        { status: 409 }
      );
    }

    // Database connection / CP network partition failure
    return NextResponse.json(
      {
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Could not connect to database. Write rejected to maintain CP consistency.',
      },
      { status: 503 }
    );
  }
}
