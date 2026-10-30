// app/portal/dashboard/components/Navigation.tsx
'use client';

import React from 'react';
import { ChildProfile } from '../types';

export type NavTab = 'home' | 'child' | 'payments' | 'reports' | 'account';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  selectedChild: ChildProfile;
  totalChildrenCount: number;
  onOpenChildModal: () => void;
  userFullName: string;
  onLogout: () => void;
  isLoggingOut: boolean;
  children: React.ReactNode;
}

export default function Navigation({
  activeTab,
  onTabChange,
  selectedChild,
  totalChildrenCount,
  onOpenChildModal,
  userFullName,
  onLogout,
  isLoggingOut,
  children,
}: NavigationProps) {
  const navItems: Array<{ id: NavTab; label: string; icon: string }> = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'child', label: 'My Child', icon: '🎓' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'reports', label: 'Reports', icon: '📄' },
    { id: 'account', label: 'Account', icon: '👤' },
  ];

  return (
    <div
      className="schoolfix-app-shell"
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-on-surface)',
        fontFamily: 'var(--type-font-family)',
      }}
    >
      {/* =========================================================================
          1. Left Navigation Sidebar (Desktop Viewports >= 768px)
          ========================================================================= */}
      <aside
        aria-label="Sidebar navigation"
        className="schoolfix-desktop-sidebar"
        style={{
          width: '16rem',
          flexShrink: 0,
          height: '100vh',
          position: 'sticky',
          top: 0,
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-outline-variant)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: 110,
          boxShadow: 'var(--shadow-soft)',
          padding: 'var(--spacing-medium)',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-large)' }}>
          {/* Brand Identity with Homepage Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.25rem 0' }}>
            <svg
              viewBox="0 0 32 32"
              width="40"
              height="40"
              aria-hidden="true"
              style={{ flexShrink: 0 }}
            >
              <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
              <path d="M16 6 L6 11 L16 16 L26 11 Z" fill="var(--color-surface)" />
              <path
                d="M10 13.5 V19 C10 22 16 25 16 25 C16 25 22 22 22 19 V13.5 L16 16.5 Z"
                fill="var(--color-primary-container)"
                opacity="0.9"
              />
            </svg>
            <div>
              <div
                className="type-title-medium"
                style={{
                  color: 'var(--color-primary)',
                  fontWeight: 'bold',
                  lineHeight: 1.2,
                }}
              >
                SchoolFix
              </div>
              <div
                className="type-label-small"
                style={{
                  color: 'var(--color-on-surface-variant)',
                }}
              >
                Parent Portal
              </div>
            </div>
          </div>

          {/* Vertical Navigation Links */}
          <nav
            aria-label="Desktop primary"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-1)',
            }}
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className="type-label-large"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    minHeight: 'var(--size-touch-target)',
                    borderRadius: 'var(--radius-medium)',
                    border: 'none',
                    backgroundColor: isActive
                      ? 'var(--color-primary-container)'
                      : 'transparent',
                    color: isActive
                      ? 'var(--color-on-primary-container)'
                      : 'var(--color-on-surface-variant)',
                    fontWeight: isActive ? 'bold' : 'normal',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    textAlign: 'left',
                    transition: 'background-color 0.15s ease, color 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: 'var(--type-title-medium-size)' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Metadata */}
        <div
          style={{
            padding: 'var(--spacing-small)',
            backgroundColor: 'var(--color-surface-container-low)',
            borderRadius: 'var(--radius-small)',
            border: '1px solid var(--color-outline-variant)',
          }}
        >
          <div
            className="type-label-small"
            style={{
              color: 'var(--color-on-surface-variant)',
              fontWeight: 'bold',
            }}
          >
            2026/2027 Academic Session
          </div>
          <div
            className="type-label-small"
            style={{
              color: 'var(--color-primary)',
              marginTop: '0.25rem',
            }}
          >
            First Term Active
          </div>
        </div>
      </aside>

      {/* =========================================================================
          2. Content Column: Top Application Header + Injected View Children
          ========================================================================= */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* Top Header Bar: Strictly containing ONLY Student Name, Search, and Log Out */}
        <header
          className="schoolfix-top-header"
          style={{
            width: '100%',
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-outline-variant)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: 'var(--shadow-soft)',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              maxWidth: '56rem',
              margin: '0 auto',
              padding: 'var(--spacing-small) var(--spacing-5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              boxSizing: 'border-box',
            }}
          >
            {/* 1. Left: Student Name / Child Selector Button */}
            <button
              onClick={onOpenChildModal}
              title="Click to switch active student"
              aria-label={`Current child: ${selectedChild.fullName}. Click to switch.`}
              className="type-label-medium"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                minHeight: 'var(--size-touch-target)',
                padding: '0.5rem 1rem',
                backgroundColor: 'var(--color-surface-container-high)',
                border: '1px solid var(--color-primary)',
                borderRadius: 'var(--radius-small)',
                color: 'var(--color-on-surface)',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              <span style={{ fontSize: 'var(--type-title-small-size)' }}>👦</span>
              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                <span className="type-label-medium" style={{ fontWeight: 'bold' }}>
                  {selectedChild.fullName}
                </span>
                <span
                  className="type-label-small"
                  style={{
                    color: 'var(--color-primary)',
                    fontWeight: 'bold',
                  }}
                >
                  {selectedChild.classArm} ({totalChildrenCount}) ▾
                </span>
              </div>
            </button>

            {/* 2. Right: Log Out Button */}
            <button
              onClick={onLogout}
              disabled={isLoggingOut}
              aria-label="Log Out"
              title="End session"
              className="type-label-small"
              style={{
                minHeight: 'var(--size-touch-target)',
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                color: 'var(--color-error)',
                border: '1px solid var(--color-error)',
                borderRadius: 'var(--radius-small)',
                cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
              }}
            >
              {isLoggingOut ? '...' : 'Log Out'}
            </button>
          </div>
        </header>

        {/* Children (e.g. main dashboard view) */}
        {children}
      </div>

      {/* =========================================================================
          3. Bottom Navigation Bar for Mobile Viewports (< 768px)
          ========================================================================= */}
      <nav
        aria-label="Mobile primary"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-outline-variant)',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          zIndex: 90,
          boxShadow: 'var(--shadow-hard)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        className="schoolfix-mobile-nav"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="type-label-small"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
                minHeight: 'var(--size-touch-target)',
                padding: '0.5rem 0.25rem',
                backgroundColor: isActive
                  ? 'var(--color-primary-container)'
                  : 'transparent',
                color: isActive
                  ? 'var(--color-primary)'
                  : 'var(--color-on-surface-variant)',
                border: 'none',
                borderTop: isActive ? '3px solid var(--color-primary)' : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: isActive ? 'bold' : 'normal',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: 'var(--type-title-medium-size)' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Responsive Visibility Rules */}
      <style jsx global>{`
        @media (max-width: 767px) {
          .schoolfix-desktop-sidebar {
            display: none !important;
          }
        }
        @media (min-width: 768px) {
          .schoolfix-mobile-nav {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
