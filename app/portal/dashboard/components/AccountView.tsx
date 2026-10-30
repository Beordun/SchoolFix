// app/portal/dashboard/components/AccountView.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChildProfile } from '../types';

interface AccountViewProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
  sessionId: string;
  expiresAt: string;
  childrenList: ChildProfile[];
  onOpenChildModal: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
  onInitiateDeletion: () => void;
  isDeleting: boolean;
}

export default function AccountView({
  user,
  sessionId,
  expiresAt,
  childrenList,
  onOpenChildModal,
  onLogout,
  isLoggingOut,
  onInitiateDeletion,
  isDeleting,
}: AccountViewProps) {
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  const toggleAccordion = (section: string) => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-medium)' }}>
      {/* Account Profile Header (P05) */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-large)',
          border: '1px solid var(--color-outline-variant)',
          padding: 'var(--spacing-medium)',
          boxShadow: 'var(--shadow-soft)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        <div
          className="type-title-large"
          style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-primary-container)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
          }}
        >
          {user.fullName.split(' ').map((n) => n[0]).join('')}
        </div>
        <div style={{ flex: 1 }}>
          <h1
            className="type-headline-large"
            style={{
              margin: 0,
              color: 'var(--color-primary)',
            }}
          >
            {user.fullName}
          </h1>
          <div className="type-body-small" style={{ color: 'var(--color-on-surface-variant)' }}>
            {user.email} • Role: <strong>{user.role}</strong>
          </div>
          <div style={{ marginTop: '0.25rem' }}>
            <span
              className="type-label-small"
              style={{
                backgroundColor: user.isVerified
                  ? 'var(--color-success-container)'
                  : 'var(--color-warning-container)',
                color: user.isVerified
                  ? 'var(--color-on-success-container)'
                  : 'var(--color-on-warning-container)',
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 'bold',
              }}
            >
              {user.isVerified ? 'Verified Account' : 'Pending Verification'}
            </span>
          </div>
        </div>
      </div>

      {/* Account Navigation / Management Accordions */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-large)',
          border: '1px solid var(--color-outline-variant)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        {/* Item 1: Linked Children */}
        <div style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
          <button
            onClick={() => toggleAccordion('children')}
            style={{
              width: '100%',
              minHeight: 'var(--size-touch-target)',
              padding: 'var(--spacing-medium)',
              backgroundColor: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: 'var(--type-title-medium-size)' }}>👨‍👧‍👦</span>�‍👦</span>
              <div>
                <strong className="type-title-small" style={{ display: 'block' }}>
                  Linked Children
                </strong>
                <span className="type-label-small" style={{ color: 'var(--color-on-surface-variant)' }}>
                  {childrenList.length} dependent student profiles
                </span>
              </div>
            </div>
            <span className="type-label-small">{activeAccordion === 'children' ? '▲' : '▼'}</span>
          </button>
          {activeAccordion === 'children' && (
            <div
              style={{
                padding: 'var(--spacing-medium)',
                backgroundColor: 'var(--color-surface-container-low)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              {childrenList.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-small)',
                  }}
                >
                  <div>
                    <strong className="type-body-small">{c.fullName}</strong>
                    <div className="type-label-small" style={{ color: 'var(--color-on-surface-variant)' }}>
                      {c.classArm} • {c.admissionNum}
                    </div>
                  </div>
                  <span className="type-label-small" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                    Active
                  </span>
                </div>
              ))}
              <button
                onClick={onOpenChildModal}
                className="type-label-medium"
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-small)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Manage & Link More Children →
              </button>
            </div>
          )}
        </div>

        {/* Item 2: School Information */}
        <div style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
          <button
            onClick={() => toggleAccordion('school')}
            style={{
              width: '100%',
              minHeight: 'var(--size-touch-target)',
              padding: 'var(--spacing-medium)',
              backgroundColor: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🏫</span>
              <div>
                <strong className="type-title-small" style={{ display: 'block' }}>
                  School Information
                </strong>
                <span className="type-label-small" style={{ color: 'var(--color-on-surface-variant)' }}>
                  Administration contacts and school location
                </span>
              </div>
            </div>
            <span className="type-label-small">{activeAccordion === 'school' ? '▲' : '▼'}</span>
          </button>
          {activeAccordion === 'school' && (
            <div
              className="type-body-small"
              style={{
                padding: 'var(--spacing-medium)',
                backgroundColor: 'var(--color-surface-container-low)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.375rem',
              }}
            >
              <div>Institution: <strong>SchoolFix Demonstration Academy</strong></div>
              <div>Location: <strong>Victoria Island / Lekki Corridor, Lagos State</strong></div>
              <div>Bursary Office: <strong>bursar@schoolfix.ng</strong></div>
              <div>Support Phone: <strong>+234 (0) 800 724 6653</strong></div>
            </div>
          )}
        </div>

        {/* Item 3: School Policies (PRD Reference) */}
        <div style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
          <button
            onClick={() => toggleAccordion('policies')}
            style={{
              width: '100%',
              minHeight: 'var(--size-touch-target)',
              padding: 'var(--spacing-medium)',
              backgroundColor: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>📖</span>
              <div>
                <strong className="type-title-small" style={{ display: 'block' }}>
                  School Policies & Grading
                </strong>
                <span className="type-label-small" style={{ color: 'var(--color-on-surface-variant)' }}>
                  Tuition reconciliation rules & academic split
                </span>
              </div>
            </div>
            <span className="type-label-small">{activeAccordion === 'policies' ? '▲' : '▼'}</span>
          </button>
          {activeAccordion === 'policies' && (
            <div
              className="type-body-small"
              style={{
                padding: 'var(--spacing-medium)',
                backgroundColor: 'var(--color-surface-container-low)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div>
                <strong>Academic Grading Standard:</strong> Continuous Assessment is weighted at 40.00 marks maximum; Terminal Examination is weighted at 60.00 marks maximum (PRD §4.3). Grades: 70–100% (A Distinction), 60–69.99% (B Credit), 50–59.99% (C Merit), 40–49.99% (D Pass), below 40% (F Fail).
              </div>
              <div>
                <strong>Tuition Clearance Gate:</strong> Report cards are hard-gated if balance &gt; ₦0.00. Electronic payments incur a 1.2% gateway fee (capped at ₦1,500). Direct manual bank transfers incur 0% gateway fee.
              </div>
            </div>
          )}
        </div>

        {/* Item 4: Security & Active Sessions */}
        <div style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
          <button
            onClick={() => toggleAccordion('security')}
            style={{
              width: '100%',
              minHeight: 'var(--size-touch-target)',
              padding: 'var(--spacing-medium)',
              backgroundColor: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🔒</span>
              <div>
                <strong className="type-title-small" style={{ display: 'block' }}>
                  Security & Session Tokens
                </strong>
                <span className="type-label-small" style={{ color: 'var(--color-on-surface-variant)' }}>
                  SHA-256 session digests & HttpOnly cookie isolation
                </span>
              </div>
            </div>
            <span className="type-label-small">{activeAccordion === 'security' ? '▲' : '▼'}</span>
          </button>
          {activeAccordion === 'security' && (
            <div
              className="type-body-small"
              style={{
                padding: 'var(--spacing-medium)',
                backgroundColor: 'var(--color-surface-container-low)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div>Active Session ID: <strong style={{ fontFamily: 'monospace' }}>{sessionId}</strong></div>
              <div>Session Valid Until: <strong>{new Date(expiresAt).toLocaleDateString()}</strong></div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Link
                  href="/portal/session-inspector"
                  className="type-label-medium"
                  style={{
                    padding: '0.5rem 0.875rem',
                    backgroundColor: 'var(--color-primary-container)',
                    color: 'var(--color-on-primary-container)',
                    borderRadius: 'var(--radius-small)',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                  }}
                >
                  Inspect Cookie Diagnostics →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Item 5: NDPA 2023 Account Erasure Rights */}
        <div>
          <button
            onClick={() => toggleAccordion('ndpa')}
            style={{
              width: '100%',
              minHeight: 'var(--size-touch-target)',
              padding: 'var(--spacing-medium)',
              backgroundColor: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.25rem' }}>⚖️</span>
              <div>
                <strong className="type-title-small" style={{ display: 'block', color: 'var(--color-error)' }}>
                  NDPA 2023 Account Erasure Rights
                </strong>
                <span className="type-label-small" style={{ color: 'var(--color-on-surface-variant)' }}>
                  Request account deletion under 7-day grace period
                </span>
              </div>
            </div>
            <span className="type-label-small">{activeAccordion === 'ndpa' ? '▲' : '▼'}</span>
          </button>
          {activeAccordion === 'ndpa' && (
            <div
              className="type-body-small"
              style={{
                padding: 'var(--spacing-medium)',
                backgroundColor: 'var(--color-surface-container-low)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <p style={{ margin: 0 }}>
                Under NDPA 2023 § 34 regulations, requesting account erasure locks your account immediately and initiates a 7-day grace period. After 7 days, a scheduled purge transaction permanently anonymizes personal records while retaining immutable financial ledgers under CAMA § 374 legal tax mandates.
              </p>
              <button
                onClick={onInitiateDeletion}
                disabled={isDeleting}
                className="type-label-medium"
                style={{
                  alignSelf: 'flex-start',
                  minHeight: 'var(--size-touch-target)',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  color: 'var(--color-error)',
                  border: '1px solid var(--color-error)',
                  borderRadius: 'var(--radius-small)',
                  fontWeight: 'bold',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                }}
              >
                {isDeleting ? 'Scheduling Purge...' : 'Request 7-Day Account Erasure'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Sign Out Button */}
      <button
        onClick={onLogout}
        disabled={isLoggingOut}
        className="type-label-large"
        style={{
          width: '100%',
          minHeight: 'var(--size-touch-target)',
          padding: 'var(--spacing-small) var(--spacing-medium)',
          backgroundColor: 'transparent',
          color: 'var(--color-error)',
          border: '1px solid var(--color-error)',
          borderRadius: 'var(--radius-medium)',
          fontWeight: 'bold',
          cursor: isLoggingOut ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoggingOut ? 'Invalidating Cryptographic Session...' : 'Sign Out of Parent Portal'}
      </button>
    </div>
  );
}
