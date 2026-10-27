import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      backgroundColor: 'var(--color-surface)',
      color: 'var(--color-on-surface)',
      padding: '2rem',
    }}>
      <div style={{
        maxWidth: '540px',
        background: 'var(--color-surface-container)',
        border: '1px solid var(--color-outline)',
        borderRadius: '12px',
        padding: '3rem 2rem',
        boxShadow: 'var(--shadow-soft)',
      }}>
        <div style={{
          display: 'inline-block',
          padding: '0.35rem 0.85rem',
          borderRadius: '9999px',
          backgroundColor: 'var(--color-warning)',
          color: 'var(--color-on-warning)',
          fontFamily: 'var(--type-label-small-font-family)',
          fontSize: 'var(--type-label-small-size)',
          fontWeight: 'var(--type-label-small-weight)',
          marginBottom: '1.25rem',
        }}>
          HTTP 404 • Resource Not Found
        </div>

        <h1 style={{
          fontFamily: 'var(--type-headline-medium-font-family)',
          fontSize: 'var(--type-headline-medium-size)',
          fontWeight: 600,
          lineHeight: 'var(--type-headline-medium-line-height)',
          color: 'var(--color-primary)',
          marginBottom: '1rem',
        }}>
          This record or portal view does not exist.
        </h1>

        <p style={{
          fontFamily: 'var(--type-body-medium-font-family)',
          fontSize: 'var(--type-body-medium-size)',
          color: 'var(--color-on-surface-variant)',
          lineHeight: 1.5,
          marginBottom: '2rem',
        }}>
          The page or student roster you requested could not be located. Verify the URL or return to the main dashboard.
        </p>

        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.75rem',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            borderRadius: '8px',
            fontFamily: 'var(--type-label-large-font-family)',
            fontSize: 'var(--type-label-large-size)',
            fontWeight: 'var(--type-label-large-weight)',
            boxShadow: 'var(--shadow-medium)',
            textDecoration: 'none',
          }}
        >
          Return to SchoolFix Home &rarr;
        </Link>
      </div>
    </div>
  );
}
