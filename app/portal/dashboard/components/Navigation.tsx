// app/portal/dashboard/components/Navigation.tsx
'use client';

import React from 'react';
import Link from 'next/link';
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
}: NavigationProps) {
  const navItems: Array<{ id: NavTab; label: string; icon: string }> = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'child', label: 'My Child', icon: '🎓' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'reports', label: 'Reports', icon: '📄' },
    { id: 'account', label: 'Account', icon: '👤' },
  ];

  return (
    <>
      {/* Top Application Header (Desktop and Mobile) */}
      <header
        style={{
          width: '100%',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-outline-variant)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <div
          style={{
            maxWidth: '68rem',
            margin: '0 auto',
            padding: 'var(--spacing-small) var(--spacing-medium)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Brand Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              className="type-title-medium"
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: 'var(--radius-small)',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
              }}
            >
              SF
            </div>
            <div>
              <div
                className="type-title-medium"
                style={{
                  color: 'var(--color-primary)',
                  fontWeight: 'bold',
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

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Desktop primary"
            style={{
              display: 'none',
              gap: '0.25rem',
              alignItems: 'center',
            }}
            className="schoolfix-desktop-nav"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className="type-label-large"
                  style={{
                    padding: '0.5rem 1rem',
                    minHeight: 'var(--size-touch-target)',
                    borderRadius: 'var(--radius-small)',
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
                    gap: '0.5rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Child Switcher Pill & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Child Selector Button */}
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
                padding: '0.375rem 0.875rem',
                backgroundColor: 'var(--color-surface-container-high)',
                border: '1px solid var(--color-primary)',
                borderRadius: 'var(--radius-full)',
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

            {/* Quick Session Tools */}
            <Link
              href="/portal/session-inspector"
              title="View session token & cookie diagnostic flags"
              aria-label="Inspect session cookies"
              style={{
                minWidth: 'var(--size-touch-target)',
                minHeight: 'var(--size-touch-target)',
                backgroundColor: 'var(--color-surface-container-low)',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: 'var(--radius-small)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                fontSize: 'var(--type-title-small-size)',
              }}
            >
              🔍
            </Link>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              disabled={isLoggingOut}
              aria-label="Log Out"
              title="End session"
              className="type-label-small schoolfix-desktop-logout"
              style={{
                minHeight: 'var(--size-touch-target)',
                padding: '0.375rem 0.75rem',
                backgroundColor: 'var(--color-error)',
                color: 'var(--color-on-error)',
                border: 'none',
                borderRadius: 'var(--radius-small)',
                cursor: isLoggingOut ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                display: 'none',
              }}
            >
              {isLoggingOut ? '...' : 'Log Out'}
            </button>
          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar for Mobile Viewports (< 768px) */}
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
                gap: '0.125rem',
                minHeight: 'var(--size-touch-target)',
                padding: '0.375rem 0.25rem',
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

      {/* CSS Rules for Desktop vs Mobile Media Queries */}
      <style jsx global>{`
        @media (min-width: 768px) {
          .schoolfix-desktop-nav {
            display: flex !important;
          }
          .schoolfix-desktop-logout {
            display: block !important;
          }
          .schoolfix-mobile-nav {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
