// app/portal/dashboard/components/ReportsView.tsx
'use client';

import React, { useState } from 'react';
import { ChildProfile, ReportCardItem } from '../types';
import { NavTab } from './Navigation';

interface ReportsViewProps {
  child: ChildProfile;
  onNavigateTab: (tab: NavTab) => void;
}

export default function ReportsView({ child, onNavigateTab }: ReportsViewProps) {
  const [activePreviewReport, setActivePreviewReport] = useState<ReportCardItem | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-medium)' }}>
      {/* Header */}
      <div>
        <h1
          className="type-headline-large"
          style={{
            margin: 0,
            color: 'var(--color-primary)',
          }}
        >
          Terminal Report Cards
        </h1>
        <p
          className="type-body-small"
          style={{
            margin: '0.25rem 0 0 0',
            color: 'var(--color-on-surface-variant)',
          }}
        >
          {child.fullName} • {child.classArm} • Official Academic Records
        </p>
      </div>

      {/* Report Cards Archive */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {child.reports.map((report) => (
          <div
            key={report.id}
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-large)',
              border: report.isRestricted
                ? '1px solid var(--color-error)'
                : '1px solid var(--color-outline-variant)',
              padding: 'var(--spacing-medium)',
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-small)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong className="type-title-small">{report.term}</strong>
                <div className="type-label-small" style={{ color: 'var(--color-on-surface-variant)' }}>
                  {report.session}
                </div>
              </div>
              <span
                className="type-label-small"
                style={{
                  backgroundColor: report.isRestricted
                    ? 'var(--color-error-container)'
                    : 'var(--color-success-container)',
                  color: report.isRestricted
                    ? 'var(--color-on-error-container)'
                    : 'var(--color-on-success-container)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 'bold',
                }}
              >
                {report.isRestricted ? 'Restricted (Unsettled Balance)' : 'Cleared & Available'}
              </span>
            </div>

            {report.isRestricted ? (
              /* Hard-Gated Restricted State (PRD §4.4) */
              <div
                style={{
                  backgroundColor: 'var(--color-surface-container-low)',
                  borderRadius: 'var(--radius-small)',
                  padding: 'var(--spacing-medium)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-error)' }}>
                  <span style={{ fontSize: 'var(--type-title-medium-size)' }}>🔒</span>
                  <strong className="type-title-small">Official Grades & Remarks Redacted</strong>
                </div>
                <p
                  className="type-body-small"
                  style={{
                    margin: 0,
                    color: 'var(--color-on-surface-variant)',
                  }}
                >
                  Under SchoolFix tuition clearance policy, terminal report cards and teacher remarks remain locked while there is an outstanding balance of ₦{report.outstandingBalance.toLocaleString('en-NG')}. Settle tuition to unlock.
                </p>
                <button
                  onClick={() => onNavigateTab('payments')}
                  className="type-label-medium"
                  style={{
                    marginTop: '0.25rem',
                    alignSelf: 'flex-start',
                    minHeight: 'var(--size-touch-target)',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                    border: 'none',
                    borderRadius: 'var(--radius-small)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  Pay Balance to Clear Report Card →
                </button>
              </div>
            ) : (
              /* Cleared Report Available */
              <div
                style={{
                  backgroundColor: 'var(--color-surface-container-low)',
                  borderRadius: 'var(--radius-small)',
                  padding: 'var(--spacing-medium)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div className="type-body-small" style={{ fontWeight: 'bold' }}>
                    Grade: {report.overallGrade} • Average: {report.overallAverage}% • Position: {report.classPosition}
                  </div>
                  <div className="type-label-small" style={{ color: 'var(--color-on-surface-variant)' }}>
                    Attendance: {report.attendanceDays}/{report.totalSchoolDays} days held
                  </div>
                </div>
                <button
                  onClick={() => setActivePreviewReport(report)}
                  className="type-label-medium"
                  style={{
                    minHeight: 'var(--size-touch-target)',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                    border: 'none',
                    borderRadius: 'var(--radius-small)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  View Full Terminal Report 📄
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Cleared Report Card Preview Modal */}
      {activePreviewReport && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--spacing-medium)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActivePreviewReport(null);
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-large)',
              padding: 'var(--spacing-medium)',
              maxWidth: '38rem',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-medium)',
              boxShadow: 'var(--shadow-hard)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 className="type-title-large" style={{ margin: 0, color: 'var(--color-primary)', fontWeight: 'bold' }}>
                  Official Terminal Report
                </h2>
                <p className="type-body-small" style={{ margin: 0, color: 'var(--color-on-surface-variant)' }}>
                  {activePreviewReport.term} ({activePreviewReport.session})
                </p>
              </div>
              <button
                onClick={() => setActivePreviewReport(null)}
                style={{
                  minWidth: 'var(--size-touch-target)',
                  minHeight: 'var(--size-touch-target)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-outline-variant)',
                  cursor: 'pointer',
                  fontSize: 'var(--type-title-medium-size)',
                }}
              >
                ✕
              </button>
            </div>

            <div
              className="type-body-small"
              style={{
                backgroundColor: 'var(--color-surface-container-low)',
                padding: 'var(--spacing-medium)',
                borderRadius: 'var(--radius-medium)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
              }}
            >
              <div>Student: <strong>{child.fullName}</strong></div>
              <div>Admission: <strong>{child.admissionNum}</strong></div>
              <div>Class: <strong>{child.classArm}</strong></div>
              <div>Class Position: <strong>{activePreviewReport.classPosition}</strong></div>
              <div>Term Average: <strong>{activePreviewReport.overallAverage}%</strong></div>
              <div>Final Grade: <strong>{activePreviewReport.overallGrade}</strong></div>
            </div>

            <div>
              <strong className="type-body-small">Teacher Remarks:</strong>
              <p
                className="type-body-small"
                style={{
                  marginTop: '0.25rem',
                  padding: 'var(--spacing-small)',
                  backgroundColor: 'var(--color-surface-container-high)',
                  borderRadius: 'var(--radius-small)',
                  fontStyle: 'italic',
                }}
              >
                "{activePreviewReport.teacherRemarks || 'A conscientious and hardworking student who demonstrates consistent academic curiosity and disciplined classroom conduct.'}"
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => window.print()}
                className="type-label-medium"
                style={{
                  minHeight: 'var(--size-touch-target)',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--color-surface-container-high)',
                  color: 'var(--color-on-surface)',
                  border: '1px solid var(--color-outline-variant)',
                  borderRadius: 'var(--radius-small)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                🖨️ Print Report
              </button>
              <button
                onClick={() => setActivePreviewReport(null)}
                className="type-label-medium"
                style={{
                  minHeight: 'var(--size-touch-target)',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-small)',
                  fontWeight: 'bold',
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
