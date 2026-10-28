import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Portal Sign In',
  description: 'Access the SchoolFix authenticated portal for attendance and tuition reconciliation.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthPage({
  searchParams,
}: {
  searchParams: { mode?: string };
}) {
  const mode = searchParams?.mode || 'login';

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
      </header>

      <main className={styles.card}>
        <div className={styles.badge} role="status">
          Authentication Gateway • Role-Isolated
        </div>

        <h1 className={styles.title}>
          {mode === 'register' ? 'Create School Account' : 'Portal Sign In'}
        </h1>

        <p className={styles.description}>
          Sign in to access classroom attendance logs, continuous assessment grading, and tuition clearance ledgers.
        </p>

        <div className={styles.actionGroup}>
          <Link href="/" className={styles.backButton}>
            &larr; Back to Public Overview
          </Link>
        </div>
      </main>
    </div>
  );
}
