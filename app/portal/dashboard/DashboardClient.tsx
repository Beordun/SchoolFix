// app/portal/dashboard/DashboardClient.tsx
// SchoolFix Parent Portal Dashboard
// Conforming strictly to ChatGPT Screen Design Specification (P01 - P05) & tokens.css
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { ChildProfile, PaymentTransaction } from './types';
import Navigation, { NavTab } from './components/Navigation';
import HomeView from './components/HomeView';
import MyChildView from './components/MyChildView';
import PaymentsView from './components/PaymentsView';
import ReportsView from './components/ReportsView';
import AccountView from './components/AccountView';
import ChildSelectorModal from './components/ChildSelectorModal';

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

// Initial Nigerian School dependent student records (PRD §3, §4)
const INITIAL_CHILDREN: ChildProfile[] = [
  {
    id: 'child-amara',
    admissionNum: 'SF-2026-0142',
    fullName: 'Amara Michael',
    classArm: 'Primary 4 Blue',
    session: '2026/2027 Academic Session',
    term: 'First Term',
    expectedFees: 150000,
    verifiedPayments: 105000,
    outstandingBalance: 45000,
    attendancePercentage: 94,
    academicAverage: 76.5,
    academicGrade: 'B',
    recentActivity: [
      {
        id: 'act-1',
        type: 'PAYMENT',
        title: 'Payment verified',
        subtitle: '₦50,000 via Bank Transfer',
        date: '12 Oct',
        badgeText: 'Verified',
        badgeColor: 'success',
      },
      {
        id: 'act-2',
        type: 'ASSESSMENT',
        title: 'Mathematics score published',
        subtitle: 'Continuous assessment: 32.00 / 40.00',
        date: '14 Oct',
        badgeText: 'CA Published',
        badgeColor: 'primary',
      },
      {
        id: 'act-3',
        type: 'ATTENDANCE',
        title: 'Present in class',
        subtitle: 'Marked present by Class Teacher',
        date: 'Today',
        badgeText: 'Present',
        badgeColor: 'success',
      },
    ],
    subjects: [
      { id: 'sub-1', subject: 'Mathematics', caScore: 32.0, examScore: 38.0, totalScore: 70.0, grade: 'A', isPublished: true },
      { id: 'sub-2', subject: 'English Studies', caScore: 35.0, examScore: 42.0, totalScore: 77.0, grade: 'A', isPublished: true },
      { id: 'sub-3', subject: 'Basic Science', caScore: 30.0, examScore: 40.0, totalScore: 70.0, grade: 'A', isPublished: true },
      { id: 'sub-4', subject: 'Social Studies', caScore: 28.0, examScore: 36.0, totalScore: 64.0, grade: 'B', isPublished: true },
      { id: 'sub-5', subject: 'Agricultural Science', caScore: 31.0, examScore: 39.0, totalScore: 70.0, grade: 'A', isPublished: true },
    ],
    transactions: [
      {
        id: 'txn-1',
        reference: 'TXN-1234',
        amount: 50000,
        date: '12 Oct',
        channel: 'BANK_TRANSFER',
        status: 'VERIFIED',
        receiptNumber: 'REC-2026-081',
      },
      {
        id: 'txn-2',
        reference: 'TXN-5678',
        amount: 55000,
        date: '15 Oct',
        channel: 'ONLINE_CARD',
        status: 'VERIFIED',
        receiptNumber: 'REC-2026-092',
      },
    ],
    reports: [
      {
        id: 'rep-1',
        term: 'First Term',
        session: '2026/2027 Academic Session',
        isRestricted: true,
        outstandingBalance: 45000,
        attendanceDays: 47,
        totalSchoolDays: 50,
      },
      {
        id: 'rep-2',
        term: 'Third Term',
        session: '2025/2026 Academic Session',
        isRestricted: false,
        outstandingBalance: 0,
        overallAverage: 84.2,
        overallGrade: 'A',
        classPosition: '3rd of 34',
        attendanceDays: 58,
        totalSchoolDays: 60,
        teacherRemarks: 'Amara is an exceptionally diligent pupil with outstanding analytical capabilities.',
      },
    ],
  },
  {
    id: 'child-daniel',
    admissionNum: 'SF-2024-0089',
    fullName: 'Daniel Michael',
    classArm: 'JSS 1 Gold',
    session: '2026/2027 Academic Session',
    term: 'First Term',
    expectedFees: 180000,
    verifiedPayments: 180000,
    outstandingBalance: 0,
    attendancePercentage: 98,
    academicAverage: 82.4,
    academicGrade: 'A',
    recentActivity: [
      {
        id: 'act-d1',
        type: 'PAYMENT',
        title: 'Tuition fully settled',
        subtitle: '100% reconciled for First Term',
        date: '08 Oct',
        badgeText: 'Cleared',
        badgeColor: 'success',
      },
      {
        id: 'act-d2',
        type: 'ASSESSMENT',
        title: 'Basic Technology score published',
        subtitle: 'Continuous assessment: 36.00 / 40.00',
        date: '16 Oct',
        badgeText: 'CA Published',
        badgeColor: 'primary',
      },
    ],
    subjects: [
      { id: 'sub-d1', subject: 'Mathematics', caScore: 36.0, examScore: 48.0, totalScore: 84.0, grade: 'A', isPublished: true },
      { id: 'sub-d2', subject: 'English Studies', caScore: 34.0, examScore: 46.0, totalScore: 80.0, grade: 'A', isPublished: true },
      { id: 'sub-d3', subject: 'Basic Technology', caScore: 35.0, examScore: 49.0, totalScore: 84.0, grade: 'A', isPublished: true },
      { id: 'sub-d4', subject: 'Business Studies', caScore: 33.0, examScore: 48.0, totalScore: 81.0, grade: 'A', isPublished: true },
    ],
    transactions: [
      {
        id: 'txn-d1',
        reference: 'TXN-8841',
        amount: 180000,
        date: '08 Oct',
        channel: 'BANK_TRANSFER',
        status: 'VERIFIED',
        receiptNumber: 'REC-2026-034',
      },
    ],
    reports: [
      {
        id: 'rep-d1',
        term: 'First Term',
        session: '2026/2027 Academic Session',
        isRestricted: false,
        outstandingBalance: 0,
        overallAverage: 82.4,
        overallGrade: 'A',
        classPosition: '1st of 30',
        attendanceDays: 49,
        totalSchoolDays: 50,
        teacherRemarks: 'Daniel has shown exemplary leadership and scholastic excellence across all STEM subjects.',
      },
    ],
  },
];

export default function DashboardClient({ user, sessionId, expiresAt }: DashboardClientProps) {
  const router = useRouter();

  // Navigation & Multi-child State
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [childrenList, setChildrenList] = useState<ChildProfile[]>(INITIAL_CHILDREN);
  const [selectedChildId, setSelectedChildId] = useState<string>('child-amara');
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);

  // Authentication & Deletion lifecycle states
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionStatus, setDeletionStatus] = useState<string | null>(null);

  const selectedChild = childrenList.find((c) => c.id === selectedChildId) || childrenList[0];

  // Dynamic Linking of another child (Self-service or School-assisted)
  const handleLinkChild = (admissionNum: string, code: string, method: 'SELF' | 'ASSISTED') => {
    const newChild: ChildProfile = {
      id: `child-${Date.now()}`,
      admissionNum,
      fullName: method === 'SELF' ? `Student (${admissionNum})` : `Pending Verification (${admissionNum})`,
      classArm: 'Primary 2 Ruby',
      session: '2026/2027 Academic Session',
      term: 'First Term',
      expectedFees: 140000,
      verifiedPayments: 0,
      outstandingBalance: 140000,
      attendancePercentage: 100,
      academicAverage: 80.0,
      academicGrade: 'A',
      recentActivity: [
        {
          id: `act-${Date.now()}`,
          type: 'ASSESSMENT',
          title: 'Profile linked',
          subtitle: `Enrolled under ${user.fullName}`,
          date: 'Just now',
          badgeText: 'Linked',
          badgeColor: 'success',
        },
      ],
      subjects: [
        { id: `sub-new-1`, subject: 'Mathematics', caScore: 30.0, examScore: 50.0, totalScore: 80.0, grade: 'A', isPublished: true },
        { id: `sub-new-2`, subject: 'English Studies', caScore: 32.0, examScore: 48.0, totalScore: 80.0, grade: 'A', isPublished: true },
      ],
      transactions: [],
      reports: [
        {
          id: `rep-new-1`,
          term: 'First Term',
          session: '2026/2027 Academic Session',
          isRestricted: true,
          outstandingBalance: 140000,
          attendanceDays: 50,
          totalSchoolDays: 50,
        },
      ],
    };

    setChildrenList((prev) => [...prev, newChild]);
    setSelectedChildId(newChild.id);
  };

  // Add payment transaction to selected child's dual-ledger
  const handleAddTransaction = (txn: PaymentTransaction) => {
    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id !== selectedChildId) return c;

        const updatedTxns = [txn, ...c.transactions];
        const newVerifiedTotal =
          txn.status === 'VERIFIED' ? c.verifiedPayments + txn.amount : c.verifiedPayments;
        const newOutstanding = Math.max(0, c.expectedFees - newVerifiedTotal);

        return {
          ...c,
          verifiedPayments: newVerifiedTotal,
          outstandingBalance: newOutstanding,
          transactions: updatedTxns,
          recentActivity: [
            {
              id: `act-${Date.now()}`,
              type: 'PAYMENT',
              title: txn.status === 'VERIFIED' ? 'Payment Verified' : 'Transfer Submitted',
              subtitle: `₦${txn.amount.toLocaleString('en-NG')} • Ref: ${txn.reference}`,
              date: 'Today',
              badgeText: txn.status === 'VERIFIED' ? 'Verified' : 'Pending',
              badgeColor: txn.status === 'VERIFIED' ? 'success' : 'warning',
            },
            ...c.recentActivity,
          ],
          reports: c.reports.map((r) =>
            r.term === c.term
              ? {
                  ...r,
                  outstandingBalance: newOutstanding,
                  isRestricted: newOutstanding > 0,
                }
              : r
          ),
        };
      })
    );
  };

  // Server-enforced logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      const res = await fetch('/api/logout', { method: 'POST' });
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}: Failed to invalidate session on database.`);
      }
      router.push('/auth?mode=login');
    } catch (err: any) {
      console.error('[Logout Network Failure]:', err);
      setIsLoggingOut(false);
      setLogoutError(
        'Network error during logout: Server could not be reached to invalidate your session. You remain securely authenticated on this terminal.'
      );
    }
  };

  // NDPA Soft-Delete Initiation (7-Day Lock)
  const handleInitiateDeletion = async () => {
    const confirmDelete = window.confirm(
      'NDPA Compliance Notice:\n\nUnder NDPA 2023 regulations, requesting account deletion locks your account immediately and initiates a 7-day grace period. During this period, your data remains intact for recovery. After 7 days, a scheduled purge transaction permanently anonymizes your personal records while retaining immutable payment ledgers for legal tax compliance.\n\nProceed with 7-day deletion lock?'
    );

    if (!confirmDelete) return;

    setIsDeleting(true);
    setDeletionStatus(null);

    try {
      const res = await fetch('/api/account/delete', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setDeletionStatus(
          `Account locked under NDPA 7-day grace period. Scheduled purge at: ${new Date(
            data.scheduledPurgeAt
          ).toLocaleDateString()}. All active sessions revoked.`
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
    <Navigation
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'instant' });
        }
      }}
      selectedChild={selectedChild}
      totalChildrenCount={childrenList.length}
      onOpenChildModal={() => setIsChildModalOpen(true)}
      userFullName={user.fullName}
      onLogout={handleLogout}
      isLoggingOut={isLoggingOut}
    >
      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '56rem',
          margin: '0 auto',
          padding: 'var(--spacing-medium) var(--spacing-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-medium)',
          paddingBottom: '5.5rem', // Space for fixed mobile bottom navigation
          boxSizing: 'border-box',
        }}
      >
        {/* Logout Failure Edge-Case Alert */}
        {logoutError && (
          <div
            className="type-body-small"
            style={{
              padding: 'var(--spacing-small)',
              backgroundColor: 'var(--color-error-container)',
              color: 'var(--color-on-error-container)',
              borderRadius: 'var(--radius-small)',
              border: '1px solid var(--color-error)',
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
              <span style={{ fontSize: 'var(--type-title-large-size)' }}>⚠️</span>
              <strong className="type-title-small">
                Account Unverified (Soft Gating Mode Active)
              </strong>
            </div>
            <p className="type-body-small" style={{ margin: 0 }}>
              Welcome to SchoolFix! You are authenticated under our <strong>Soft Gating</strong> onboarding policy.
              Electronic payments, terminal Continuous Assessment (CA) report cards, and attendance registers remain{' '}
              <strong>gated and locked</strong> until your email address is verified.
            </p>
            <div style={{ marginTop: '0.25rem' }}>
              <Link
                href={`/auth?mode=verify&email=${encodeURIComponent(user.email)}`}
                className="type-label-medium"
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  backgroundColor: 'var(--color-primary)',
                  color: 'var(--color-on-primary)',
                  borderRadius: 'var(--radius-small)',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                }}
              >
                Complete 6-Digit Email Verification →
              </Link>
            </div>
          </div>
        )}

        {/* Deletion Status Notice */}
        {deletionStatus && (
          <div
            className="type-body-small"
            style={{
              padding: 'var(--spacing-small)',
              backgroundColor: 'var(--color-primary-container)',
              color: 'var(--color-on-primary-container)',
              borderRadius: 'var(--radius-small)',
            }}
          >
            {deletionStatus}
          </div>
        )}

        {/* Dynamic Screen View Based on Active Tab */}
        {activeTab === 'home' && (
          <HomeView
            child={selectedChild}
            totalChildrenCount={childrenList.length}
            onOpenChildModal={() => setIsChildModalOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab)}
            parentName={user.fullName}
          />
        )}

        {activeTab === 'child' && <MyChildView child={selectedChild} />}

        {activeTab === 'payments' && (
          <PaymentsView child={selectedChild} onAddTransaction={handleAddTransaction} />
        )}

        {activeTab === 'reports' && (
          <ReportsView child={selectedChild} onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'account' && (
          <AccountView
            user={user}
            sessionId={sessionId}
            expiresAt={expiresAt}
            childrenList={childrenList}
            onOpenChildModal={() => setIsChildModalOpen(true)}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
            onInitiateDeletion={handleInitiateDeletion}
            isDeleting={isDeleting}
          />
        )}
      </main>

      {/* Multi-Child Selector & Linking Modal */}
      <ChildSelectorModal
        isOpen={isChildModalOpen}
        onClose={() => setIsChildModalOpen(false)}
        childrenList={childrenList}
        selectedChildId={selectedChildId}
        onSelectChild={(id) => setSelectedChildId(id)}
        onLinkChild={handleLinkChild}
      />
    </Navigation>
  );
}
