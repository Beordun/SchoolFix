// app/portal/admin/components/PaymentsView.tsx
// SchoolFix Administrator Payment Reconciliation & Dual-Ledger Management
'use client';

import React, { useState } from 'react';

interface Transaction {
  id: string;
  studentName: string;
  admissionNo: string;
  classArm: string;
  amount: number;
  channel: 'Bank Transfer' | 'Card' | 'USSD' | 'Cash Deposit';
  reference: string;
  timestamp: string;
  status: 'PENDING' | 'VERIFIED' | 'FAILED';
}

interface PaymentsViewProps {
  bursarName: string;
}

export default function PaymentsView({ bursarName }: PaymentsViewProps) {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED'>('ALL');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  // Cash form state
  const [cashAdmissionNo, setCashAdmissionNo] = useState('SF-2024-089');
  const [cashAmount, setCashAmount] = useState('150000');
  const [cashReceipt, setCashReceipt] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'TXN-9021',
      studentName: 'Amara Michael',
      admissionNo: 'SF-2024-089',
      classArm: 'Primary 4 Blue',
      amount: 150000,
      channel: 'Bank Transfer',
      reference: 'TRF-839201-GTB',
      timestamp: 'Today · 10:42 AM',
      status: 'PENDING',
    },
    {
      id: 'TXN-9020',
      studentName: 'Chukwudi Obi',
      admissionNo: 'SF-2023-114',
      classArm: 'JSS 2 Gold',
      amount: 75000,
      channel: 'Bank Transfer',
      reference: 'TRF-554109-ZEN',
      timestamp: 'Today · 09:15 AM',
      status: 'PENDING',
    },
    {
      id: 'TXN-9018',
      studentName: 'Fatima Bello',
      admissionNo: 'SF-2024-042',
      classArm: 'Nursery 2 Diamond',
      amount: 90000,
      channel: 'USSD',
      reference: 'USD-992318-FBN',
      timestamp: 'Yesterday · 04:30 PM',
      status: 'PENDING',
    },
    {
      id: 'TXN-9015',
      studentName: 'Zainab Balogun',
      admissionNo: 'SF-2022-005',
      classArm: 'SSS 1 Ruby',
      amount: 210000,
      channel: 'Card',
      reference: 'FLW-REV-881203',
      timestamp: 'Yesterday · 02:10 PM',
      status: 'VERIFIED',
    },
    {
      id: 'TXN-9012',
      studentName: 'David Adeleke',
      admissionNo: 'SF-2024-101',
      classArm: 'Primary 1 Gold',
      amount: 120000,
      channel: 'Cash Deposit',
      reference: 'CSH-REC-77192',
      timestamp: '28 Oct 2026',
      status: 'VERIFIED',
    },
  ]);

  const handleVerify = (txnId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txnId ? { ...t, status: 'VERIFIED' as const } : t))
    );
    setSelectedTxn(null);
  };

  const handleCashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(cashAmount, 10);
    if (!amt) return;
    const rec = `REC-${Date.now().toString().slice(-6)}`;
    const newTxn: Transaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      studentName: cashAdmissionNo === 'SF-2024-089' ? 'Amara Michael' : 'Registered Student',
      admissionNo: cashAdmissionNo,
      classArm: 'Primary 4 Blue',
      amount: amt,
      channel: 'Cash Deposit',
      reference: `CSH-${rec}`,
      timestamp: 'Just now',
      status: 'VERIFIED',
    };
    setTransactions([newTxn, ...transactions]);
    setCashReceipt(`Issued Official Receipt ${rec} for ₦${amt.toLocaleString()} to ${cashAdmissionNo}. Verified by Bursar ${bursarName}.`);
  };

  const filtered = transactions.filter((t) => (filter === 'ALL' ? true : t.status === filter));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)' }}>
      {/* Top Header */}
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
          Tuition Payment Reconciliation &amp; Cash Counter
        </h1>
        <p style={{ margin: 'var(--spacing-1) 0 0 0', fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)' }}>
          Dual-Ledger Reconciliation · Electronic Flutterwave Settlements &amp; Manual Cash Counter
        </p>
      </div>

      {cashReceipt && (
        <div
          style={{
            padding: 'var(--spacing-3) var(--spacing-4)',
            backgroundColor: 'var(--color-success-container)',
            color: 'var(--color-on-success-container)',
            borderRadius: 'var(--radius-small)',
            border: '1px solid var(--color-success)',
            fontSize: 'var(--type-body-small-size)',
            fontWeight: 600,
          }}
        >
          ✅ {cashReceipt}
        </div>
      )}

      {/* Two Column Section: Action Queue & Manual Cash Form */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))', gap: 'var(--spacing-5)' }}>
        {/* Needs Attention Queue */}
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
            <h2 style={{ fontSize: 'var(--type-title-small-size)', fontWeight: 700, margin: 0, color: 'var(--color-primary)' }}>
              Bank Transfers Awaiting Verification
            </h2>
            <span
              style={{
                fontSize: '0.75rem',
                backgroundColor: 'var(--color-warning-container)',
                color: 'var(--color-on-warning-container)',
                padding: '0.125rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
              }}
            >
              {transactions.filter((t) => t.status === 'PENDING').length} Pending
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            {transactions
              .filter((t) => t.status === 'PENDING')
              .map((txn) => (
                <div
                  key={txn.id}
                  style={{
                    padding: 'var(--spacing-3)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-outline-variant)',
                    borderRadius: 'var(--radius-small)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{txn.studentName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-on-surface-variant)' }}>
                      Ref: <code>{txn.reference}</code> · {txn.channel}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>₦{txn.amount.toLocaleString()}</div>
                    <button
                      onClick={() => setSelectedTxn(txn)}
                      style={{
                        marginTop: '0.25rem',
                        padding: '0.25rem 0.625rem',
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-on-primary)',
                        border: 'none',
                        borderRadius: 'var(--radius-small)',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Verify →
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Counter Cash Reconciliation Form */}
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
          <div>
            <h2 style={{ fontSize: 'var(--type-title-small-size)', fontWeight: 700, margin: 0, color: 'var(--color-primary)' }}>
              Direct Cash Counter Reconciliation
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: 'var(--type-body-small-size)', color: 'var(--color-on-surface-variant)' }}>
              0% gateway processing fee. Issues certified receipt into immutable ledger.
            </p>
          </div>

          <form onSubmit={handleCashSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--type-label-small-size)', fontWeight: 700, marginBottom: '0.25rem' }}>
                Student Admission Number
              </label>
              <input
                type="text"
                value={cashAdmissionNo}
                onChange={(e) => setCashAdmissionNo(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-2)',
                  borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-outline)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-on-surface)',
                  fontFamily: 'monospace',
                }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--type-label-small-size)', fontWeight: 700, marginBottom: '0.25rem' }}>
                Cash Amount Received (₦)
              </label>
              <input
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-2)',
                  borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-outline)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-on-surface)',
                  fontFamily: 'monospace',
                }}
                required
              />
            </div>

            <button
              type="submit"
              style={{
                marginTop: 'var(--spacing-1)',
                padding: 'var(--spacing-3)',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                border: 'none',
                borderRadius: 'var(--radius-small)',
                fontWeight: 700,
                fontSize: 'var(--type-label-medium-size)',
                cursor: 'pointer',
              }}
            >
              Issue Cash Receipt &amp; Settle Ledger →
            </button>
          </form>
        </div>
      </div>

      {/* Transaction History Table */}
      <div
        style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          borderRadius: 'var(--radius-medium)',
          border: '1px solid var(--color-outline-variant)',
          boxShadow: 'var(--shadow-soft)',
          overflowX: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-4)' }}>
          <h2 style={{ fontSize: 'var(--type-title-small-size)', fontWeight: 700, margin: 0, color: 'var(--color-primary)' }}>
            Reconciliation Transaction Log
          </h2>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {(['ALL', 'PENDING', 'VERIFIED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-outline-variant)',
                  backgroundColor: filter === tab ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: filter === tab ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
                  cursor: 'pointer',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 'var(--type-body-small-size)' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--color-surface-container)', borderBottom: '1px solid var(--color-outline-variant)' }}>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Reference</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Student</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Channel</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Amount</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Timestamp</th>
              <th style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((txn) => (
              <tr key={txn.id} style={{ borderBottom: '1px solid var(--color-outline-variant)' }}>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontFamily: 'monospace' }}>{txn.reference}</td>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 600 }}>{txn.studentName}</td>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>{txn.channel}</td>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  ₦{txn.amount.toLocaleString()}
                </td>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', color: 'var(--color-on-surface-variant)' }}>{txn.timestamp}</td>
                <td style={{ padding: 'var(--spacing-3) var(--spacing-4)' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.125rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor:
                        txn.status === 'VERIFIED'
                          ? 'var(--color-success-container)'
                          : 'var(--color-warning-container)',
                      color:
                        txn.status === 'VERIFIED'
                          ? 'var(--color-on-success-container)'
                          : 'var(--color-on-warning-container)',
                    }}
                  >
                    {txn.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Deliberate Verification Modal */}
      {selectedTxn && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--spacing-4)',
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface-container-lowest)',
              borderRadius: 'var(--radius-medium)',
              border: '1px solid var(--color-outline-variant)',
              padding: 'var(--spacing-5)',
              maxWidth: '30rem',
              width: '100%',
              boxShadow: 'var(--shadow-hard)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--spacing-4)',
            }}
          >
            <h3 style={{ fontSize: 'var(--type-title-medium-size)', fontWeight: 700, margin: 0, color: 'var(--color-primary)' }}>
              Confirm Bank Transfer Deposit
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 'var(--type-body-small-size)' }}>
              <div>
                Student: <strong>{selectedTxn.studentName}</strong> ({selectedTxn.admissionNo})
              </div>
              <div>
                Bank Ref: <code>{selectedTxn.reference}</code>
              </div>
              <div>
                Amount: <strong style={{ color: 'var(--color-primary)' }}>₦{selectedTxn.amount.toLocaleString()}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                style={{
                  padding: 'var(--spacing-2) var(--spacing-4)',
                  backgroundColor: 'var(--color-surface-container)',
                  borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-outline-variant)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleVerify(selectedTxn.id)}
                style={{
                  padding: 'var(--spacing-2) var(--spacing-4)',
                  backgroundColor: 'var(--color-success)',
                  color: 'var(--color-on-primary)',
                  borderRadius: 'var(--radius-small)',
                  border: 'none',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Approve &amp; Issue Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
