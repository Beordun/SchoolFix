# Task 5 Technical Interview Defense: 22 Authoritative Answers

> **Platform:** SchoolFix (Next.js 14.2.35 + PostgreSQL 16 + Prisma ORM)  
> **Target Roles:** Forward Deployed Engineer (FDE), Full-Stack Systems Engineer, AI Systems Architect  
> **Constraint:** Maximum 200 words per answer. Cross-task numerical consistency rigorously verified.  
> **Document Reference:** `task-05-sessions-compliance-defence/docs/interview-answers.md`  

---

### Question 1: What should a secure browser session look like? Name every property and what each one prevents.
A secure session uses an opaque, high-entropy 32-byte CSPRNG token (64 hex characters) stored as a SHA-256 hash in the database, delivered via an HTTP cookie with five mandatory attributes:
1. `HttpOnly`: Prevents client-side JavaScript (`document.cookie`) access, stopping XSS token theft.
2. `Secure`: Restricts cookie transmission strictly to TLS/HTTPS encrypted connections, preventing network eavesdropping on public Wi-Fi.
3. `SameSite=Lax`: Withholds cookies from cross-site subrequests (embedded forms/images), preventing Cross-Site Request Forgery (CSRF) while allowing top-level navigation.
4. `Path=/`: Constrains scope to application root, preventing cross-path token leaks.
5. `Max-Age=604800` (7 days): Establishes deterministic expiration, preventing abandoned sessions from living indefinitely.
Server-side, the record tracks `userId`, `expiresAt`, `ipAddress`, and `userAgent` to enable anomalous device detection.

*(118 words)*

---

### Question 2: What is session fixation, and what prevents it?
Session fixation occurs when an attacker forces a known session identifier onto a victim’s browser (e.g., via a crafted link or query parameter), waits for the victim to authenticate, and then uses that pre-set identifier to hijack the authenticated account.

To prevent session fixation:
1. **Regenerate on Privilege Change:** The application must strictly discard any pre-existing session token upon authentication and issue a completely fresh 32-byte identifier from CSPRNG on every successful login.
2. **Never Accept Session IDs from URLs:** Session identifiers must never be parsed from query parameters or request bodies; they must originate exclusively from browser cookies.
3. **Strict Cookie Scoping:** Setting `SameSite=Lax` and domain-restricted paths prevents external domains from pre-seeding cookie jars.

*(116 words)*

---

### Question 3: Are tokens better than server-side sessions? Answer for your own application, not in general.
For SchoolFix, server-side sessions stored in PostgreSQL are definitively superior to stateless JWT tokens.

In Nigerian school administration, security requires immediate, centralized revocation. If a classroom teacher's smartphone is stolen or an administrator suspects unauthorized tampering with terminal exam scores, a server-side session can be revoked in milliseconds by deleting its database row. 

Stateless JWT tokens cannot be revoked before natural expiration without building a distributed blocklist, which re-introduces statefulness while adding caching complexity. Furthermore, SchoolFix is a strict CP system with an existing PostgreSQL database. A 0.8 ms index lookup on `Session.sessionToken` costs virtually nothing and guarantees that account locks, 7-day NDPA deletions, and role changes take effect immediately.

*(114 words)*

---

### Question 4: How would you implement log out of all devices?
To log out of all devices in SchoolFix:
1. The server receives an authenticated request to `POST /api/account/logout-all`.
2. An atomic query executes against PostgreSQL:
   ```ts
   await prisma.session.deleteMany({ where: { userId: currentUserId } });
   ```
3. The server clears the cookie on the calling device by emitting `Set-Cookie: schoolfix_session=; Max-Age=0; Path=/`.
Every device previously authenticated with that user's credentials will now fail its next request with `HTTP 401 Unauthorized`, because its session digest has been expunged from the database. This guarantees instant, total revocation across mobile, desktop, and cybercafé terminals.

*(98 words)*

---

### Question 5: How do you invalidate existing sessions on a password change?
A password change or reset indicates either that an account was compromised or that the user lost control of a device. Existing sessions must never persist across credential changes.

In SchoolFix (`app/api/reset/route.ts`), when a password update succeeds:
1. The new password is validated and hashed with Argon2id.
2. An atomic transaction updates `User.passwordHash` and executes:
   ```ts
   await prisma.session.deleteMany({ where: { userId } });
   ```
3. The response sends `Set-Cookie` with `Max-Age=0` to clear the current device.
Any secondary browser or mobile device attempting to make authenticated requests immediately receives `401 Unauthorized` and is redirected to login, proved in `evidence/11-reset-kills-other-session.txt`.

*(110 words)*

---

### Question 6: What do the HttpOnly, Secure and SameSite cookie flags protect against, and what does each one fail to protect against?
- **`HttpOnly`:** Protects against XSS token exfiltration via `document.cookie`. It fails to protect against Cross-Site Request Forgery (CSRF) or browser-level packet interception.
- **`Secure`:** Protects against man-in-the-middle packet sniffing by restricting transmission to TLS/HTTPS. It fails to protect against malware, physical device access, or compromised local browser extensions.
- **`SameSite=Lax`:** Protects against Cross-Site Request Forgery (CSRF) on cross-origin POST requests. It fails to protect against state-changing actions improperly bound to HTTP GET requests or attacks originating from subdomains of the same origin.

*(86 words)*

---

### Question 7: What is the difference between a 401 and a 403, and how should the interface treat them differently?
- **`401 Unauthorized`:** Signals missing or invalid authentication. The server does not know who you are. The interface must redirect the user to `/auth?mode=login`, preserving the requested URL in a redirect parameter to restore context after authentication.
- **`403 Forbidden`:** Signals that authentication succeeded, but authorization is denied. The server knows who you are, but your role lacks permission. The interface must NOT redirect to login (which causes an infinite redirect loop); it must display an explicit refusal page explaining why access is denied and offering a safe route back to their authorized dashboard.

*(100 words)*

---

### Question 8: Why must logout be handled on the server rather than the front end, and what exactly stays alive if it is not?
Logout must be handled on the server because authentication is maintained by the database ledger. 

If logout is handled on the front end only (wiping `localStorage` and clearing the cookie), the session record in PostgreSQL remains completely active. If an attacker intercepted the token on a shared school computer or public Wi-Fi, the stolen token remains a 100% valid bearer credential until natural expiration (7 days). 

Server-side logout permanently destroys the database row via `DELETE FROM "Session"`, rendering the token dead even if an adversary possesses the raw cookie.

*(93 words)*

---

### Question 9: What is the difference between authentication and authorisation, and which one does a protected route need?
- **Authentication:** Verifying **identity**—confirming that the user is who they claim to be (e.g., verifying an email and Argon2id password hash).
- **Authorization:** Verifying **privilege**—determining whether an identified user has permission to perform a specific action or view a specific resource (e.g., confirming whether a user has role `BURSAR` or `PARENT`).

A protected route requires **both**: it must first authenticate the user to establish identity, and then immediately authorize their role against route permissions before rendering data.

*(82 words)*

---

### Question 10: A user asks you to delete their account. Walk me through what happens, from the request to the data being gone.
1. **Verification & Soft Delete:** The user submits a deletion request via `/portal/dashboard`. The server updates `User.deletedAt = now()` and schedules purge for `now() + 7 days`. All active sessions are revoked immediately, locking the account against logins.
2. **7-Day Grace Period:** The account remains locked in the database, allowing accidental requests to be cancelled.
3. **Scheduled Background Purge:** After 7 days, an automated worker runs an atomic transaction:
   - PII (`fullName`, `email`, `nin`, `phone`) is permanently anonymized.
   - Child links are unlinked (`Student.parentId = null`).
   - Immutable financial ledgers (`Payment`, `PaymentAttempt`) are strictly retained for CAMA compliance.

*(102 words)*

---

### Question 11: Which data would you refuse to delete on a deletion request, and on what basis?
SchoolFix strictly refuses to delete records from the **`Payment`** and **`PaymentAttempt`** tables.

The legal basis is **NDPA 2023 § 34(2)(b)**, which explicitly limits the right to erasure where data processing is required for compliance with a statutory legal obligation. Under the **Companies and Allied Matters Act (CAMA 2020) § 374** and **CITA § 63**, Nigerian businesses must retain financial books of account, bank transaction references, and payment vouchers for a minimum of **six (6) years** for statutory tax audits by the Federal Inland Revenue Service (FIRS) and state revenue boards.

*(94 words)*

---

### Question 12: What happens to your backups when a user is deleted?
Backups cannot be selectively mutated in real time without invalidating archive cryptographic checksums. 

SchoolFix resolves backup compliance through **timed snapshot expiration and tombstone replay**:
1. Nightly snapshots have an automated **30-day lifecycle expiration policy** in AWS S3 / Wasabi cold vaults. Deleted rows naturally age out within 30 days.
2. SchoolFix maintains a permanent `DeletionTombstone` table. If disaster recovery requires restoring a 14-day-old backup snapshot, our post-restore reconciliation script immediately replays the tombstone table, re-purging any resurrected user records before production traffic is re-routed.

*(89 words)*

---

### Question 13: What is the difference between anonymising and deleting, and when is anonymising sufficient?
- **Deleting:** Completely dropping rows from disk (`DELETE FROM "User"`).
- **Anonymising:** Permanently severing all identifiable links (overwriting names with static text, hashing emails, nulling NINs) so the data cannot be attributed to a natural person.

Under **NDPA § 65** and **GDPR Recital 26**, properly anonymized data ceases to be personal data under law. Anonymising is sufficient—and architecturally superior—when historical operational records (such as grade distributions, class arm attendance percentages, and tuition ledgers) must be preserved for longitudinal analytics without violating privacy.

*(85 words)*

---

### Question 14: Why do you want to work as a forward deployed engineer specifically, rather than as a software engineer?
A traditional software engineer builds against synthetic specifications inside an insulated development team. A Forward Deployed Engineer (FDE) operates directly on the operational frontline, bridging client business reality with system architecture.

I want to work as an FDE because the most difficult software failures are never algorithmic—they are sociotechnical mismatches. Talking to school bursars revealed that parents will not use card checkouts because of 1.5% gateway fees, demanding cash reconciliation instead. An FDE identifies that reality on-site, designs the dual-ledger model, and defends the architecture in production.

*(90 words)*

---

### Question 15: A customer says they want to use AI to improve their operations. How do you respond?
I respond by refusing to pitch AI until we diagnose their data pipeline and baseline metrics. 

I ask: *"What specific operational decision is currently slow, inaccurate, or expensive? Where does the source data live, and is it structured and clean?"* 

In 80% of enterprise cases, what the customer actually needs is a relational schema, clean data pipelines, and a streamlined mobile form. AI is a reasoning engine, not a magic wand. Deploying an LLM or Vector RAG on top of disorganized records merely automates hallucination.

*(84 words)*

---

### Question 16: What is the difference between a RAG system and a fine-tuned model for an enterprise deployment?
- **RAG (Retrieval-Augmented Generation):** Keeps the model frozen. Dynamic enterprise documents are chunked, embedded, and retrieved from a vector database (PostgreSQL `pgvector`), injected into the prompt context at query time.
- **Fine-Tuning:** Updates model internal weights using a specialized dataset to alter style, tone, or domain terminology.

For enterprise knowledge (like school policies and fee tariffs), **RAG is vastly superior**: it provides verifiable citations, updates instantly without expensive retraining, and respects row-level access control. Fine-tuning teaches *how* to speak; RAG provides *what* to know.

*(89 words)*

---

### Question 17: How do you evaluate whether an AI agent is working correctly in production?
You evaluate an AI agent against **grounded execution metrics and boundary constraints**, not conversational fluency:
1. **Tool Invocation Correctness:** Did the agent call the expected API with validated Zod schemas, or did it hallucinate non-existent arguments?
2. **Deterministic Constraint Adherence:** Did it respect negative constraints (e.g., zero raw hex colors, no autonomous migrations)?
3. **Retrieval Grounding:** In RAG workflows, what percentage of generated statements are directly cited from retrieved document chunks (faithfulness score)?
4. **Latency & Token Efficiency:** Tracking time-to-first-token and token consumption per completed user workflow.

*(90 words)*

---

### Question 18: How do you decide between local component state, context, and an external state manager?
- **Local Component State (`useState`):** Use for UI state that belongs to a single component or its immediate children (form inputs, toggle states, modal visibility).
- **React Context:** Use for low-frequency global data that many distant components need to read (current user identity, theme tokens, locale).
- **External State Manager (Zustand/Redux):** Use ONLY when high-frequency state changes occur across distant sibling components, or when complex optimistic offline queues (`PENDING_SYNC`) require transactional rollbacks. Most apps ship state libraries prematurely when component composition suffices.

*(87 words)*

---

### Question 19: How do you handle server state, as distinct from client state?
**Client state** is ephemeral UI state (e.g., active tab, dropdown open, typed email in reset form). It lives in browser memory.

**Server state** is data stored remotely in PostgreSQL (e.g., student attendance registers, fee balances). It is asynchronous, shared across multiple users, and can become stale at any moment. 

Server state must be managed with caching, validation, and revalidation boundaries (e.g., Next.js Server Components, React Query), never duplicated into client global stores. The server is always the single source of truth.

*(84 words)*

---

### Question 20: Cite three specific numbers from your own tasks one to four: one from your type scale, one timing figure from your hashing comparison, and one from your rate limit configuration. Explain what each number means and why you chose it.
1. **`1.4×` (Typography Line-Height Multiplier):** Derived in Task 1 Step 3 (`task-01-design-system/docs/type-scale.md`). We enforced a strict $1.4\times$ multiplier across headline and display styles (`line-height = font-size * 1.4`) to maintain tight, scannable vertical density on low-resolution Android screens.
2. **`82.21 ms` (Argon2id Hashing Duration):** Measured on my local machine in Task 4 Step 4 (`task-04-server-security/evidence/08-timing-argon-vs-sha.txt`). Tuned with 64MB RAM and 3 iterations, it proved **894× slower than SHA-256 (0.092 ms)**, making offline GPU dictionary attacks impossible.
3. **`5 requests / minute` (Rate Limit Threshold):** Enforced in Task 4 Step 8 (`task-04-server-security/docs/rate-limiting.md`). Set to lock out automated credential stuffers while accommodating legitimate parents correcting mobile typing errors.

*(116 words)*

---

### Question 21: Across all five tasks, name the decision you are least confident about. Say what you would need to find out to settle it, and what you would do if the answer went against you.
The decision I am least confident about is shipping **Soft Gating** over **Hard Gating** on registration.

While soft gating optimizes user acquisition on metered Nigerian 3G networks by allowing parents to view fee schedules immediately, it creates orphan unverified accounts in PostgreSQL. To settle this, I would need production telemetry measuring: (1) what percentage of soft-gated parents actually complete 6-digit email verification within 24 hours, and (2) whether unverified accounts are exploited for spam. 

If data showed that over 40% of parents never verify, I would switch to Hard Gating with an integrated WhatsApp OTP gateway.

*(99 words)*

---

### Question 22: Wrong-answer analysis. A candidate says: "For GDPR compliance we added a delete account button that removes the user's row from the database immediately, so we are fully compliant with the right to be forgotten. We also keep backups for a year in case anyone needs their data restored." Two sentences, several problems. Identify each, say which is a legal exposure rather than a technical one, and say what the correct design is.
**Problems Identified:**
1. **Immediate Raw Wipe:** Executing `DELETE FROM "User"` immediately violates statutory accounting laws (CAMA 2020 § 374 / CITA § 63) requiring 6-year financial retention. This is a severe **legal exposure**.
2. **Lack of Grace Period:** Immediate deletion leaves zero window for recovery from accidental deletion or fraud.
3. **One-Year Backups Restoring Deleted Data:** Keeping backups for a year without sync means restoring a backup resurrects deleted users, violating the Right to be Forgotten. This is both a **legal and technical exposure**.

**Correct Design:**
Implement 3-stage NDPA deletion: immediate account lock, 7-day grace period, and scheduled background anonymization that decouples personal data while immutably retaining financial ledgers for 6 years. Backups must enforce a 30-day rolling expiration with tombstone reconciliation.

*(126 words)*
