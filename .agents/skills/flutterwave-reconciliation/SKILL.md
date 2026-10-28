---
name: flutterwave-reconciliation
description: Handles Flutterwave payment lifecycle, verifies webhook signature hashes, and coordinates dual-ledger atomic settlements.
---

# Flutterwave Payment Reconciliation Skill

## Purpose
Orchestrates electronic tuition collections for Nigerian private schools via Flutterwave, enforcing dual-ledger financial safety, strict webhook signature verification, and **bulletproof idempotency**.

## Core Directives
1. **Never Commit Secrets:** `FLW_SECRET_HASH`, `FLW_SECRET_KEY`, and `FLW_PUBLIC_KEY` must never be hardcoded or committed to git.
2. **Dual-Ledger Model:**
   - `PaymentAttempt`: Records initiated checkouts, dropped transactions, or gateway failures.
   - `Payment`: Records verified, immutable fee receipts.
3. **Strict Idempotency:** Webhook retries and duplicate events must NEVER produce duplicate receipts, double-credit student accounts, or throw unhandled 500 errors. Duplicate valid requests must return `200 OK`.
4. **Amount & Currency Tamper Check:** Always verify that `amount` returned from the gateway matches or exceeds the `expectedAmount` stored on the initial `PaymentAttempt`, and that currency is strictly `NGN`.
5. **Ledger Immutability:** Foreign keys enforce `onDelete: Restrict` so student deletions never cascade into financial loss.
6. **Convenience Fee Rule:** 1.2% processing fee (capped at ₦1,500) applies to electronic card collections via Flutterwave; direct offline cash or bank transfers reconciled manually by the bursar carry 0% gateway fees.

---

## Operational Workflows

### 1. Payment Initiation
Before redirecting a parent to Flutterwave checkout:
1. Compute the student's outstanding balance:
   $$\text{Balance} = \text{FeeSchedule.expectedAmount} - \sum(\text{Payment.amount})$$
2. Generate a unique, deterministic transaction reference (e.g., `SF-TX-2026-STU042-TERM1-1730123456`).
3. Insert a `PaymentAttempt` record with status `PENDING`, student ID, amount, and channel:
   ```typescript
   await prisma.paymentAttempt.create({
     data: {
       studentId,
       amount: calculatedBalance,
       term: currentTerm,
       reference: txRef,
       channel: 'CARD',
       status: 'PENDING'
     }
   });
   ```

### 2. Webhook Signature Verification
Verify incoming webhook requests before inspecting payloads or touching database ledgers:
```typescript
const secretHash = process.env.FLW_SECRET_HASH;
const signature = req.headers.get('verif-hash');

if (!signature || signature !== secretHash) {
  // Reject unauthorized payloads immediately
  return new Response(JSON.stringify({ error: 'Unauthorized Webhook Signature' }), { status: 401 });
}
```

### 3. Idempotent Server Verification & Atomic Settlement
Always verify transaction state with Flutterwave's `/v3/transactions/{id}/verify` endpoint and execute an **idempotent reconciliation**:

```typescript
const txId = payload.data.id;
const txRef = payload.data.tx_ref;

// 1. Pre-flight Idempotency Guard
// If a Payment receipt already exists for this reference, acknowledge and return 200 OK immediately
const existingPayment = await prisma.payment.findUnique({
  where: { reference: txRef }
});
if (existingPayment) {
  console.log(`[Idempotency] Transaction ${txRef} already settled. Returning 200 OK.`);
  return new Response(JSON.stringify({ status: 'success', message: 'Already reconciled' }), { status: 200 });
}

// Check corresponding attempt
const attempt = await prisma.paymentAttempt.findUnique({
  where: { reference: txRef }
});
if (!attempt) {
  return new Response(JSON.stringify({ error: 'Unknown transaction reference' }), { status: 404 });
}
if (attempt.status === 'SUCCESS') {
  console.log(`[Idempotency] PaymentAttempt ${txRef} already marked SUCCESS. Returning 200 OK.`);
  return new Response(JSON.stringify({ status: 'success', message: 'Already marked success' }), { status: 200 });
}

// 2. Server-to-Server Verification Call
const res = await fetch(`https://api.flutterwave.com/v3/transactions/${txId}/verify`, {
  headers: { Authorization: `Bearer ${process.env.FLW_SECRET_KEY}` }
});
const flwData = await res.json();

// 3. Status, Currency, and Amount Tamper Verification
const isSuccessful = flwData.status === 'success' && flwData.data.status === 'successful';
const isCurrencyValid = flwData.data.currency === 'NGN';
const isAmountValid = Number(flwData.data.amount) >= Number(attempt.amount);

if (!isSuccessful || !isCurrencyValid || !isAmountValid) {
  await prisma.paymentAttempt.update({
    where: { reference: txRef },
    data: {
      status: 'FAILED',
      failureReason: !isSuccessful ? flwData.data.processor_response : 'Amount or currency mismatch'
    }
  });
  return new Response(JSON.stringify({ error: 'Verification failed' }), { status: 400 });
}

// 4. Atomic Idempotent Settlement Transaction
try {
  const deterministicReceiptNumber = `REC-${txRef.replace(/[^A-Za-z0-9]/g, '').toUpperCase()}`;

  await prisma.$transaction([
    prisma.paymentAttempt.update({
      where: { reference: txRef },
      data: { status: 'SUCCESS' }
    }),
    prisma.payment.create({
      data: {
        studentId: attempt.studentId,
        amount: attempt.amount,
        term: attempt.term,
        reference: txRef,
        channel: attempt.channel,
        receiptNumber: deterministicReceiptNumber,
        verifiedBy: 'FLUTTERWAVE_WEBHOOK'
      }
    })
  ]);

  return new Response(JSON.stringify({ status: 'success', receipt: deterministicReceiptNumber }), { status: 200 });
} catch (error: any) {
  // If a concurrent request created the record (Prisma P2002 Unique Constraint), handle gracefully as idempotent 200
  if (error.code === 'P2002') {
    console.log(`[Idempotency Race Safe] Transaction ${txRef} settled concurrently. Returning 200 OK.`);
    return new Response(JSON.stringify({ status: 'success', message: 'Concurrent settlement resolved' }), { status: 200 });
  }
  throw error;
}
```
