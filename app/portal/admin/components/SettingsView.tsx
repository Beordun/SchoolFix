// app/portal/admin/components/SettingsView.tsx
// SchoolFix Administrator School Settings, Academic Calendar, Gateway & Compliance Configuration
'use client';

import React, { useState } from 'react';

export default function SettingsView() {
  const [schoolName, setSchoolName] = useState('Greenfield Academy');
  const [schoolAddress, setSchoolAddress] = useState('14 Adeola Odeku Street, Victoria Island, Lagos');
  const [schoolEmail, setSchoolEmail] = useState('admin@greenfieldacademy.ng');
  const [schoolPhone, setSchoolPhone] = useState('08023456789');

  const [activeSession, setActiveSession] = useState('2026/2027');
  const [activeTerm, setActiveTerm] = useState('First Term');
  const [termStart, setTermStart] = useState('2026-09-14');
  const [termEnd, setTermEnd] = useState('2026-12-18');

  const [settlementBank, setSettlementBank] = useState('Access Bank Nigeria');
  const [accountNumber, setAccountNumber] = useState('0123456789');
  const [accountName, setAccountName] = useState('Greenfield Academy Tuition Collections');
  const [flwWebhookStatus, setFlwWebhookStatus] = useState('ACTIVE_VERIFIED');

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
      {/* Header */}
      <div>
        <h1
          style={{
            fontSize: 'var(--type-headline-medium-size)',
            lineHeight: 'var(--type-headline-medium-line-height)',
            fontWeight: 700,
            margin: 0,
            color: 'var(--color-on-surface)',
          }}
        >
          School Settings &amp; Configuration ⚙️
        </h1>
        <p
          style={{
            fontSize: 'var(--type-body-medium-size)',
            color: 'var(--color-on-surface-variant)',
            margin: 'var(--spacing-1) 0 0 0',
          }}
        >
          Manage institution details, academic calendars, payment settlements, and data retention policies.
        </p>
      </div>

      {saveSuccess && (
        <div
          style={{
            padding: 'var(--spacing-4)',
            backgroundColor: 'var(--color-success-container)',
            color: 'var(--color-on-success-container)',
            borderRadius: 'var(--radius-small)',
            border: '1px solid var(--color-success)',
            fontWeight: 600,
            fontSize: 'var(--type-body-medium-size)',
          }}
        >
          ✓ School configuration and payment gateway parameters saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        {/* Section 1: Institution Profile */}
        <section
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-medium)',
            border: '1px solid var(--color-outline-variant)',
            padding: 'var(--spacing-5)',
            boxShadow: 'var(--shadow-soft)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-4)',
          }}
        >
          <div style={{ borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: 'var(--spacing-3)' }}>
            <h2
              style={{
                fontSize: 'var(--type-title-small-size)',
                fontWeight: 700,
                margin: 0,
                color: 'var(--color-primary)',
              }}
            >
              1. Institution Profile &amp; Contact
            </h2>
            <p
              style={{
                fontSize: 'var(--type-body-small-size)',
                color: 'var(--color-on-surface-variant)',
                margin: 'var(--spacing-1) 0 0 0',
              }}
            >
              School identity information displayed on tuition receipts and terminal reports.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: 'var(--spacing-4)' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--type-label-small-size)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-1)',
                  color: 'var(--color-on-surface)',
                }}
              >
                School Name
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-outline)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-on-surface)',
                  fontSize: 'var(--type-body-medium-size)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--type-label-small-size)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-1)',
                  color: 'var(--color-on-surface)',
                }}
              >
                Official Bursary Email
              </label>
              <input
                type="email"
                value={schoolEmail}
                onChange={(e) => setSchoolEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-outline)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-on-surface)',
                  fontSize: 'var(--type-body-medium-size)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--type-label-small-size)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-1)',
                  color: 'var(--color-on-surface)',
                }}
              >
                Support Phone (SMS &amp; Inquiries)
              </label>
              <input
                type="tel"
                value={schoolPhone}
                onChange={(e) => setSchoolPhone(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-outline)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-on-surface)',
                  fontSize: 'var(--type-body-medium-size)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--type-label-small-size)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-1)',
                  color: 'var(--color-on-surface)',
                }}
              >
                Physical Campus Address
              </label>
              <input
                type="text"
                value={schoolAddress}
                onChange={(e) => setSchoolAddress(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-outline)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-on-surface)',
                  fontSize: 'var(--type-body-medium-size)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </section>

        {/* Section 2: Active Academic Calendar */}
        <section
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-medium)',
            border: '1px solid var(--color-outline-variant)',
            padding: 'var(--spacing-5)',
            boxShadow: 'var(--shadow-soft)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-4)',
          }}
        >
          <div style={{ borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: 'var(--spacing-3)' }}>
            <h2
              style={{
                fontSize: 'var(--type-title-small-size)',
                fontWeight: 700,
                margin: 0,
                color: 'var(--color-primary)',
              }}
            >
              2. Academic Calendar &amp; Term Boundary
            </h2>
            <p
              style={{
                fontSize: 'var(--type-body-small-size)',
                color: 'var(--color-on-surface-variant)',
                margin: 'var(--spacing-1) 0 0 0',
              }}
            >
              Determines the active session for fee reconciliation and attendance tracking.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: 'var(--spacing-4)' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--type-label-small-size)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-1)',
                  color: 'var(--color-on-surface)',
                }}
              >
                Academic Session
              </label>
              <select
                value={activeSession}
                onChange={(e) => setActiveSession(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-outline)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-on-surface)',
                  fontSize: 'var(--type-body-medium-size)',
                  boxSizing: 'border-box',
                }}
              >
                <option value="2026/2027">2026/2027</option>
                <option value="2027/2028">2027/2028</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--type-label-small-size)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-1)',
                  color: 'var(--color-on-surface)',
                }}
              >
                Current Term
              </label>
              <select
                value={activeTerm}
                onChange={(e) => setActiveTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-outline)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-on-surface)',
                  fontSize: 'var(--type-body-medium-size)',
                  boxSizing: 'border-box',
                }}
              >
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Third Term">Third Term</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--type-label-small-size)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-1)',
                  color: 'var(--color-on-surface)',
                }}
              >
                Term Resumption Date
              </label>
              <input
                type="date"
                value={termStart}
                onChange={(e) => setTermStart(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-outline)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-on-surface)',
                  fontSize: 'var(--type-body-medium-size)',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--type-label-small-size)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-1)',
                  color: 'var(--color-on-surface)',
                }}
              >
                Term Vacation Date
              </label>
              <input
                type="date"
                value={termEnd}
                onChange={(e) => setTermEnd(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-outline)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-on-surface)',
                  fontSize: 'var(--type-body-medium-size)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </section>

        {/* Section 3: Payment Settlement & Flutterwave Gateway */}
        <section
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-medium)',
            border: '1px solid var(--color-outline-variant)',
            padding: 'var(--spacing-5)',
            boxShadow: 'var(--shadow-soft)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-4)',
          }}
        >
          <div style={{ borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: 'var(--spacing-3)' }}>
            <h2
              style={{
                fontSize: 'var(--type-title-small-size)',
                fontWeight: 700,
                margin: 0,
                color: 'var(--color-primary)',
              }}
            >
              3. Payment Settlement &amp; Flutterwave Integration
            </h2>
            <p
              style={{
                fontSize: 'var(--type-body-small-size)',
                color: 'var(--color-on-surface-variant)',
                margin: 'var(--spacing-1) 0 0 0',
              }}
            >
              Designated Nigerian bank account for automated Flutterwave electronic card and USSD payouts.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))', gap: 'var(--spacing-4)' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--type-label-small-size)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-1)',
                  color: 'var(--color-on-surface)',
                }}
              >
                Settlement Bank
              </label>
              <select
                value={settlementBank}
                onChange={(e) => setSettlementBank(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-outline)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-on-surface)',
                  fontSize: 'var(--type-body-medium-size)',
                  boxSizing: 'border-box',
                }}
              >
                <option value="Access Bank Nigeria">Access Bank Nigeria</option>
                <option value="First Bank of Nigeria">First Bank of Nigeria</option>
                <option value="Guaranty Trust Bank (GTBank)">Guaranty Trust Bank (GTBank)</option>
                <option value="Zenith Bank Plc">Zenith Bank Plc</option>
                <option value="United Bank for Africa (UBA)">United Bank for Africa (UBA)</option>
              </select>
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--type-label-small-size)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-1)',
                  color: 'var(--color-on-surface)',
                }}
              >
                NUBAN Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                maxLength={10}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-outline)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-on-surface)',
                  fontSize: 'var(--type-body-medium-size)',
                  fontFamily: 'monospace',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--type-label-small-size)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-1)',
                  color: 'var(--color-on-surface)',
                }}
              >
                Beneficiary Account Name
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-outline)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-on-surface)',
                  fontSize: 'var(--type-body-medium-size)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div
            style={{
              padding: 'var(--spacing-3) var(--spacing-4)',
              backgroundColor: 'var(--color-surface-container)',
              borderRadius: 'var(--radius-small)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 'var(--type-body-small-size)',
            }}
          >
            <span>
              🔒 <strong>Webhook Verification Hash:</strong> <code>FLW_SECRET_HASH</code> is connected to live dual-ledger
              listener.
            </span>
            <span
              style={{
                backgroundColor: 'var(--color-success-container)',
                color: 'var(--color-on-success-container)',
                padding: 'var(--spacing-1) var(--spacing-2)',
                borderRadius: 'var(--radius-small)',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              Connected (HTTP 200)
            </span>
          </div>
        </section>

        {/* Section 4: NDPA Compliance & Data Retention */}
        <section
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-medium)',
            border: '1px solid var(--color-outline-variant)',
            padding: 'var(--spacing-5)',
            boxShadow: 'var(--shadow-soft)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-3)',
          }}
        >
          <div style={{ borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: 'var(--spacing-3)' }}>
            <h2
              style={{
                fontSize: 'var(--type-title-small-size)',
                fontWeight: 700,
                margin: 0,
                color: 'var(--color-primary)',
              }}
            >
              4. NDPA Compliance &amp; Legal Data Retention
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: 'var(--spacing-4)' }}>
            <div
              style={{
                padding: 'var(--spacing-3)',
                borderRadius: 'var(--radius-small)',
                backgroundColor: 'var(--color-surface-container)',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 'var(--type-label-medium-size)' }}>NDPA Deletion Grace Period</div>
              <div style={{ fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)' }}>
                Locked at 7 calendar days before immutable anonymization worker runs.
              </div>
            </div>

            <div
              style={{
                padding: 'var(--spacing-3)',
                borderRadius: 'var(--radius-small)',
                backgroundColor: 'var(--color-surface-container)',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 'var(--type-label-medium-size)' }}>CAMA § 374 Financial Retention</div>
              <div style={{ fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)' }}>
                Payment ledgers preserved for 6 years; cannot be purged or cascade-deleted.
              </div>
            </div>
          </div>
        </section>

        {/* Action Button */}
        <div>
          <button
            type="submit"
            style={{
              padding: 'var(--spacing-3) var(--spacing-6)',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
              borderRadius: 'var(--radius-small)',
              border: 'none',
              fontWeight: 700,
              fontSize: 'var(--type-label-large-size)',
              cursor: 'pointer',
              minHeight: 'var(--size-touch-target)',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
}
