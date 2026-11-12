// app/api/teacher/scores/route.ts
// SchoolFix Continuous Assessment & Exam Scoring API
// Enforces 40/60 split, decimal precision, deterministic letter grades, and RBAC isolation

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/security/session';
import { canAccessClassArm, findOutOfScopeStudentIds } from '@/lib/security/rbac';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const ScoreEntrySchema = z.object({
  studentId: z.string().min(1),
  caScore: z.number().min(0).max(40, 'CA score cannot exceed 40.00 marks'),
  examScore: z.number().min(0).max(60, 'Exam score cannot exceed 60.00 marks'),
});

const BatchScoresSchema = z.object({
  classArmId: z.string().min(1),
  subject: z.string().min(1),
  term: z.string().min(1),
  entries: z.array(ScoreEntrySchema).min(1),
});

function calculateGrade(total: number): string {
  if (total >= 70.0) return 'A';
  if (total >= 60.0) return 'B';
  if (total >= 50.0) return 'C';
  if (total >= 40.0) return 'D';
  return 'F';
}

export async function GET(req: NextRequest) {
  try {
    const rawToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = rawToken ? await validateSession(rawToken) : null;

    if (!session) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'FORBIDDEN' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const classArmId = searchParams.get('classArmId');
    const subject = searchParams.get('subject') || 'Mathematics';
    const term = searchParams.get('term') || 'First Term';

    if (!classArmId) {
      return NextResponse.json({ success: false, error: 'MISSING_CLASS_ARM_ID' }, { status: 400 });
    }

    // RBAC Isolation (fail-closed): teachers may only read their assigned arms.
    const allowed = await canAccessClassArm(session.user.id, session.user.role, classArmId);
    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'FORBIDDEN_CLASS_ARM',
          message: 'You are not assigned to this class arm.',
        },
        { status: 403 }
      );
    }

    const students = await prisma.student.findMany({
      where: { classArmId },
      orderBy: { fullName: 'asc' },
      include: {
        assessments: {
          where: { subject, term },
          take: 1,
        },
      },
    });

    const payload = students.map((s) => {
      const assessment = s.assessments[0];
      const ca = assessment ? Number(assessment.caScore) : 0;
      const exam = assessment ? Number(assessment.examScore) : 0;
      const total = assessment ? Number(assessment.totalScore) : 0;
      const grade = assessment ? assessment.grade : 'F';

      return {
        studentId: s.id,
        fullName: s.fullName,
        admissionNum: s.admissionNum,
        caScore: ca,
        examScore: exam,
        totalScore: total,
        grade,
        isSaved: Boolean(assessment),
      };
    });

    return NextResponse.json({
      success: true,
      classArmId,
      subject,
      term,
      students: payload,
    });
  } catch (error: any) {
    console.error('Scores GET error:', error);
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = rawToken ? await validateSession(rawToken) : null;

    if (!session) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'FORBIDDEN' }, { status: 403 });
    }

    const body = await req.json();
    const validation = BatchScoresSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'VALIDATION_FAILED', issues: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { classArmId, subject, term, entries } = validation.data;

    // RBAC check (fail-closed)
    const allowed = await canAccessClassArm(session.user.id, session.user.role, classArmId);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'FORBIDDEN_CLASS_ARM', message: 'You are not assigned to this class arm.' },
        { status: 403 }
      );
    }

    // Student-scope check: a teacher must not write scores for another class's pupils
    const outOfScope = await findOutOfScopeStudentIds(
      classArmId,
      entries.map((entry) => entry.studentId)
    );

    if (outOfScope.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'STUDENTS_OUTSIDE_CLASS_ARM',
          message: `${outOfScope.length} submitted student record(s) do not belong to this class arm.`,
          studentIds: outOfScope,
        },
        { status: 403 }
      );
    }

    // Upsert each assessment in an atomic transaction
    await prisma.$transaction(
      entries.map((entry) => {
        const total = Number((entry.caScore + entry.examScore).toFixed(2));
        const grade = calculateGrade(total);

        return prisma.assessment.upsert({
          where: {
            studentId_subject_term: {
              studentId: entry.studentId,
              subject,
              term,
            },
          },
          update: {
            caScore: new Prisma.Decimal(entry.caScore.toFixed(2)),
            examScore: new Prisma.Decimal(entry.examScore.toFixed(2)),
            totalScore: new Prisma.Decimal(total.toFixed(2)),
            grade,
            classArmId,
          },
          create: {
            studentId: entry.studentId,
            classArmId,
            subject,
            term,
            caScore: new Prisma.Decimal(entry.caScore.toFixed(2)),
            examScore: new Prisma.Decimal(entry.examScore.toFixed(2)),
            totalScore: new Prisma.Decimal(total.toFixed(2)),
            grade,
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized assessment scores for ${entries.length} students.`,
      count: entries.length,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Scores POST error:', error);
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: error.message },
      { status: 500 }
    );
  }
}
