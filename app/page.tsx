import Link from 'next/link';
import RegistrationForm from './components/RegistrationForm';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.mainContainer}>
      <header className={styles.navbar}>
        <Link href="/" className={styles.logo} aria-label="SchoolFix Home">
          <svg className={styles.logoIcon} viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
            <path d="M16 6 L6 11 L16 16 L26 11 Z" fill="var(--color-surface)" />
            <path d="M10 13.5 V19 C10 22 16 25 16 25 C16 25 22 22 22 19 V13.5 L16 16.5 Z" fill="var(--color-primary-container)" opacity="0.9" />
          </svg>
          <span className={styles.brandTitle}>SchoolFix</span>
        </Link>
        <nav aria-label="Main Navigation">
          {/* Collapsed Choice: Single unified portal entry point */}
          <Link href="/auth?mode=login" className={styles.primaryCta}>
            Enter School Portal &rarr;
          </Link>
        </nav>
      </header>

      <main className={styles.heroSection}>
        <div className={styles.badge} role="status">
          2nd Term 2026/2027 • Low-Bandwidth Optimized
        </div>

        <h1 className={styles.headline}>
          Attendance clarity and fee reconciliation for African classrooms.
        </h1>

        <p className={styles.subheading}>
          Digitising continuous assessment marks, daily registers, and audit-compliant tuition ledgers on low-bandwidth mobile networks.
        </p>

        {/* Database-Writing Registration Form for Step 6 Verification */}
        <RegistrationForm />
      </main>

      <footer className={styles.footer}>
        <p>SchoolFix Administrative Platform • Zero Data Loss on Network Partition</p>
      </footer>
    </div>
  );
}
