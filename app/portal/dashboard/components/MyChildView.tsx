// app/portal/dashboard/components/MyChildView.tsx
'use client';

import React, { useState } from 'react';
import { ChildProfile } from '../types';

interface MyChildViewProps {
  child: ChildProfile;
}

export default function MyChildView({ child }: MyChildViewProps) {
  const [subTab, setSubTab] = useState<'academics' | 'attendance' | 'info'>('academics');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-medium)' }}>
      {/* Student Profile Card (P02 Header) */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-large)',
          border: '1px solid var(--color-outline-variant)',
          padding: 'var(--spacing-medium)',
          boxShadow: 'var(--shadow-soft)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-small)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-container)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--type-headline-small-size)',
              fontWeight: 'bold',
            }}
          >
            🎓
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <h1
                className="type-headline-large"
                style={{
                  margin: 0,
                  color: 'var(--color-primary)',
                }}
              >
                {child.fullName}
              </h1>
              <span
                className="type-label-small"
                style={{
                  backgroundColor: 'var(--color-success-container)',
                  color: 'var(--color-on-success-container)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 'bold',
                }}
              >
                Active Student
              </span>
            </div>
            <p
              className="type-body-small"
              style={{
                margin: '0.25rem 0 0 0',
                color: 'var(--color-on-surface-variant)',
              }}
            >
              Class: <strong>{child.classArm}</strong> • Session: {child.session} • {child.term}
            </p>
          </div>
        </div>

        {/* 2-Column Summary KPI Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.75rem',
            marginTop: '0.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface-container-low)',
              borderRadius: 'var(--radius-medium)',
              padding: 'var(--spacing-small) var(--spacing-medium)',
              border: '1px solid var(--color-outline-variant)',
            }}
          >
            <div className="type-label-small" style={{ color: 'var(--color-on-surface-variant)' }}>
              Attendance
            </div>
            <div
              className="type-title-large"
              style={{
                fontWeight: 'bold',
                color: 'var(--color-primary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {child.attendancePercentage}%
            </div>
            <div className="type-label-small" style={{ color: 'var(--color-on-surface-variant)' }}>
              Current term
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--color-surface-container-low)',
              borderRadius: 'var(--radius-medium)',
              padding: 'var(--spacing-small) var(--spacing-medium)',
              border: '1px solid var(--color-outline-variant)',
            }}
          >
            <div className="type-label-small" style={{ color: 'var(--color-on-surface-variant)' }}>
              Academic Average
            </div>
            <div
              className="type-title-large"
              style={{
                fontWeight: 'bold',
                color: 'var(--color-primary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {child.academicAverage}% ({child.academicGrade})
            </div>
            <div className="type-label-small" style={{ color: 'var(--color-on-surface-variant)' }}>
              Continuous assessment
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--color-outline-variant)',
          paddingBottom: '0.25rem',
        }}
      >
        <button
          onClick={() => setSubTab('academics')}
          className="type-label-medium"
          style={{
            padding: '0.5rem 1rem',
            minHeight: 'var(--size-touch-target)',
            backgroundColor: subTab === 'academics' ? 'var(--color-primary)' : 'transparent',
            color: subTab === 'academics' ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
            border: 'none',
            borderRadius: 'var(--radius-small)',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Academics (CA/Exam)
        </button>
        <button
          onClick={() => setSubTab('attendance')}
          className="type-label-medium"
          style={{
            padding: '0.5rem 1rem',
            minHeight: 'var(--size-touch-target)',
            backgroundColor: subTab === 'attendance' ? 'var(--color-primary)' : 'transparent',
            color: subTab === 'attendance' ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
            border: 'none',
            borderRadius: 'var(--radius-small)',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Attendance Log
        </button>
        <button
          onClick={() => setSubTab('info')}
          className="type-label-medium"
          style={{
            padding: '0.5rem 1rem',
            minHeight: 'var(--size-touch-target)',
            backgroundColor: subTab === 'info' ? 'var(--color-primary)' : 'transparent',
            color: subTab === 'info' ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
            border: 'none',
            borderRadius: 'var(--radius-small)',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Student Bio
        </button>
      </div>

      {/* Subtab 1: Academic Scores Table (PRD §4.3: 40/60 Split) */}
      {subTab === 'academics' && (
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-medium)',
            border: '1px solid var(--color-outline-variant)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <div
            style={{
              padding: 'var(--spacing-medium)',
              borderBottom: '1px solid var(--color-outline-variant)',
              backgroundColor: 'var(--color-surface-container-low)',
            }}
          >
            <strong className="type-title-small" style={{ color: 'var(--color-primary)' }}>
              Continuous Assessment & Examination Breakdown
            </strong>
            <p
              className="type-body-small"
              style={{
                margin: '0.25rem 0 0 0',
                color: 'var(--color-on-surface-variant)',
              }}
            >
              SchoolFix standard 40/60 split: Continuous Assessment (max 40) + Terminal Exam (max 60).
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr className="type-label-small" style={{ backgroundColor: 'var(--color-surface-container)' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Subject</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>CA (40)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Exam (60)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Total (100)</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Grade</th>
                </tr>
              </thead>
              <tbody className="type-body-small">
                {child.subjects.map((sub, idx) => (
                  <tr
                    key={sub.id}
                    style={{
                      borderBottom:
                        idx < child.subjects.length - 1
                          ? '1px solid var(--color-outline-variant)'
                          : 'none',
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold' }}>{sub.subject}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {sub.caScore.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {sub.examScore.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}>
                      {sub.totalScore.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span
                        className="type-label-small"
                        style={{
                          backgroundColor:
                            sub.grade === 'A'
                              ? 'var(--color-success-container)'
                              : sub.grade === 'B'
                              ? 'var(--color-primary-container)'
                              : 'var(--color-surface-container-high)',
                          color:
                            sub.grade === 'A'
                              ? 'var(--color-on-success-container)'
                              : sub.grade === 'B'
                              ? 'var(--color-on-primary-container)'
                              : 'var(--color-on-surface)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-small)',
                          fontWeight: 'bold',
                        }}
                      >
                        {sub.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 2: Attendance Register */}
      {subTab === 'attendance' && (
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-medium)',
            border: '1px solid var(--color-outline-variant)',
            padding: 'var(--spacing-medium)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <strong className="type-title-small">
            Daily Attendance State Machine (PRD §4.2)
          </strong>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: '0.5rem',
            }}
          >
            <div
              style={{
                padding: 'var(--spacing-small)',
                backgroundColor: 'var(--color-success-container)',
                borderRadius: 'var(--radius-small)',
                textAlign: 'center',
              }}
            >
              <div className="type-headline-small" style={{ fontWeight: 'bold', color: 'var(--color-success)', fontVariantNumeric: 'tabular-nums' }}>
                47
              </div>
              <div className="type-label-small" style={{ color: 'var(--color-on-success-container)' }}>
                Present
              </div>
            </div>
            <div
              style={{
                padding: 'var(--spacing-small)',
                backgroundColor: 'var(--color-surface-container-high)',
                borderRadius: 'var(--radius-small)',
                textAlign: 'center',
              }}
            >
              <div className="type-headline-small" style={{ fontWeight: 'bold', color: 'var(--color-primary)', fontVariantNumeric: 'tabular-nums' }}>
                2
              </div>
              <div className="type-label-small" style={{ color: 'var(--color-on-surface)' }}>
                Late
              </div>
            </div>
            <div
              style={{
                padding: 'var(--spacing-small)',
                backgroundColor: 'var(--color-surface-container-low)',
                borderRadius: 'var(--radius-small)',
                textAlign: 'center',
              }}
            >
              <div className="type-headline-small" style={{ fontWeight: 'bold', color: 'var(--color-on-surface-variant)', fontVariantNumeric: 'tabular-nums' }}>
                1
              </div>
              <div className="type-label-small" style={{ color: 'var(--color-on-surface-variant)' }}>
                Excused
              </div>
            </div>
            <div
              style={{
                padding: 'var(--spacing-small)',
                backgroundColor: 'var(--color-surface-container-low)',
                borderRadius: 'var(--radius-small)',
                textAlign: 'center',
              }}
            >
              <div className="type-headline-small" style={{ fontWeight: 'bold', color: 'var(--color-error)', fontVariantNumeric: 'tabular-nums' }}>
                0
              </div>
              <div className="type-label-small" style={{ color: 'var(--color-on-surface-variant)' }}>
                Absent
              </div>
            </div>
          </div>
          <p className="type-body-small" style={{ margin: 0, color: 'var(--color-on-surface-variant)' }}>
            Attendance records are verified daily by the classroom teacher using the class arm isolation boundary. Total school sessions held: 50.
          </p>
        </div>
      )}

      {/* Subtab 3: Student Bio */}
      {subTab === 'info' && (
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-medium)',
            border: '1px solid var(--color-outline-variant)',
            padding: 'var(--spacing-medium)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <strong className="type-title-small">Official School Records</strong>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }} className="type-body-small">
            <div>
              <span style={{ color: 'var(--color-on-surface-variant)' }}>Admission Number:</span>
              <div style={{ fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}>{child.admissionNum}</div>
            </div>
            <div>
              <span style={{ color: 'var(--color-on-surface-variant)' }}>Assigned Class Arm:</span>
              <div style={{ fontWeight: 'bold' }}>{child.classArm}</div>
            </div>
            <div>
              <span style={{ color: 'var(--color-on-surface-variant)' }}>Academic Session:</span>
              <div style={{ fontWeight: 'bold' }}>{child.session}</div>
            </div>
            <div>
              <span style={{ color: 'var(--color-on-surface-variant)' }}>Current Term:</span>
              <div style={{ fontWeight: 'bold' }}>{child.term}</div>
            </div>
            <div>
              <span style={{ color: 'var(--color-on-surface-variant)' }}>Tuition Rate:</span>
              <div style={{ fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}>₦{child.expectedFees.toLocaleString('en-NG')} / term</div>
            </div>
            <div>
              <span style={{ color: 'var(--color-on-surface-variant)' }}>Class Arm ID:</span>
              <div style={{ fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}>arm-p4-blue-01</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
