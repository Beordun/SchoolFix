// app/portal/admin/components/AuditLogView.tsx
// SchoolFix Administrator Financial Audit Log & Legal Compliance
'use client';

import React from 'react';

interface AuditRecord {
  id: string;
  action: string;
  target: string;
  actor: string;
  ipAddress: string;
  timestamp: string;
  integrityHash: string;
}

export default function AuditLogView() {
  const auditRecords: AuditRecord[] = [
    {
      id: 'AUD-88910',
      action: 'PAYMENT_VERIFIED',
      target: 'REC-77192 (₦120,000 for David Adeleke)',
      actor: 'Alhaji Rasheed Adeleke (Chief Bursar)',
      ipAddress: '102.89.44.12 (Lagos, Nigeria)',
      timestamp: '2026-10-30T10:42:15Z',
      integrityHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    {
      id: 'AUD-88909',
      action: 'CASH_RECONCILIATION',
      target: 'REC-77188 (₦150,000 for Amara Michael)',
      actor: 'Alhaji Rasheed Adeleke (Chief Bursar)',
      ipAddress: '102.89.44.12 (Lagos, Nigeria)',
      timestamp: '2026-10-30T09:15:32Z',
      integrityHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    },
    {
      id: 'AUD-88908',
      action: 'CLASS_ARM_CREATED',
      target: 'ClassArm: JSS 2 Gold',
      actor: 'Mrs. Adeyemi (Administrator)',
      ipAddress: '197.210.55.88 (MTN Nigeria)',
      timestamp: '2026-10-29T16:20:00Z',
      integrityHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    },
    {
      id: 'AUD-88907',
      action: 'FEE_SCHEDULE_SET',
      target: 'Primary Section 2026/2027 (₦185,000)',
      actor: 'Alhaji Rasheed Adeleke (Chief Bursar)',
      ipAddress: '102.89.44.12 (Lagos, Nigeria)',
      timestamp: '2026-10-29T14:10:45Z',
      integrityHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    },
    {
      id: 'AUD-88906',
      action: 'NDPA_ERASURE_SCHEDULED',
      target: 'User: 2b3a9563 (Folake Badmus)',
      actor: 'System Purge Worker (CRON)',
      ipAddress: '127.0.0.1 (Localhost Worker)',
      timestamp: '2026-10-28T02:00:00Z',
      integrityHash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-3)' }}>
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
            CAMA § 374 Financial Audit Ledger
          </h1>
          <p style={{ margin: 'var(--spacing-1) 0 0 0', fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)' }}>
            Immutable financial records retained for 6 years · Companies and Allied Matters Act § 374 compliance
          </p>
        </div>

        <button
          type="button"
          style={{
            padding: 'var(--spacing-2) var(--spacing-4)',
            backgroundColor: 'var(--color-surface-container-high)',
            color: 'var(--color-primary)',
            border: '1px solid var(--color-outline-variant)',
            borderRadius: 'var(--radius-small)',
            fontWeight: 700,
            fontSize: 'var(--type-label-medium-size)',
            cursor: 'pointer',
          }}
        >
          📥 Export Audit Trail (CSV)
        </button>
      </div>

      {/* Compliance Information Box */}
      <div
        style={{
          padding: 'var(--spacing-4)',
          backgroundColor: 'var(--color-surface-container)',
          borderRadius: 'var(--radius-medium)',
          border: '1px solid var(--color-outline-variant)',
          fontSize: 'var(--type-body-small-size)',
          lineHeight: 1.5,
        }}
      >
        <strong>Referential Ledger Preservation:</strong> In accordance with CAMA § 374 and NDPA § 34, while personal parent profiles can be anonymized upon erasure requests, all financial transactions, cashier verification IDs, bank references, and SHA-256 integrity digests remain permanently undeletable.
      </div>

      {/* Audit Log Table */}
      <div
        style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          borderRadius: 'var(--radius-medium)',
          border: '1px solid var(--color-outline-variant)',
          boxShadow: 'var(--shadow-soft)',
          overflowX: 'auto',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--type-body-small-size)' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-container)', borderBottom: '1px solid var(--color-outline-variant)' }}>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Log ID</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Action Event</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Target Record</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Performed By</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Timestamp (UTC)</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Integrity SHA-256</th>
            </tr>
          </thead>
          <tbody>
            {auditRecords.map((rec) => (
              <tr key={rec.id} style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontFamily: 'monospace', fontWeight: 600 }}>{rec.id}</td>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.125rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: 'var(--color-surface-container-high)',
                      color: 'var(--color-primary)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {rec.action}
                  </span>
                </td>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>{rec.target}</td>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>{rec.actor}</td>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', color: 'var(--color-on-surface-variant)' }}>{rec.timestamp}</td>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontFamily: 'monospace', fontSize: '0.6875rem' }} title={rec.integrityHash}>
                  {rec.integrityHash.slice(0, 12)}...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
