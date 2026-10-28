---
name: ndpa-compliance-purger
description: Manages NDPA/GDPR account deletion lifecycle, 7-day grace period locks, and financial ledger preservation transactions.
---

# NDPA/GDPR Compliance Purger Skill

## Purpose
Guarantees compliance with the Nigeria Data Protection Act (NDPA) and GDPR "Right to Erasure" without violating financial accounting and tax retention obligations.

## Core Directives
1. **Never Wipe Records by Hand:** Deleting account rows directly in the database is illegal and violates tax audit trails.
2. **Strict 3-Stage Lifecycle:**
   - **Stage 1 (Soft Delete):** Sets `deletedAt: new Date()` and revokes all active sessions. The account cannot log in.
   - **Stage 2 (7-Day Grace Period):** The account remains locked in the database for 7 calendar days to allow recovery if requested.
   - **Stage 3 (Scheduled Anonymization Purge):** A background worker permanently anonymizes personal identifiers while preserving financial records.
3. **Financial Ledger Preservation:** Both `Payment` and `PaymentAttempt` records enforce `onDelete: Restrict`. When a parent account purges, `Student.parentId` is set to `null` so receipts and audit trails remain intact.

## Operational Workflows

### 1. The Anonymization Purge Transaction
Execute the scheduled purge as an atomic Prisma transaction:
```typescript
await prisma.$transaction(async (tx) => {
  // 1. Unlink dependent students so onDelete: Restrict on payments is satisfied
  await tx.student.updateMany({
    where: { parentId: expiredUserId },
    data: { parentId: null }
  });

  // 2. Anonymize user record
  await tx.user.update({
    where: { id: expiredUserId },
    data: {
      email: `anonymized-${expiredUserId.slice(0, 8)}@purged.schoolfix.internal`,
      fullName: 'Redacted (NDPA Purged)',
      passwordHash: 'REDACTED',
      isAnonymized: true,
      scheduledPurgeAt: null
    }
  });

  // 3. Delete active sessions and assignments
  await tx.session.deleteMany({ where: { userId: expiredUserId } });
});
```

### 2. Verify Safe Re-Execution (Idempotency)
Prove that running the purge job twice against the same database produces identical results with zero errors, documenting the run logs for evidence.
