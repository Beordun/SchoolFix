# SchoolFix

## 1. What This Is
SchoolFix is a mobile-first school management and tuition reconciliation web application designed for Nigerian private primary and secondary school teachers and bursars operating on budget smartphones over metered networks, where daily attendance capture and audit-compliant fee clearance must never lose data during network partitions.

---

## 2. Status
* **Completed Milestones:**
  * **Task 1 (Design System):** Full token architecture derived for Nigerian private schools, 14-step tonal palette pinned to Primary 40 Indigo (`#4B0082`), 15 Bricolage Grotesque typography tokens ($1.4\times$ line-height formula), brand-tinted elevation shadows, token compiler (`scripts/build-tokens.js`), and intentional regression proof (`evidence/11-broken-referencing.png`).
  * **Task 2 (Repository Scaffolding, Diagnostics & Information Design):** Grounded scaffolding prompt, model decision matrix, development server startup diagnostics, three deliberate breakages and recoveries, verified database persistence with explicit HTTP `201 Created` logs and row timestamps (`evidence/11-write-succeeded-logs.txt`), false-success investigation (`docs/false-success.md`), working tree analysis (`docs/working-tree.md`), git branching with non-fast-forward PR merge and unmerged branch deletion (`evidence/15-git-log-graph.txt`, [Pull Request #1](https://github.com/Beordun/SchoolFix/pull/1)), Information Design with responsive `clamp()` typography (`docs/information-design.md`, `evidence/16` to `20`), Task 2 summary README, defect log (`docs/defects.md`), and 15 viva defense answers (`docs/interview-answers.md`).
  * **Task 3 (Client Validation, SPA Auth & Accessibility):** Collapsed multi-page auth into query state machine (`/auth?mode=login|register|reset`), 4 derived client validation categories with legitimate user costs documented, Nigerian phone `inputMode="numeric"` fix, user enumeration defense, WCAG 2.1 AA accessibility audit with NVDA/TalkBack transcripts, disabled button tab-order retention (`aria-disabled="true"`), adversarial form attack (whitespace password defect), direct endpoint bypass proof (`HTTP 201 Created` user `5d8e9b4e-76d3-4f6b-84d0-02dd50411ae5`), hard rollback experiment (`171a725`), defects log (`docs/defects.md`), and 14 viva defense answers (`docs/interview-answers.md`).
  * **Task 4 (Server Security, Hashing & Boundary Validation):** Frozen 11-model relational schema with separate `PaymentAttempt` dual-ledger, three-step zero-downtime migration pattern (Expand-Backfill-Contract) for `nin`, runtime schema drift error forensics (`evidence/06-drift-error.txt`), slow password hashing benchmark (Argon2id 82.21ms vs SHA-256 0.092ms, 894× ratio), Zod boundary validation rejecting Task 3 direct bypass attack (`HTTP 400 Bad Request` in `evidence/12-direct-request-before-and-after.txt`), lowercased email normalization, trimmed passwords, sliding window rate limiting (5 req/min, triggered 429 & defeated via IP rotation in `evidence/14-rate-limit-defeated.txt`), k-anonymity HaveIBeenPwned breach rejection (`evidence/15-breach-check-rejection.png`), CSPRNG 6-digit OTP email verification with 10-minute expiry, asynchronous queue worker (3,085ms sync vs 438ms background job), all 3 failure states evidenced (expired, wrong, code reused), branded transactional email with Task 1 tokens (`evidence/23-rendered-email.png`), defect log (`docs/defects.md`), and 19 viva answers (`docs/interview-answers.md`).
* **Not Started:**
  * **Task 5 (Sessions, Compliance & Viva Defense):** Cryptographic 32-byte session tokens, 3-stage lawful NDPA account deletion, Data Retention Matrix, and viva defense handbook.

---

## 3. The Stack, with Reasons
* **Next.js 14 (App Router):** Server-side rendering by default minimizes JavaScript hydration payload on sub-$100 Android smartphones, unlike client-heavy single-page React bundles.
* **TypeScript:** Enforces strict compile-time type boundaries (`strict: true`, `noImplicitAny: true`) across database entities and route handlers, eliminating undefined runtime exceptions during school hours.
* **PostgreSQL 16 + Prisma ORM:** Delivers strict ACID consistency (CP model) and immutable foreign key ledger constraints (`onDelete: Restrict`) required for fee audit disputes, unlike eventually consistent NoSQL databases.
* **Vanilla CSS & Design Tokens (`tokens.css`):** Direct consumption of semantic CSS variables ensures complete visual consistency with zero runtime CSS-in-JS overhead or heavy utility-class dependencies.
* **Zod:** Provides declarative boundary validation on all incoming request bodies and route parameters before touching database queries, preventing corrupt inputs from reaching service layers.
* **Argon2id:** Memory-hard cryptographic password hashing ($65,536\text{ KiB}$ memory, 3 iterations, 4 parallelism) protects parent accounts against GPU-accelerated dictionary attacks, unlike vulnerable fast hashes like SHA-256.
* **Flutterwave:** Built-in support for Nigerian banking rails (debit cards, bank transfers, USSD) with webhook signature verification, unlike foreign gateways lacking direct NGN settlement.

---

## 4. Getting Started
Execute these commands in order from a terminal on a machine with Node.js 18+ and PostgreSQL 16+ installed:

```bash
# 1. Clone the repository
git clone https://github.com/Beordun/SchoolFix.git
cd SchoolFix

# 2. Install dependencies
npm install

# 3. Create your local environment configuration
cp .env.example .env.local

# 4. Open .env.local in an editor and set your local DATABASE_URL (see Section 5 below)

# 5. Synthesize Prisma client types
npx prisma generate

# 6. Apply database schema and initialize tables
# Option A (via Prisma):
npx prisma db push

# Option B (direct SQL execution via psql):
psql -U postgres -h localhost -d schoolfix_db -f prisma/init-schema.sql

# 7. Compile design tokens into semantic CSS variables
node scripts/build-tokens.js

# 8. Start the local development server
npm run dev
```

Open `http://localhost:3000` in your browser. The application is running.

---

## 5. Environment Variables
* `DATABASE_URL`: Connection string for PostgreSQL database instance with schema specification.
* `SESSION_SECRET`: Cryptographic signing secret used to verify server-side session cookies.
* `PORT`: HTTP port number on which the web server listens (defaults to 3000).
* `FLW_PUBLIC_KEY`: Flutterwave merchant public key for initializing checkout modals.
* `FLW_SECRET_KEY`: Flutterwave secret key for server-to-server transaction verification requests.
* `FLW_SECRET_HASH`: Secret hash header verified against incoming Flutterwave webhook events.

---

## 6. What This Deliberately Does Not Do
* **No In-App Messaging or Chat Channels:** School parent-teacher communications remain on WhatsApp to prevent server infrastructure bloat and notification fatigue.
* **No Automated Timetable Scheduling:** Complex algorithm solvers for timetable generation are explicitly excluded; class scheduling is handled administratively.
* **No Independent Student Accounts:** Students cannot log in or register; parents hold accounts and access dependent pupil profiles to protect minor data.
* **No Native Mobile Binaries (iOS/Android):** SchoolFix is built as a mobile-first Progressive Web App (PWA) to eliminate app store approval delays and phone storage limits.
* **No Payroll or Inventory Management:** System scope is tightly bound to attendance and tuition reconciliation, omitting general school ERP assets and pension engines.

---

## 7. Known Defects
* **Outline Token Contrast Boundary (`tokens.css:136`):** The `--color-outline` variable has a contrast ratio of **4.22:1** against `--color-surface`. While compliant with WCAG AA 1.4.11 for non-text UI components ($\ge 3:1$), it fails the 4.5:1 requirement for body text and is strictly restricted to decorative borders and field boundaries.
* **Local Windows pgvector Extension Dependency (`prisma/schema.prisma:4`):** The `extensions = [pgvector(map: "vector")]` flag requires compiled native C binaries. On Windows systems where pgvector is not pre-compiled into PostgreSQL's library directory, automated migrations stall unless tables are created via the fallback SQL script (`prisma/init-schema.sql`).
* **Redundant Shadow Suffix Bug (`scripts/build-tokens.js:111`):** The initial compiler export keyed elevation tokens as `--shadow-soft-shadow`, preventing elevated modals from rendering shadows until key normalization was patched in `scripts/build-tokens.js`.
* **Windows File Lock on Native Query Engine (`node_modules/.prisma/client/query_engine-windows.dll.node`):** On Windows hosts, active Next.js processes acquire an exclusive kernel handle lock on Prisma's engine DLL, failing `prisma generate` atomic renames with `EPERM` until daemon workers are signaled.
* **Verification Code Replay State Leak (`app/api/verify/route.ts:43`):** Submitting a valid confirmation code twice allowed duplicate execution before atomic state checks were added to reject already verified accounts with `409 Conflict`.
