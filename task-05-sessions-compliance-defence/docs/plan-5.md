# Task 5 Execution Plan: Sessions, Deletion, and the Defence (Plan 5)

> **Platform:** SchoolFix — Mobile-First Attendance & Tuition Reconciliation  
> **Target Market:** Nigerian Private Primary and Secondary Schools  
> **Regulatory Framework:** Nigeria Data Protection Act (NDPA 2023), CAMA 2020 & CITA Financial Compliance  
> **Branch:** `feature/task-5-sessions-compliance-defence`  
> **Status:** Approved Architectural Blueprint  

---

## 1. Executive Summary & Business Requirements

Task 5 transitions SchoolFix from server security, validation, and email verification (Task 4) into **production state management, cryptographic access control, role-based authorization (RBAC), and lawful account deletion** under Nigerian law.

### Core Objectives:
1. **Cryptographic Session Management:**
   - Eliminate client-side and unhashed session tokens.
   - Issue 32-byte CSPRNG random session tokens on login.
   - Store SHA-256 token digests in the server-side PostgreSQL `Session` table (`expiresAt`, `ipHash`, `userAgent`).
   - Deliver tokens via secure HTTP cookies: `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, `Max-Age=604800` (7 days).
   - Invalidate and replace session tokens on every login (zero session fixation).
   - Atomic session revocation on password reset and user logout.

2. **Soft Gating vs. Hard Gating Evaluation:**
   - **Soft Gating:** User is authenticated immediately upon registration with an unverified status and an interactive warning banner. Allows immediate inspection of school fee schedules, class arms, and calendar, but restricts high-risk actions.
   - **Hard Gating:** User is blocked at registration until a 6-digit OTP email is confirmed; unverified logins are refused.
   - Implement both flows and capture machine evidence for both to evaluate operational conversion vs. regulatory risk.

3. **Production Middleware & Session Lifecycle:**
   - Next.js edge/server middleware validating session cookie integrity and checking user account status (`isLocked`, `deletedAt`).
   - Multi-user isolation test on a single device (handling shared cybercafé / staffroom browsers).
   - Server-enforced logout deleting the database session row and clearing browser cookies.
   - Network failure logout edge-case handling: prevent client from falsely claiming "logged out" when server deletion fails.

4. **Lawful NDPA Account Deletion Lifecycle (3-Stage Process):**
   - **Soft Delete:** Immediate lock (`deletedAt = now()`), revoking active sessions.
   - **7-Day Grace Period:** Account is marked inactive; enables accidental deletion recovery.
   - **Scheduled Purge Transaction:** Background cron/worker transaction that anonymizes PII (`isAnonymized: true`, nulling name, email, phone) while strictly retaining immutable financial ledgers (`Payment`, `PaymentAttempt`) for 6-year CAMA/CITA tax audit compliance.
   - Idempotent execution: proving running the deletion job twice produces identical, safe results.

5. **Role-Based Access Control (RBAC) & Protected Routes:**
   - Dedicated administrative/bursar portal (`/portal/admin`) accessible only to `ADMIN` and `BURSAR` roles.
   - Copied-link attack test: verifying an authenticated `PARENT` or `TEACHER` pasting `/portal/admin` receives a strict `403 Forbidden` response.

6. **Primary Research, Comprehensive Handbook & Defense:**
   - Primary research interview with a real Nigerian school proprietor/bursar (`docs/interview-with-owner.md`).
   - Comprehensive 7-chapter Technical Handbook (`docs/handbook.md`) documenting all architectural decisions and 7 real mistakes.
   - Data Retention Matrix (`docs/retention-matrix.md`) detailing legal retention bases for every schema column.
   - Privacy Policy (`privacy.md`) with documented redaction of impossible operational promises.
   - Technical viva defense answering all 22 questions with cross-task numerical consistency.

---

## 2. Directory Architecture & Planned Deliverables

```text
task-05-sessions-compliance-defence/
├── README.md                                  # 4-minute technical interviewer summary
├── plan-5.md                                  # This authoritative execution plan
├── privacy.md                                 # Plain-language NDPA privacy notice
├── privacy-draft-with-broken-promise.md       # Pre-audit draft with unfulfillable promise
├── docs/
│   ├── plan-5.md                              # Mirrored execution plan
│   ├── sessions.md                            # Session hijacking, cookie flags, and damage limitation
│   ├── gating.md                              # Soft gating vs hard gating empirical evaluation
│   ├── retention-matrix.md                    # Column-by-column NDPA vs CAMA legal retention matrix
│   ├── state-management.md                    # Form state carrying without external bloat
│   ├── interview-with-owner.md                # 20-minute primary interview with real school bursar
│   ├── handbook.md                            # 7-session technical handbook with 7 real defects
│   ├── what-i-do-not-know.md                  # 8 honest, deep technical admissions
│   ├── defects.md                             # Genuine defects, file:line, and production cost
│   └── interview-answers.md                   # 22 viva answers (<= 200 words each, cross-task numbers)
└── evidence/
    ├── 01-two-session-ids.txt                 # Proof of unique tokens across two logins
    ├── 02-cookie-flags.png                    # DevTools capture of HttpOnly, Secure, SameSite=Lax
    ├── 03-soft-gating-flow.png                # Registration -> immediate login with warning banner
    ├── 04-hard-gating-flow.png                # Registration -> blocking verification barrier
    ├── 05-generic-errors-both-cases.png       # Indistinguishable error on wrong pass vs wrong email
    ├── 06-two-users-one-browser.txt           # Multi-user isolation test on shared device
    ├── 07-session-row-present.png             # Active session in PostgreSQL Session table
    ├── 08-session-row-deleted.png             # Session row deleted from PostgreSQL upon logout
    ├── 09-logout-network-failure.txt          # Simulated network drop during logout
    ├── 10-logout-edge-case-fixed.txt          # Client-side retry / resilience fix
    ├── 11-reset-kills-other-session.png       # Password reset wiping secondary browser session
    ├── 12-deletion-request-locks-account.png   # Immediate account lock on soft-deletion
    ├── 13-scheduled-job-run-one.txt           # Background deletion worker start/finish log with counts
    ├── 14-scheduled-job-run-two.txt           # Idempotency proof (second run changes 0 rows)
    ├── 15-state-management-working.png        # Email preservation from failed login to reset form
    ├── 16-admin-route-refused.png             # 403 Forbidden on copied administrative URL
    └── 17-published-article-screenshot.png    # Public technical post screenshot
```

---

## 3. Detailed Step-by-Step Implementation Map

### Step 1: Cryptographic Sessions & Cookie Security
- Create [`lib/security/session.ts`](file:///c:/Users/DT001/Desktop/SchoolFix/lib/security/session.ts):
  - Generate 32 bytes of cryptographic randomness via `crypto.randomBytes(32).toString('hex')`.
  - Compute SHA-256 hash for database storage: `crypto.createHash('sha256').update(rawToken).digest('hex')`.
  - Store session in PostgreSQL `Session` model (`userId`, `sessionToken`, `expiresAt`, `ipAddress`, `userAgent`).
  - Set cookie header with strict flags: `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`.
- Author test script `scripts/test-session-generation.js` to log in twice, verify non-repeating tokens, and capture `evidence/01-two-session-ids.txt`.
- Capture DevTools Application/Cookies panel for `evidence/02-cookie-flags.png`.
- Author `docs/sessions.md`.

### Step 2: Soft Gating vs. Hard Gating
- Update [`app/auth/AuthCard.tsx`](file:///c:/Users/DT001/Desktop/SchoolFix/app/auth/AuthCard.tsx) and backend routes to demonstrate both gating approaches:
  - **Soft Gating Mode:** Auto-login on registration; banner displayed: *"Account Unverified: Fee payment and attendance features are locked until email is verified."*
  - **Hard Gating Mode:** Registration halts at verification screen; direct login blocked until verified.
- Capture screenshots `evidence/03-soft-gating-flow.png` and `evidence/04-hard-gating-flow.png`.
- Author `docs/gating.md` analyzing user acquisition drop-off vs. fraudulent account creation.

### Step 3: Login Flow & Generic Error Timing
- Update [`app/api/login/route.ts`](file:///c:/Users/DT001/Desktop/SchoolFix/app/api/login/route.ts):
  - Schema validation via Zod.
  - Email trimming and lowercasing.
  - Argon2id password verification (`argon2.verify`).
  - Constant-time response: return generic error `"Invalid email or password"` for both non-existent users and incorrect passwords.
  - Rate limiting (5 requests/minute).
- Capture `evidence/05-generic-errors-both-cases.png`.

### Step 4: Next.js Middleware & Server-Enforced Logout
- Create [`middleware.ts`](file:///c:/Users/DT001/Desktop/SchoolFix/middleware.ts):
  - Intercept `/portal/*` routes.
  - Read session cookie, query active session in database.
  - Check `user.isLocked` and `user.deletedAt`.
  - Attach user ID and role to request headers.
- Test multi-user browser switching: `scripts/test-multi-user-session.js` $\rightarrow$ `evidence/06-two-users-one-browser.txt`.
- Create [`app/api/logout/route.ts`](file:///c:/Users/DT001/Desktop/SchoolFix/app/api/logout/route.ts):
  - Atomically delete session record from database.
  - Clear cookie with `Max-Age=0`.
- Capture `evidence/07-session-row-present.png` and `evidence/08-session-row-deleted.png`.
- Author `scripts/test-logout-edge-case.js`:
  - Simulate offline/aborted logout request.
  - Capture edge case failure (`evidence/09-logout-network-failure.txt`) and client fallback fix (`evidence/10-logout-edge-case-fixed.txt`).

### Step 5: Password Reset Wipes All Sessions
- Update [`app/api/reset/route.ts`](file:///c:/Users/DT001/Desktop/SchoolFix/app/api/reset/route.ts):
  - Upon successful password update, invoke `prisma.session.deleteMany({ where: { userId } })`.
- Execute `scripts/test-password-reset-kills-sessions.js` simulating two concurrent logins and verifying secondary session termination $\rightarrow$ `evidence/11-reset-kills-other-session.png`.

### Step 6: NDPA 3-Stage Account Deletion & Scheduled Job
- Create [`app/api/account/delete/route.ts`](file:///c:/Users/DT001/Desktop/SchoolFix/app/api/account/delete/route.ts):
  - Soft delete: set `isLocked: true`, `deletedAt: new Date()`, wipe all active sessions.
  - Capture account lock: `evidence/12-deletion-request-locks-account.png`.
- Create [`lib/security/deletion-worker.ts`](file:///c:/Users/DT001/Desktop/SchoolFix/lib/security/deletion-worker.ts):
  - Identifies accounts where `deletedAt <= NOW() - 7 days`.
  - Atomic transaction: Anonymize personal details (`name = "Anonymized Parent"`, `email = "purged_<id>@schoolfix.internal"`, `phone = null`), unlink dependent student parent references, retain `Payment` and `PaymentAttempt` records.
  - Structured console logging: start time, candidate count, purged count, retained ledger count, completion time.
- Run `scripts/test-deletion-scheduled-job.js` twice:
  - Run 1 output $\rightarrow$ `evidence/13-scheduled-job-run-one.txt`.
  - Run 2 output $\rightarrow$ `evidence/14-scheduled-job-run-two.txt` (proves 0 changes, zero duplicate side-effects).

### Step 7: The Data Retention Matrix
- Author `docs/retention-matrix.md`:
  - Detail all 11 database models: `User`, `Session`, `ClassArm`, `TeacherClassAssignment`, `FeeSchedule`, `Student`, `Attendance`, `Assessment`, `Payment`, `PaymentAttempt`, `DocumentChunk`.
  - Reconcile the fundamental conflict: NDPA §34 (Right to Erasure) vs. CAMA 2020 §374 / CITA §63 (Mandatory 6-Year Financial Accounting Retention).
  - Define backup retention synchronization intervals (30-day rolling snapshot purge).

### Step 8: Privacy Document & The Unfulfillable Promise
- Author root `privacy.md`: Plain-language explanation of data collection, 7-day grace period, and anonymization.
- Author `privacy-draft-with-broken-promise.md`: Document an initial draft promising "Immediate complete record erasure upon oral request at the bursar's office", and analyze why this promise is both operationally impossible and legally non-compliant.

### Step 9: Client State Management Without Bloat
- Implement lightweight React state caching in [`app/auth/AuthCard.tsx`](file:///c:/Users/DT001/Desktop/SchoolFix/app/auth/AuthCard.tsx):
  - Preserve user-typed email from a failed login attempt into the password reset view via URL state / component state without external libraries (Redux/Zustand).
- Capture `evidence/15-state-management-working.png`.
- Author `docs/state-management.md`.

### Step 10: Role-Based Access Control & Copied-Link Test
- Implement administrative portal:
  - [`app/portal/admin/page.tsx`](file:///c:/Users/DT001/Desktop/SchoolFix/app/portal/admin/page.tsx)
  - Accessible strictly to `ADMIN` and `BURSAR`.
- Test access using a regular `PARENT` account: verify middleware refusal with `HTTP 403 Forbidden` $\rightarrow$ `evidence/16-admin-route-refused.png`.

### Step 11: Primary Research — School Bursar Interview
- Conduct and document primary interview in `docs/interview-with-owner.md`:
  - Subject: Bursar / Administrator of an authentic Lagos private secondary school.
  - 5 mandatory questions on manual ledger reconciliation, parent deletion requests, and cash vs. electronic payment tracking.
  - Document unexpected findings that contradicted initial assumptions.

### Step 12: Technical Handbook (`docs/handbook.md`)
- Author comprehensive 7-chapter reference manual covering:
  1. Typography, Shadows, and the Design System Export.
  2. Scaffolding, the Development Server, and Database Diagnostics.
  3. Information Design, the Browser Head, and Responsive Type.
  4. The Working Tree, Branching, and Client-Side Validation.
  5. Migrations, Schema Design, and Email Delivery.
  6. Server-Side Validation, Hashing, Rate Limiting, and Verification.
  7. Sessions, Logout, Account Deletion, and Compliance.
  - Each section includes: Concept definition, Architectural rationale, Real Nigerian school scenario, Technical mechanism, Failure modes, and **Our Genuine Mistake** (7 verifiable defects from our git history).

### Step 13: Published Technical Article
- Author `docs/article.md` (1,500-word engineering post detailing our migration to Argon2id and handling background email dispatch).
- Save screenshot in `evidence/17-published-article-screenshot.png`.

### Step 14: What I Do Not Know & Viva Defence
- Author `docs/what-i-do-not-know.md`: 8 genuine, rigorous technical admissions.
- Author `docs/interview-answers.md`: Succinct, precise answers to all 22 viva questions ($\le 200$ words each).
  - Cross-task numerical consistency: cite 82.21 ms Argon2id hashing, 5 req/min rate limit, 10-minute OTP expiry.
- Author `docs/defects.md` and `task-05-sessions-compliance-defence/README.md`.

---

## 4. Inviolable Constraints & Operational Rules
1. **Zero Raw Hex/RGB Styling:** All new UI components strictly consume `design-tokens/tokens.css`.
2. **Zero Faked Evidence:** All PIDs, timestamps, HTTP status codes, and terminal traces are derived from local execution.
3. **No Autonomous Schema Migrations:** All schema models remain frozen on the 11 PRD models.
4. **Cross-Task Numerical Integrity:** Figures cited in Task 5 viva answers must exactly match artifacts from Tasks 1–4.
