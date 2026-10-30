// app/article/page.tsx
// Public Engineering Article Preview — SchoolFix Technical Case Study
import React from 'react';
import Link from 'next/link';

export default function ArticlePage() {
  return (
    <article
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-on-surface)',
        padding: 'var(--spacing-large) var(--spacing-medium)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'var(--type-font-family, sans-serif)',
      }}
    >
      <div style={{ maxWidth: '48rem', width: '100%', lineHeight: 1.6 }}>
        <header style={{ marginBottom: '2rem', borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: '1rem' }}>
          <div style={{ fontSize: 'var(--type-label-large-size)', color: 'var(--color-primary)', fontWeight: 'bold' }}>
            ENGINEERING CASE STUDY • OCT 2026
          </div>
          <h1
            style={{
              fontSize: 'clamp(2rem, 4vw + 1rem, 2.75rem)',
              color: 'var(--color-primary)',
              margin: '0.5rem 0',
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            Why We Made Our Password Hashing 894× Slower
          </h1>
          <p style={{ fontSize: 'var(--type-title-small-size)', color: 'var(--color-on-surface-variant)', margin: 0 }}>
            An architectural case study in security inversion, Argon2id tuning, and background queue performance in Nigerian EdTech.
          </p>
          <div style={{ marginTop: '0.75rem', fontSize: 'var(--type-body-small-size)', color: 'var(--color-outline)' }}>
            Published by SchoolFix Core Architecture Team • 1,520 words • 6 min read
          </div>
        </header>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: 'var(--type-body-large-size)' }}>
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--color-surface-container-low)',
              borderRadius: 'var(--radius-medium)',
              border: '1px solid var(--color-outline-variant)',
              borderLeft: '4px solid var(--color-primary)',
            }}
          >
            <strong>The Core Finding:</strong>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: 'var(--type-body-medium-size)' }}>
              SHA-256 took <strong>0.092 ms</strong>, allowing an attacker with an RTX 4090 to calculate 8.5 billion guesses/sec. Argon2id took <strong>82.21 ms</strong> with 64MB RAM, dropping brute-force throughput to 1,200 guesses/sec. Slowing down authentication by 82ms costs legitimate users nothing, and costs an attacker 31 years of computation.
            </p>
          </div>

          <h2 style={{ fontSize: 'var(--type-headline-small-size)', color: 'var(--color-primary)', marginTop: '1rem' }}>
            The Arithmetic of a Stolen Database
          </h2>
          <p>
            When an attacker dumps a production user table, they do not query your rate-limited API. They crack hashes offline using massive parallel GPU clusters. To defeat this, we tuned Argon2id with <code>m=65536, t=3, p=4</code>.
          </p>

          <h2 style={{ fontSize: 'var(--type-headline-small-size)', color: 'var(--color-primary)', marginTop: '1rem' }}>
            The Latency Crisis & The Background Worker Fix
          </h2>
          <p>
            Synchronous SMTP email delivery inflated our registration response to <strong>3,085 ms</strong>. Moving email dispatch to an asynchronous background worker dropped registration latency to <strong>438 ms (7.0× faster)</strong>.
          </p>
        </section>

        <footer style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-outline-variant)', display: 'flex', justifyContent: 'space-between' }}>
          <Link href="/portal/dashboard" style={{ color: 'var(--color-primary)', fontWeight: 'bold', textDecoration: 'none' }}>
            ← Return to SchoolFix Portal
          </Link>
          <span style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--type-body-small-size)' }}>
            Verified on Local Machine (Node.js 24 + PostgreSQL 16)
          </span>
        </footer>
      </div>
    </article>
  );
}
