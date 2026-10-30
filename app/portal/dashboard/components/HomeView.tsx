// app/portal/dashboard/components/HomeView.tsx
'use client';

import React from 'react';
import { ChildProfile } from '../types';
import { NavTab } from './Navigation';

interface HomeViewProps {
  child: ChildProfile;
  totalChildrenCount: number;
  onOpenChildModal: () => void;
  onNavigateTab: (tab: NavTab) => void;
  parentName: string;
}

export default function HomeView({
  child,
  totalChildrenCount,
  onOpenChildModal,
  onNavigateTab,
  parentName,
}: HomeViewProps) {
  const settledPercent = child.expectedFees > 0
    ? Math.min(100, Math.round((child.verifiedPayments / child.expectedFees) * 100))
    : 100;

  const isReportRestricted = child.outstandingBalance > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-medium)' }}>
      {/* Welcome Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div>
          <h1
            className="type-headline-large"
            style={{
              margin: 0,
              color: 'var(--color-primary)',
            }}
          >
            Welcome, {parentName.split(' ')[0]}!
          </h1>
          <p
            className="type-body-medium"
            style={{
              margin: '0.25rem 0 0 0',
              color: 'var(--color-on-surface-variant)',
            }}
          >
            Here is the operational overview for your enrolled children.
          </p>
        </div>
        <div
          className="type-label-small"
          style={{
            backgroundColor: 'var(--color-surface-container-high)',
            borderRadius: 'var(--radius-full)',
            padding: '0.25rem 0.75rem',
            color: 'var(--color-on-surface)',
            border: '1px solid var(--color-outline-variant)',
            fontWeight: 'bold',
          }}
        >
          🔔 Term Active (2026/2027)
        </div>
      </div>

      {/* Selected Child Card (P01 Specification) */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-medium)',
          border: '1px solid var(--color-outline-variant)',
          padding: 'var(--spacing-medium)',
          boxShadow: 'var(--shadow-soft)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            className="type-label-small"
            style={{
              fontWeight: 'bold',
              color: 'var(--color-on-surface-variant)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Selected Child
          </span>
          <button
            onClick={onOpenChildModal}
            className="type-label-small"
            style={{
              padding: '0.25rem 0.75rem',
              backgroundColor: 'var(--color-primary-container)',
              color: 'var(--color-on-primary-container)',
              borderRadius: 'var(--radius-full)',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {totalChildrenCount} children linked ▾
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '3rem',
                height: '3rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-surface-container-high)',
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
            <div>
              <div
                className="type-title-medium"
                style={{
                  fontWeight: 'bold',
                  color: 'var(--color-on-surface)',
                }}
              >
                {child.fullName}
              </div>
              <div
                className="type-body-small"
                style={{
                  color: 'var(--color-on-surface-variant)',
                }}
              >
                {child.classArm} • {child.session}
              </div>
            </div>
          </div>
          <button
            onClick={onOpenChildModal}
            aria-label="Switch child"
            className="type-label-small"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: 'var(--radius-small)',
              padding: '0.5rem 0.75rem',
              fontWeight: 'bold',
              color: 'var(--color-primary)',
              cursor: 'pointer',
            }}
          >
            Switch
          </button>
        </div>

        <div
          className="type-body-small"
          style={{
            borderTop: '1px solid var(--color-outline-variant)',
            paddingTop: '0.5rem',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ color: 'var(--color-on-surface-variant)' }}>Admission Number</span>
          <span style={{ fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}>{child.admissionNum}</span>
        </div>
      </div>

      {/* Fee Overview Card (P01 Dual-Ledger Status) */}
      <div
        style={{
          backgroundColor: 'var(--color-surface-container-low)',
          borderRadius: 'var(--radius-large)',
          border: '1px solid var(--color-outline-variant)',
          padding: 'var(--spacing-medium)',
          boxShadow: 'var(--shadow-soft)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-small)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong className="type-title-small" style={{ color: 'var(--color-on-surface)' }}>
            Fee Overview
          </strong>
          <span
            className="type-label-small"
            style={{
              color: 'var(--color-on-surface-variant)',
            }}
          >
            {child.term} • {child.session}
          </span>
        </div>

        <div>
          <div className="type-body-small" style={{ color: 'var(--color-on-surface-variant)' }}>
            Outstanding Balance
          </div>
          <div
            className="type-display-small"
            style={{
              color: child.outstandingBalance > 0 ? 'var(--color-error)' : 'var(--color-success)',
              margin: '0.25rem 0',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            ₦{child.outstandingBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="type-body-small" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--color-on-surface-variant)' }}>Expected Term Fees</span>
          <strong>₦{child.expectedFees.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</strong>
        </div>

        <div className="type-body-small" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--color-on-surface-variant)' }}>Verified Payments</span>
          <strong style={{ color: 'var(--color-success)' }}>
            ₦{child.verifiedPayments.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </strong>
        </div>

        {/* Visual Progress Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
          <div
            style={{
              width: '100%',
              height: '0.5rem',
              backgroundColor: 'var(--color-surface-container-high)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${settledPercent}%`,
                height: '100%',
                backgroundColor: settledPercent === 100 ? 'var(--color-success)' : 'var(--color-primary)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <span className="type-label-small" style={{ color: 'var(--color-on-surface-variant)', textAlign: 'right' }}>
            {settledPercent}% of fees settled
          </span>
        </div>

        <button
          onClick={() => onNavigateTab('payments')}
          className="type-label-large"
          style={{
            marginTop: '0.5rem',
            width: '100%',
            minHeight: 'var(--size-touch-target)',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            border: 'none',
            borderRadius: 'var(--radius-small)',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          Make a Payment →
        </button>
      </div>

      {/* 2-Column KPI Cards: Attendance & Academics Snapshot */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 'var(--spacing-small)',
        }}
      >
        {/* Attendance Card */}
        <div
          onClick={() => onNavigateTab('child')}
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: 'var(--radius-medium)',
            padding: 'var(--spacing-medium)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="type-title-small" style={{ fontWeight: 'bold' }}>Attendance</span>
            <span>📅</span>
          </div>
          <div
            className="type-headline-small"
            style={{
              fontWeight: 'bold',
              color: 'var(--color-primary)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {child.attendancePercentage}%
          </div>
          <div className="type-label-small" style={{ color: 'var(--color-on-surface-variant)' }}>
            This term
          </div>
          <span
            className="type-label-small"
            style={{
              backgroundColor: 'var(--color-success-container)',
              color: 'var(--color-on-success-container)',
              borderRadius: 'var(--radius-full)',
              padding: '0.25rem 0.5rem',
              fontWeight: 'bold',
              alignSelf: 'flex-start',
            }}
          >
            Good attendance
          </span>
        </div>

        {/* Academics Card */}
        <div
          onClick={() => onNavigateTab('child')}
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: 'var(--radius-medium)',
            padding: 'var(--spacing-medium)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="type-title-small" style={{ fontWeight: 'bold' }}>Academics</span>
            <span>📖</span>
          </div>
          <div
            className="type-headline-small"
            style={{
              fontWeight: 'bold',
              color: 'var(--color-primary)',
            }}
          >
            {child.academicGrade} ({child.academicAverage}%)
          </div>
          <div className="type-label-small" style={{ color: 'var(--color-on-surface-variant)' }}>
            Current average
          </div>
          <span
            className="type-label-small"
            style={{
              backgroundColor: 'var(--color-primary-container)',
              color: 'var(--color-on-primary-container)',
              borderRadius: 'var(--radius-full)',
              padding: '0.25rem 0.5rem',
              fontWeight: 'bold',
              alignSelf: 'flex-start',
            }}
          >
            Distinction track
          </span>
        </div>
      </div>

      {/* Recent Activity Card */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-medium)',
          border: '1px solid var(--color-outline-variant)',
          padding: 'var(--spacing-medium)',
          boxShadow: 'var(--shadow-soft)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong className="type-title-small">Recent Activity</strong>
          <span className="type-label-small" style={{ color: 'var(--color-primary)' }}>
            Live updates
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {child.recentActivity.map((activity, idx) => (
            <div
              key={activity.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0',
                borderBottom:
                  idx < child.recentActivity.length - 1
                    ? '1px solid var(--color-outline-variant)'
                    : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: 'var(--type-title-medium-size)' }}>
                  {activity.type === 'PAYMENT' ? '✅' : '📝'}
                </span>
                <div>
                  <div className="type-body-small" style={{ fontWeight: 'bold' }}>
                    {activity.title}
                  </div>
                  <div
                    className="type-label-small"
                    style={{
                      color: 'var(--color-on-surface-variant)',
                    }}
                  >
                    {activity.subtitle} • {activity.date}
                  </div>
                </div>
              </div>
              {activity.badgeText && (
                <span
                  className="type-label-small"
                  style={{
                    backgroundColor:
                      activity.badgeColor === 'success'
                        ? 'var(--color-success-container)'
                        : 'var(--color-surface-container-high)',
                    color:
                      activity.badgeColor === 'success'
                        ? 'var(--color-on-success-container)'
                        : 'var(--color-on-surface)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 'bold',
                  }}
                >
                  {activity.badgeText}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Terminal Report Card Status Card (Hard-Gated Clearance) */}
      <div
        style={{
          backgroundColor: isReportRestricted
            ? 'var(--color-surface-container-lowest)'
            : 'var(--color-success-container)',
          borderRadius: 'var(--radius-medium)',
          border: isReportRestricted
            ? '1px solid var(--color-error)'
            : '1px solid var(--color-success)',
          padding: 'var(--spacing-medium)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: 'var(--type-title-medium-size)' }}>{isReportRestricted ? '🔒' : '📄'}</span>
          <strong
            className="type-title-small"
            style={{
              color: isReportRestricted ? 'var(--color-error)' : 'var(--color-on-success-container)',
            }}
          >
            {isReportRestricted
              ? 'Terminal Report Card Restricted'
              : 'Terminal Report Card Available'}
          </strong>
        </div>
        <p
          className="type-body-small"
          style={{
            margin: 0,
            color: isReportRestricted
              ? 'var(--color-on-surface-variant)'
              : 'var(--color-on-success-container)',
          }}
        >
          {isReportRestricted
            ? `Your terminal Continuous Assessment (CA) report card remains locked because there is an outstanding fee balance of ₦${child.outstandingBalance.toLocaleString('en-NG')}. Settle the balance to access official grades and remarks.`
            : `All term fees have been reconciled. The official terminal report card and teacher comments are fully cleared for viewing.`}
        </p>
        <button
          onClick={() => onNavigateTab(isReportRestricted ? 'payments' : 'reports')}
          className="type-label-medium"
          style={{
            marginTop: '0.25rem',
            alignSelf: 'flex-start',
            minHeight: 'var(--size-touch-target)',
            padding: '0.5rem 1rem',
            backgroundColor: isReportRestricted
              ? 'transparent'
              : 'var(--color-success)',
            color: isReportRestricted
              ? 'var(--color-primary)'
              : 'var(--color-on-success)',
            border: isReportRestricted
              ? '1px solid var(--color-primary)'
              : 'none',
            borderRadius: 'var(--radius-small)',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          {isReportRestricted ? 'View Payment Details →' : 'View Cleared Report →'}
        </button>
      </div>
    </div>
  );
}
