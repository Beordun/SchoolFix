# Task 5: Sessions, Compliance & Final Defense

> **Platform:** SchoolFix — Mobile-First Attendance & Tuition Reconciliation  
> **Target Role:** Forward Deployed Engineer / Systems Architect  
> **Review Time:** 4 Minutes  

---

## 1. What This Task Was
Task 5 shifts SchoolFix from server security and verification into **production state management, cryptographic access control, role-based authorization (RBAC), and lawful account deletion under the Nigeria Data Protection Act (NDPA 2023)**. It proves how an enterprise web application holds sessions securely without fixation, ends sessions definitively across network partitions, resolves conflicting statutory mandates between privacy and tax law, and prepares the candidate for comprehensive live viva defense.

---

## 2. What We Built & Evidenced
1. **Cryptographic Session Engine (`lib/security/session.ts`):**
   - 32-byte CSPRNG token generation (64 hex characters, 256 bits of entropy).
   - Server-side SHA-256 storage hash: database dumps reveal zero replayable bearer tokens.
   - Enforced cookie flags: `HttpOnly`, `Secure` (in prod), `SameSite=Lax`, `Path=/`, `Max-Age=604800` (7 days).
   - Machine evidence: Unique tokens across logins ([`evidence/01-two-session-ids.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/evidence/01-two-session-ids.txt)) and DevTools flag panel ([`evidence/02-cookie-flags.png`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/evidence/02-cookie-flags.png)).
2. **Soft Gating vs. Hard Gating Evaluation:**
   - Soft Gating (Shipped): Immediate parent access to fee schedules and calendar with cautionary banner ([`evidence/03-soft-gating-flow.png`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/evidence/03-soft-gating-flow.png)).
   - Hard Gating (Evaluated): Strict verification barrier blocking unverified logins with `HTTP 403` ([`evidence/04-hard-gating-flow.png`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/evidence/04-hard-gating-flow.png)).
   - Full trade-off writeup: [`docs/gating.md`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/docs/gating.md).
3. **Login Specification & Generic Errors:**
   - Constant-time verification returning identical `401 Unauthorized` responses for wrong passwords vs. non-existent users, defeating account enumeration ([`evidence/05-generic-errors-both-cases.png`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/evidence/05-generic-errors-both-cases.png)).
4. **Middleware & Server-Side Logout:**
   - Next.js edge middleware (`middleware.ts`) enforcing session presence and security headers.
   - Multi-user isolation test on a shared browser terminal ([`evidence/06-two-users-one-browser.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/evidence/06-two-users-one-browser.txt)).
   - True server logout deleting database session rows ([`evidence/07-session-row-present.png`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/evidence/07-session-row-present.png), [`evidence/08-session-row-deleted.png`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/evidence/08-session-row-deleted.png)).
   - Logout network failure edge-case documentation and defensive client fix ([`evidence/09-logout-network-failure.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/evidence/09-logout-network-failure.txt), [`evidence/10-logout-edge-case-fixed.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/evidence/10-logout-edge-case-fixed.txt)).
5. **Password Reset Revocation:**
   - Updating password atomically purges all active sessions across all devices ([`evidence/11-reset-kills-other-session.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/evidence/11-reset-kills-other-session.txt), [`evidence/11-reset-kills-other-session.png`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/evidence/11-reset-kills-other-session.png)).
6. **Lawful NDPA 3-Stage Account Deletion:**
   - Stage 1: Soft-delete and immediate session lockout ([`evidence/12-deletion-request-locks-account.png`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/evidence/12-deletion-request-locks-account.png)).
   - Stage 2: 7-day holding grace period for accidental deletion recovery.
   - Stage 3: Automated background worker (`lib/security/deletion-worker.ts`) executing single-transaction PII anonymization while immutably retaining financial ledgers. Verified start/finish counts on Run 1 ([`evidence/13-scheduled-job-run-one.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/evidence/13-scheduled-job-run-one.txt)) and idempotency proof on Run 2 ([`evidence/14-scheduled-job-run-two.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/evidence/14-scheduled-job-run-two.txt)).
7. **Frontend State Management Without Bloat:**
   - Preserving typed email from failed login into password reset form with zero external state libraries ([`evidence/15-state-management-working.png`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/evidence/15-state-management-working.png), [`docs/state-management.md`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/docs/state-management.md)).
8. **RBAC & Copied-Link Route Protection:**
   - Protected administrative portal (`/portal/admin`) verifying role authorization. Copied-link attack by ordinary parent rejected with `HTTP 403 Forbidden` ([`evidence/16-admin-route-refused.png`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/evidence/16-admin-route-refused.png)).
9. **Primary Research Interview:**
   - Primary interview with Mrs. Funke Adeyemi, Bursar of Gracefield College (380 students) in Magodo, Lagos ([`docs/interview-with-owner.md`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/docs/interview-with-owner.md)).
10. **The Technical Handbook & Defense:**
    - 7-chapter comprehensive reference manual covering every curriculum topic with 7 verifiable mistakes ([`docs/handbook.md`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/docs/handbook.md)).
    - 8 honest admissions in [`docs/what-i-do-not-know.md`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/docs/what-i-do-not-know.md).
    - Published engineering case study ([`docs/article.md`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/docs/article.md), [`evidence/17-published-article-screenshot.png`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/evidence/17-published-article-screenshot.png)).
    - Precise answers to all 22 interview questions ([`docs/interview-answers.md`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/docs/interview-answers.md)).

---

## 3. What We Decided & Why
1. **SHA-256 Storage Hash for Session Cookies:** Storing raw session tokens in PostgreSQL creates a single point of failure if the database is leaked. Storing SHA-256 hashes ensures database dumps cannot be replayed as bearer cookies.
2. **Soft Gating for Parent Onboarding:** Avoids 30%+ drop-off on Nigerian 3G networks by allowing parents to see tuition fees immediately, while gating high-risk financial mutations until email verification.
3. **CAMA 6-Year Financial Retention over Total Erasure:** Reconciled NDPA § 34 Right to Erasure with CAMA 2020 § 374: personal data is anonymized, but payment receipts remain permanently immutable for statutory tax audits.

---

## 4. What We Got Wrong (Genuine Mistakes)
- **The Logout Network Failure Edge Case:** Naively redirecting on logout before server confirmation allowed active sessions to persist in PostgreSQL during network drops (`DashboardClient.tsx:30-47`).
- **Prisma Schema Column Mismatch:** Using `admissionNumber` instead of canonical PRD `admissionNum` crashed the initial deletion worker script (`scripts/test-deletion-lifecycle.js:48`).
- Detailed forensic breakdowns and production costs documented in [`docs/defects.md`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/docs/defects.md).

---

## 5. Cross-Task Numerical Consistency
- **Type Scale Multiplier:** `1.4×` line-height ratio across headlines (`task-01-design-system/docs/type-scale.md`).
- **Argon2id Hashing Duration:** `82.21 ms` on local machine (`task-04-server-security/evidence/08-timing-argon-vs-sha.txt`).
- **Rate Limit Window:** `5 requests per minute` (`task-04-server-security/docs/rate-limiting.md`).
- **OTP Verification Expiry:** `10 minutes` (`task-04-server-security/docs/verification-design.md`).
- **NDPA Deletion Grace Period:** `7 days` (`task-05-sessions-compliance-defence/docs/retention-matrix.md`).
