'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

type AuthMode = 'login' | 'register' | 'reset';

export default function AuthCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Read initial mode from URL query parameter (?mode=login|register|reset)
  const queryMode = searchParams.get('mode') as AuthMode;
  const initialMode: AuthMode = (queryMode === 'register' || queryMode === 'reset') ? queryMode : 'login';

  const [mode, setMode] = useState<AuthMode>(initialMode);
  
  // Shared state: carry email across form mode transitions without retyping
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Sync mode with URL without triggering server document reloads
  useEffect(() => {
    if (queryMode && ['login', 'register', 'reset'].includes(queryMode)) {
      setMode(queryMode as AuthMode);
    }
  }, [queryMode]);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    // Client-side URL transition with zero network payload
    const newUrl = `/auth?mode=${newMode}`;
    window.history.pushState(null, '', newUrl);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.logoLink} aria-label="Return to SchoolFix Home">
          <svg className={styles.logoIcon} viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
            <path d="M16 6 L6 11 L16 16 L26 11 Z" fill="var(--color-surface)" />
            <path d="M10 13.5 V19 C10 22 16 25 16 25 C16 25 22 22 22 19 V13.5 L16 16.5 Z" fill="var(--color-primary-container)" opacity="0.9" />
          </svg>
          <span className={styles.logoText}>SchoolFix</span>
        </Link>
        <span className={styles.gatewayIndicator}>Unified Authentication Gateway</span>
      </header>

      <main className={styles.card}>
        {/* Navigation Mode Tabs */}
        <div className={styles.tabGroup} role="tablist" aria-label="Authentication Modes">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            aria-controls="auth-panel"
            id="tab-login"
            className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
            onClick={() => switchMode('login')}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'register'}
            aria-controls="auth-panel"
            id="tab-register"
            className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
            onClick={() => switchMode('register')}
          >
            Create Account
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'reset'}
            aria-controls="auth-panel"
            id="tab-reset"
            className={`${styles.tab} ${mode === 'reset' ? styles.tabActive : ''}`}
            onClick={() => switchMode('reset')}
          >
            Reset
          </button>
        </div>

        {/* Dynamic Panel Content */}
        <div id="auth-panel" role="tabpanel" aria-labelledby={`tab-${mode}`} className={styles.panel}>
          {mode === 'login' && (
            <div className={styles.formContainer}>
              <h1 className={styles.title}>Welcome Back</h1>
              <p className={styles.subtitle}>
                Access classroom registers, attendance history, and fee ledgers.
              </p>

              <form onSubmit={(e) => e.preventDefault()} className={styles.form} noValidate>
                <div className={styles.fieldGroup}>
                  <label htmlFor="login-email" className={styles.label}>
                    Parent or Staff Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    className={styles.input}
                    placeholder="e.g. adeleke@schoolfix.internal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <div className={styles.labelRow}>
                    <label htmlFor="login-password" className={styles.label}>
                      Password
                    </label>
                    <button
                      type="button"
                      className={styles.linkButton}
                      onClick={() => switchMode('reset')}
                    >
                      Forgot?
                    </button>
                  </div>
                  <input
                    id="login-password"
                    type="password"
                    className={styles.input}
                    placeholder="Enter account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>

                <button type="submit" className={styles.submitBtn}>
                  Sign In to School Portal &rarr;
                </button>
              </form>

              <div className={styles.footerPrompt}>
                <span>New school or parent? </span>
                <button
                  type="button"
                  className={styles.inlineAction}
                  onClick={() => switchMode('register')}
                >
                  Create an account
                </button>
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className={styles.formContainer}>
              <h1 className={styles.title}>Create School Account</h1>
              <p className={styles.subtitle}>
                Register as a parent or administrator for attendance and fee clearance.
              </p>

              <form onSubmit={(e) => e.preventDefault()} className={styles.form} noValidate>
                <div className={styles.fieldGroup}>
                  <label htmlFor="reg-fullname" className={styles.label}>
                    Full Name (Surname First)
                  </label>
                  <input
                    id="reg-fullname"
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Adeleke Folashade"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="reg-email" className={styles.label}>
                    Email Address
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    className={styles.input}
                    placeholder="e.g. adeleke@schoolfix.internal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="reg-password" className={styles.label}>
                    Password (min. 8 characters)
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    className={styles.input}
                    placeholder="Create secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>

                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="reg-terms"
                    className={styles.checkbox}
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                  />
                  <label htmlFor="reg-terms" className={styles.checkboxLabel}>
                    I accept the Nigerian Data Protection Act (NDPA) privacy terms and student fee ledger policies.
                  </label>
                </div>

                <button type="submit" className={styles.submitBtn}>
                  Complete Registration &rarr;
                </button>
              </form>

              <div className={styles.footerPrompt}>
                <span>Already registered? </span>
                <button
                  type="button"
                  className={styles.inlineAction}
                  onClick={() => switchMode('login')}
                >
                  Sign in instead
                </button>
              </div>
            </div>
          )}

          {mode === 'reset' && (
            <div className={styles.formContainer}>
              <h1 className={styles.title}>Password Recovery</h1>
              <p className={styles.subtitle}>
                Enter your registered school email to receive a secure 6-digit access code.
              </p>

              <form onSubmit={(e) => e.preventDefault()} className={styles.form} noValidate>
                <div className={styles.fieldGroup}>
                  <label htmlFor="reset-email" className={styles.label}>
                    Registered Email Address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    className={styles.input}
                    placeholder="e.g. adeleke@schoolfix.internal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <button type="submit" className={styles.submitBtn}>
                  Send Recovery Code &rarr;
                </button>
              </form>

              <div className={styles.footerPrompt}>
                <span>Remembered your password? </span>
                <button
                  type="button"
                  className={styles.inlineAction}
                  onClick={() => switchMode('login')}
                >
                  Back to sign in
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
