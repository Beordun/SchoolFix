// app/portal/admin/page.tsx
// SchoolFix Protected Administrative Route — Strict Role-Based Access Control (RBAC)
// Demonstrates Authentication vs Authorization separation and the Copied-Link Test

import React from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/security/session';
import AdminCard from './AdminCard';

export const dynamic = 'force-dynamic';

export default async function AdminPortalPage() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const rawToken = sessionCookie?.value || '';

  // 1. Authentication Check (Are you logged in?)
  const session = rawToken ? await validateSession(rawToken) : null;
  if (!session) {
    redirect('/auth?mode=login&redirect=/portal/admin');
  }

  const { user } = session;
  const isAuthorized = user.role === 'ADMIN' || user.role === 'BURSAR';

  // 2. Authorization Check (Do you possess the required permissions?)
  // If an ordinary PARENT or TEACHER copies the link into their browser:
  if (!isAuthorized) {
    return (
      <main
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-on-surface)',
          padding: 'var(--spacing-medium)',
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
            backgroundColor: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-medium)',
            border: '2px solid var(--color-error)',
            boxShadow: 'var(--shadow-hard)',
            padding: 'var(--spacing-large)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-small)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', margin: 0 }}>🛑</div>
          <h1
            style={{
              fontSize: 'var(--type-headline-small-size)',
              color: 'var(--color-error)',
              margin: '0 0 0.5rem 0',
              fontWeight: 700,
            }}
          >
            403 Forbidden: Administrative Access Denied
          </h1>

          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--color-error-container)',
              color: 'var(--color-on-error-container)',
              borderRadius: 'var(--radius-small)',
              fontSize: 'var(--type-body-small-size)',
              textAlign: 'left',
              lineHeight: 1.5,
            }}
          >
            <strong>Copied-Link Security Check Triggered:</strong>
            <p style={{ margin: '0.25rem 0 0 0' }}>
              You are authenticated as <strong>{user.fullName}</strong> ({user.email}), holding the role of{' '}
              <span style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{user.role}</span>.
            </p>
            <p style={{ margin: '0.25rem 0 0 0' }}>
              The route <code>/portal/admin</code> is strictly restricted to <strong>BURSAR</strong> and{' '}
              <strong>ADMIN</strong> roles. Your account permits parent-level student inspection only.
            </p>
          </div>

          <div
            style={{
              fontSize: 'var(--type-body-small-size)',
              color: 'var(--color-on-surface-variant)',
              marginTop: '0.5rem',
            }}
          >
            <em>
              "If you see the administrative dashboard after copying this link, your route checks authentication and not
              authorization."
            </em>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <Link
              href="/portal/dashboard"
              style={{
                padding: '0.75rem 1.25rem',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                borderRadius: 'var(--radius-small)',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: 'var(--type-label-medium-size)',
              }}
            >
              ← Return to Safe Parent Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // 3. Authorized View: Bursar & Admin Management Portal
  return <AdminCard user={user} />;
}
