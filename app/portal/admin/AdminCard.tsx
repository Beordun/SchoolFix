// app/portal/admin/AdminCard.tsx
// SchoolFix Administrator Command Center
// Faithful, tokenized implementation of the Admin First-Run & Onboarding Wireframe:
// - Top global header with school selector, academic session/term selector, notifications & profile
// - 9-tab persistent left sidebar (Dashboard, Students, Classes, Fees, Payments, Reports, Handbook, Audit log, Settings)
// - Welcome greeting for the administrator (~15 minutes setup guidance)
// - 6-step Setup Progress Card (1 of 6 done) with active [Start →] action
// - Optional Policy Handbook Vector RAG callout
// - 4 actionable zero-state metric cards (Collected, Outstanding, To verify, Attendance) with contextual action buttons

'use client';

import React, { useState } from 'react';
import Link from 'next/link';

import StudentsView from './components/StudentsView';
import TeachersView from './components/TeachersView';
import ClassesView from './components/ClassesView';
import FeesView from './components/FeesView';
import PaymentsView from './components/PaymentsView';
import ReportsAdminView from './components/ReportsAdminView';
import HandbookView from './components/HandbookView';
import AuditLogView from './components/AuditLogView';
import SettingsView from './components/SettingsView';

interface AdminCardProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export default function AdminCard({ user }: AdminCardProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<
    'Dashboard' | 'Students' | 'Teachers' | 'Classes' | 'Fees' | 'Payments' | 'Reports' | 'Handbook' | 'Audit log' | 'Settings'
  >('Dashboard');

  // Mobile Drawer State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tenant & Academic Term State
  const [selectedSchool, setSelectedSchool] = useState('Greenfield Academy');
  const [selectedTerm, setSelectedTerm] = useState('2026/27 · First Term');

  // Onboarding Step State
  const [activeStep, setActiveStep] = useState<number>(2); // 2 = "Add school details & term dates"
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]); // 1 = "Create your account"
  const [showStepModal, setShowStepModal] = useState<string | null>(null);

  // Form State for Step 2: School Details & Term Dates
  const [schoolAddress, setSchoolAddress] = useState('14 Adeola Odeku Street, Victoria Island, Lagos');
  const [termStart, setTermStart] = useState('2026-09-14');
  const [termEnd, setTermEnd] = useState('2026-12-18');

  // Form State for Step 3: Create Classes
  const [classArmList, setClassArmList] = useState<string[]>([
    'Primary 1 Gold',
    'Primary 2 Silver',
    'Primary 3 Bronze',
    'Primary 4 Blue',
    'JSS 1 Ruby',
    'JSS 2 Diamond',
  ]);
  const [newClassName, setNewClassName] = useState('Primary 5');
  const [newArmName, setNewArmName] = useState('Emerald');

  // Form State for Step 4: Import Students
  const [importedStudentCount, setImportedStudentCount] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState('Greenfield_Enrolment_2026.csv');

  // Form State for Step 5: Invite Teachers
  const [teacherName, setTeacherName] = useState('Mr. Ibrahim Danladi');
  const [teacherEmail, setTeacherEmail] = useState('teacher.ibrahim@schoolfix.internal');
  const [teacherClassArm, setTeacherClassArm] = useState('Primary 4 Blue');
  const [invitedTeachers, setInvitedTeachers] = useState<string[]>([]);

  // Form State for Step 6: Fee Schedule
  const [tuitionFee, setTuitionFee] = useState('150000');
  const [devLevy, setDevLevy] = useState('20000');
  const [booksLevy, setBooksLevy] = useState('15000');
  const [configuredFees, setConfiguredFees] = useState(false);

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Administrator Display Name (from session or domain persona)
  const adminDisplayName = user.fullName || 'Mrs. Adeyemi';

  // Step 2 Handler: Save School Details
  const handleCompleteStep2 = () => {
    if (!completedSteps.includes(2)) {
      setCompletedSteps((prev) => [...prev, 2]);
      setActiveStep(3);
    }
    setSaveSuccessMsg('School details and term dates successfully saved!');
    setTimeout(() => {
      setShowStepModal(null);
      setSaveSuccessMsg(null);
    }, 1000);
  };

  // Step 3 Handler: Create Classes
  const handleAddClassArm = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClassName && newArmName) {
      setClassArmList((prev) => [...prev, `${newClassName} ${newArmName}`]);
      setNewClassName('');
      setNewArmName('');
    }
  };

  const handleCompleteStep3 = () => {
    if (!completedSteps.includes(3)) {
      setCompletedSteps((prev) => [...prev, 3]);
      setActiveStep(4);
    }
    setSaveSuccessMsg(`${classArmList.length} class arms successfully registered!`);
    setTimeout(() => {
      setShowStepModal(null);
      setSaveSuccessMsg(null);
    }, 1000);
  };

  // Step 4 Handler: Import Students
  const handleCompleteStep4 = () => {
    setImportedStudentCount(148);
    if (!completedSteps.includes(4)) {
      setCompletedSteps((prev) => [...prev, 4]);
      setActiveStep(5);
    }
    setSaveSuccessMsg('Successfully imported 148 students and parent guardian contacts!');
    setTimeout(() => {
      setShowStepModal(null);
      setSaveSuccessMsg(null);
    }, 1000);
  };

  // Step 5 Handler: Invite Teachers
  const handleCompleteStep5 = () => {
    if (teacherName && !invitedTeachers.includes(teacherName)) {
      setInvitedTeachers((prev) => [...prev, `${teacherName} (${teacherClassArm})`]);
    }
    if (!completedSteps.includes(5)) {
      setCompletedSteps((prev) => [...prev, 5]);
      setActiveStep(6);
    }
    setSaveSuccessMsg(`Teacher account created and assigned to ${teacherClassArm}!`);
    setTimeout(() => {
      setShowStepModal(null);
      setSaveSuccessMsg(null);
    }, 1000);
  };

  // Step 6 Handler: Set Fee Schedule
  const handleCompleteStep6 = () => {
    setConfiguredFees(true);
    if (!completedSteps.includes(6)) {
      setCompletedSteps((prev) => [...prev, 6]);
    }
    const total = parseInt(tuitionFee || '0', 10) + parseInt(devLevy || '0', 10) + parseInt(booksLevy || '0', 10);
    setSaveSuccessMsg(`Term fee schedule configured at ₦${total.toLocaleString()} per student!`);
    setTimeout(() => {
      setShowStepModal(null);
      setSaveSuccessMsg(null);
    }, 1000);
  };

  const navItems = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'Students', icon: '🎓' },
    { name: 'Teachers', icon: '👩‍🏫' },
    { name: 'Classes', icon: '🏫' },
    { name: 'Fees', icon: '💳' },
    { name: 'Payments', icon: '🧾' },
    { name: 'Reports', icon: '📄' },
    { name: 'Handbook', icon: '📚' },
    { name: 'Audit log', icon: '📋' },
    { name: 'Settings', icon: '⚙️' },
  ] as const;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-on-surface)',
        fontFamily: 'var(--type-font-family, sans-serif)',
      }}
    >
      {/* 1. TOP GLOBAL NAVIGATION HEADER */}
      <header
        style={{
          height: '4rem',
          backgroundColor: 'var(--color-surface-container-lowest)',
          borderBottom: '1px solid var(--color-outline-variant)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 0,
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        {/* Left Column: Brand Logo + Mobile Hamburger (Matches 15rem sidebar on desktop) */}
        <div
          className="admin-header-brand-col"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-3)',
            height: '100%',
          }}
        >
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation drawer"
            className="admin-hamburger-btn"
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              color: 'var(--color-on-surface)',
              cursor: 'pointer',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'var(--size-touch-target)',
              height: 'var(--size-touch-target)',
              borderRadius: 'var(--radius-small)',
            }}
          >
            ☰
          </button>

          <Link
            href="/portal/admin"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-2)',
              textDecoration: 'none',
              color: 'var(--color-primary)',
            }}
          >
            <span
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: 'var(--radius-small)',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.875rem',
              }}
            >
              SF
            </span>
            <span
              style={{
                fontWeight: 800,
                fontSize: 'var(--type-title-medium-size)',
                letterSpacing: '-0.02em',
              }}
            >
              SchoolFix
            </span>
          </Link>
        </div>

        {/* Center: Greenfield Academy & Term selector (Aligned with padding of main content on desktop, collapsed on tablet/mobile) */}
        <div
          className="admin-header-tabs-col"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-3)',
            flex: 1,
            height: '100%',
          }}
        >
          {/* School Selector Dropdown - Clean Tab with single dropdown arrow */}
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              aria-label="Select School Branch"
              style={{
                padding: 'var(--spacing-2) 1.85rem var(--spacing-2) var(--spacing-3)',
                backgroundColor: 'var(--color-surface-container)',
                color: 'var(--color-on-surface)',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: 'var(--radius-small)',
                fontWeight: 600,
                fontSize: 'var(--type-label-medium-size)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
              }}
            >
              <option value="Greenfield Academy">Greenfield Academy</option>
              <option value="Gracefield College">Gracefield College</option>
              <option value="Crown Jewel International">Crown Jewel International</option>
            </select>
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                right: '0.65rem',
                pointerEvents: 'none',
                fontSize: '0.65rem',
                color: 'var(--color-on-surface-variant)',
                display: 'inline-flex',
                alignItems: 'center',
                lineHeight: 1,
              }}
            >
              ▼
            </span>
          </div>

          {/* Academic Session / Term Dropdown - Clean Tab with single dropdown arrow */}
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              aria-label="Select Academic Term"
              style={{
                padding: 'var(--spacing-2) 1.85rem var(--spacing-2) var(--spacing-3)',
                backgroundColor: 'var(--color-surface-container)',
                color: 'var(--color-on-surface)',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: 'var(--radius-small)',
                fontWeight: 600,
                fontSize: 'var(--type-label-medium-size)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
              }}
            >
              <option value="2026/27 · First Term">2026/27 · First Term</option>
              <option value="2026/27 · Second Term">2026/27 · Second Term</option>
              <option value="2026/27 · Third Term">2026/27 · Third Term</option>
            </select>
            <span
              aria-hidden="true"
              style={{
                position: 'absolute',
                right: '0.65rem',
                pointerEvents: 'none',
                fontSize: '0.65rem',
                color: 'var(--color-on-surface-variant)',
                display: 'inline-flex',
                alignItems: 'center',
                lineHeight: 1,
              }}
            >
              ▼
            </span>
          </div>
        </div>

        {/* Right: Notifications & User Avatar / Profile */}
        <div
          className="admin-header-actions-col"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-3)',
            paddingRight: 'var(--spacing-5)',
            flexShrink: 0,
          }}
        >
          {/* Notification Bell */}
          <button
            title="Notifications"
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              padding: 'var(--spacing-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-small)',
            }}
          >
            🔔
            <span
              style={{
                position: 'absolute',
                top: '0.25rem',
                right: '0.25rem',
                width: '0.5rem',
                height: '0.5rem',
                borderRadius: '50%',
                backgroundColor: 'var(--color-warning)',
              }}
            />
          </button>

          {/* User Profile Badge & Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
            <div
              style={{
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-container)',
                color: 'var(--color-on-primary-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              👤
            </div>
            <form action="/api/logout" method="POST">
              <button
                type="submit"
                className="admin-header-logout-btn"
                style={{
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-on-surface-variant)',
                  border: '1px solid var(--color-outline-variant)',
                  borderRadius: 'var(--radius-small)',
                  fontSize: 'var(--type-label-small-size)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Log Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* MOBILE / IPAD DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(2px)',
            }}
          />

          {/* Sliding Drawer Container */}
          <div
            style={{
              position: 'relative',
              width: '18rem',
              maxWidth: '85vw',
              height: '100%',
              backgroundColor: 'var(--color-surface-container-lowest)',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-hard)',
              zIndex: 101,
              padding: 'var(--spacing-4) 0',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 var(--spacing-4) var(--spacing-4) var(--spacing-4)',
                borderBottom: '1px solid var(--color-outline-variant)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                <span
                  style={{
                    width: '2rem',
                    height: '2rem',
                    borderRadius: 'var(--radius-small)',
                    backgroundColor: 'var(--color-primary)',
                    color: 'var(--color-on-primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.875rem',
                  }}
                >
                  SF
                </span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 'var(--type-title-medium-size)',
                    color: 'var(--color-primary)',
                  }}
                >
                  SchoolFix
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: 'var(--color-on-surface-variant)',
                  padding: 'var(--spacing-1)',
                }}
              >
                ✕
              </button>
            </div>

            {/* Collapsed Top Nav Bar Elements (Active School & Term) for Tablet/Mobile */}
            <div
              style={{
                padding: 'var(--spacing-3) var(--spacing-4)',
                borderBottom: '1px solid var(--color-outline-variant)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-2)',
                backgroundColor: 'var(--color-surface-container-low)',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>
                Active School &amp; Term
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  aria-label="Select School Branch"
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-2) 1.85rem var(--spacing-2) var(--spacing-3)',
                    backgroundColor: 'var(--color-surface-container)',
                    color: 'var(--color-on-surface)',
                    border: '1px solid var(--color-outline-variant)',
                    borderRadius: 'var(--radius-small)',
                    fontWeight: 600,
                    fontSize: 'var(--type-label-medium-size)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    outline: 'none',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                  }}
                >
                  <option value="Greenfield Academy">Greenfield Academy</option>
                  <option value="Gracefield College">Gracefield College</option>
                  <option value="Crown Jewel International">Crown Jewel International</option>
                </select>
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    pointerEvents: 'none',
                    fontSize: '0.65rem',
                    color: 'var(--color-on-surface-variant)',
                    lineHeight: 1,
                  }}
                >
                  ▼
                </span>
              </div>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  aria-label="Select Academic Term"
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-2) 1.85rem var(--spacing-2) var(--spacing-3)',
                    backgroundColor: 'var(--color-surface-container)',
                    color: 'var(--color-on-surface)',
                    border: '1px solid var(--color-outline-variant)',
                    borderRadius: 'var(--radius-small)',
                    fontWeight: 600,
                    fontSize: 'var(--type-label-medium-size)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    outline: 'none',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                  }}
                >
                  <option value="2026/27 · First Term">2026/27 · First Term</option>
                  <option value="2026/27 · Second Term">2026/27 · Second Term</option>
                  <option value="2026/27 · Third Term">2026/27 · Third Term</option>
                </select>
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    pointerEvents: 'none',
                    fontSize: '0.65rem',
                    color: 'var(--color-on-surface-variant)',
                    lineHeight: 1,
                  }}
                >
                  ▼
                </span>
              </div>
            </div>

            {/* Drawer Nav List */}
            <nav
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-1)',
                padding: 'var(--spacing-3) var(--spacing-2)',
                overflowY: 'auto',
                flex: 1,
              }}
            >
              {navItems.map((item) => {
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveTab(item.name as typeof activeTab);
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-3)',
                      padding: 'var(--spacing-3) var(--spacing-3)',
                      borderRadius: 'var(--radius-small)',
                      border: 'none',
                      backgroundColor: isActive ? 'var(--color-surface-container-high)' : 'transparent',
                      color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: 'var(--type-label-large-size)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      minHeight: 'var(--size-touch-target)',
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>

            {/* Drawer Footer */}
            <div style={{ padding: 'var(--spacing-4)', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              <Link
                href="/portal/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'block',
                  fontSize: 'var(--type-body-small-size)',
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                  fontWeight: 600,
                  padding: 'var(--spacing-1) 0',
                }}
              >
                ← Switch to Parent View
              </Link>
              <form action="/api/logout" method="POST">
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-2) var(--spacing-3)',
                    backgroundColor: 'transparent',
                    color: 'var(--color-error)',
                    border: '1px solid var(--color-outline-variant)',
                    borderRadius: 'var(--radius-small)',
                    fontSize: 'var(--type-label-small-size)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  Log Out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 2. BODY LAYOUT: SIDEBAR + MAIN CONTENT */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Left Navigation Sidebar (Sticky on Desktop, Hidden on Tablet/Mobile) */}
        <aside
          className="admin-desktop-sidebar"
          style={{
            width: '15rem',
            backgroundColor: 'var(--color-surface-container-lowest)',
            borderRight: '1px solid var(--color-outline-variant)',
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--spacing-4) 0',
            flexShrink: 0,
            position: 'sticky',
            top: '4rem',
            height: 'calc(100vh - 4rem)',
            alignSelf: 'flex-start',
            overflowY: 'auto',
          }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)', padding: '0 var(--spacing-3)' }}>
            {navItems.map((item) => {
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name as typeof activeTab)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-3)',
                    padding: 'var(--spacing-2) var(--spacing-3)',
                    borderRadius: 'var(--radius-small)',
                    border: 'none',
                    backgroundColor: isActive ? 'var(--color-surface-container-high)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 'var(--type-label-large-size)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    minHeight: '2.5rem',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '1.125rem' }}>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          <div style={{ marginTop: 'auto', padding: 'var(--spacing-4)', borderTop: '1px solid var(--color-outline-variant)' }}>
            <Link
              href="/portal/dashboard"
              style={{
                display: 'block',
                fontSize: 'var(--type-body-small-size)',
                color: 'var(--color-primary)',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              ← Switch to Parent View
            </Link>
          </div>
        </aside>

        {/* Main Content Area (Full Width with Left Padding Maintained) */}
        <main
          style={{
            flex: 1,
            padding: 'var(--spacing-6)',
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-6)',
          }}
        >
          {activeTab === 'Dashboard' && (
            <>
              {/* Header Greeting */}
          <div>
            <h1
              style={{
                fontSize: 'var(--type-headline-medium-size)',
                lineHeight: 'var(--type-headline-medium-line-height)',
                fontWeight: 700,
                margin: 0,
                color: 'var(--color-on-surface)',
              }}
            >
              Welcome, {adminDisplayName} 👋
            </h1>
            <p
              style={{
                fontSize: 'var(--type-body-medium-size)',
                color: 'var(--color-on-surface-variant)',
                margin: 'var(--spacing-1) 0 0 0',
              }}
            >
              Let&apos;s get {selectedSchool} ready. ~15 minutes.
            </p>
          </div>

          {/* 6-STEP SETUP PROGRESS CARD */}
          <section
            style={{
              backgroundColor: 'var(--color-surface-container-lowest)',
              borderRadius: 'var(--radius-medium)',
              border: '1px solid var(--color-outline-variant)',
              padding: 'var(--spacing-5)',
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-4)',
            }}
          >
            {/* Header with Step Counter */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--color-outline-variant)',
                paddingBottom: 'var(--spacing-3)',
              }}
            >
              <h2
                style={{
                  fontSize: 'var(--type-title-small-size)',
                  fontWeight: 700,
                  margin: 0,
                  color: 'var(--color-primary)',
                }}
              >
                Setup progress
              </h2>
              <span
                style={{
                  fontSize: 'var(--type-label-small-size)',
                  backgroundColor: 'var(--color-primary-container)',
                  color: 'var(--color-on-primary-container)',
                  padding: '0.125rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                }}
              >
                {completedSteps.length} of 6 done
              </span>
            </div>

            {/* Checklist of 6 Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              {/* Step 1: Create your account */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-3)',
                  fontSize: 'var(--type-body-medium-size)',
                }}
              >
                <span
                  style={{
                    color: 'var(--color-success)',
                    fontWeight: 'bold',
                    fontSize: '1.125rem',
                    width: '1.25rem',
                  }}
                >
                  ✓
                </span>
                <span style={{ fontWeight: 600 }}>Create your account</span>
              </div>

              {/* Step 2: Add school details & term dates (Active step) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--spacing-3)',
                  fontSize: 'var(--type-body-medium-size)',
                  backgroundColor: completedSteps.includes(2) ? 'transparent' : 'var(--color-surface)',
                  padding: completedSteps.includes(2) ? '0' : 'var(--spacing-2) var(--spacing-3)',
                  borderRadius: 'var(--radius-small)',
                  border: completedSteps.includes(2) ? 'none' : '1px solid var(--color-primary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                  <span
                    style={{
                      color: completedSteps.includes(2) ? 'var(--color-success)' : 'var(--color-primary)',
                      fontWeight: 'bold',
                      fontSize: '1.125rem',
                      width: '1.25rem',
                    }}
                  >
                    {completedSteps.includes(2) ? '✓' : '▶'}
                  </span>
                  <span style={{ fontWeight: 600 }}>Add school details &amp; term dates</span>
                </div>

                {!completedSteps.includes(2) ? (
                  <button
                    onClick={() => setShowStepModal('details')}
                    style={{
                      padding: 'var(--spacing-1) var(--spacing-3)',
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      border: 'none',
                      borderRadius: 'var(--radius-small)',
                      fontWeight: 700,
                      fontSize: 'var(--type-label-small-size)',
                      cursor: 'pointer',
                      minHeight: '2rem',
                    }}
                  >
                    [Start →]
                  </button>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>
                    Configured
                  </span>
                )}
              </div>

              {/* Step 3: Create classes */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--spacing-3)',
                  fontSize: 'var(--type-body-medium-size)',
                  backgroundColor: !completedSteps.includes(3) && activeStep === 3 ? 'var(--color-surface)' : 'transparent',
                  padding: !completedSteps.includes(3) && activeStep === 3 ? 'var(--spacing-2) var(--spacing-3)' : '0',
                  borderRadius: 'var(--radius-small)',
                  border: !completedSteps.includes(3) && activeStep === 3 ? '1px solid var(--color-primary)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                  <span
                    style={{
                      color: completedSteps.includes(3)
                        ? 'var(--color-success)'
                        : activeStep === 3
                        ? 'var(--color-primary)'
                        : 'var(--color-on-surface-variant)',
                      fontWeight: 'bold',
                      fontSize: '1.125rem',
                      width: '1.25rem',
                    }}
                  >
                    {completedSteps.includes(3) ? '✓' : activeStep === 3 ? '▶' : '○'}
                  </span>
                  <span
                    style={{
                      fontWeight: completedSteps.includes(3) || activeStep === 3 ? 600 : 500,
                      color: completedSteps.includes(3) || activeStep === 3 ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)',
                    }}
                  >
                    Create classes {completedSteps.includes(3) && `(${classArmList.length} arms registered)`}
                  </span>
                </div>

                {!completedSteps.includes(3) ? (
                  <button
                    onClick={() => setShowStepModal('classes')}
                    style={{
                      padding: 'var(--spacing-1) var(--spacing-3)',
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      border: 'none',
                      borderRadius: 'var(--radius-small)',
                      fontWeight: 700,
                      fontSize: 'var(--type-label-small-size)',
                      cursor: 'pointer',
                      minHeight: '2rem',
                    }}
                  >
                    [Start →]
                  </button>
                ) : (
                  <button
                    onClick={() => setShowStepModal('classes')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-success)',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Configured ({classArmList.length})
                  </button>
                )}
              </div>

              {/* Step 4: Import students & parents (Excel/CSV) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--spacing-3)',
                  fontSize: 'var(--type-body-medium-size)',
                  backgroundColor: !completedSteps.includes(4) && activeStep === 4 ? 'var(--color-surface)' : 'transparent',
                  padding: !completedSteps.includes(4) && activeStep === 4 ? 'var(--spacing-2) var(--spacing-3)' : '0',
                  borderRadius: 'var(--radius-small)',
                  border: !completedSteps.includes(4) && activeStep === 4 ? '1px solid var(--color-primary)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                  <span
                    style={{
                      color: completedSteps.includes(4)
                        ? 'var(--color-success)'
                        : activeStep === 4
                        ? 'var(--color-primary)'
                        : 'var(--color-on-surface-variant)',
                      fontWeight: 'bold',
                      fontSize: '1.125rem',
                      width: '1.25rem',
                    }}
                  >
                    {completedSteps.includes(4) ? '✓' : activeStep === 4 ? '▶' : '○'}
                  </span>
                  <span
                    style={{
                      fontWeight: completedSteps.includes(4) || activeStep === 4 ? 600 : 500,
                      color: completedSteps.includes(4) || activeStep === 4 ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)',
                    }}
                  >
                    Import students &amp; parents (Excel/CSV) {completedSteps.includes(4) && `(148 students)`}
                  </span>
                </div>

                {!completedSteps.includes(4) ? (
                  <button
                    onClick={() => setShowStepModal('students')}
                    style={{
                      padding: 'var(--spacing-1) var(--spacing-3)',
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      border: 'none',
                      borderRadius: 'var(--radius-small)',
                      fontWeight: 700,
                      fontSize: 'var(--type-label-small-size)',
                      cursor: 'pointer',
                      minHeight: '2rem',
                    }}
                  >
                    [Start →]
                  </button>
                ) : (
                  <button
                    onClick={() => setShowStepModal('students')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-success)',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Imported (148)
                  </button>
                )}
              </div>

              {/* Step 5: Invite teachers & assign classes */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--spacing-3)',
                  fontSize: 'var(--type-body-medium-size)',
                  backgroundColor: !completedSteps.includes(5) && activeStep === 5 ? 'var(--color-surface)' : 'transparent',
                  padding: !completedSteps.includes(5) && activeStep === 5 ? 'var(--spacing-2) var(--spacing-3)' : '0',
                  borderRadius: 'var(--radius-small)',
                  border: !completedSteps.includes(5) && activeStep === 5 ? '1px solid var(--color-primary)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                  <span
                    style={{
                      color: completedSteps.includes(5)
                        ? 'var(--color-success)'
                        : activeStep === 5
                        ? 'var(--color-primary)'
                        : 'var(--color-on-surface-variant)',
                      fontWeight: 'bold',
                      fontSize: '1.125rem',
                      width: '1.25rem',
                    }}
                  >
                    {completedSteps.includes(5) ? '✓' : activeStep === 5 ? '▶' : '○'}
                  </span>
                  <span
                    style={{
                      fontWeight: completedSteps.includes(5) || activeStep === 5 ? 600 : 500,
                      color: completedSteps.includes(5) || activeStep === 5 ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)',
                    }}
                  >
                    Invite teachers &amp; assign classes {invitedTeachers.length > 0 && `(${invitedTeachers.length} assigned)`}
                  </span>
                </div>

                {!completedSteps.includes(5) ? (
                  <button
                    onClick={() => setShowStepModal('teachers')}
                    style={{
                      padding: 'var(--spacing-1) var(--spacing-3)',
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      border: 'none',
                      borderRadius: 'var(--radius-small)',
                      fontWeight: 700,
                      fontSize: 'var(--type-label-small-size)',
                      cursor: 'pointer',
                      minHeight: '2rem',
                    }}
                  >
                    [Start →]
                  </button>
                ) : (
                  <button
                    onClick={() => setShowStepModal('teachers')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-success)',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Assigned ({invitedTeachers.length || 1})
                  </button>
                )}
              </div>

              {/* Step 6: Set fee schedule */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--spacing-3)',
                  fontSize: 'var(--type-body-medium-size)',
                  backgroundColor: !completedSteps.includes(6) && activeStep === 6 ? 'var(--color-surface)' : 'transparent',
                  padding: !completedSteps.includes(6) && activeStep === 6 ? 'var(--spacing-2) var(--spacing-3)' : '0',
                  borderRadius: 'var(--radius-small)',
                  border: !completedSteps.includes(6) && activeStep === 6 ? '1px solid var(--color-primary)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                  <span
                    style={{
                      color: completedSteps.includes(6)
                        ? 'var(--color-success)'
                        : activeStep === 6
                        ? 'var(--color-primary)'
                        : 'var(--color-on-surface-variant)',
                      fontWeight: 'bold',
                      fontSize: '1.125rem',
                      width: '1.25rem',
                    }}
                  >
                    {completedSteps.includes(6) ? '✓' : activeStep === 6 ? '▶' : '○'}
                  </span>
                  <span
                    style={{
                      fontWeight: completedSteps.includes(6) || activeStep === 6 ? 600 : 500,
                      color: completedSteps.includes(6) || activeStep === 6 ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)',
                    }}
                  >
                    Set fee schedule {configuredFees && `(₦${(parseInt(tuitionFee) + parseInt(devLevy) + parseInt(booksLevy)).toLocaleString()}/term)`}
                  </span>
                </div>

                {!completedSteps.includes(6) ? (
                  <button
                    onClick={() => setShowStepModal('fees')}
                    style={{
                      padding: 'var(--spacing-1) var(--spacing-3)',
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      border: 'none',
                      borderRadius: 'var(--radius-small)',
                      fontWeight: 700,
                      fontSize: 'var(--type-label-small-size)',
                      cursor: 'pointer',
                      minHeight: '2rem',
                    }}
                  >
                    [Start →]
                  </button>
                ) : (
                  <button
                    onClick={() => setShowStepModal('fees')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-success)',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    Configured
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Optional Policy Handbook RAG Callout */}
          <div
            style={{
              padding: 'var(--spacing-3) var(--spacing-4)',
              backgroundColor: 'var(--color-surface-container)',
              borderRadius: 'var(--radius-small)',
              border: '1px dashed var(--color-outline)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 'var(--type-body-small-size)',
            }}
          >
            <span>
              💡 <strong>Optional later:</strong> upload handbook for the policy assistant
            </span>
            <button
              onClick={() => setActiveTab('Handbook')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                fontWeight: 700,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Upload PDF →
            </button>
          </div>

          {/* 4 ACTIONABLE ZERO-STATE METRIC CARDS */}
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))',
              gap: 'var(--spacing-4)',
            }}
          >
            {/* Card 1: Collected */}
            <div
              style={{
                backgroundColor: 'var(--color-surface-container-lowest)',
                borderRadius: 'var(--radius-medium)',
                border: '1px solid var(--color-outline-variant)',
                padding: 'var(--spacing-4)',
                boxShadow: 'var(--shadow-soft)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-2)',
              }}
            >
              <span
                style={{
                  fontSize: 'var(--type-label-small-size)',
                  fontWeight: 600,
                  color: 'var(--color-on-surface-variant)',
                  textTransform: 'uppercase',
                }}
              >
                Collected
              </span>
              <div
                style={{
                  fontSize: 'var(--type-headline-medium-size)',
                  lineHeight: 1.2,
                  fontWeight: 800,
                  color: configuredFees ? 'var(--color-success)' : 'var(--color-on-surface)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {configuredFees ? '₦18,400,000' : '₦0'}
              </div>
              <button
                onClick={() => (configuredFees ? setActiveTab('Fees') : setShowStepModal('fees'))}
                style={{
                  marginTop: 'auto',
                  padding: 'var(--spacing-2)',
                  backgroundColor: 'var(--color-surface-container-high)',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-outline-variant)',
                  borderRadius: 'var(--radius-small)',
                  fontSize: 'var(--type-label-small-size)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {configuredFees ? 'View fee schedule →' : 'Set fees'}
              </button>
            </div>

            {/* Card 2: Outstanding */}
            <div
              style={{
                backgroundColor: 'var(--color-surface-container-lowest)',
                borderRadius: 'var(--radius-medium)',
                border: '1px solid var(--color-outline-variant)',
                padding: 'var(--spacing-4)',
                boxShadow: 'var(--shadow-soft)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-2)',
              }}
            >
              <span
                style={{
                  fontSize: 'var(--type-label-small-size)',
                  fontWeight: 600,
                  color: 'var(--color-on-surface-variant)',
                  textTransform: 'uppercase',
                }}
              >
                Outstanding
              </span>
              <div
                style={{
                  fontSize: 'var(--type-headline-medium-size)',
                  lineHeight: 1.2,
                  fontWeight: 800,
                  color: configuredFees ? 'var(--color-error)' : 'var(--color-on-surface)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {configuredFees ? '₦7,150,000' : '₦0'}
              </div>
              <button
                onClick={() => (configuredFees ? setActiveTab('Students') : setShowStepModal('fees'))}
                style={{
                  marginTop: 'auto',
                  padding: 'var(--spacing-2)',
                  backgroundColor: 'var(--color-surface-container-high)',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-outline-variant)',
                  borderRadius: 'var(--radius-small)',
                  fontSize: 'var(--type-label-small-size)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {configuredFees ? 'View student debts →' : 'Set fees'}
              </button>
            </div>

            {/* Card 3: To verify */}
            <div
              style={{
                backgroundColor: 'var(--color-surface-container-lowest)',
                borderRadius: 'var(--radius-medium)',
                border: '1px solid var(--color-outline-variant)',
                padding: 'var(--spacing-4)',
                boxShadow: 'var(--shadow-soft)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-2)',
              }}
            >
              <span
                style={{
                  fontSize: 'var(--type-label-small-size)',
                  fontWeight: 600,
                  color: 'var(--color-on-surface-variant)',
                  textTransform: 'uppercase',
                }}
              >
                To verify
              </span>
              <div
                style={{
                  fontSize: 'var(--type-headline-medium-size)',
                  lineHeight: 1.2,
                  fontWeight: 800,
                  color: completedSteps.includes(4) ? 'var(--color-warning)' : 'var(--color-on-surface)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {completedSteps.includes(4) ? '3' : '0'}
              </div>
              <button
                onClick={() => setActiveTab('Payments')}
                style={{
                  marginTop: 'auto',
                  padding: 'var(--spacing-2)',
                  backgroundColor: completedSteps.includes(4) ? 'var(--color-warning-container)' : 'var(--color-surface-container-high)',
                  color: completedSteps.includes(4) ? 'var(--color-on-warning-container)' : 'var(--color-primary)',
                  border: '1px solid var(--color-outline-variant)',
                  borderRadius: 'var(--radius-small)',
                  fontSize: 'var(--type-label-small-size)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {completedSteps.includes(4) ? 'Verify 3 payments →' : 'Reconciliation queue →'}
              </button>
            </div>

            {/* Card 4: Attendance */}
            <div
              style={{
                backgroundColor: 'var(--color-surface-container-lowest)',
                borderRadius: 'var(--radius-medium)',
                border: '1px solid var(--color-outline-variant)',
                padding: 'var(--spacing-4)',
                boxShadow: 'var(--shadow-soft)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-2)',
              }}
            >
              <span
                style={{
                  fontSize: 'var(--type-label-small-size)',
                  fontWeight: 600,
                  color: 'var(--color-on-surface-variant)',
                  textTransform: 'uppercase',
                }}
              >
                Attendance
              </span>
              <div
                style={{
                  fontSize: 'var(--type-headline-medium-size)',
                  lineHeight: 1.2,
                  fontWeight: 800,
                  color: completedSteps.includes(3) ? 'var(--color-success)' : 'var(--color-on-surface)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {completedSteps.includes(3) ? '94.2%' : '—'}
              </div>
              <button
                onClick={() => (completedSteps.includes(3) ? setActiveTab('Classes') : setShowStepModal('classes'))}
                style={{
                  marginTop: 'auto',
                  padding: 'var(--spacing-2)',
                  backgroundColor: 'var(--color-surface-container-high)',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-outline-variant)',
                  borderRadius: 'var(--radius-small)',
                  fontSize: 'var(--type-label-small-size)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {completedSteps.includes(3) ? `${classArmList.length} arms active →` : 'Add class'}
              </button>
            </div>
          </section>
            </>
          )}

          {/* TAB 2: STUDENTS REGISTER */}
          {activeTab === 'Students' && <StudentsView />}

          {/* TAB 3: TEACHERS & CLASS ASSIGNMENTS */}
          {activeTab === 'Teachers' && <TeachersView />}

          {/* TAB 4: CLASSES & ARMS */}
          {activeTab === 'Classes' && <ClassesView />}

          {/* TAB 4: FEES SCHEDULE */}
          {activeTab === 'Fees' && <FeesView />}

          {/* TAB 5: PAYMENTS & RECONCILIATION */}
          {activeTab === 'Payments' && <PaymentsView bursarName={user.fullName || 'Mrs. Adeyemi'} />}

          {/* TAB 6: TERMINAL REPORTS CLEARANCE GATE */}
          {activeTab === 'Reports' && <ReportsAdminView />}

          {/* TAB 7: POLICY HANDBOOK RAG ASSISTANT */}
          {activeTab === 'Handbook' && <HandbookView />}

          {/* TAB 8: CAMA § 374 AUDIT LOG */}
          {activeTab === 'Audit log' && <AuditLogView />}

          {/* TAB 9: SCHOOL SETTINGS */}
          {activeTab === 'Settings' && <SettingsView />}
        </main>
      </div>

      {/* 3. INTERACTIVE MODAL FOR ACTIVE STEP 2 [Start →] */}
      {showStepModal === 'details' && (
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
              <h3
                style={{
                  fontSize: 'var(--type-title-medium-size)',
                  fontWeight: 700,
                  margin: 0,
                  color: 'var(--color-primary)',
                }}
              >
                Step 2: School Details &amp; Term Dates
              </h3>
              <button
                onClick={() => setShowStepModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: 'var(--color-on-surface-variant)',
                }}
              >
                ✕
              </button>
            </div>

            {saveSuccessMsg ? (
              <div
                style={{
                  padding: 'var(--spacing-4)',
                  backgroundColor: 'var(--color-success-container)',
                  color: 'var(--color-on-success-container)',
                  borderRadius: 'var(--radius-small)',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                ✅ {saveSuccessMsg}
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCompleteStep2();
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 'var(--type-label-small-size)',
                      fontWeight: 700,
                      marginBottom: 'var(--spacing-1)',
                    }}
                  >
                    School Physical Address
                  </label>
                  <input
                    type="text"
                    value={schoolAddress}
                    onChange={(e) => setSchoolAddress(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-2) var(--spacing-3)',
                      borderRadius: 'var(--radius-small)',
                      border: '1px solid var(--color-outline)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-on-surface)',
                      fontSize: 'var(--type-body-small-size)',
                      minHeight: 'var(--size-touch-target)',
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 'var(--type-label-small-size)',
                        fontWeight: 700,
                        marginBottom: 'var(--spacing-1)',
                      }}
                    >
                      Term Start Date
                    </label>
                    <input
                      type="date"
                      value={termStart}
                      onChange={(e) => setTermStart(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-2) var(--spacing-3)',
                        borderRadius: 'var(--radius-small)',
                        border: '1px solid var(--color-outline)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-on-surface)',
                        fontSize: 'var(--type-body-small-size)',
                        minHeight: 'var(--size-touch-target)',
                      }}
                      required
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: 'var(--type-label-small-size)',
                        fontWeight: 700,
                        marginBottom: 'var(--spacing-1)',
                      }}
                    >
                      Term End Date
                    </label>
                    <input
                      type="date"
                      value={termEnd}
                      onChange={(e) => setTermEnd(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-2) var(--spacing-3)',
                        borderRadius: 'var(--radius-small)',
                        border: '1px solid var(--color-outline)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-on-surface)',
                        fontSize: 'var(--type-body-small-size)',
                        minHeight: 'var(--size-touch-target)',
                      }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'flex-end', marginTop: 'var(--spacing-2)' }}>
                  <button
                    type="button"
                    onClick={() => setShowStepModal(null)}
                    style={{
                      padding: 'var(--spacing-2) var(--spacing-4)',
                      backgroundColor: 'var(--color-surface-container)',
                      color: 'var(--color-on-surface)',
                      border: '1px solid var(--color-outline-variant)',
                      borderRadius: 'var(--radius-small)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      minHeight: 'var(--size-touch-target)',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: 'var(--spacing-2) var(--spacing-4)',
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      border: 'none',
                      borderRadius: 'var(--radius-small)',
                      fontWeight: 700,
                      cursor: 'pointer',
                      minHeight: 'var(--size-touch-target)',
                    }}
                  >
                    Save &amp; Continue →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL FOR STEP 3: CREATE CLASSES */}
      {showStepModal === 'classes' && (
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
              maxWidth: '36rem',
              width: '100%',
              boxShadow: 'var(--shadow-hard)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-4)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3
                  style={{
                    fontSize: 'var(--type-title-medium-size)',
                    fontWeight: 700,
                    margin: 0,
                    color: 'var(--color-primary)',
                  }}
                >
                  Step 3: Create Class Arms
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)' }}>
                  Configure your school sections, class grades, and arms (e.g. Primary 4 Blue).
                </p>
              </div>
              <button
                onClick={() => setShowStepModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: 'var(--color-on-surface-variant)',
                }}
              >
                ✕
              </button>
            </div>

            {saveSuccessMsg ? (
              <div
                style={{
                  padding: 'var(--spacing-4)',
                  backgroundColor: 'var(--color-success-container)',
                  color: 'var(--color-on-success-container)',
                  borderRadius: 'var(--radius-small)',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                ✅ {saveSuccessMsg}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                {/* Active class arm tags */}
                <div>
                  <span style={{ fontSize: 'var(--type-label-small-size)', fontWeight: 700, display: 'block', marginBottom: 'var(--spacing-2)' }}>
                    Registered Class Arms ({classArmList.length})
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)' }}>
                    {classArmList.map((arm, idx) => (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: 'var(--color-surface-container-high)',
                          color: 'var(--color-on-surface)',
                          padding: '0.25rem 0.625rem',
                          borderRadius: 'var(--radius-small)',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          border: '1px solid var(--color-outline-variant)',
                        }}
                      >
                        {arm}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Add new arm form */}
                <form onSubmit={handleAddClassArm} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 'var(--spacing-2)', alignItems: 'end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Class Level</label>
                    <input
                      type="text"
                      placeholder="e.g. Primary 5"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-2)',
                        borderRadius: 'var(--radius-small)',
                        border: '1px solid var(--color-outline)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-on-surface)',
                        fontSize: 'var(--type-body-small-size)',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Arm Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Emerald"
                      value={newArmName}
                      onChange={(e) => setNewArmName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-2)',
                        borderRadius: 'var(--radius-small)',
                        border: '1px solid var(--color-outline)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-on-surface)',
                        fontSize: 'var(--type-body-small-size)',
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    style={{
                      padding: 'var(--spacing-2) var(--spacing-3)',
                      backgroundColor: 'var(--color-surface-container-high)',
                      color: 'var(--color-primary)',
                      border: '1px solid var(--color-outline-variant)',
                      borderRadius: 'var(--radius-small)',
                      fontWeight: 700,
                      fontSize: 'var(--type-label-small-size)',
                      cursor: 'pointer',
                      height: '2.375rem',
                    }}
                  >
                    + Add Arm
                  </button>
                </form>

                <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'flex-end', borderTop: '1px solid var(--color-outline-variant)', paddingTop: 'var(--spacing-3)' }}>
                  <button
                    type="button"
                    onClick={() => setShowStepModal(null)}
                    style={{
                      padding: 'var(--spacing-2) var(--spacing-4)',
                      backgroundColor: 'var(--color-surface-container)',
                      color: 'var(--color-on-surface)',
                      border: '1px solid var(--color-outline-variant)',
                      borderRadius: 'var(--radius-small)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCompleteStep3}
                    style={{
                      padding: 'var(--spacing-2) var(--spacing-4)',
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      border: 'none',
                      borderRadius: 'var(--radius-small)',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Save Classes &amp; Continue →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL FOR STEP 4: IMPORT STUDENTS */}
      {showStepModal === 'students' && (
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
              maxWidth: '36rem',
              width: '100%',
              boxShadow: 'var(--shadow-hard)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3
                  style={{
                    fontSize: 'var(--type-title-medium-size)',
                    fontWeight: 700,
                    margin: 0,
                    color: 'var(--color-primary)',
                  }}
                >
                  Step 4: Import Students &amp; Parents (Excel/CSV)
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)' }}>
                  Upload your existing school enrolment register or bulk spreadsheet.
                </p>
              </div>
              <button
                onClick={() => setShowStepModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: 'var(--color-on-surface-variant)',
                }}
              >
                ✕
              </button>
            </div>

            {saveSuccessMsg ? (
              <div
                style={{
                  padding: 'var(--spacing-4)',
                  backgroundColor: 'var(--color-success-container)',
                  color: 'var(--color-on-success-container)',
                  borderRadius: 'var(--radius-small)',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                ✅ {saveSuccessMsg}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                {/* Upload Zone */}
                <div
                  style={{
                    padding: 'var(--spacing-6)',
                    border: '2px dashed var(--color-primary)',
                    borderRadius: 'var(--radius-medium)',
                    backgroundColor: 'var(--color-surface-container)',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 'var(--spacing-2)',
                  }}
                >
                  <span style={{ fontSize: '2.5rem' }}>📄</span>
                  <strong style={{ fontSize: 'var(--type-body-medium-size)' }}>{selectedFileName}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>
                    Ready to parse 148 student records across 6 class arms
                  </span>
                  <button
                    type="button"
                    style={{
                      marginTop: 'var(--spacing-2)',
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'var(--color-surface)',
                      border: '1px solid var(--color-outline-variant)',
                      borderRadius: 'var(--radius-small)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    📥 Download Standard CSV Template
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'flex-end', marginTop: 'var(--spacing-2)' }}>
                  <button
                    type="button"
                    onClick={() => setShowStepModal(null)}
                    style={{
                      padding: 'var(--spacing-2) var(--spacing-4)',
                      backgroundColor: 'var(--color-surface-container)',
                      color: 'var(--color-on-surface)',
                      border: '1px solid var(--color-outline-variant)',
                      borderRadius: 'var(--radius-small)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCompleteStep4}
                    style={{
                      padding: 'var(--spacing-2) var(--spacing-4)',
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      border: 'none',
                      borderRadius: 'var(--radius-small)',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Import 148 Students →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL FOR STEP 5: INVITE TEACHERS */}
      {showStepModal === 'teachers' && (
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
              maxWidth: '34rem',
              width: '100%',
              boxShadow: 'var(--shadow-hard)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3
                  style={{
                    fontSize: 'var(--type-title-medium-size)',
                    fontWeight: 700,
                    margin: 0,
                    color: 'var(--color-primary)',
                  }}
                >
                  Step 5: Invite Teachers &amp; Assign Class Arms
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)' }}>
                  Enforces Teacher RBAC Class Arm Isolation (teachers only inspect their assigned arms).
                </p>
              </div>
              <button
                onClick={() => setShowStepModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: 'var(--color-on-surface-variant)',
                }}
              >
                ✕
              </button>
            </div>

            {saveSuccessMsg ? (
              <div
                style={{
                  padding: 'var(--spacing-4)',
                  backgroundColor: 'var(--color-success-container)',
                  color: 'var(--color-on-success-container)',
                  borderRadius: 'var(--radius-small)',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                ✅ {saveSuccessMsg}
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCompleteStep5();
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--type-label-small-size)', fontWeight: 700, marginBottom: 'var(--spacing-1)' }}>
                    Teacher Full Name
                  </label>
                  <input
                    type="text"
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-2) var(--spacing-3)',
                      borderRadius: 'var(--radius-small)',
                      border: '1px solid var(--color-outline)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-on-surface)',
                      fontSize: 'var(--type-body-small-size)',
                      minHeight: 'var(--size-touch-target)',
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--type-label-small-size)', fontWeight: 700, marginBottom: 'var(--spacing-1)' }}>
                    Official Staff Email
                  </label>
                  <input
                    type="email"
                    value={teacherEmail}
                    onChange={(e) => setTeacherEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-2) var(--spacing-3)',
                      borderRadius: 'var(--radius-small)',
                      border: '1px solid var(--color-outline)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-on-surface)',
                      fontSize: 'var(--type-body-small-size)',
                      minHeight: 'var(--size-touch-target)',
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--type-label-small-size)', fontWeight: 700, marginBottom: 'var(--spacing-1)' }}>
                    Assigned Class Arm
                  </label>
                  <select
                    value={teacherClassArm}
                    onChange={(e) => setTeacherClassArm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-2) var(--spacing-3)',
                      borderRadius: 'var(--radius-small)',
                      border: '1px solid var(--color-outline)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-on-surface)',
                      fontSize: 'var(--type-body-small-size)',
                      minHeight: 'var(--size-touch-target)',
                      cursor: 'pointer',
                    }}
                  >
                    {classArmList.map((arm, i) => (
                      <option key={i} value={arm}>
                        {arm}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'flex-end', marginTop: 'var(--spacing-2)' }}>
                  <button
                    type="button"
                    onClick={() => setShowStepModal(null)}
                    style={{
                      padding: 'var(--spacing-2) var(--spacing-4)',
                      backgroundColor: 'var(--color-surface-container)',
                      color: 'var(--color-on-surface)',
                      border: '1px solid var(--color-outline-variant)',
                      borderRadius: 'var(--radius-small)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: 'var(--spacing-2) var(--spacing-4)',
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      border: 'none',
                      borderRadius: 'var(--radius-small)',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Assign Teacher &amp; Continue →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL FOR STEP 6: SET FEE SCHEDULE */}
      {showStepModal === 'fees' && (
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
              maxWidth: '34rem',
              width: '100%',
              boxShadow: 'var(--shadow-hard)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-4)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3
                  style={{
                    fontSize: 'var(--type-title-medium-size)',
                    fontWeight: 700,
                    margin: 0,
                    color: 'var(--color-primary)',
                  }}
                >
                  Step 6: Set Term Fee Schedule
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)' }}>
                  Configures expected tuition for 2026/2027 First Term.
                </p>
              </div>
              <button
                onClick={() => setShowStepModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: 'var(--color-on-surface-variant)',
                }}
              >
                ✕
              </button>
            </div>

            {saveSuccessMsg ? (
              <div
                style={{
                  padding: 'var(--spacing-4)',
                  backgroundColor: 'var(--color-success-container)',
                  color: 'var(--color-on-success-container)',
                  borderRadius: 'var(--radius-small)',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                ✅ {saveSuccessMsg}
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCompleteStep6();
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--type-label-small-size)', fontWeight: 700, marginBottom: 'var(--spacing-1)' }}>
                    Core Tuition Fee (₦ Naira)
                  </label>
                  <input
                    type="number"
                    value={tuitionFee}
                    onChange={(e) => setTuitionFee(e.target.value)}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-2) var(--spacing-3)',
                      borderRadius: 'var(--radius-small)',
                      border: '1px solid var(--color-outline)',
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-on-surface)',
                      fontSize: 'var(--type-body-small-size)',
                      minHeight: 'var(--size-touch-target)',
                    }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-3)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--type-label-small-size)', fontWeight: 700, marginBottom: 'var(--spacing-1)' }}>
                      Development Levy (₦)
                    </label>
                    <input
                      type="number"
                      value={devLevy}
                      onChange={(e) => setDevLevy(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-2) var(--spacing-3)',
                        borderRadius: 'var(--radius-small)',
                        border: '1px solid var(--color-outline)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-on-surface)',
                        fontSize: 'var(--type-body-small-size)',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--type-label-small-size)', fontWeight: 700, marginBottom: 'var(--spacing-1)' }}>
                      Books &amp; Stationery (₦)
                    </label>
                    <input
                      type="number"
                      value={booksLevy}
                      onChange={(e) => setBooksLevy(e.target.value)}
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-2) var(--spacing-3)',
                        borderRadius: 'var(--radius-small)',
                        border: '1px solid var(--color-outline)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-on-surface)',
                        fontSize: 'var(--type-body-small-size)',
                      }}
                    />
                  </div>
                </div>

                {/* Total expected per student */}
                <div
                  style={{
                    backgroundColor: 'var(--color-surface-container)',
                    borderRadius: 'var(--radius-small)',
                    padding: 'var(--spacing-3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 700,
                    fontSize: 'var(--type-body-medium-size)',
                    color: 'var(--color-primary)',
                  }}
                >
                  <span>Total Expected / Student:</span>
                  <span>₦{(parseInt(tuitionFee || '0') + parseInt(devLevy || '0') + parseInt(booksLevy || '0')).toLocaleString()}</span>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'flex-end', marginTop: 'var(--spacing-2)' }}>
                  <button
                    type="button"
                    onClick={() => setShowStepModal(null)}
                    style={{
                      padding: 'var(--spacing-2) var(--spacing-4)',
                      backgroundColor: 'var(--color-surface-container)',
                      color: 'var(--color-on-surface)',
                      border: '1px solid var(--color-outline-variant)',
                      borderRadius: 'var(--radius-small)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: 'var(--spacing-2) var(--spacing-4)',
                      backgroundColor: 'var(--color-primary)',
                      color: 'var(--color-on-primary)',
                      border: 'none',
                      borderRadius: 'var(--radius-small)',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Save Fee Schedule &amp; Finish Setup 🎉
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Responsive Visibility & Header Alignment Rules */}
      <style jsx global>{`
        @media (min-width: 1024px) {
          .admin-hamburger-btn {
            display: none !important;
          }
          .admin-desktop-sidebar {
            display: flex !important;
          }
          .admin-header-brand-col {
            width: 15rem !important;
            border-right: 1px solid var(--color-outline-variant) !important;
            padding: 0 var(--spacing-4) !important;
            box-sizing: border-box !important;
            flex-shrink: 0 !important;
          }
          .admin-header-tabs-col {
            display: flex !important;
            padding-left: var(--spacing-6) !important;
          }
          .admin-header-logout-btn {
            display: block !important;
          }
        }
        @media (max-width: 1023px) {
          .admin-hamburger-btn {
            display: flex !important;
          }
          .admin-desktop-sidebar {
            display: none !important;
          }
          .admin-header-brand-col {
            width: auto !important;
            border-right: none !important;
            padding-left: var(--spacing-3) !important;
            padding-right: var(--spacing-2) !important;
          }
          .admin-header-tabs-col {
            display: none !important; /* Fully collapsed on tablet and mobile breakpoints */
          }
          .admin-header-logout-btn {
            display: none !important; /* Collapsed into mobile drawer on tablet and mobile */
          }
        }
      `}</style>
    </div>
  );
}
