// app/portal/dashboard/page.tsx
// SchoolFix Main Application Dashboard (Server Component)
// Strictly checks cryptographic session and enforces role isolation

import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/security/session';
import DashboardClient from './DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const rawToken = sessionCookie?.value || '';

  const session = rawToken ? await validateSession(rawToken) : null;

  if (!session) {
    redirect('/auth?mode=login');
  }

  return (
    <DashboardClient
      user={session.user}
      sessionId={session.id}
      expiresAt={session.expiresAt.toISOString()}
    />
  );
}
