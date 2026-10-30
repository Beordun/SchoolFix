# The SchoolFix Engineering Handbook: Architecture, Failure Modes & Production Lessons

> **Platform:** SchoolFix — Mobile-First Attendance & Tuition Reconciliation  
> **Author:** SchoolFix Staff Engineering & Candidate Team  
> **Audience:** Incoming Cohort Engineers & Forward Deployed System Architects  
> **Document Reference:** `task-05-sessions-compliance-defence/docs/handbook.md`  

---

## CHAPTER 1: Typography, Shadows, and the Design System Export

### 1. The Concept, in Plain Words
A design system is an engineering contract that translates brand identity into a rigid, machine-readable vocabulary of mathematical design tokens. Instead of arbitrary CSS rules (`color: #4B0082; font-size: 19px`), a design system creates a two-tier hierarchy: **private primitives** (the raw palette) and **semantic roles** (functional jobs like `--color-surface`, `--color-primary`, `--type-body-medium`). Components are strictly prohibited from consuming raw values.

### 2. Why It Exists: The Failure It Prevents
Without a token contract, AI coding agents and human developers inevitably produce aesthetic drift. An agent prompted to "make a nice dashboard" defaults to the generic average of its training corpus: muddy black shadows (`rgba(0,0,0,0.15)`), arbitrary line-heights, and unvetted color combinations that fail WCAG accessibility standards. A token system acts as a sandbox that restricts the agent to the exact mathematical choices of your business.

### 3. A Real Nigerian Scenario
At *Eko Premier Academy* in Surulere, teachers open the school portal outdoors on a dusty football pitch at 1:30 PM under intense equatorial sunlight. If the UI designer selected a generic light gray text (`#9E9E9E`) on a white background, the contrast ratio is 3.1:1 (failing WCAG AA). The teacher cannot read the student attendance roster without squinting or shading the cracked phone screen with their palm. SchoolFix enforced pinned Primary 40 Indigo (`#4B0082`) on Surface (`#FCFAFE`), guaranteeing a certified contrast ratio of **12.4:1**, remaining perfectly legible in outdoor glare.

### 4. How It Is Done: The Actual Mechanism
1. The brand color is pinned as Primary 40 in Figma, generating 13 tonal steps (0 to 100) using perceptual color spaces.
2. Elevation shadows are calculated with a brand tint:
   ```css
   --shadow-soft: 0px 4px 12px 0px rgba(75, 0, 130, 0.08);
   --shadow-medium: 0px 8px 24px 0px rgba(75, 0, 130, 0.12);
   ```
3. A zero-dependency transformer script (`scripts/build-tokens.js`) compiles the Figma JSON export into `design-tokens/tokens.css`, exposing strictly semantic CSS variables to the application.

### 5. Where It Goes Wrong: The Failure Mode & Cost
If a developer breaks the token mapping by hardcoding a hex color (`#4B0082`) directly into component CSS, changing the institutional brand color requires a risky global string replacement across hundreds of files. In production, this causes brand dilution where components show mismatched shades of purple and navy, destroying visual trust in an application managing millions of Naira in school fees.

### 6. What I Got Wrong: My Real Mistake
During Task 1 Step 5, I exported tokens from Figma without ensuring variables were explicitly enabled in the export settings. The exported file (`evidence/05-tokens-incomplete.json`) contained only typography and shadow styles while completely omitting all color variables. The transformer script crashed with an unhandled `TypeError: Cannot read properties of undefined (reading 'primary')`. I had to diagnose the missing variable payload, re-export the complete JSON (`evidence/06-tokens-complete.json`), and document the one-line diff in the task summary.

---

## CHAPTER 2: Scaffolding, the Development Server, and Database Diagnostics

### 1. The Concept, in Plain Words
Scaffolding is establishing the baseline runtime, tooling, and database boundaries before writing product code. Database diagnostics is the discipline of inspecting live server logs and relational table states to confirm that state mutations (writes) actually execute on disk rather than trusting what the browser interface displays.

### 2. Why It Exists: The Failure It Prevents
The single most common defect in AI-generated software is the **False-Success Interface**: an agent builds a signup card, mocks an optimistic state transition, shows a green checkmark to the user, but writes nothing to the database. Without disciplined diagnostics, an entire application can be built for weeks on top of an unseeded, unmigrated, or disconnected database.

### 3. A Real Nigerian Scenario
Bursar Adeyemi at *Gracefield College* signs up for a trial school software platform. She enters 45 student records and marks their first-term tuition payments. The screen displays *"Student Saved Successfully!"* after every entry. Two weeks later, her computer crashes. She logs in from another laptop; the dashboard is completely blank. The software was storing entries in volatile in-memory component state without committing rows to PostgreSQL. Forty-five tuition records vanished.

### 4. How It Is Done: The Actual Mechanism
1. Every write endpoint must return an explicit `HTTP 201 Created` status code, never a generic `200 OK`.
2. Every mutation must be verified using independent database inspectors:
   ```bash
   npx prisma studio --port 5555
   ```
3. Terminal logs must capture the incoming request, execution duration, and database primary key UUID.

### 5. Where It Goes Wrong: The Failure Mode & Cost
Relying on UI visual feedback without inspecting terminal logs causes catastrophic deployment failures. A broken environment variable (`DATABASE_URL`) that returns a silent 500 error masked by a client-side `catch` block results in 100% customer registration loss upon public launch.

### 6. What I Got Wrong: My Real Mistake
During Task 2 Step 5, I encountered a port conflict when starting the dev server because a zombie Node.js process was holding port 3000. Instead of diagnosing the PID, I initially attempted to run on port 3001, which broke all cross-origin cookies and callback URLs. I had to stop, execute `netstat -ano | findstr :3000`, locate process ID `14228`, terminate it with `taskkill /F /PID 14228`, and document the recovery in `evidence/07-port-conflict.txt`.

---

## CHAPTER 3: Information Design, the Browser Head, and Responsive Type

### 1. The Concept, in Plain Words
Information design is the intentional architecture of metadata and layout hierarchy. The **browser head** contains configuration (page titles, Open Graph tags, canonical URLs, responsive viewport tags). The **browser body** contains content styled with mathematical fluid sizing (`clamp()`) and rem-based touch targets.

### 2. Why It Exists: The Failure It Prevents
Without deliberate information design, shared links in parent WhatsApp groups render as naked, untrusted URLs without previews. Headings styled with fixed pixel sizes (`font-size: 48px`) spill off the edges of 360px smartphone screens, forcing horizontal scrollbars and breaking usability.

### 3. A Real Nigerian Scenario
A school proprietor shares the link to the new SchoolFix term registration portal on a 250-member WhatsApp parents' group. Because the browser head lacked dynamic Open Graph tags, WhatsApp renders only a raw IP address: `http://197.210.64.12:3000`. Parents immediately flag it as a phishing scam or malware link, refusing to click. Adding a curated title, 9-word description (*"Mobile-first school attendance and tuition reconciliation for Nigerian schools"*), and custom favicon restored complete parental trust.

### 4. How It Is Done: The Actual Mechanism
1. Responsive typography uses CSS `clamp()`:
   ```css
   font-size: clamp(1.75rem, 5vw + 1rem, 2.75rem);
   ```
2. Interactive touch targets enforce a minimum bounding box of `2.75rem` (44px) to ensure reliable thumb taps on cracked smartphone glass.
3. Buttons use padding in `rem` units rather than rigid fixed widths, allowing buttons to adapt to localized text.

### 5. Where It Goes Wrong: The Failure Mode & Cost
Hardcoding button dimensions (`width: 200px; height: 50px`) causes text truncation when rendered on localized devices or when translated. Users with accessibility text zoom enabled experience overlapping text, rendering primary call-to-actions unusable.

### 6. What I Got Wrong: My Real Mistake
During Task 2 Step 10, my initial landing page heading used a fixed `font-size: 3.5rem`. On a simulated Tecno Spark Android viewport (360px width), the word *"Reconciliation"* caused a severe horizontal overflow of 42 pixels, breaking the layout. I had to derive a mathematical clamp formula (`clamp(2rem, 4vw + 1rem, 3.25rem)`) and capture the broken vs fixed layout in `evidence/18-heading-wrap-bad.png` and `19-heading-wrap-good.png`.

---

## CHAPTER 4: The Working Tree, Branching, and Client-Side Validation

### 1. The Concept, in Plain Words
The **working tree** is the four-stage pipeline through which code travels: Working Directory $\rightarrow$ Staging Area $\rightarrow$ Local Git Repository $\rightarrow$ Remote GitHub $\rightarrow$ Production. Client-side validation is immediate user feedback implemented in the browser using HTML5 attributes and JavaScript event handlers.

### 2. Why It Exists: The Failure It Prevents
Operating directly on `main` ensures that an untested regression or broken dependency immediately breaks the live production site. Client-side validation exists solely as a **user convenience**—guiding legitimate users to format phone numbers and emails correctly before burning cellular data on an API round-trip.

### 3. A Real Nigerian Scenario
A Nigerian father registers on SchoolFix typing his mobile number as `803 123 4567`. In standard forms with `<input type="number">`, the browser automatically strips the leading zero, transforming the entry to `8031234567`. When the school bursar later dispatches an urgent SMS regarding fee clearance, the telco gateway rejects the 10-digit string. SchoolFix implemented `<input type="text" inputMode="numeric">` with leading-zero preservation, preventing communication failures across 400 families.

### 4. How It Is Done: The Actual Mechanism
1. Single-page authentication collapses `/login`, `/register`, and `/reset` into URL query state (`/auth?mode=login`).
2. Disabled submit buttons are retained in the tab order (`aria-disabled="true"`) so screen readers announce why the button is inactive rather than disappearing from focus.
3. Client validation checks empty fields, minimum length, structure, and Nigerian phone masks (`/^0[789][01]\d{8}$/`).

### 5. Where It Goes Wrong: The Failure Mode & Cost
**Client-side is not security.** Anyone can open a terminal and bypass every browser check using `curl`:
```bash
curl -X POST http://localhost:3000/api/register -d '{"fullName":"a","email":"bad"}'
```
If the backend does not duplicate every rule, corrupted and malicious records poison the database.

### 6. What I Got Wrong: My Real Mistake
During Task 3 Step 8 adversarial form testing, I discovered that entering eight spaces (`"        "`) in the password field completely bypassed my client-side length check because the validation rule used `password.length >= 8` without trimming whitespace. A user could register with an invisible password of spaces! I had to patch the check to `password.trim().length >= 8` and document the defect in `task-03-client-validation/docs/defects.md`.

---

## CHAPTER 5: Migrations, Schema Design, and Email Delivery

### 1. The Concept, in Plain Words
A migration is an immutable, version-controlled SQL script that transforms database schema structure. A dual-ledger financial schema separates transient transaction attempts (`PaymentAttempt`) from verified, immutable payments (`Payment`). Background email delivery offloads SMTP network latency to an asynchronous queue.

### 2. Why It Exists: The Failure It Prevents
Attempting to send emails synchronously inside an HTTP request ties user registration latency to the third-party mail server. If Google SMTP experiences a 3-second network pause, the user’s mobile browser times out. In databases, running un-versioned migrations or altering live columns locks tables, causing catastrophic production downtime.

### 3. A Real Nigerian Scenario
During school resumption at *Gracefield College*, 150 parents register simultaneously on Monday morning between 7:30 AM and 8:15 AM. With synchronous email dispatch, each request took **3,085 ms**, exhausting Node.js thread pools and dropping 40% of connections. Offloading verification email dispatch to an in-memory background queue dropped API response latency to **438 ms (7.0× faster)**, completely absorbing the morning registration surge.

### 4. How It Is Done: The Actual Mechanism
1. Zero-downtime column addition follows the **Expand-Backfill-Contract** pattern:
   - Step 1: Add column as nullable (`nin String?`).
   - Step 2: Backfill historical rows with surrogate defaults.
   - Step 3: Apply `NOT NULL` constraint (`nin String`).
2. Dual-ledger financial integrity enforces `onDelete: Restrict` on `Payment` and `PaymentAttempt` tables.
3. Emails are processed asynchronously via `lib/security/email-worker.ts`.

### 5. Where It Goes Wrong: The Failure Mode & Cost
Editing an existing migration file that has already executed against staging or production causes catastrophic **Schema Drift** (`P3005`). Prisma refuses to apply subsequent migrations, demanding a complete schema reset (`DROP SCHEMA public`) that destroys all live production records.

### 6. What I Got Wrong: My Real Mistake
During Task 4 Step 3, when adding the required `nin` column to the `User` table, I initially tried to add it directly as a required field (`nin String`). Because the table already contained historical rows from Task 3, Prisma aborted with error: `Step 1 Added the required column nin to the User table without a default value... it is not possible to execute this step.` I had to discard the broken migration and execute the proper 3-step Expand-Backfill-Contract migration documented in `evidence/05-required-column-three-steps.txt`.

---

## CHAPTER 6: Server-Side Validation, Hashing, Rate Limiting and Verification

### 1. The Concept, in Plain Words
Server-side validation is schema boundary enforcement using libraries like Zod. Password hashing is a one-way, mathematically slow transformation (Argon2id) that protects passwords even if the database is leaked. Rate limiting restricts request frequency per IP or identity. Verification uses CSPRNG cryptographic random codes.

### 2. Why It Exists: The Failure It Prevents
Fast hashing algorithms (SHA-256, MD5) allow an attacker who steals a database to compute billions of guesses per second using consumer GPUs, recovering 90% of user passwords within 24 hours. Rate limiting stops automated credential stuffing and brute-force guessing against the login endpoint.

### 3. A Real Nigerian Scenario
A disgruntled former teacher attempts to crack the SchoolFix administrator account. The teacher runs an automated dictionary script testing 100 common passwords per second. Because SchoolFix enforces sliding-window rate limiting (**5 attempts per minute**), the IP address is locked on the 6th attempt with `HTTP 429 Too Many Requests`. Simultaneously, the password is protected with Argon2id (`m=65536, t=3, p=4`), taking **82.21 ms per verification**, rendering offline GPU dictionary attacks financially impossible ($40,000+ hardware cost).

### 4. How It Is Done: The Actual Mechanism
1. Boundary validation executes before hashing:
   ```ts
   const result = RegisterSchema.safeParse(body);
   ```
2. Passwords are verified against the HaveIBeenPwned range API using k-anonymity (transmitting only the 5-character SHA-1 prefix).
3. 6-digit confirmation codes are generated via `crypto.randomInt(100000, 1000000)` with a 10-minute expiry window.

### 5. Where It Goes Wrong: The Failure Mode & Cost
Relying on IP address alone for rate limiting fails on university campuses or corporate offices where hundreds of legitimate users share a single NAT public IP. Attackers easily defeat IP rate limiting by rotating proxy headers (`X-Forwarded-For`), which we proved and documented in `evidence/14-rate-limit-defeated.txt`.

### 6. What I Got Wrong: My Real Mistake
During Task 4 Step 10, in writing a mock SMTP protocol diagnostic script (`scripts/test-smtp-diagnostics.js`), I included a simulated 16-character Google Workspace App Password string (`"xkvm wjpq ozle ydrh"`). Although it was completely fake test text, GitHub’s automated secret scanner flagged the 4×4 letter pattern upon push! I had to immediately redact all files with `[REDACTED_APP_PASSWORD]`, amend the git commit (`git commit --amend`), and force-push with lease (`git push --force-with-lease origin feature/task-4-server-security`) to excise the alert from remote history.

---

## CHAPTER 7: Sessions, Logout, Account Deletion and Compliance

### 1. The Concept, in Plain Words
A cryptographic session is a 32-byte CSPRNG token stored as a SHA-256 hash in PostgreSQL and sent to the browser via an `HttpOnly`, `Secure`, `SameSite=Lax` cookie. Lawful account deletion under the Nigeria Data Protection Act (NDPA 2023) is a 3-stage process (Soft Delete $\rightarrow$ 7-Day Grace Period $\rightarrow$ Background Purge) that balances privacy rights with CAMA 6-year financial tax retention mandates.

### 2. Why It Exists: The Failure It Prevents
Client-side-only logout leaves active session records in the database, allowing anyone on a shared school computer to hijack the session. Furthermore, executing immediate hard-deletes (`DELETE FROM "User"`) destroys financial audit trails, making it impossible to defend school revenue during government tax audits or embassy visa verifications.

### 3. A Real Nigerian Scenario
Mrs. Ibrahim, a parent at *Gracefield College*, gets into an acrimonious custody battle and angrily demands that the school *"delete her entire profile from the school portal immediately."* A junior IT contractor logs into pgAdmin and executes `DELETE FROM "User" WHERE email = 'ibrahim@...'`. Because foreign keys were set to cascade, three years of tuition payments totaling ₦1,665,000 are wiped from the ledger. When Lagos State Internal Revenue Service (LIRS) audits the school six months later, the bursar cannot reconcile a ₦1.6M cash discrepancy and faces heavy tax penalties. Under SchoolFix, Mrs. Ibrahim's request triggers the **NDPA Anonymization Decoupling**: her personal name and email are purged, but the ₦1,665,000 receipt numbers and audit timestamps remain permanently intact.

### 4. How It Is Done: The Actual Mechanism
1. Session generation issues 32 bytes of entropy; the database stores only `SHA256(rawToken)`.
2. Logout executes an atomic database revocation:
   ```ts
   await prisma.session.deleteMany({ where: { sessionToken: hash(rawToken) } });
   ```
3. Account deletion executes soft-delete (`deletedAt = now()`, `scheduledPurgeAt = now() + 7 days`).
4. An automated background worker purges expired records in an atomic transaction, unlinking students, anonymizing PII, and logging start/finish lines with candidate counts.

### 5. Where It Goes Wrong: The Failure Mode & Cost
The **Logout Network Failure Edge Case**: A user clicks "Log Out" on a shared cybercafé computer, but a network blip causes the backend request to fail. A naive frontend clears the local cookie and redirects to `/login`. The parent believes they are safe, but the session token remains active in PostgreSQL for 7 days, allowing the next user on that PC to restore the cookie and access sensitive student records.

### 6. What I Got Wrong: My Real Mistake
During Task 5 Step 6, when authoring the automated deletion worker test (`scripts/test-deletion-lifecycle.js`), I invoked `prisma.student.upsert({ where: { admissionNumber: ... } })`. Prisma threw a fatal runtime error: `Unknown argument admissionNumber. Did you mean admissionNum?` because our frozen schema PRD model strictly named the column `admissionNum`. I had to inspect the generated client types and patch the script to use `admissionNum` before the transaction executed cleanly.
