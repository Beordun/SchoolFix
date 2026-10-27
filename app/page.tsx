import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.mainContainer}>
      <header className={styles.navbar}>
        <Link href="/" className={styles.logo} aria-label="SchoolFix Home">
          <span>SchoolFix</span>
        </Link>
        <nav aria-label="Main Navigation">
          <Link href="/auth?mode=login" className={styles.navLink}>
            Portal Sign In
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

        {/* Unified Call to Action (Collapses login/signup choice) */}
        <div>
          <Link href="/auth?mode=login" className={styles.primaryCta} id="portal-cta-btn">
            Access School Portal &rarr;
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>SchoolFix Administrative Platform • Zero Data Loss on Network Partition</p>
      </footer>
    </div>
  );
}
