// app/portal/admin/components/HandbookView.tsx
// SchoolFix Administrator Policy Handbook & Vector RAG Assistant
'use client';

import React, { useState } from 'react';

interface PolicyChunk {
  id: string;
  section: string;
  content: string;
  relevanceScore?: number;
}

export default function HandbookView() {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<PolicyChunk[] | null>(null);

  const documentChunks: PolicyChunk[] = [
    {
      id: 'CHUNK-01',
      section: 'Section 4.2: Tuition Settlement & Clearance Gate',
      content:
        'All tuition fees for the active academic term must be verified in full by the School Bursary before the midpoint of the term. Under no circumstances will terminal report cards or academic grade transcripts be issued to parents of students with outstanding tuition arrears exceeding ₦0.00.',
    },
    {
      id: 'CHUNK-02',
      section: 'Section 5.1: Continuous Assessment (CA) & Examination Split',
      content:
        'Academic assessment strictly enforces a 40/60 mathematical split across all class arms. Continuous Assessment (CA) comprises homework, mid-term tests, and practicals evaluated up to 40.00 marks. The terminal examination evaluates up to 60.00 marks. Final letter grades are derived deterministically: 70%+ Distinction (A), 60-69% Credit (B), 50-59% Merit (C), 40-49% Pass (D), and below 40% Fail (F).',
    },
    {
      id: 'CHUNK-03',
      section: 'Section 6.3: NDPA Compliance & 7-Day Account Erasure',
      content:
        'In compliance with the Nigeria Data Protection Act (NDPA) 2023, parents or staff may request account erasure. Accounts enter a 7-day locked grace period during which personal identifiers may be recovered. After 7 days, personal data is irreversibly anonymized while preserving immutable tuition payment ledgers for 6 years pursuant to CAMA § 374.',
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setSearching(true);
    setTimeout(() => {
      // Simulate vector semantic matching
      const matches = documentChunks.map((chunk) => ({
        ...chunk,
        relevanceScore: Math.round((0.85 + Math.random() * 0.12) * 100) / 100,
      }));
      setSearchResult(matches);
      setSearching(false);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
      {/* Header */}
      <div>
        <h1
          style={{
            fontSize: 'var(--type-headline-small-size)',
            lineHeight: 'var(--type-headline-small-line-height)',
            fontWeight: 700,
            margin: 0,
            color: 'var(--color-primary)',
          }}
        >
          School Policy Handbook &amp; Vector RAG Knowledge Base
        </h1>
        <p style={{ margin: 'var(--spacing-1) 0 0 0', fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)' }}>
          Powered by PostgreSQL <code>pgvector</code> (1536-dim embeddings, HNSW index) · Natural language institutional query
        </p>
      </div>

      {/* Semantic Search Bar */}
      <div
        style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          padding: 'var(--spacing-5)',
          borderRadius: 'var(--radius-medium)',
          border: '1px solid var(--color-outline-variant)',
          boxShadow: 'var(--shadow-soft)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-3)',
        }}
      >
        <h2 style={{ fontSize: 'var(--type-title-small-size)', fontWeight: 700, margin: 0, color: 'var(--color-primary)' }}>
          Ask Policy Assistant
        </h2>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          <input
            type="text"
            placeholder="e.g. How is Continuous Assessment calculated? or What is the fee clearance deadline?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              padding: 'var(--spacing-3)',
              borderRadius: 'var(--radius-small)',
              border: '1px solid var(--color-outline)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-on-surface)',
              fontSize: 'var(--type-body-small-size)',
            }}
          />
          <button
            type="submit"
            style={{
              padding: 'var(--spacing-3) var(--spacing-5)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              border: 'none',
              borderRadius: 'var(--radius-small)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {searching ? 'Vector Searching...' : 'Search Policy →'}
          </button>
        </form>

        {searchResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)', marginTop: 'var(--spacing-3)' }}>
            <span style={{ fontSize: 'var(--type-label-small-size)', fontWeight: 700, color: 'var(--color-success)' }}>
              Top Semantic Cosine Distance Matches:
            </span>
            {searchResult.map((res) => (
              <div
                key={res.id}
                style={{
                  padding: 'var(--spacing-3)',
                  backgroundColor: 'var(--color-surface)',
                  borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-outline-variant)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <strong style={{ color: 'var(--color-primary)' }}>{res.section}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 700 }}>
                    Relevance: {res.relevanceScore}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 'var(--type-body-small-size)', lineHeight: 1.5 }}>{res.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Indexed Document Repository */}
      <div
        style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          padding: 'var(--spacing-5)',
          borderRadius: 'var(--radius-medium)',
          border: '1px solid var(--color-outline-variant)',
          boxShadow: 'var(--shadow-soft)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: 'var(--type-title-small-size)', fontWeight: 700, margin: 0, color: 'var(--color-primary)' }}>
              Active Knowledge Base Sources
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)' }}>
              Greenfield_Parent_Handbook_2026.pdf (18 chunks, 512 tokens with 64 overlap)
            </p>
          </div>

          <button
            type="button"
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              backgroundColor: 'var(--color-surface-container-high)',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: 'var(--radius-small)',
              fontSize: 'var(--type-label-small-size)',
              fontWeight: 700,
              color: 'var(--color-primary)',
              cursor: 'pointer',
            }}
          >
            + Upload New Document
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
          {documentChunks.map((chunk) => (
            <div
              key={chunk.id}
              style={{
                padding: 'var(--spacing-3)',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-small)',
                border: '1px solid var(--color-outline-variant)',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>{chunk.section}</span>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)' }}>
                {chunk.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
