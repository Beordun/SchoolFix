// app/portal/teacher/page.tsx
// SchoolFix Teacher Portal (Server Component)
// Enforces cryptographic session authentication and RBAC authorization with Copied-Link protection

import React from 'react';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/security/session';
import { prisma } from '@/lib/prisma';
import TeacherDashboardClient from './TeacherDashboardClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Teacher Cockpit & Attendance Register',
  description: 'Mobile-first attendance marking, continuous assessment gradebook, and terminal remarks.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default async function TeacherPortalPage() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const rawToken = sessionCookie?.value || '';

  // 1. Authentication Check
  const session = rawToken ? await validateSession(rawToken) : null;
  if (!session) {
    redirect('/auth?mode=login&redirect=/portal/teacher');
  }

  const { user } = session;
  const isAuthorized = user.role === 'TEACHER' || user.role === 'ADMIN';

  // 2. Authorization Check (Copied-Link Defense)
  // If an ordinary PARENT visits the teacher route:
  if (!isAuthorized) {
    return (
      <main
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--color-surface, #F9F9FC)',
          color: 'var(--color-on-surface, #1A1A24)',
          padding: 'var(--spacing-medium, 1rem)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--type-font-family, sans-serif)',
        }}
      >
        <div
          style={{
            maxWidth: '36rem',
            width: '100%',
            backgroundColor: 'var(--color-surface-container-lowest, #FFFFFF)',
            borderRadius: 'var(--radius-medium, 0.75rem)',
            border: '2px solid var(--color-error, #BA1A1A)',
            boxShadow: 'var(--shadow-hard, 0 8px 24px rgba(75, 0, 130, 0.15))',
            padding: 'var(--spacing-large, 1.5rem)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-small, 0.75rem)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', margin: 0 }}>🛑</div>
          <h1
            style={{
              fontSize: 'var(--type-headline-small-size, 1.35rem)',
              color: 'var(--color-error, #BA1A1A)',
              margin: '0 0 0.5rem 0',
              fontWeight: 800,
            }}
          >
            403 Forbidden: Teacher Portal Access Denied
          </h1>

          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-error-container, #FFDAD6)',
              color: 'var(--color-on-error-container, #410002)',
              borderRadius: 'var(--radius-small, 0.5rem)',
              fontSize: 'var(--type-body-small-size, 0.8125rem)',
              textAlign: 'left',
              lineHeight: 1.5,
            }}
          >
            <strong>Copied-Link Security Check:</strong>
            <p style={{ margin: '0.25rem 0 0 0' }}>
              You are authenticated as <strong>{user.fullName}</strong> ({user.email}), holding the role of{' '}
              <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{user.role}</span>.
            </p>
            <p style={{ margin: '0.25rem 0 0 0' }}>
              The route <code>/portal/teacher</code> is strictly restricted to <strong>TEACHER</strong> and{' '}
              <strong>ADMIN</strong> roles. Your account permits parent-level inspection of dependent pupils only.
            </p>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
            <Link
              href="/portal/dashboard"
              style={{
                padding: '0.75rem 1.25rem',
                backgroundColor: 'var(--color-primary, #4B0082)',
                color: 'var(--color-on-primary, #FFFFFF)',
                borderRadius: 'var(--radius-small, 0.5rem)',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 'var(--type-label-medium-size, 0.875rem)',
              }}
            >
              ← Return to Safe Parent Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 3. Query assigned class arms from database
  let assignedClasses: Array<{ id: string; name: string; studentCount: number }> = [];

  try {
    const dbAssignments = await prisma.teacherClassAssignment.findMany({
      where: { teacherId: user.id },
      include: {
        classArm: {
          include: {
            students: {
              select: { id: true },
            },
          },
        },
      },
    });

    assignedClasses = dbAssignments.map((a) => ({
      id: a.classArm.id,
      name: a.classArm.name,
      studentCount: a.classArm.students.length,
    }));
  } catch (err) {
    console.error('Error fetching teacher class assignments:', err);
  }

  return <TeacherDashboardClient user={user} assignedClasses={assignedClasses} />;
}
