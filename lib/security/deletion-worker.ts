// lib/security/deletion-worker.ts
// SchoolFix NDPA Account Deletion Background Purge Worker
// Implements Stage 3 (Automated Anonymization & Financial Ledger Retention)
// Enforces single-transaction atomicity and strict start/finish audit logging

import { PrismaClient } from '@prisma/client';

export interface PurgeJobResult {
  startedAt: string;
  finishedAt: string;
  candidateCount: number;
  anonymizedCount: number;
  financialLedgersPreserved: number;
  durationMs: number;
  success: boolean;
}

/**
 * Runs the NDPA compliance purge worker.
 * Identifies accounts where the 7-day grace period has elapsed:
 * (deletedAt IS NOT NULL AND scheduledPurgeAt <= NOW() AND isAnonymized = false)
 * Anonymizes PII while strictly preserving financial audit records.
 */
export async function runNdpaPurgeWorker(prisma: PrismaClient): Promise<PurgeJobResult> {
  const startTime = Date.now();
  const startIso = new Date(startTime).toISOString();

  // MANDATORY LOGGING REQUIREMENT: Start line with candidate discovery
  console.log(`[NDPA Purge Job]: START execution at ${startIso}`);

  const candidates = await prisma.user.findMany({
    where: {
      deletedAt: { not: null },
      scheduledPurgeAt: { lte: new Date() },
      isAnonymized: false,
    },
    include: {
      students: true,
      sessions: true,
    },
  });

  console.log(`[NDPA Purge Job]: Candidate accounts discovered for legal purge: ${candidates.length}`);

  let anonymizedCount = 0;
  let financialLedgersPreserved = 0;

  // Execute purge operations inside an atomic transaction
  await prisma.$transaction(async (tx) => {
    for (const candidate of candidates) {
      const surrogateId = candidate.id.substring(0, 8);

      // 1. Wipe active sessions
      await tx.session.deleteMany({
        where: { userId: candidate.id },
      });

      // 2. Unlink dependent student records
      await tx.student.updateMany({
        where: { parentId: candidate.id },
        data: { parentId: null },
      });

      // 3. Count preserved payments for CAMA / CITA tax audit compliance
      const preservedAttempts = await tx.paymentAttempt.count({
        where: { student: { parentId: candidate.id } },
      }).catch(() => 0);
      financialLedgersPreserved += preservedAttempts;

      // 4. Anonymize user PII (Purge personal identifiers)
      await tx.user.update({
        where: { id: candidate.id },
        data: {
          fullName: 'Anonymized Parent (NDPA Purged)',
          email: `purged_${candidate.id}@schoolfix.internal`,
          nin: `PURGED-${surrogateId}`,
          passwordHash: '$purged$v=19$ndpa-erased$',
          verificationCode: null,
          codeExpiresAt: null,
          isAnonymized: true,
        },
      });

      anonymizedCount++;
    }
  });

  const finishTime = Date.now();
  const durationMs = finishTime - startTime;
  const finishIso = new Date(finishTime).toISOString();

  // MANDATORY LOGGING REQUIREMENT: Finish line with counts
  console.log(
    `[NDPA Purge Job]: FINISH execution at ${finishIso}. Duration=${durationMs}ms. Candidates=${candidates.length}, Anonymized=${anonymizedCount}, FinancialLedgersPreserved=${financialLedgersPreserved}`
  );

  return {
    startedAt: startIso,
    finishedAt: finishIso,
    candidateCount: candidates.length,
    anonymizedCount,
    financialLedgersPreserved,
    durationMs,
    success: true,
  };
}
