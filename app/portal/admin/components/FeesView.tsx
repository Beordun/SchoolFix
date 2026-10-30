// app/portal/admin/components/FeesView.tsx
// SchoolFix Administrator Fee Schedules & Tuition Management
'use client';

import React, { useState } from 'react';

interface FeeItem {
  id: string;
  section: string;
  coreTuition: number;
  devLevy: number;
  booksAndUniform: number;
  totalPerStudent: number;
  expectedTotal: number;
  collectedTotal: number;
}

export default function FeesView() {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [feeSchedules, setFeeSchedules] = useState<FeeItem[]>([
    {
      id: 'FEE-NUR',
      section: 'Nursery Section (Creche to KG 2)',
      coreTuition: 120000,
      devLevy: 10000,
      booksAndUniform: 10000,
      totalPerStudent: 140000,
      expectedTotal: 3080000,
      collectedTotal: 2520000,
    },
    {
      id: 'FEE-PRI',
      section: 'Primary Section (Primary 1 to 6)',
      coreTuition: 150000,
      devLevy: 20000,
      booksAndUniform: 15000,
      totalPerStudent: 185000,
      expectedTotal: 10915000,
      collectedTotal: 8325000,
    },
    {
      id: 'FEE-JSS',
      section: 'Junior Secondary (JSS 1 to 3)',
      coreTuition: 180000,
      devLevy: 25000,
      booksAndUniform: 30000,
      totalPerStudent: 235000,
      expectedTotal: 6345000,
      collectedTotal: 4465000,
    },
    {
      id: 'FEE-SSS',
      section: 'Senior Secondary (SSS 1 to 3)',
      coreTuition: 210000,
      devLevy: 30000,
      booksAndUniform: 15000,
      totalPerStudent: 255000,
      expectedTotal: 5210000,
      collectedTotal: 3090000,
    },
  ]);

  const totalExpected = feeSchedules.reduce((acc, f) => acc + f.expectedTotal, 0);
  const totalCollected = feeSchedules.reduce((acc, f) => acc + f.collectedTotal, 0);
  const totalOutstanding = totalExpected - totalCollected;
  const collectionPercentage = Math.round((totalCollected / totalExpected) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-3)' }}>
        <div>
          <h1
            style={{
              fontSize: 'var(--type-headline-small-size)',
              lineHeight: 'var(--type-headline-small-line-height)',
              fontWeight: 700,
              margin: 0,
              color: 'var(--color-primary)',
            }}
          >
            Fee Schedules &amp; Tuition Tariffs
          </h1>
          <p style={{ margin: 'var(--spacing-1) 0 0 0', fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)' }}>
            Configured for <strong>2026/2027 · First Term</strong> · Strict CP balance calculations enforced
          </p>
        </div>

        <button
          onClick={() => setShowConfigModal(true)}
          style={{
            padding: 'var(--spacing-2) var(--spacing-4)',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            border: 'none',
            borderRadius: 'var(--radius-small)',
            fontWeight: 700,
            fontSize: 'var(--type-label-medium-size)',
            cursor: 'pointer',
            minHeight: 'var(--size-touch-target)',
          }}
        >
          + Configure Fee Schedule
        </button>
      </div>

      {/* Financial Health Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
          gap: 'var(--spacing-4)',
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            padding: 'var(--spacing-4)',
            borderRadius: 'var(--radius-medium)',
            border: '1px solid var(--color-outline-variant)',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <span style={{ fontSize: 'var(--type-label-small-size)', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
            TOTAL EXPECTED TUITION
          </span>
          <div style={{ fontSize: 'var(--type-headline-small-size)', fontWeight: 800, color: 'var(--color-primary)', marginTop: '0.25rem' }}>
            ₦{totalExpected.toLocaleString()}
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            padding: 'var(--spacing-4)',
            borderRadius: 'var(--radius-medium)',
            border: '1px solid var(--color-outline-variant)',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <span style={{ fontSize: 'var(--type-label-small-size)', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
            VERIFIED COLLECTIONS ({collectionPercentage}%)
          </span>
          <div style={{ fontSize: 'var(--type-headline-small-size)', fontWeight: 800, color: 'var(--color-success)', marginTop: '0.25rem' }}>
            ₦{totalCollected.toLocaleString()}
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            padding: 'var(--spacing-4)',
            borderRadius: 'var(--radius-medium)',
            border: '1px solid var(--color-error)',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <span style={{ fontSize: 'var(--type-label-small-size)', color: 'var(--color-error)', fontWeight: 700 }}>
            OUTSTANDING ARREARS
          </span>
          <div style={{ fontSize: 'var(--type-headline-small-size)', fontWeight: 800, color: 'var(--color-error)', marginTop: '0.25rem' }}>
            ₦{totalOutstanding.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Fee Schedules Table */}
      <div
        style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          borderRadius: 'var(--radius-medium)',
          border: '1px solid var(--color-outline-variant)',
          boxShadow: 'var(--shadow-soft)',
          overflowX: 'auto',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--type-body-small-size)' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-container)', borderBottom: '1px solid var(--color-outline-variant)' }}>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Academic Section</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Core Tuition</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Dev Levy</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Books &amp; Uniform</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Total / Student</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Collected Rate</th>
            </tr>
          </thead>
          <tbody>
            {feeSchedules.map((schedule) => {
              const rate = Math.round((schedule.collectedTotal / schedule.expectedTotal) * 100);
              return (
                <tr key={schedule.id} style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                  <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>{schedule.section}</td>
                  <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontVariantNumeric: 'tabular-nums' }}>
                    ₦{schedule.coreTuition.toLocaleString()}
                  </td>
                  <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontVariantNumeric: 'tabular-nums' }}>
                    ₦{schedule.devLevy.toLocaleString()}
                  </td>
                  <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontVariantNumeric: 'tabular-nums' }}>
                    ₦{schedule.booksAndUniform.toLocaleString()}
                  </td>
                  <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700, color: 'var(--color-primary)' }}>
                    ₦{schedule.totalPerStudent.toLocaleString()}
                  </td>
                  <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                      <span style={{ fontWeight: 700 }}>{rate}%</span>
                      <div
                        style={{
                          width: '4rem',
                          height: '0.375rem',
                          backgroundColor: 'var(--color-surface-container-high)',
                          borderRadius: 'var(--radius-full)',
                          overflow: 'hidden',
                        }}
                      >
                        <div style={{ width: `${rate}%`, height: '100%', backgroundColor: 'var(--color-success)' }} />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
