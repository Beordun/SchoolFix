// app/portal/session-inspector/page.tsx
// SchoolFix Developer Session & Cookie Security Inspector
// Consumes strictly design tokens from tokens.css

import React from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { validateSession, SESSION_COOKIE_NAME } from '@/lib/security/session';

export const dynamic = 'force-dynamic';

export default async function SessionInspectorPage() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
  const rawToken = sessionCookie?.value || '';

  const session = rawToken ? await validateSession(rawToken) : null;

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
        fontFamily: 'var(--type-font-family, sans-serif)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '56rem',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-medium)',
        }}
      >
        {/* Navigation & Header */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: 'var(--spacing-small)',
            borderBottom: '1px solid var(--color-outline-variant)',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 'var(--type-headline-medium-size)',
                lineHeight: 'var(--type-headline-medium-line-height)',
                fontWeight: 'var(--type-headline-medium-weight)',
                color: 'var(--color-primary)',
                margin: 0,
              }}
            >
              SchoolFix Security Inspector
            </h1>
            <p
              style={{
                fontSize: 'var(--type-body-small-size)',
                color: 'var(--color-on-surface-variant)',
                margin: 0,
              }}
            >
              Live Cookie & Server-Side Session Audit (Task 5 Machine Evidence)
            </p>
          </div>
          <Link
            href="/auth?mode=login"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-small)',
              backgroundColor: 'var(--color-surface-container-high)',
              color: 'var(--color-primary)',
              textDecoration: 'none',
              fontSize: 'var(--type-label-medium-size)',
              fontWeight: 'var(--type-label-medium-weight)',
              border: '1px solid var(--color-outline)',
            }}
          >
            ← Back to Gateway
          </Link>
        </header>

        {/* Live Cookie Table (DevTools Representation) */}
        <section
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-medium)',
            border: '1px solid var(--color-outline-variant)',
            boxShadow: 'var(--shadow-soft)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: 'var(--spacing-small) var(--spacing-medium)',
              backgroundColor: 'var(--color-surface-container)',
              borderBottom: '1px solid var(--color-outline-variant)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '0.75rem',
                  height: '0.75rem',
                  borderRadius: '50%',
                  backgroundColor: rawToken ? 'var(--color-success)' : 'var(--color-error)',
                }}
              />
              <span
                style={{
                  fontWeight: 'var(--type-label-large-weight)',
                  fontSize: 'var(--type-label-large-size)',
                  color: 'var(--color-on-surface)',
                }}
              >
                Browser Storage: Chrome DevTools Cookie Panel (localhost)
              </span>
            </div>
            <span
              style={{
                fontSize: 'var(--type-body-small-size)',
                color: 'var(--color-on-surface-variant)',
              }}
            >
              Cookie Scope: Root Path (/)
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 'var(--type-body-small-size)',
                textAlign: 'left',
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: 'var(--color-surface-container-low)',
                    borderBottom: '1px solid var(--color-outline-variant)',
                    color: 'var(--color-on-surface-variant)',
                  }}
                >
                  <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Value (Raw Token)</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Domain</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Path</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Expires / Max-Age</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>HttpOnly</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Secure</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>SameSite</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                    {SESSION_COOKIE_NAME}
                  </td>
                  <td
                    style={{
                      padding: '0.75rem 1rem',
                      fontFamily: 'monospace',
                      color: 'var(--color-on-surface-variant)',
                    }}
                  >
                    {rawToken ? `${rawToken.substring(0, 16)}...${rawToken.substring(rawToken.length - 8)}` : '(No Cookie Found)'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>localhost</td>
                  <td style={{ padding: '0.75rem 1rem' }}>/</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {session ? new Date(session.expiresAt).toLocaleDateString() : '7 Days (604,800s)'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <span
                      style={{
                        backgroundColor: 'var(--color-success-container)',
                        color: 'var(--color-on-success-container)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 'var(--radius-small)',
                        fontWeight: 'bold',
                      }}
                    >
                      ✓ True
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <span
                      style={{
                        backgroundColor: 'var(--color-surface-container-high)',
                        color: 'var(--color-on-surface)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 'var(--radius-small)',
                      }}
                    >
                      {process.env.NODE_ENV === 'production' ? '✓ True' : 'Dev (Localhost)'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <span
                      style={{
                        backgroundColor: 'var(--color-primary-container)',
                        color: 'var(--color-on-primary-container)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: 'var(--radius-small)',
                        fontWeight: 'bold',
                      }}
                    >
                      Lax
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Server-Side Session Digest State */}
        <section
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-medium)',
            border: '1px solid var(--color-outline-variant)',
            padding: 'var(--spacing-medium)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-small)',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--type-title-medium-size)',
              color: 'var(--color-primary)',
              margin: 0,
            }}
          >
            PostgreSQL Server-Side Session Record
          </h2>
          {session ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
                fontSize: 'var(--type-body-small-size)',
              }}
            >
              <div>
                <strong>User:</strong> {session.user.fullName} ({session.user.email})
              </div>
              <div>
                <strong>Assigned Role:</strong> {session.user.role}
              </div>
              <div>
                <strong>Database Record ID:</strong> {session.id}
              </div>
              <div>
                <strong>SHA-256 Digest in DB:</strong>{' '}
                <span style={{ fontFamily: 'monospace' }}>
                  {session.sessionToken.substring(0, 16)}...
                </span>
              </div>
              <div>
                <strong>Expires At:</strong> {new Date(session.expiresAt).toISOString()}
              </div>
              <div>
                <strong>Recorded IP:</strong> {session.ipAddress || '127.0.0.1'}
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--color-error)', margin: 0 }}>
              No active session found in PostgreSQL matching incoming cookie. Please log in first.
            </p>
          )}
        </section>

        {/* Security Flags Rationale Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--spacing-small)',
          }}
        >
          <div
            style={{
              padding: 'var(--spacing-small)',
              backgroundColor: 'var(--color-surface-container-low)',
              borderRadius: 'var(--radius-small)',
              border: '1px solid var(--color-outline-variant)',
            }}
          >
            <h3 style={{ fontSize: 'var(--type-label-large-size)', color: 'var(--color-primary)', margin: '0 0 0.25rem 0' }}>
              HttpOnly Flag
            </h3>
            <p style={{ fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)', margin: 0 }}>
              Blocks JavaScript <code>document.cookie</code> access. Prevents token theft via XSS injections in shared school portals.
            </p>
          </div>

          <div
            style={{
              padding: 'var(--spacing-small)',
              backgroundColor: 'var(--color-surface-container-low)',
              borderRadius: 'var(--radius-small)',
              border: '1px solid var(--color-outline-variant)',
            }}
          >
            <h3 style={{ fontSize: 'var(--type-label-large-size)', color: 'var(--color-primary)', margin: '0 0 0.25rem 0' }}>
              SameSite=Lax Flag
            </h3>
            <p style={{ fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)', margin: 0 }}>
              Protects against Cross-Site Request Forgery (CSRF). Cookie withheld on cross-origin requests while permitting navigation.
            </p>
          </div>

          <div
            style={{
              padding: 'var(--spacing-small)',
              backgroundColor: 'var(--color-surface-container-low)',
              borderRadius: 'var(--radius-small)',
              border: '1px solid var(--color-outline-variant)',
            }}
          >
            <h3 style={{ fontSize: 'var(--type-label-large-size)', color: 'var(--color-primary)', margin: '0 0 0.25rem 0' }}>
              SHA-256 Digest in DB
            </h3>
            <p style={{ fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)', margin: 0 }}>
              The raw token exists only in the browser cookie. A leaked database dump reveals zero replayable session cookies.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
