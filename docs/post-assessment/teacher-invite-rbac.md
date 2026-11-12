# Post-Assessment Hardening: Teacher Invitation, Activation & Class-Arm RBAC

**Date:** 12 November 2026
**Scope:** P0 security and correctness batch after the five-task curriculum audit.
**Schema impact:** none. The frozen 11-model schema was not modified and no migration was run.
**Verification:** `npx tsc --noEmit` clean · `npx next build` succeeds · `node scripts/verify-invite-rbac.js` → **33/33 checks passed**.

---

## 1. Why this batch exists

The audit found that teacher onboarding and teacher data access were **client-authoritative**. The administrator screen generated a setup code in the browser, the activation endpoint never compared the submitted code to anything, and the teacher dashboard posted a human-readable class name where the API expected a UUID. Three of the four defects below are exploitable by anyone with a browser and a session; the fourth silently blocks the feature from ever working.

All line numbers in this section refer to the committed state audited at `HEAD` before the fix, reproduced verbatim in [`evidence/05-before-state-excerpts.txt`](evidence/05-before-state-excerpts.txt).

### Defect 1 — Activation granted the `TEACHER` role without any invite (privilege escalation)

`app/api/teachers/activate/route.ts:54` destructured the submitted `code`, but no branch in the handler ever read it again. When the email was unknown, the route fell through to `prisma.user.create` at `:113` with `role: 'TEACHER'`, `isVerified: true` (`:119-120`). The class-arm assignment at `:128-136` also trusted the client-supplied `assignedClassArm`, creating missing class arms on demand.

Consequence: **any anonymous internet user could POST a name, email, phone, password and an arbitrary class arm to `/api/teachers/activate` and receive an activated teacher account with write access to that class arm.** The "72-hour invitation token" documented in the README was never enforced. Non-repudiation was void: a teacher could self-assign to any class and no administrator-authored record existed to attribute score edits to.

Cost if unpatched: unauthorised marks and attendance entries in a school's terminal results, with no audit trail tying the account to an administrator's decision. In a Nigerian private school this is a fee-dispute and results-tampering vector.

### Defect 2 — Invitation codes were generated in the browser with a non-cryptographic PRNG

`app/portal/admin/components/TeachersView.tsx:164` and `:204` produced `SF-${Math.floor(1000 + Math.random() * 9000)}` — a 9,000-value keyspace from `Math.random()`, stored only in React state (`AdminCard.tsx:90`, `:153-155`). The code was never persisted, so it could not be verified, could not expire, and did not survive a page reload. The activation link embedded the teacher's name, phone and email in the URL query string.

Consequence: the code was decorative. Any code would have activated an account (see Defect 1), and the "WhatsApp invite" carried PII in a shareable URL.

Cost if unpatched: personal data leakage through forwarded links, plus a workflow that looks compliant while granting access to anyone.

### Defect 3 — Teacher RBAC failed open

`app/api/teacher/attendance/route.ts:50-56` and `app/api/teacher/scores/route.ts:132-138` only denied access when the teacher had *some* assignment elsewhere. A teacher with **zero** assignments passed the check for **every** class arm. Neither route validated that the submitted `studentId`s belonged to the posted `classArmId`, so a teacher assigned to JSS 1A could upsert attendance or assessment rows for JSS 3C pupils by sending their IDs.

`app/api/teacher/scores/route.ts` GET had no class-arm check at all — any authenticated teacher could read another arm's CA and exam marks.

Cost if unpatched: cross-class grade tampering and disclosure of minors' academic records, in direct violation of AGENTS.md §4.1 and the NDPA data-minimisation principle.

### Defect 4 — The dashboard sent class names and rendered mock pupils

`app/portal/teacher/TeacherDashboardClient.tsx:63` held `activeClass = 'JSS 2A'`; `:67` seeded attendance from a hard-coded `DEFAULT_STUDENTS` array declared at `:38`; `:145` and `:253` posted `classArmId: activeClass`, i.e. the literal string `"JSS 2A"`. Since `ClassArm.id` is a UUID, every save would fail the foreign-key/validation path. The header also hard-coded `38 students`, `94% present`, `22 of 38` and `Fri 30 Oct` regardless of reality.

Consequence: the dashboard was a static mock. Even with a valid assignment, attendance and scores could never be saved from the UI, and the teacher saw fictitious pupils.

Cost if unpatched: attendance capture silently fails on the first real school day, which is the exact operational failure the product is meant to prevent.

---

## 2. What changed

### 2.1 Frozen-schema constraint and the storage decision

AGENTS.md Rule 4 and PRD §8.2 freeze the 11 models; new invite columns are not permitted. The existing `User.verificationCode` and `User.codeExpiresAt` columns already exist for email OTP verification, so the invite secret reuses them:

| Property | Implementation |
| :--- | :--- |
| Secret format | `SF-` + 6 CSPRNG digits (`crypto.randomInt`), 10⁶ keyspace |
| At rest | SHA-256 hex digest in `User.verificationCode`; raw code never stored |
| Expiry | `User.codeExpiresAt = now + 72 h` |
| Single use | Atomic conditional `updateMany` clears the digest; a concurrent second request matches zero rows |
| Comparison | `crypto.timingSafeEqual` over equal-length digests |
| Discriminator | `role = TEACHER` **and** `isVerified = false` identifies a pending invite |

**Why 6 digits, not the 4 digits shown in the old samples.** At the enforced ceiling of 10 attempts/minute per IP, a 72-hour window permits at most 43,200 guesses. Against a known invited email that is 4.32% of the 10⁶ space — unacceptable but bounded, and the address must be known first. With the old 4-digit space (10,000), the same window covers the entire keyspace 4.3 times over, so the rate limit would be meaningless. 6 digits is also what the UI label ("6-Digit Setup Code") already promised.

**Accepted consequences, stated openly:**
* `User` has **no phone column**. The phone number collected by the admin is validated and used only to address the WhatsApp message; it is echoed back in the API response as `deliveryPhone` and is not persisted. Email is therefore mandatory for an invite.
* Parents' email OTP and teacher invites share the same two columns. They cannot collide in practice because a pending invite requires `role = TEACHER` and the activation route refuses non-teacher rows; the email OTP flow never sets a `TEACHER` role. This is a documented compromise of the schema freeze, not an accident.

### 2.2 New files

| File | Responsibility |
| :--- | :--- |
| `lib/security/invite.ts` | CSPRNG code generation, SHA-256 hashing, constant-time verification, 72-hour TTL, activation-link and WhatsApp message builders, unusable placeholder Argon2id hash |
| `lib/security/rbac.ts` | `canAccessClassArm(userId, role, classArmId)` and `findOutOfScopeStudentIds(classArmId, studentIds)`, both fail-closed |
| `app/api/teachers/invite/route.ts` | `POST` invite endpoint: `ADMIN` only, Zod boundary validation, 10/min/IP, creates/refreshes the unverified teacher row, upserts class arm and assignment, returns code/link/WhatsApp text/expiry |
| `scripts/verify-invite-rbac.js` | Live HTTP + database harness; seeds its own fixtures and deletes them in `finally` |
| `docs/post-assessment/` | This document and its evidence |

### 2.3 Modified files

| File | Change |
| :--- | :--- |
| `app/api/teachers/activate/route.ts` | Rewritten: no user creation, invite required, constant-time code check, expiry enforcement, atomic single-use, server-authored name and class arm, breached-password check before hashing, Argon2id, session issue |
| `app/api/teacher/attendance/route.ts` | Fail-closed class-arm guard on GET and POST; every `studentId` verified against the posted arm before the transaction |
| `app/api/teacher/scores/route.ts` | Same guards; GET previously had no RBAC check |
| `app/portal/teacher/TeacherDashboardClient.tsx` | Class-arm UUID state, server-loaded roster and saved scores, derived metrics, honest failure messaging, real retry of unsent payloads, removal of all mock pupils and hard-coded figures |
| `app/portal/admin/components/TeachersView.tsx` | Invite form calls the API; renders server code, expiry and WhatsApp text; demo rows cannot mint real accounts |
| `app/portal/admin/AdminCard.tsx` | Onboarding Step 5 calls the API, collects the missing phone number, and shows the one-time code in a dedicated share panel |
| `app/auth/AuthCard.tsx` | 6-digit `SF-######` client validation, client no longer submits a class arm, explains that the name is administrator-authored |
| `lib/security/validation.ts` | `TeacherInviteSchema` with class-arm name constraints |
| `lib/security/rate-limiter.ts` | Adds the `teacher-invite` action bucket |

---

## 3. Verification (machine evidence)

Evidence files live in [`evidence/`](evidence/):

| File | Content |
| :--- | :--- |
| `01-tsc-clean.txt` | `npx tsc --noEmit` exit code and output |
| `02-next-build.txt` | `npx next build` route table including `/api/teachers/invite` |
| `03-invite-rbac-33-checks.txt` | Full harness transcript, 33/33 |
| `04-working-tree-diff.patch` | Complete `git diff` of the batch |
| `05-before-state-excerpts.txt` | Numbered `HEAD` excerpts proving each defect above |

Reproduce:

```bash
npx tsc --noEmit
npx next build
npx next start -p 3100        # in one terminal
node scripts/verify-invite-rbac.js   # in another
```

The harness performs real HTTP calls with real session cookies and asserts against PostgreSQL:

* anonymous invite → `401`; parent invite → `403`; admin invite → `201`;
* code matches `SF-\d{6}`, expiry is 72.00 h, stored value is a 64-char digest and differs from the code;
* wrong code → `400` and the invite survives; unknown email → `400` (no open self-registration); expired code → `400` and the digest is cleared;
* re-issue does not duplicate the row; valid activation → `200` with a session cookie, `isVerified = true`, digest `NULL`, exactly one assignment matching the admin's arm;
* replaying the consumed code → `409`;
* teacher reading own register → `200`; foreign arm → `403`; attendance write for a foreign pupil → `403`; own pupil → `200`;
* foreign-arm score read → `403`; foreign-pupil score write → `403`; own pupil → `200` with `35 + 55 = 90` and grade `A`;
* cleanup restores the database to its pre-run counts (20 users, 1 student, 1 class arm, 0 attendance, 0 assessments, 0 assignments).

---

## 4. Residual risks and known limits (not fixed by this batch)

1. **Rate limiting is per-process and trusts `X-Forwarded-For`** (`lib/security/rate-limiter.ts:11,30-40`). Behind a proxy that does not overwrite the header, an attacker rotates the key and defeats the 10/min ceiling, which is the only control bounding setup-code guessing. Production requires the proxy to strip/overwrite the header and a shared store (Redis/Postgres) for counters.
2. **The admin teacher directory still renders seeded sample rows.** Rows created through this batch are marked `isPersisted` and cannot be re-invited into real accounts; the directory itself is not yet database-backed, and class-arm reassignment is still UI-only.
3. **The offline queue is not a queue.** A failed save keeps the exact payload in component state plus a per-class `localStorage` draft, and retries on `online` or manual retry. It does not survive a page reload, so the UI no longer claims queued durability.
4. **Remarks are not persisted.** The dashboard labels the remark draft as such.
5. **Teachers with no assignment now see an empty dashboard** rather than a 403 page. That is deliberate: the page renders, but no class data is exposed.
6. **Email is mandatory for invites** because the frozen `User` model has no phone column; a phone-only teacher cannot be invited until a schema change is approved by the repository owner.
7. **Activation distinguishes "already active" (`409`) from "invalid or expired" (`400`)**. This is helpful to a real teacher but does confirm that a given email belongs to an activated teacher account. The check is rate-limited, requires the invite screen, and reveals nothing about parents or administrators; a stricter deployment could collapse both into one response.

---

## 5. Remaining product gap register (unchanged by this batch)

| Area | State |
| :--- | :--- |
| Flutterwave checkout, webhook verification, dual-ledger settlement | Not implemented (`app/api/payments/*` absent) |
| Report-card fee gate at `/portal/reports/[studentId]` | Route does not exist |
| Bursar and parent dashboards | Client components with `INITIAL_CHILDREN` / local state; not DB-backed |
| Student, class, fee and CSV roster management endpoints | Absent |
| pgvector RAG and handbook chat | Not implemented; no extension or index |
| Seed data | No seed script; explains the near-empty database |
| Missing hand-drawn evidence | `task-02/evidence/14-working-tree-drawing.jpg`, `task-04/evidence/01-schema-drawing.jpg` (human-only) |
