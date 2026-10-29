'use client';

import React, { useState, useEffect, useId } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

type AuthMode = 'login' | 'register' | 'reset' | 'verify';

export default function AuthCard() {
  const searchParams = useSearchParams();
  
  // Read initial mode from URL query parameter (?mode=login|register|reset|verify)
  const queryMode = searchParams.get('mode') as AuthMode;
  const initialMode: AuthMode = (queryMode === 'register' || queryMode === 'reset' || queryMode === 'verify') ? queryMode : 'login';

  const [mode, setMode] = useState<AuthMode>(initialMode);
  
  // Shared state: carry email across form mode transitions without retyping
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Field focus tracking for Category 1 (Empty Field) blur detection
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Login submission attempt flag for Category 3 (On-Submit enforcement)
  const [loginSubmitted, setLoginSubmitted] = useState(false);

  // Disabled button explanation message (Step 7 requirement)
  const [buttonNotice, setButtonNotice] = useState<string | null>(null);
  const [serverFeedback, setServerFeedback] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 4 & 7 Diagnostic Toggles (accessible via query params or buttons for evidence generation)
  const showAnnoyingNumberInput = searchParams.get('test_input') === 'number';
  const hideDisabledButton = searchParams.get('test_button') === 'hidden';

  // Sync mode with URL without triggering server document reloads
  useEffect(() => {
    if (queryMode && ['login', 'register', 'reset', 'verify'].includes(queryMode)) {
      setMode(queryMode as AuthMode);
      setButtonNotice(null);
    }
  }, [queryMode]);

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setButtonNotice(null);
    const newUrl = `/auth?mode=${newMode}`;
    window.history.pushState(null, '', newUrl);
  };

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // --- VALIDATION RULES DERIVATION ---
  
  // 1. Full Name: Required, min 2 words, min 2 chars per word
  const validateFullName = (val: string): string | null => {
    if (!val.trim()) return 'Full name is required for student ledger matching.';
    const words = val.trim().split(/\s+/);
    if (words.length < 2) return 'Please provide at least two names (e.g. Surname and First Name).';
    if (words.some((w) => w.length < 2)) return 'Each name part must contain at least 2 characters.';
    return null;
  };

  // 2. Email Format: Strict RFC pattern checking
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const validateEmailFormat = (val: string): string | null => {
    if (!val.trim()) return 'Email address is required for fee statements.';
    if (!emailRegex.test(val.trim())) return 'Please enter a valid email format (e.g. name@school.ng).';
    return null;
  };

  // 3. Nigerian Mobile Phone: Exactly 11 digits starting with 070, 080, 081, 090, 091
  const phoneRegex = /^(070|080|081|090|091)\d{8}$/;
  const validatePhone = (val: string): string | null => {
    if (!val.trim()) return 'Phone number is required for WhatsApp school alerts.';
    const digitsOnly = val.replace(/\D/g, '');
    if (digitsOnly.length !== 11 || !phoneRegex.test(digitsOnly)) {
      return 'Nigerian mobile numbers must be 11 digits starting with 070, 080, 081, 090, or 091.';
    }
    return null;
  };

  // 4. Password: Min 8 characters
  const validatePassword = (val: string): string | null => {
    if (!val) return 'Password is required to secure student records.';
    if (val.length < 8) return 'Password must contain at least 8 characters.';
    return null;
  };

  // Registration Validation States
  const nameError = touched.fullName ? validateFullName(fullName) : null;
  // Real-time email validation on registration as typing occurs
  const regEmailError = touched.email || email.length > 0 ? validateEmailFormat(email) : null;
  const phoneError = touched.phone ? validatePhone(phone) : null;
  const regPasswordError = touched.password ? validatePassword(password) : null;
  const termsError = touched.terms && !acceptedTerms ? 'NDPA consent is required to create a school account.' : null;

  const isRegisterValid =
    validateFullName(fullName) === null &&
    validateEmailFormat(email) === null &&
    validatePhone(phone) === null &&
    validatePassword(password) === null &&
    acceptedTerms;

  // Login Validation States (Enforced strictly on submit or blur)
  const loginEmailError = loginSubmitted || touched.loginEmail ? validateEmailFormat(email) : null;
  const loginPasswordError = loginSubmitted || touched.loginPassword ? validatePassword(password) : null;

  const handleDisabledButtonClick = () => {
    if (!acceptedTerms && (fullName || email || password || phone)) {
      setButtonNotice('Please accept the NDPA privacy terms to proceed with registration.');
    } else {
      setButtonNotice('Please correct highlighted fields before submitting registration.');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (showAnnoyingNumberInput) {
      setPhone(e.target.value);
    } else {
      // Clean numeric text input preserving leading zeroes without spinners
      const val = e.target.value.replace(/\D/g, '').slice(0, 11);
      setPhone(val);
    }
  };

  // Reusable Accessible Caution Icon
  const CautionIcon = () => (
    <svg className={styles.cautionIcon} viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );

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
          
          {/* ==================== LOGIN VIEW ==================== */}
          {mode === 'login' && (
            <div className={styles.formContainer}>
              <h1 className={styles.title}>Welcome Back</h1>
              <p className={styles.subtitle}>
                Access classroom registers, attendance history, and fee ledgers.
              </p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setLoginSubmitted(true);
                  setServerFeedback(null);
                  if (loginEmailError || loginPasswordError) return;
                  setIsSubmitting(true);
                  try {
                    const res = await fetch('/api/login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email, password }),
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                      setServerFeedback({
                        type: 'success',
                        message: `Authentication successful! Welcome, ${data.user.fullName}. Password trimmed & email normalized to lowercase.`,
                      });
                    } else {
                      setServerFeedback({
                        type: 'error',
                        message: data.message || 'Incorrect email or password.',
                      });
                    }
                  } catch (err: any) {
                    setServerFeedback({ type: 'error', message: err.message || 'Network connection failed' });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className={styles.form}
                noValidate
              >
                {serverFeedback && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      backgroundColor: serverFeedback.type === 'success' ? '#E8F5E9' : '#FFEBEE',
                      color: serverFeedback.type === 'success' ? '#1B5E20' : '#C62828',
                      border: `1px solid ${serverFeedback.type === 'success' ? '#81C784' : '#EF9A9A'}`,
                    }}
                    role="alert"
                  >
                    {serverFeedback.message}
                  </div>
                )}
                <div className={styles.fieldGroup}>
                  <label htmlFor="login-email" className={styles.label}>
                    Parent or Staff Email
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    className={`${styles.input} ${loginEmailError ? styles.inputError : ''}`}
                    placeholder="Enter registered email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => markTouched('loginEmail')}
                    autoComplete="email"
                    aria-invalid={loginEmailError ? 'true' : 'false'}
                    aria-describedby={loginEmailError ? 'login-email-error' : undefined}
                  />
                  {loginEmailError && (
                    <div id="login-email-error" className={styles.errorMessage} role="alert">
                      <CautionIcon />
                      <span>{loginEmailError}</span>
                    </div>
                  )}
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
                  <div className={styles.passwordWrapper}>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      className={`${styles.passwordInput} ${loginPasswordError ? styles.inputError : ''}`}
                      placeholder="Enter account password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => markTouched('loginPassword')}
                      autoComplete="current-password"
                      aria-invalid={loginPasswordError ? 'true' : 'false'}
                      aria-describedby={loginPasswordError ? 'login-password-error' : undefined}
                    />
                    <button
                      type="button"
                      className={styles.toggleVisibilityBtn}
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {loginPasswordError && (
                    <div id="login-password-error" className={styles.errorMessage} role="alert">
                      <CautionIcon />
                      <span>{loginPasswordError}</span>
                    </div>
                  )}
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

          {/* ==================== REGISTRATION VIEW ==================== */}
          {mode === 'register' && (
            <div className={styles.formContainer}>
              <h1 className={styles.title}>Create School Account</h1>
              <p className={styles.subtitle}>
                Register as a parent or administrator for attendance and fee clearance.
              </p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setServerFeedback(null);
                  if (!isRegisterValid) return;
                  setIsSubmitting(true);
                  try {
                    const res = await fetch('/api/register', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ fullName, email, phone, password, acceptedTerms }),
                    });
                    const data = await res.json();
                    if (res.status === 201 && data.success) {
                      setServerFeedback({
                        type: 'success',
                        message: `Account created for ${data.user.fullName} (${data.user.email}). Check email for 6-digit confirmation OTP.`,
                      });
                    } else {
                      setServerFeedback({
                        type: 'error',
                        message: data.message || 'Registration failed server boundary check.',
                      });
                    }
                  } catch (err: any) {
                    setServerFeedback({ type: 'error', message: err.message || 'Network error' });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className={styles.form}
                noValidate
              >
                {serverFeedback && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      backgroundColor: serverFeedback.type === 'success' ? '#E8F5E9' : '#FFEBEE',
                      color: serverFeedback.type === 'success' ? '#1B5E20' : '#C62828',
                      border: `1px solid ${serverFeedback.type === 'success' ? '#81C784' : '#EF9A9A'}`,
                    }}
                    role="alert"
                  >
                    {serverFeedback.message}
                  </div>
                )}
                {/* 1. Full Name */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="reg-fullname" className={styles.label}>
                    Full Name (Surname First) *
                  </label>
                  <input
                    id="reg-fullname"
                    type="text"
                    required
                    aria-required="true"
                    className={`${styles.input} ${nameError ? styles.inputError : ''}`}
                    placeholder="e.g. Adeleke Folashade"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onBlur={() => markTouched('fullName')}
                    aria-invalid={nameError ? 'true' : 'false'}
                    aria-describedby={nameError ? 'reg-fullname-error' : undefined}
                  />
                  {nameError && (
                    <div id="reg-fullname-error" className={styles.errorMessage} role="alert">
                      <CautionIcon />
                      <span>{nameError}</span>
                    </div>
                  )}
                </div>

                {/* 2. Email Address (Real-Time Validation) */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="reg-email" className={styles.label}>
                    Email Address *
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    aria-required="true"
                    className={`${styles.input} ${regEmailError ? styles.inputError : ''}`}
                    placeholder="e.g. adeleke@schoolfix.internal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => markTouched('email')}
                    autoComplete="email"
                    aria-invalid={regEmailError ? 'true' : 'false'}
                    aria-describedby={regEmailError ? 'reg-email-error' : undefined}
                  />
                  {regEmailError && (
                    <div id="reg-email-error" className={styles.errorMessage} role="alert">
                      <CautionIcon />
                      <span>{regEmailError}</span>
                    </div>
                  )}
                </div>

                {/* 3. Phone Number */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="reg-phone" className={styles.label}>
                    Nigerian Mobile Number (WhatsApp Alerts) *
                  </label>
                  {showAnnoyingNumberInput ? (
                    <input
                      id="reg-phone"
                      type="number"
                      required
                      aria-required="true"
                      className={`${styles.input} ${phoneError ? styles.inputError : ''}`}
                      placeholder="08012345678"
                      value={phone}
                      onChange={handlePhoneChange}
                      onBlur={() => markTouched('phone')}
                      aria-invalid={phoneError ? 'true' : 'false'}
                      aria-describedby={phoneError ? 'reg-phone-error' : undefined}
                    />
                  ) : (
                    <input
                      id="reg-phone"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      aria-required="true"
                      className={`${styles.input} ${phoneError ? styles.inputError : ''}`}
                      placeholder="e.g. 08031234567"
                      value={phone}
                      onChange={handlePhoneChange}
                      onBlur={() => markTouched('phone')}
                      aria-invalid={phoneError ? 'true' : 'false'}
                      aria-describedby={phoneError ? 'reg-phone-error' : undefined}
                    />
                  )}
                  {phoneError && (
                    <div id="reg-phone-error" className={styles.errorMessage} role="alert">
                      <CautionIcon />
                      <span>{phoneError}</span>
                    </div>
                  )}
                </div>

                {/* 4. Password with Eye Toggle */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="reg-password" className={styles.label}>
                    Password (min. 8 characters)
                  </label>
                  <div className={styles.passwordWrapper}>
                    <input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      className={`${styles.passwordInput} ${regPasswordError ? styles.inputError : ''}`}
                      placeholder="Create secure password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => markTouched('password')}
                      autoComplete="new-password"
                      aria-invalid={regPasswordError ? 'true' : 'false'}
                      aria-describedby={regPasswordError ? 'reg-password-error' : undefined}
                    />
                    <button
                      type="button"
                      className={styles.toggleVisibilityBtn}
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {regPasswordError && (
                    <div id="reg-password-error" className={styles.errorMessage} role="alert">
                      <CautionIcon />
                      <span>{regPasswordError}</span>
                    </div>
                  )}
                </div>

                {/* 5. NDPA Terms Acceptance Checkbox */}
                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="reg-terms"
                    className={styles.checkbox}
                    checked={acceptedTerms}
                    onChange={(e) => {
                      setAcceptedTerms(e.target.checked);
                      markTouched('terms');
                      if (e.target.checked) setButtonNotice(null);
                    }}
                    onBlur={() => markTouched('terms')}
                    aria-invalid={termsError ? 'true' : 'false'}
                    aria-describedby={termsError ? 'reg-terms-error' : undefined}
                  />
                  <label htmlFor="reg-terms" className={styles.checkboxLabel}>
                    I accept the Nigerian Data Protection Act (NDPA) 2023 privacy terms, student record processing guidelines, and tuition fee ledger clearance policies.
                  </label>
                </div>
                {termsError && (
                  <div id="reg-terms-error" className={styles.errorMessage} role="alert">
                    <CautionIcon />
                    <span>{termsError}</span>
                  </div>
                )}

                {/* Button Notice when clicked in disabled state without accepting terms */}
                {buttonNotice && (
                  <div className={styles.warningNotice} role="alert">
                    <CautionIcon />
                    <span>{buttonNotice}</span>
                  </div>
                )}

                {/* Step 7: Hidden Button vs Disabled Button toggle */}
                {hideDisabledButton ? (
                  /* Hidden Button Version: Only renders once valid (poor UX) */
                  isRegisterValid && (
                    <button type="submit" className={styles.submitBtn}>
                      Complete Registration &rarr;
                    </button>
                  )
                ) : (
                  /* Disabled Button Version (Proper UX): Present by default, shows notice on click */
                  <div onClick={!isRegisterValid ? handleDisabledButtonClick : undefined} className={styles.submitWrapper}>
                    <button
                      type="submit"
                      disabled={!isRegisterValid}
                      className={`${styles.submitBtn} ${!isRegisterValid ? styles.submitBtnDisabled : ''}`}
                      aria-disabled={!isRegisterValid}
                    >
                      Complete Registration &rarr;
                    </button>
                  </div>
                )}
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

          {/* ==================== RESET VIEW ==================== */}
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
                    placeholder="Enter registered school email"
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

          {/* ==================== VERIFY VIEW ==================== */}
          {mode === 'verify' && (
            <div className={styles.formContainer}>
              <h1 className={styles.title}>Verify Your Account</h1>
              <p className={styles.subtitle}>
                Enter the 6-digit confirmation code dispatched to your email address.
              </p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setServerFeedback(null);
                  setIsSubmitting(true);
                  try {
                    const res = await fetch('/api/verify', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email, code: otpCode }),
                    });
                    const data = await res.json();
                    if (res.ok && data.success) {
                      setServerFeedback({
                        type: 'success',
                        message: 'Account successfully confirmed. You now have full access to student records.',
                      });
                    } else {
                      setServerFeedback({
                        type: 'error',
                        message: data.message || 'Verification failed.',
                      });
                    }
                  } catch (err: any) {
                    setServerFeedback({ type: 'error', message: err.message || 'Verification network error' });
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className={styles.form}
                noValidate
              >
                {serverFeedback && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      backgroundColor: serverFeedback.type === 'success' ? '#E8F5E9' : '#FFEBEE',
                      color: serverFeedback.type === 'success' ? '#1B5E20' : '#C62828',
                      border: `1px solid ${serverFeedback.type === 'success' ? '#81C784' : '#EF9A9A'}`,
                    }}
                    role="alert"
                  >
                    {serverFeedback.message}
                  </div>
                )}

                <div className={styles.fieldGroup}>
                  <label htmlFor="verify-email" className={styles.label}>
                    Account Email
                  </label>
                  <input
                    id="verify-email"
                    type="email"
                    className={styles.input}
                    placeholder="Enter registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="verify-code" className={styles.label}>
                    6-Digit Confirmation OTP
                  </label>
                  <input
                    id="verify-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className={styles.input}
                    placeholder="e.g. 241925"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    style={{ fontSize: '1.5rem', letterSpacing: '0.3em', textAlign: 'center', fontWeight: 700 }}
                  />
                </div>

                <button type="submit" className={styles.submitBtn}>
                  Verify Code &rarr;
                </button>
              </form>

              <div className={styles.footerPrompt}>
                <span>Need to sign in instead? </span>
                <button
                  type="button"
                  className={styles.inlineAction}
                  onClick={() => switchMode('login')}
                >
                  Back to login
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
