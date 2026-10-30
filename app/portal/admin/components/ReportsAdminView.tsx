// app/portal/admin/components/ReportsAdminView.tsx
// SchoolFix Administrator Terminal Report Cards Clearance Gate
'use client';

import React, { useState } from 'react';

interface StudentReport {
  studentId: string;
  admissionNo: string;
  name: string;
  classArm: string;
  totalFee: number;
  paidFee: number;
  balance: number;
  caScore: number; // Max 40.00
  examScore: number; // Max 60.00
  totalScore: number; // Max 100.00
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  clearanceStatus: 'UNLOCKED' | 'GATED';
}

export default function ReportsAdminView() {
  const [filter, setFilter] = useState<'ALL' | 'UNLOCKED' | 'GATED'>('ALL');
  const [selectedReport, setSelectedReport] = useState<StudentReport | null>(null);

  const reports: StudentReport[] = [
    {
      studentId: 'STU-001',
      admissionNo: 'SF-2024-089',
      name: 'Amara Michael',
      classArm: 'Primary 4 Blue',
      totalFee: 185000,
      paidFee: 185000,
      balance: 0,
      caScore: 36.5,
      examScore: 52.0,
      totalScore: 88.5,
      grade: 'A',
      clearanceStatus: 'UNLOCKED',
    },
    {
      studentId: 'STU-002',
      admissionNo: 'SF-2023-114',
      name: 'Chukwudi Obi',
      classArm: 'JSS 2 Gold',
      totalFee: 235000,
      paidFee: 160000,
      balance: 75000,
      caScore: 31.0,
      examScore: 44.5,
      totalScore: 75.5,
      grade: 'A',
      clearanceStatus: 'GATED',
    },
    {
      studentId: 'STU-003',
      admissionNo: 'SF-2024-042',
      name: 'Fatima Bello',
      classArm: 'Nursery 2 Diamond',
      totalFee: 140000,
      paidFee: 50000,
      balance: 90000,
      caScore: 34.0,
      examScore: 48.0,
      totalScore: 82.0,
      grade: 'A',
      clearanceStatus: 'GATED',
    },
    {
      studentId: 'STU-004',
      admissionNo: 'SF-2022-005',
      name: 'Zainab Balogun',
      classArm: 'SSS 1 Ruby',
      totalFee: 255000,
      paidFee: 255000,
      balance: 0,
      caScore: 38.0,
      examScore: 56.5,
      totalScore: 94.5,
      grade: 'A',
      clearanceStatus: 'UNLOCKED',
    },
  ];

  const filtered = reports.filter((r) => (filter === 'ALL' ? true : r.clearanceStatus === filter));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
      {/* Header */}
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
          Terminal Report Cards &amp; Clearance Gate
        </h1>
        <p style={{ margin: 'var(--spacing-1) 0 0 0', fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)' }}>
          PRD § 6.3 Gate: Students with outstanding balance have academic grades redacted.
        </p>
      </div>

      {/* Domain Explainer Banner */}
      <div
        style={{
          padding: 'var(--spacing-4)',
          backgroundColor: 'var(--color-surface-container)',
          borderRadius: 'var(--radius-medium)',
          border: '1px solid var(--color-outline-variant)',
          fontSize: 'var(--type-body-small-size)',
          lineHeight: 1.5,
        }}
      >
        <strong>Automated Clearance Gate:</strong> Terminal report cards at <code>/portal/reports/[studentId]</code> are dynamically evaluated. When a student carries an unpaid tuition balance (&gt; ₦0), all subject assessment grades, exam totals, and teacher remarks are obscured with a fee settlement clearance notice.
      </div>

      {/* Filter Tabs & Table */}
      <div
        style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          borderRadius: 'var(--radius-medium)',
          border: '1px solid var(--color-outline-variant)',
          boxShadow: 'var(--shadow-soft)',
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-4)' }}>
          <h2 style={{ fontSize: 'var(--type-title-small-size)', fontWeight: 700, margin: 0, color: 'var(--color-primary)' }}>
            Report Card Clearance Status
          </h2>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {(['ALL', 'UNLOCKED', 'GATED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-outline-variant)',
                  backgroundColor: filter === tab ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: filter === tab ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
                  cursor: 'pointer',
                }}
              >
                {tab === 'UNLOCKED' ? 'Unlocked (Cleared)' : tab === 'GATED' ? 'Gated (Arrears)' : 'All Records'}
              </button>
            ))}
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--type-body-small-size)' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-container)', borderBottom: '1px solid var(--color-outline-variant)' }}>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Admission No</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Student Name</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Class Arm</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Tuition Balance</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Report Card Visibility</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((report) => (
              <tr key={report.studentId} style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontFamily: 'monospace' }}>{report.admissionNo}</td>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>{report.name}</td>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>{report.classArm}</td>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>
                  {report.balance === 0 ? (
                    <span style={{ color: 'var(--color-success)' }}>₦0</span>
                  ) : (
                    <span style={{ color: 'var(--color-error)' }}>₦{report.balance.toLocaleString()}</span>
                  )}
                </td>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.125rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor:
                        report.clearanceStatus === 'UNLOCKED'
                          ? 'var(--color-success-container)'
                          : 'var(--color-error-container)',
                      color:
                        report.clearanceStatus === 'UNLOCKED'
                          ? 'var(--color-on-success-container)'
                          : 'var(--color-on-error-container)',
                    }}
                  >
                    {report.clearanceStatus === 'UNLOCKED' ? '✅ Unlocked & Visible' : '🔒 Redacted & Gated'}
                  </span>
                </td>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                  <button
                    onClick={() => setSelectedReport(report)}
                    style={{
                      padding: '0.25rem 0.625rem',
                      backgroundColor: 'var(--color-surface-container-high)',
                      border: '1px solid var(--color-outline-variant)',
                      borderRadius: 'var(--radius-small)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--color-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    Preview Card →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Report Card Preview Modal */}
      {selectedReport && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-4)',
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface-container-lowest)',
              borderRadius: 'var(--radius-medium)',
              border: '1px solid var(--color-outline-variant)',
              padding: 'var(--spacing-5)',
              maxWidth: '32rem',
              width: '100%',
              boxShadow: 'var(--shadow-hard)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 'var(--type-title-medium-size)', fontWeight: 700, margin: 0, color: 'var(--color-primary)' }}>
                Terminal Report Preview
              </h3>
              <button onClick={() => setSelectedReport(null)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 'var(--type-body-small-size)' }}>
              <div>
                Student: <strong>{selectedReport.name}</strong> ({selectedReport.admissionNo})
              </div>
              <div>Class: {selectedReport.classArm}</div>

              {selectedReport.clearanceStatus === 'GATED' ? (
                <div
                  style={{
                    marginTop: 'var(--spacing-2)',
                    padding: 'var(--spacing-4)',
                    backgroundColor: 'var(--color-error-container)',
                    color: 'var(--color-on-error-container)',
                    borderRadius: 'var(--radius-small)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🔒</div>
                  <strong>Report Card Obscured</strong>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem' }}>
                    Outstanding tuition arrears of ₦{selectedReport.balance.toLocaleString()}. Parents cannot view academic scores until cleared.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    marginTop: 'var(--spacing-2)',
                    padding: 'var(--spacing-3)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-outline-variant)',
                    borderRadius: 'var(--radius-small)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>Continuous Assessment (Max 40.00):</span>
                    <strong>{selectedReport.caScore}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>Terminal Exam (Max 60.00):</span>
                    <strong>{selectedReport.examScore}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-outline-variant)', paddingTop: '0.25rem', fontWeight: 800 }}>
                    <span>Terminal Total:</span>
                    <span style={{ color: 'var(--color-primary)' }}>{selectedReport.totalScore}% ({selectedReport.grade})</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-2)' }}>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                style={{
                  padding: 'var(--spacing-2) var(--spacing-4)',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  borderRadius: 'var(--radius-small)',
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
