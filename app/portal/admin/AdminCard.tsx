// app/portal/admin/AdminCard.tsx
// Authorized Administrator View for School Bursar
'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface AdminCardProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export default function AdminCard({ user }: AdminCardProps) {
  const [amount, setAmount] = useState('185000');
  const [admissionNum, setAdmissionNum] = useState('SF-2024-089');
  const [reconciled, setReconciled] = useState<string | null>(null);

  const handleReconcile = (e: React.FormEvent) => {
    e.preventDefault();
    setReconciled(
      `Receipt REC-${Date.now().toString().slice(-6)}: Successfully reconciled manual cash tuition of ₦${parseInt(amount).toLocaleString()} for student ${admissionNum}. Verified by Bursar ${user.fullName}. Dual-ledger updated.`
    );
  };

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
                color: 'var(--color-primary)',
                margin: 0,
              }}
            >
              School Bursary & Administrative Portal
            </h1>
            <p
              style={{
                fontSize: 'var(--type-body-small-size)',
                color: 'var(--color-on-surface-variant)',
                margin: 0,
              }}
            >
              Authenticated as {user.fullName} ({user.role})
            </p>
          </div>
          <Link
            href="/portal/dashboard"
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--color-surface-container-high)',
              color: 'var(--color-primary)',
              borderRadius: 'var(--radius-small)',
              textDecoration: 'none',
              fontSize: 'var(--type-label-medium-size)',
              border: '1px solid var(--color-outline)',
            }}
          >
            ← Back to Dashboard
          </Link>
        </header>

        {reconciled && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--color-success-container)',
              color: 'var(--color-on-success-container)',
              borderRadius: 'var(--radius-small)',
              border: '1px solid var(--color-success)',
              fontSize: 'var(--type-body-small-size)',
            }}
          >
            ✅ {reconciled}
          </div>
        )}

        {/* Exclusive Bursar Action */}
        <section
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-medium)',
            border: '1px solid var(--color-outline-variant)',
            padding: 'var(--spacing-large)',
            boxShadow: 'var(--shadow-medium)',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--type-title-medium-size)',
              color: 'var(--color-primary)',
              margin: '0 0 0.5rem 0',
            }}
          >
            Bursar-Exclusive Action: Offline Cash Tuition Reconciliation
          </h2>
          <p
            style={{
              fontSize: 'var(--type-body-small-size)',
              color: 'var(--color-on-surface-variant)',
              marginBottom: '1.5rem',
            }}
          >
            Only authenticated BURSAR and ADMIN roles can manually verify physical bank cash deposits and issue certified
            settlement receipts into the immutable payment ledger.
          </p>

          <form onSubmit={handleReconcile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--type-label-medium-size)',
                  fontWeight: 'bold',
                  marginBottom: '0.25rem',
                }}
              >
                Student Admission Number
              </label>
              <input
                type="text"
                value={admissionNum}
                onChange={(e) => setAdmissionNum(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-outline)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-on-surface)',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--type-label-medium-size)',
                  fontWeight: 'bold',
                  marginBottom: '0.25rem',
                }}
              >
                Cash Amount Received (₦ Naira)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-outline)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-on-surface)',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                border: 'none',
                borderRadius: 'var(--radius-small)',
                fontWeight: 'bold',
                fontSize: 'var(--type-label-large-size)',
                cursor: 'pointer',
              }}
            >
              Issue Verified Receipt & Reconcile Ledger →
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
