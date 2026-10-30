// app/portal/dashboard/DashboardClient.tsx
// Interactive Dashboard Component consuming strictly tokens.css variables
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DashboardClientProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
  sessionId: string;
  expiresAt: string;
}

export default function DashboardClient({ user, sessionId, expiresAt }: DashboardClientProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState<string | null>(null);

  // Server-enforced logout with network failure edge-case handling (Step 4)
  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      const res = await fetch('/api/logout', {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}: Failed to invalidate session on database.`);
      }

      // Successful server-side revocation: navigate to login
      router.push('/auth?mode=login');
    } catch (err: any) {
      console.error('[Logout Network Failure]:', err);
      // EDGE CASE DEFECT PREVENTION:
      // Do NOT pretend the user is logged out if the server failed to delete the session!
      setIsLoggingOut(false);
      setLogoutError(
        'Network error during logout: Server could not be reached to invalidate your session. You remain securely authenticated on this terminal. Retry when network is restored.'
      );
    }
  };

  // NDPA Soft-Delete Initiation (Step 6)
  const handleInitiateDeletion = async () => {
    const confirmDelete = window.confirm(
      'NDPA Compliance Notice:\n\nUnder NDPA 2023 regulations, requesting account deletion locks your account immediately and initiates a 7-day grace period. During this period, your data remains intact for recovery. After 7 days, a scheduled purge transaction permanently anonymizes your personal records while retaining immutable payment ledgers for legal tax compliance.\n\nProceed with 7-day deletion lock?'
    );

    if (!confirmDelete) return;

    setIsDeleting(true);
    setDeletionStatus(null);

    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
      });

      const data = await res.json();
      if (res.ok) {
        setDeletionStatus(
          `Account locked under NDPA 7-day grace period. Scheduled purge at: ${new Date(data.scheduledPurgeAt).toLocaleDateString()}. All active sessions revoked.`
        );
        setTimeout(() => {
          router.push('/auth?mode=login');
        }, 3000);
      } else {
        setDeletionStatus(`Deletion error: ${data.message || 'Operation failed'}`);
      }
    } catch (err: any) {
      setDeletionStatus(`Network error: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
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
        {/* Top Navigation */}
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: 'var(--spacing-small)',
            borderBottom: '1px solid var(--color-outline-variant)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: 'var(--radius-small)',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '1.25rem',
              }}
            >
              SF
            </div>
            <div>
              <h1
                style={{
                  fontSize: 'var(--type-title-large-size)',
                  fontWeight: 'var(--type-title-large-weight)',
                  color: 'var(--color-primary)',
                  margin: 0,
                }}
              >
                SchoolFix Portal
              </h1>
              <p
                style={{
                  fontSize: 'var(--type-body-small-size)',
                  color: 'var(--color-on-surface-variant)',
                  margin: 0,
                }}
              >
                Mobile-First Attendance & Tuition Reconciliation
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Link
              href="/portal/session-inspector"
              style={{
                padding: '0.5rem 0.875rem',
                fontSize: 'var(--type-label-small-size)',
                backgroundColor: 'var(--color-surface-container-high)',
                color: 'var(--color-primary)',
                borderRadius: 'var(--radius-small)',
                textDecoration: 'none',
                border: '1px solid var(--color-outline)',
                fontWeight: 'bold',
              }}
            >
              🔍 Cookie Inspector
            </Link>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              style={{
                padding: '0.5rem 1rem',
                fontSize: 'var(--type-label-small-size)',
                fontWeight: 'var(--type-label-large-weight)',
                backgroundColor: 'var(--color-error)',
                color: 'var(--color-on-error)',
                borderRadius: 'var(--radius-small)',
                border: 'none',
                cursor: isLoggingOut ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoggingOut ? 'Invalidating...' : 'Log Out'}
            </button>
          </div>
        </header>

        {/* Logout Failure Edge-Case Alert */}
        {logoutError && (
          <div
            style={{
              padding: 'var(--spacing-small)',
              backgroundColor: 'var(--color-error-container)',
              color: 'var(--color-on-error-container)',
              borderRadius: 'var(--radius-small)',
              border: '1px solid var(--color-error)',
              fontSize: 'var(--type-body-small-size)',
            }}
          >
            <strong>⚠️ Logout Synchronization Error:</strong> {logoutError}
          </div>
        )}

        {/* Soft Gating Warning Banner (Step 2 Implementation) */}
        {!user.isVerified && (
          <div
            style={{
              padding: 'var(--spacing-medium)',
              backgroundColor: 'var(--color-secondary-container)',
              color: 'var(--color-on-secondary-container)',
              borderRadius: 'var(--radius-medium)',
              border: '1px solid var(--color-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.25rem' }}>⚠️</span>
              <strong style={{ fontSize: 'var(--type-title-small-size)' }}>
                Account Unverified (Soft Gating Mode Active)
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: 'var(--type-body-small-size)', lineHeight: 1.5 }}>
              Welcome to SchoolFix! You are currently authenticated under our <strong>Soft Gating</strong> onboarding policy.
              You have immediate access to view fee schedules and school calendar dates. However, electronic tuition payments,
              terminal Continuous Assessment (CA) report cards, and attendance registers remain <strong>gated and locked</strong> until your email address is verified.
            </p>
            <div style={{ marginTop: '0.25rem' }}>
              <Link
                href={`/auth?mode=verify&email=${encodeURIComponent(user.email)}`}
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  borderRadius: 'var(--radius-small)',
                  fontSize: 'var(--type-label-medium-size)',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                }}
              >
                Complete 6-Digit Email Verification →
              </Link>
            </div>
          </div>
        )}

        {/* Verified Account Confirmation */}
        {user.isVerified && (
          <div
            style={{
              padding: 'var(--spacing-small) var(--spacing-medium)',
              backgroundColor: 'var(--color-success-container)',
              color: 'var(--color-on-success-container)',
              borderRadius: 'var(--radius-small)',
              fontSize: 'var(--type-body-small-size)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>✅</span>
            <span>
              <strong>Verified School Account:</strong> All parental clearance, terminal report cards, and fee reconciliation features are fully accessible.
            </span>
          </div>
        )}

        {/* Deletion Status Notice */}
        {deletionStatus && (
          <div
            style={{
              padding: 'var(--spacing-small)',
              backgroundColor: 'var(--color-primary-container)',
              color: 'var(--color-on-primary-container)',
              borderRadius: 'var(--radius-small)',
              fontSize: 'var(--type-body-small-size)',
            }}
          >
            {deletionStatus}
          </div>
        )}

        {/* User Identity & Active Session Card */}
        <section
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-medium)',
            border: '1px solid var(--color-outline-variant)',
            padding: 'var(--spacing-medium)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-small)',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--type-title-medium-size)',
              color: 'var(--color-primary)',
              margin: 0,
            }}
          >
            Authenticated Account Profile
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              fontSize: 'var(--type-body-small-size)',
            }}
          >
            <div>
              <strong>Full Name:</strong> {user.fullName}
            </div>
            <div>
              <strong>Registered Email:</strong> {user.email}
            </div>
            <div>
              <strong>Portal Role:</strong>{' '}
              <span
                style={{
                  backgroundColor: 'var(--color-surface-container-high)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-small)',
                  fontWeight: 'bold',
                }}
              >
                {user.role}
              </span>
            </div>
            <div>
              <strong>Verification Status:</strong> {user.isVerified ? 'Verified' : 'Pending Verification'}
            </div>
            <div>
              <strong>Active Session ID:</strong>{' '}
              <span style={{ fontFamily: 'monospace' }}>{sessionId}</span>
            </div>
            <div>
              <strong>Session Expiry:</strong> {new Date(expiresAt).toLocaleDateString()}
            </div>
          </div>
        </section>

        {/* Student Dependent Profile & Tuition Fee Schedule */}
        <section
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-medium)',
            border: '1px solid var(--color-outline-variant)',
            padding: 'var(--spacing-medium)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-small)',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--type-title-medium-size)',
              color: 'var(--color-primary)',
              margin: 0,
            }}
          >
            Dependent Student Records (2026/2027 Academic Year)
          </h2>
          <div
            style={{
              border: '1px solid var(--color-outline-variant)',
              borderRadius: 'var(--radius-small)',
              padding: 'var(--spacing-small)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--color-surface-container-low)',
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold' }}>Chinedu Alabi</div>
              <div style={{ fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)' }}>
                Class: JSS 2 Diamond • Admission No: SF-2024-089
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>₦185,000 / Term</div>
              <div
                style={{
                  fontSize: 'var(--type-label-small-size)',
                  color: user.isVerified ? 'var(--color-success)' : 'var(--color-error)',
                }}
              >
                {user.isVerified ? 'Tuition Reconciled: ₦0.00 Balance' : '🔒 Clearance Gated (Unverified)'}
              </div>
            </div>
          </div>
        </section>

        {/* Administrative Protected Route Access Test (Step 10) */}
        <section
          style={{
            backgroundColor: 'var(--color-surface-container-low)',
            borderRadius: 'var(--radius-medium)',
            border: '1px solid var(--color-outline-variant)',
            padding: 'var(--spacing-medium)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: 'var(--type-title-small-size)' }}>
              Administrative Portal (RBAC Enforcement)
            </h3>
            <p style={{ margin: 0, fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)' }}>
              Reserved strictly for School Administrators and Bursars. Tests copied-link route protection.
            </p>
          </div>
          <Link
            href="/portal/admin"
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: 'var(--color-primary-container)',
              color: 'var(--color-on-primary-container)',
              borderRadius: 'var(--radius-small)',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: 'var(--type-label-medium-size)',
            }}
          >
            Attempt Access to /portal/admin →
          </Link>
        </section>

        {/* NDPA Account Deletion Controls (Step 6) */}
        <section
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-medium)',
            border: '1px solid var(--color-outline-variant)',
            padding: 'var(--spacing-medium)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: 'var(--type-title-small-size)', color: 'var(--color-error)' }}>
              NDPA 2023 Account Erasure Rights
            </h3>
            <p style={{ margin: 0, fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)' }}>
              Requesting erasure locks your account for a 7-day grace period, followed by automated background anonymization.
            </p>
          </div>
          <button
            onClick={handleInitiateDeletion}
            disabled={isDeleting}
            style={{
              padding: '0.625rem 1.25rem',
              backgroundColor: 'transparent',
              color: 'var(--color-error)',
              border: '1px solid var(--color-error)',
              borderRadius: 'var(--radius-small)',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: 'var(--type-label-medium-size)',
            }}
          >
            {isDeleting ? 'Scheduling Lock...' : 'Request Account Deletion (7-Day Lock)'}
          </button>
        </section>
      </div>
    </div>
  );
}
