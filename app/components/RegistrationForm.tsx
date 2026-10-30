'use client';

import React, { useState } from 'react';
import styles from './RegistrationForm.module.css';

interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function RegistrationForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [createdUser, setCreatedUser] = useState<UserRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatusCode(null);
    setCreatedUser(null);
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          acceptedTerms,
        }),
      });

      setStatusCode(res.status);
      const data = await res.json();

      if (res.status === 201 && data.success) {
        setCreatedUser(data.user);
        // Clear sensitive input
        setPassword('');
      } else {
        setErrorMessage(data.message || data.error || 'Failed to submit registration');
        if (data.issues) {
          setFieldErrors(data.issues);
        }
      }
    } catch (err: any) {
      setStatusCode(500);
      setErrorMessage(err.message || 'Client network error connecting to server');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.formCard} id="admission-form">
      <h2 className={styles.formTitle}>Parent Admission Registration</h2>
      <p className={styles.formSubtitle}>
        Enroll dependent pupils into SchoolFix attendance and fee reconciliation ledgers.
      </p>

      <form onSubmit={handleSubmit}>
        <div className={styles.fieldGroup}>
          <label htmlFor="reg-fullname" className={styles.label}>
            Parent / Guardian Full Name (Surname First) *
          </label>
          <input
            id="reg-fullname"
            type="text"
            required
            className={styles.input}
            placeholder="e.g. Folashade Adeleke"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
          />
          {fieldErrors.fullName && (
            <span style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {fieldErrors.fullName.join('. ')}
            </span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="reg-email" className={styles.label}>
            Email Address *
          </label>
          <input
            id="reg-email"
            type="email"
            required
            className={styles.input}
            placeholder="e.g. folashade@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          {fieldErrors.email && (
            <span style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {fieldErrors.email.join('. ')}
            </span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="reg-phone" className={styles.label}>
            Nigerian Mobile Number (WhatsApp Alerts) *
          </label>
          <input
            id="reg-phone"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            className={styles.input}
            placeholder="e.g. 08031234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
            disabled={loading}
          />
          {fieldErrors.phone && (
            <span style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {fieldErrors.phone.join('. ')}
            </span>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="reg-password" className={styles.label}>
            Account Password (min. 8 characters, 1 uppercase, 1 number) *
          </label>
          <input
            id="reg-password"
            type="password"
            required
            minLength={8}
            className={styles.input}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          {fieldErrors.password && (
            <span style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {fieldErrors.password.join('. ')}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', marginBottom: '1.25rem' }}>
          <input
            type="checkbox"
            id="reg-terms-home"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            disabled={loading}
            style={{ marginTop: '0.25rem', width: '1.125rem', height: '1.125rem', accentColor: 'var(--color-primary)' }}
          />
          <label htmlFor="reg-terms-home" style={{ fontSize: '0.8rem', color: 'var(--color-on-surface-variant)', lineHeight: 1.4 }}>
            I accept the NDPA 2023 data protection terms, student record processing policies, and fee ledgers.
          </label>
        </div>
        {fieldErrors.acceptedTerms && (
          <div style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginBottom: '1rem' }}>
            {fieldErrors.acceptedTerms.join('. ')}
          </div>
        )}

        <button
          type="submit"
          className={styles.submitBtn}
          id="btn-submit-registration"
          disabled={loading || !fullName || !email || !phone || !password || !acceptedTerms}
        >
          {loading ? 'Submitting to Database...' : 'Register Parent Account'}
        </button>
      </form>

      {/* Success Box - Explicit 201 Created */}
      {createdUser && statusCode === 201 && (
        <div className={styles.successBox} role="status" id="registration-success-box">
          <div className={styles.successTitle}>
            <span>✓</span> Database Record Created (HTTP 201)
          </div>
          <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            User successfully stored in PostgreSQL <code>User</code> table.
          </p>
          <div className={styles.recordMeta}>
            <div><strong>ID:</strong> {createdUser.id}</div>
            <div><strong>Email:</strong> {createdUser.email}</div>
            <div><strong>Role:</strong> {createdUser.role}</div>
            <div><strong>Timestamp:</strong> {createdUser.createdAt}</div>
          </div>
        </div>
      )}

      {/* Error Box - Captures real failure during DB disconnect */}
      {errorMessage && (
        <div className={styles.errorBox} role="alert" id="registration-error-box">
          <div className={styles.errorTitle}>
            <span>⚠</span> Server Rejection {statusCode ? `(HTTP ${statusCode})` : ''}
          </div>
          <p style={{ fontSize: '0.9rem' }}>{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
