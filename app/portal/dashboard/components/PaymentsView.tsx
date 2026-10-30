// app/portal/dashboard/components/PaymentsView.tsx
'use client';

import React, { useState } from 'react';
import { ChildProfile, PaymentTransaction } from '../types';

interface PaymentsViewProps {
  child: ChildProfile;
  onAddTransaction: (txn: PaymentTransaction) => void;
}

export default function PaymentsView({ child, onAddTransaction }: PaymentsViewProps) {
  const [selectedMethod, setSelectedMethod] = useState<'ONLINE' | 'BANK_TRANSFER' | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>(child.outstandingBalance.toString());
  const [transferRef, setTransferRef] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionNotice, setSubmissionNotice] = useState<string | null>(null);

  // Calculate Flutterwave 1.2% convenience fee (capped at ₦1,500)
  const numericAmount = parseFloat(paymentAmount) || 0;
  const rawFee = numericAmount * 0.012;
  const convenienceFee = Math.min(1500, Math.round(rawFee * 100) / 100);
  const totalCharge = numericAmount + convenienceFee;

  const handleBankTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferRef.trim() || numericAmount <= 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newTxn: PaymentTransaction = {
        id: `txn-${Date.now()}`,
        reference: transferRef.trim(),
        amount: numericAmount,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        channel: 'BANK_TRANSFER',
        status: 'PENDING',
      };
      onAddTransaction(newTxn);
      setIsSubmitting(false);
      setSubmissionNotice(
        `Transfer reference ${transferRef} submitted successfully! In accordance with SchoolFix dual-ledger rules, your submission is queued with status 'PENDING VERIFICATION' until reconciled by the bursar.`
      );
      setTransferRef('');
      setSelectedMethod(null);
    }, 600);
  };

  const handleOnlinePaymentMock = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const generatedRef = `FLW-${Date.now().toString().slice(-6)}`;
      const newTxn: PaymentTransaction = {
        id: `flw-${Date.now()}`,
        reference: generatedRef,
        amount: numericAmount,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        channel: 'ONLINE_CARD',
        status: 'VERIFIED',
        receiptNumber: `REC-${Date.now().toString().slice(-5)}`,
      };
      onAddTransaction(newTxn);
      setIsSubmitting(false);
      setSubmissionNotice(
        `Electronic payment of ₦${numericAmount.toLocaleString('en-NG')} verified via Flutterwave webhook reconciliation. Receipt ${newTxn.receiptNumber} issued.`
      );
      setSelectedMethod(null);
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-medium)' }}>
      {/* Tuition Ledger Card (P03 Header) */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-large)',
          border: '1px solid var(--color-outline-variant)',
          padding: 'var(--spacing-medium)',
          boxShadow: 'var(--shadow-soft)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-small)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1
            className="type-headline-large"
            style={{
              margin: 0,
              color: 'var(--color-primary)',
            }}
          >
            Tuition Reconciliation
          </h1>
          <span className="type-label-small" style={{ color: 'var(--color-on-surface-variant)' }}>
            {child.fullName} • {child.term}
          </span>
        </div>

        <div
          style={{
            backgroundColor: 'var(--color-surface-container-low)',
            borderRadius: 'var(--radius-medium)',
            padding: 'var(--spacing-medium)',
            border: '1px solid var(--color-outline-variant)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div className="type-label-small" style={{ color: 'var(--color-on-surface-variant)' }}>
            Outstanding Term Balance
          </div>
          <div
            className="type-display-small"
            style={{
              fontWeight: 'bold',
              color: child.outstandingBalance > 0 ? 'var(--color-error)' : 'var(--color-success)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            ₦{child.outstandingBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </div>

          <div className="type-body-small" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-on-surface-variant)' }}>Expected Fee Schedule</span>
            <strong>₦{child.expectedFees.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</strong>
          </div>

          <div className="type-body-small" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-on-surface-variant)' }}>Verified Settlements</span>
            <strong style={{ color: 'var(--color-success)' }}>
              ₦{child.verifiedPayments.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
            </strong>
          </div>
        </div>
      </div>

      {submissionNotice && (
        <div
          className="type-body-small"
          style={{
            padding: 'var(--spacing-small) var(--spacing-medium)',
            backgroundColor: 'var(--color-primary-container)',
            color: 'var(--color-on-primary-container)',
            borderRadius: 'var(--radius-small)',
            border: '1px solid var(--color-primary)',
          }}
        >
          {submissionNotice}
        </div>
      )}

      {/* Payment Channel Selection */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-large)',
          border: '1px solid var(--color-outline-variant)',
          padding: 'var(--spacing-medium)',
          boxShadow: 'var(--shadow-soft)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-small)',
        }}
      >
        <strong className="type-title-small">Choose a Payment Method</strong>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
          {/* Option 1: Online Card / Gateway */}
          <button
            onClick={() => setSelectedMethod('ONLINE')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: 'var(--spacing-medium)',
              minHeight: 'var(--size-touch-target)',
              backgroundColor:
                selectedMethod === 'ONLINE'
                  ? 'var(--color-primary-container)'
                  : 'var(--color-surface-container-low)',
              border:
                selectedMethod === 'ONLINE'
                  ? '2px solid var(--color-primary)'
                  : '1px solid var(--color-outline-variant)',
              borderRadius: 'var(--radius-medium)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 'var(--type-headline-small-size)' }}>💳</span>
            <div>
              <div className="type-title-small" style={{ fontWeight: 'bold' }}>
                Pay Online
              </div>
              <div className="type-label-small" style={{ color: 'var(--color-on-surface-variant)' }}>
                Debit Card, Bank USSD, or Virtual Account via Flutterwave
              </div>
            </div>
          </button>

          {/* Option 2: Direct Bank Transfer */}
          <button
            onClick={() => setSelectedMethod('BANK_TRANSFER')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: 'var(--spacing-medium)',
              minHeight: 'var(--size-touch-target)',
              backgroundColor:
                selectedMethod === 'BANK_TRANSFER'
                  ? 'var(--color-primary-container)'
                  : 'var(--color-surface-container-low)',
              border:
                selectedMethod === 'BANK_TRANSFER'
                  ? '2px solid var(--color-primary)'
                  : '1px solid var(--color-outline-variant)',
              borderRadius: 'var(--radius-medium)',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 'var(--type-headline-small-size)' }}>🏛️</span>
            <div>
              <div className="type-title-small" style={{ fontWeight: 'bold' }}>
                Bank Transfer
              </div>
              <div className="type-label-small" style={{ color: 'var(--color-on-surface-variant)' }}>
                Transfer to school account and submit your reference
              </div>
            </div>
          </button>
        </div>

        {/* Selected Form: Online Checkout Modal/Drawer */}
        {selectedMethod === 'ONLINE' && (
          <div
            style={{
              marginTop: '0.5rem',
              padding: 'var(--spacing-medium)',
              backgroundColor: 'var(--color-surface-container-low)',
              borderRadius: 'var(--radius-medium)',
              border: '1px solid var(--color-primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div className="type-title-small" style={{ fontWeight: 'bold' }}>
              Flutterwave Inline Gateway
            </div>
            <div>
              <label
                htmlFor="onlineAmount"
                className="type-body-small"
                style={{
                  display: 'block',
                  fontWeight: 'bold',
                  marginBottom: '0.25rem',
                }}
              >
                Tuition Payment Amount (₦)
              </label>
              <input
                id="onlineAmount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="type-body-medium"
                style={{
                  width: '100%',
                  minHeight: 'var(--size-touch-target)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-outline)',
                }}
              />
            </div>

            <div className="type-body-small" style={{ color: 'var(--color-on-surface-variant)' }}>
              <div>Tuition Amount: ₦{numericAmount.toLocaleString('en-NG')}</div>
              <div>Gateway Convenience Fee (1.2%, capped at ₦1,500): ₦{convenienceFee.toLocaleString('en-NG')}</div>
              <div style={{ fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '0.25rem' }}>
                Total Settlement: ₦{totalCharge.toLocaleString('en-NG')}
              </div>
            </div>

            <button
              onClick={handleOnlinePaymentMock}
              disabled={isSubmitting || numericAmount <= 0}
              className="type-label-large"
              style={{
                minHeight: 'var(--size-touch-target)',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                border: 'none',
                borderRadius: 'var(--radius-small)',
                fontWeight: 'bold',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Initializing Gateway...' : `Proceed to Pay ₦${totalCharge.toLocaleString('en-NG')} →`}
            </button>
          </div>
        )}

        {/* Selected Form: Bank Transfer Instructions */}
        {selectedMethod === 'BANK_TRANSFER' && (
          <form
            onSubmit={handleBankTransferSubmit}
            style={{
              marginTop: '0.5rem',
              padding: 'var(--spacing-medium)',
              backgroundColor: 'var(--color-surface-container-low)',
              borderRadius: 'var(--radius-medium)',
              border: '1px solid var(--color-primary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <div className="type-title-small" style={{ fontWeight: 'bold' }}>
              School Collection Account
            </div>
            <div
              className="type-body-small"
              style={{
                backgroundColor: 'var(--color-surface)',
                padding: 'var(--spacing-small)',
                borderRadius: 'var(--radius-small)',
                border: '1px solid var(--color-outline-variant)',
              }}
            >
              <div>Bank: <strong>Guaranty Trust Bank (GTBank)</strong></div>
              <div>Account Name: <strong>SchoolFix Tuition Collection</strong></div>
              <div>Account Number: <strong style={{ fontVariantNumeric: 'tabular-nums' }}>0123456789</strong></div>
              <div style={{ color: 'var(--color-on-surface-variant)', marginTop: '0.25rem' }}>
                Gateway Processing Fee: <strong>0% (No gateway fee for direct bank transfers)</strong>
              </div>
            </div>

            <div>
              <label
                htmlFor="bankTransferRef"
                className="type-body-small"
                style={{
                  display: 'block',
                  fontWeight: 'bold',
                  marginBottom: '0.25rem',
                }}
              >
                Bank Transaction Reference / Session ID
              </label>
              <input
                id="bankTransferRef"
                type="text"
                placeholder="e.g. TXN-9482019482"
                value={transferRef}
                onChange={(e) => setTransferRef(e.target.value)}
                required
                className="type-body-medium"
                style={{
                  width: '100%',
                  minHeight: 'var(--size-touch-target)',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-small)',
                  border: '1px solid var(--color-outline)',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !transferRef.trim()}
              className="type-label-large"
              style={{
                minHeight: 'var(--size-touch-target)',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
                border: 'none',
                borderRadius: 'var(--radius-small)',
                fontWeight: 'bold',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Recording Attempt...' : 'Submit Transfer for Bursar Verification'}
            </button>
          </form>
        )}
      </div>

      {/* Recent Transactions List (PRD §4.5: Dual-Ledger Status) */}
      <div
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-large)',
          border: '1px solid var(--color-outline-variant)',
          padding: 'var(--spacing-medium)',
          boxShadow: 'var(--shadow-soft)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-small)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong className="type-title-small">Transaction History</strong>
          <span className="type-label-small" style={{ color: 'var(--color-on-surface-variant)' }}>
            Immutable financial records
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {child.transactions.map((txn, idx) => (
            <div
              key={txn.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 0',
                borderBottom:
                  idx < child.transactions.length - 1
                    ? '1px solid var(--color-outline-variant)'
                    : 'none',
              }}
            >
              <div>
                <div className="type-body-small" style={{ fontWeight: 'bold' }}>
                  {txn.channel === 'BANK_TRANSFER' ? 'Direct Bank Transfer' : 'Online Card Settlement'}
                </div>
                <div className="type-label-small" style={{ color: 'var(--color-on-surface-variant)' }}>
                  {txn.date} • Ref: <span style={{ fontVariantNumeric: 'tabular-nums' }}>{txn.reference}</span>
                </div>
                {txn.receiptNumber && (
                  <div className="type-label-small" style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                    Receipt No: {txn.receiptNumber}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                <span className="type-body-medium" style={{ fontWeight: 'bold', fontVariantNumeric: 'tabular-nums' }}>
                  ₦{txn.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </span>
                <span
                  className="type-label-small"
                  style={{
                    backgroundColor:
                      txn.status === 'VERIFIED'
                        ? 'var(--color-success-container)'
                        : 'var(--color-surface-container-high)',
                    color:
                      txn.status === 'VERIFIED'
                        ? 'var(--color-on-success-container)'
                        : 'var(--color-on-surface)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 'bold',
                  }}
                >
                  {txn.status === 'VERIFIED' ? 'Verified' : 'Awaiting verification'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
