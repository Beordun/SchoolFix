# Product Requirements Document (PRD): SchoolFix

**Document Version:** 1.1.0  
**Target Platform:** Mobile-First Web Application (Progressive Web App Ready)  
**Architecture:** Next.js (App Router), TypeScript, Prisma ORM, PostgreSQL with `pgvector`, Zod Boundary Validation  
**Distributed Systems Profile:** CP System (Consistency + Partition Tolerance) with Client-Edge Optimistic Queuing  

---

## 1. Product Summary
SchoolFix is a mobile-first school management web application designed for private nursery, primary, and secondary schools in Africa operating under unstable network connectivity, constrained smartphone hardware, and tight operational budgets. The system establishes an operational wedge: rapid attendance marking and Continuous Assessment (CA) score recording on mobile devices for teachers, audit-compliant tuition tracking and drop-off reconciliation for bursars, and fee-gated digital academic report cards for parents.

---

## 2. Problem Statement
Private primary and secondary schools in emerging African markets face chronic administrative friction:
* **Record Accessibility Deficit:** Over 50% of surveyed teachers report severe difficulty updating and reviewing student academic records outside physical school premises.
* **Prohibitive Maintenance and Interface Clutter:** Existing commercial platforms are built as desktop accounting tools, requiring high-bandwidth connections, continuous desktop access, and extensive training.
* **Financial Reconciliation Gaps:** School bursars rely on manual cash ledgers and unsynchronised bank slips, making drop-off tracking and dispute resolution difficult.
* **Parental Information Asymmetry:** Parents lack timely visibility into attendance and terminal grades, while schools struggle to withhold paper results until school fees are cleared.

---

## 3. Goals and Non-Goals

### Goals
* Enable assigned teachers to mark full class attendance in under 30 seconds on a budget smartphone over 2G/3G connections.
* Enable teachers to record, compute, and sync CA scores (tests and exams) with client-persisted offline drafts to prevent data loss during power cuts or network drops.
* Enforce absolute role-based access control (RBAC) ensuring teachers cannot inspect or mutate records outside their assigned class arms.
* Log all verified tuition settlements alongside incomplete, failed, or unverified claims in a dual-ledger audit model.
* Calculate outstanding school fees dynamically against a configured fee schedule and restrict terminal report access when balance is greater than zero.
* Guarantee strict consistency for financial transactions and grade computations using a CP (Consistency + Partition Tolerance) backend model.
* Provide vector-embedded semantic search across school handbooks, fee policies, and grading standards using `pgvector`.
* Comply with NDPA and GDPR deletion mandates through soft-deletion, a 7-day grace period, and anonymised record retention.

### Non-Goals
* **No In-App Messaging or Chat Forums:** SchoolFix will not build or maintain live messaging channels. External communication remains on WhatsApp.
* **No Automated Timetable Scheduling:** The platform will not generate automatic scheduling algorithms.
* **No Independent Student Accounts:** Students cannot register or log in. Parents hold the account and view dependent profiles.
* **No Native Mobile App Build:** SchoolFix will not ship separate native iOS or Android binaries in version 1.1.0; the application runs entirely in mobile browsers.

---

## 4. Users and Personas

| Persona | Primary Interface | Key Responsibilities | Primary Constraint |
| :--- | :--- | :--- | :--- |
| **School Administrator / Bursar** | Desktop / Mobile Browser | Class configuration, teacher allocations, fee schedule setup, payment verification, and audit review. | Requires audit trails and dispute-proof records. |
| **Class Teacher** | Mobile Browser (Smartphones) | Daily attendance marking, continuous assessment entries, and terminal remark submission. | Operates on low-end hardware, limited mobile data, and unstable power. |
| **Parent / Guardian** | Mobile Browser | Profile review, tuition verification, receipt access, and terminal report card inspection. | Intermittent portal visits; strictly outcomes-focused. |

---

## 5. Scope

### In-Scope
* Single-page authentication flow (Login, Registration, Password Reset) with query-parameter conditional routing.
* Password hashing using Argon2id with adaptive work factors (no plain SHA algorithms for credentials).
* Cryptographic session tokens stored as server-side SHA-256 hashes, delivered in hardened cookies (`HttpOnly`, `Secure`, `SameSite=Lax`).
* Daily attendance register with one-tap status toggling (`PRESENT`, `ABSENT`, `LATE`, `EXCUSED`).
* Continuous Assessment (CA) score entry with auto-computed sums, letter grades, and class positions using exact decimal precision.
* Fee schedule definitions per class arm and term to compute real-time student fee balances dynamically.
* Double-ledger tuition monitoring with distinct tables for verified payments and unverified attempts.
* Fee clearance gate for terminal report cards.
* Cryptographic session tracking, server-side session termination, and 7-day grace-period account soft-deletion.
* Vector embeddings for school policies, grading criteria, and curriculum guides.

### Explicitly Out-of-Scope
* Real-time web-socket chat channels.
* Bus route mapping, vehicle dispatch tracking, and fuel logs.
* School inventory, asset tracking, and stationery supply-chain management.
* Teacher payroll, pension schedules, and employee tax deduction engines.
* Student-facing submission portals.

---

## 6. Functional Requirements

### 6.1 Authentication & Boundary Enforcement
1. **Unified Auth Route:** The client serves login, sign-up, and password recovery from `/auth` via the `?mode=` parameter without triggering full page reloads.
2. **Boundary Validation:** Every incoming request body, route parameter, and query string must pass a Zod validation schema before reaching route controllers.
3. **Password Security:** All passwords are hashed using Argon2id with memory cost 65536 KiB, time cost 3 iterations, and parallelism 4. Passwords must never be hashed with plain SHA algorithms.
4. **Session Hardening:** Successful authentication returns a 32-byte cryptographically random session token generated via `crypto.randomBytes(32)`. The server stores only the SHA-256 hash of this token in the database, delivering the raw token over an `HttpOnly`, `Secure`, `SameSite=Lax` cookie.
5. **Global Invalidation:** A password reset must terminate all active database sessions tied to the user account.

### 6.2 Attendance Management
1. **RBAC Scope Check:** Teachers can only view and mutate registers for classes where a valid `TeacherClassAssignment` exists.
2. **Single-Screen Register:** Class teachers see an alphabetical roster of students in their assigned `ClassArm`.
3. **Attendance Toggle:** Tapping a student rotates status (`PRESENT` $\rightarrow$ `ABSENT` $\rightarrow$ `LATE` $\rightarrow$ `EXCUSED`).
4. **Write Deduplication:** The database enforces a composite unique constraint (`studentId` + `date`) to prevent duplicate registers.
5. **Offline Durability:** When a network drop occurs during register marking, the client saves entries into `localStorage` with a `syncPending` flag and syncs automatically when connectivity returns.

### 6.3 Continuous Assessment & Gradebook
1. **Weighting Enforcement:** The system accepts CA scores (maximum 40 marks) and Examination scores (maximum 60 marks) [ASSUMPTION: Default assessment split is 40% Continuous Assessment and 60% Terminal Examination].
2. **Decimal Precision:** All score calculations use fixed two-digit decimals (`Decimal(5, 2)`) to eliminate floating-point rounding errors.
3. **Automatic Computation:** Server calculates `totalScore` ($caScore + examScore$) and derives letter grades:
   * 70.00 – 100.00: `A` (Distinction)
   * 60.00 – 69.99: `B` (Credit)
   * 50.00 – 59.99: `C` (Merit)
   * 40.00 – 49.99: `D` (Pass)
   * 0.00 – 39.99: `F` (Fail)
4. **Input Sanitation:** Numeric fields reject non-digit characters at the input boundary and enforce a clamp range between `0.00` and `100.00`.

### 6.4 Fee Ledger & Terminal Clearance
1. **Fee Schedule Definition:** Admins configure standard tuition fees per `ClassArm` and `term` via the `FeeSchedule` model.
2. **Balance Calculation:** Outstanding balance is computed dynamically:
   $$\text{Balance} = \text{FeeSchedule.expectedAmount} - \sum(\text{Payment.amount for term})$$
3. **Dual Ledger Model:**
   * `Payment`: Approved receipts containing reference, amount, verified timestamp, and bursar user identifier.
   * `PaymentAttempt`: Failed gateway attempts, abandoned checkouts, or unverified bank transfer references.
4. **Report Card Lock:** When a parent accesses `/portal/reports/[studentId]`, the server calculates balance:
   * If balance $\le 0$: Full academic report renders.
   * If balance $> 0$: The page renders an outstanding balance summary and settlement instructions; academic scores remain redacted.
5. **Deletion Immunity & Anonymisation:** Financial records (`Payment` and `PaymentAttempt`) cannot be deleted on account wipe. Foreign keys enforce `onDelete: Restrict`. When a parent account purges, `Student.parentId` is set to null, preserving financial audit integrity while complying with erasure rights.

---

## 7. AI & AI-Related Tools

1. **Automated Teacher Remark Generation:** A secure, low-latency LLM agent drafts standardized, constructive terminal comments (under 30 words) based on a student's attendance percentage, subject grades, and class rank.
2. **RAG Policy Query Engine:** An AI-powered assistant answers parent and teacher queries regarding school regulations, grading scales, fee deadlines, and exam guidelines based on indexed administrative documents.
3. **Token System Compliance:** AI agents interacting with the system must consume the token system exclusively, avoid inventing arbitrary hex codes, and enforce strict JSON schemas on structured responses.

---

## 8. Technical Architecture & Distributed Systems Design

### 8.1 CAP Theorem Architectural Trade-Off: CP Core with Client Edge Queuing

SchoolFix operates on a **CP model (Consistency + Partition Tolerance)** for all database operations, combined with an optimistic local caching tier on the client device.

```
┌────────────────────────────────────────────────────────┐
│           Client Tier: Optimistic Local State          │
│  - Captures CA grades and registers into localStorage  │
│  - Displays local status as PENDING_SYNC on cell drops │
│  - Exponential backoff retry engine on reconnection    │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS Payload (Zod Boundary)
                            ▼
┌────────────────────────────────────────────────────────┐
│         Application Tier: Next.js Route Handlers       │
│  - Session Validation Middleware & RBAC Interceptors   │
│  - Atomic Multi-Table Transactions ($transaction)      │
│  - Rejection with 409 Conflict / 503 on Partition      │
└───────────────────────────┬────────────────────────────┘
                            │ Prisma ORM Client
                            ▼
┌────────────────────────────────────────────────────────┐
│          Storage Tier: PostgreSQL 16 (Strict CP)       │
│  - ACID Transactions at Read Committed / Serializable  │
│  - Strict Foreign Key Integrity (onDelete: Restrict)   │
│  - Zero Stale Reads for Financial Clearance & Grades   │
│  - pgvector Extension for Knowledge Embeddings         │
└────────────────────────────────────────────────────────┘
```

#### Why AP is Explicitly Rejected
In an AP (Available + Partition Tolerant) system, nodes resolve conflicts eventually. For SchoolFix, an AP split-brain condition causes irreparable financial and institutional harm:
* **Duplicate Receipts:** Concurrent reconciliations during network partitions generate duplicate receipt numbers for the same bank deposit.
* **Unauthorized Grade Disclosures:** An eventual-consistency read of fee balances could return a stale zero balance, allowing a parent to view report cards before an unpaid tuition transaction is recorded.
* **Grade Collision:** Stale replicas allow multiple teachers or staff members to overwrite Continuous Assessment marks without concurrency locks.

#### Architectural Resolution
The PostgreSQL backend acts as a strict CP source of truth. If a network partition prevents database consensus or transaction verification, the server rejects writes with an unambiguous error code (`503 Service Unavailable` or `409 Conflict`). High availability is simulated safely at the client edge: the mobile browser persists unconfirmed writes to `localStorage` marked with a dirty flag (`PENDING_SYNC`), guaranteeing data preservation without sacrificing backend transactional consistency.

---

## 8.2 Complete Prisma Schema (`schema.prisma`)

```prisma
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgvector(map: "vector")]
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

enum Role {
  ADMIN
  TEACHER
  PARENT
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  ABANDONED
}

enum PaymentChannel {
  BANK_TRANSFER
  CARD
  CASH
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  EXCUSED
}

model User {
  id               String    @id @default(uuid())
  email            String    @unique
  passwordHash     String    // Argon2id hash (never SHA)
  fullName         String
  role             Role      @default(PARENT)
  isVerified       Boolean   @default(false)
  verificationCode String?
  codeExpiresAt    DateTime?

  // Compliance & Deletion Lifecycle
  isAnonymized     Boolean   @default(false)
  deletedAt        DateTime?
  scheduledPurgeAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  sessions    Session[]
  students    Student[]                @relation("ParentStudents")
  assignments TeacherClassAssignment[]

  @@index([email])
  @@index([role])
}

model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique // SHA-256 hash of raw cookie token
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  ipAddress    String?
  userAgent    String?
  expiresAt    DateTime
  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([sessionToken])
}

model ClassArm {
  id           String                   @id @default(uuid())
  name         String                   // e.g., "JSS 1 Gold", "Primary 4 Blue"
  students     Student[]
  assessments  Assessment[]
  feeSchedules FeeSchedule[]
  teachers     TeacherClassAssignment[]
  createdAt    DateTime                 @default(now())
}

model TeacherClassAssignment {
  id         String   @id @default(uuid())
  teacherId  String
  teacher    User     @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  classArmId String
  classArm   ClassArm @relation(fields: [classArmId], references: [id], onDelete: Cascade)
  assignedAt DateTime @default(now())

  @@unique([teacherId, classArmId])
  @@index([teacherId])
  @@index([classArmId])
}

model FeeSchedule {
  id             String   @id @default(uuid())
  classArmId     String
  classArm       ClassArm @relation(fields: [classArmId], references: [id], onDelete: Restrict)
  term           String   // e.g., "First Term 2026/2027"
  expectedAmount Decimal  @db.Decimal(12, 2)
  createdAt      DateTime @default(now())

  @@unique([classArmId, term])
  @@index([classArmId])
}

model Student {
  id           String           @id @default(uuid())
  admissionNum String           @unique
  fullName     String
  classArmId   String
  classArm     ClassArm         @relation(fields: [classArmId], references: [id], onDelete: Restrict)
  parentId     String?
  parent       User?            @relation("ParentStudents", fields: [parentId], references: [id], onDelete: SetNull)
  
  attendance   Attendance[]
  assessments  Assessment[]
  payments     Payment[]
  attempts     PaymentAttempt[]

  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt

  @@index([classArmId])
  @@index([parentId])
}

model Attendance {
  id        String           @id @default(uuid())
  studentId String
  student   Student          @relation(fields: [studentId], references: [id], onDelete: Cascade)
  date      DateTime         @db.Date
  status    AttendanceStatus @default(PRESENT)
  createdAt DateTime         @default(now())

  @@unique([studentId, date])
  @@index([date])
}

model Assessment {
  id         String   @id @default(uuid())
  studentId  String
  student    Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  classArmId String
  classArm   ClassArm @relation(fields: [classArmId], references: [id], onDelete: Restrict)
  subject    String
  term       String
  caScore    Decimal  @default(0.00) @db.Decimal(5, 2)
  examScore  Decimal  @default(0.00) @db.Decimal(5, 2)
  totalScore Decimal  @default(0.00) @db.Decimal(5, 2)
  grade      String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([studentId, subject, term])
  @@index([classArmId, term])
}

model Payment {
  id            String         @id @default(uuid())
  studentId     String
  student       Student        @relation(fields: [studentId], references: [id], onDelete: Restrict)
  amount        Decimal        @db.Decimal(12, 2)
  term          String
  reference     String         @unique
  channel       PaymentChannel @default(BANK_TRANSFER)
  receiptNumber String         @unique
  verifiedBy    String
  verifiedAt    DateTime       @default(now())
  createdAt     DateTime       @default(now())

  @@index([studentId])
  @@index([reference])
}

model PaymentAttempt {
  id            String         @id @default(uuid())
  studentId     String
  student       Student        @relation(fields: [studentId], references: [id], onDelete: Restrict)
  amount        Decimal        @db.Decimal(12, 2)
  term          String
  reference     String         @unique
  channel       PaymentChannel
  status        PaymentStatus  @default(PENDING)
  failureReason String?
  createdAt     DateTime       @default(now())

  @@index([studentId])
  @@index([status])
}

model DocumentChunk {
  id         String                 @id @default(uuid())
  title      String
  content    String                 @db.Text
  metadata   Json
  embedding  Unsupported("vector")?
  createdAt  DateTime               @default(now())

  @@index([title])
}
```

---

## 9. Vector Database Architecture & Design

```
Raw Text Document (Handbook, Policy)
           │
           ▼
[Recursive Text Splitter: 512 Tokens, 64 Overlap]
           │
           ▼
[Embedding Generator: text-embedding-3-small (1536 dims)]
           │
           ▼
[PostgreSQL Table: DocumentChunk via pgvector]
           │
           ▼
[HNSW Index: Cosine Distance Operator (<=>)]
```

* **Storage Engine:** Integrated PostgreSQL storage utilizing the `pgvector` extension, eliminating external microservice latency and infrastructure overhead.
* **Chunking Strategy:** Content is processed using recursive semantic boundary splitting with a target chunk size of 512 tokens and an overlap of 64 tokens.
* **Search Execution:** Retrieval performs metadata-filtered approximate nearest neighbor (ANN) search via cosine similarity:
  ```sql
  SELECT id, title, content, 1 - (embedding <=> $1::vector) AS similarity
  FROM "DocumentChunk"
  WHERE metadata->>'category' = 'FEE_POLICY'
  ORDER BY similarity DESC
  LIMIT 5;
  ```

---

## 10. Vector Database Model

The vector index is maintained via raw migration script to ensure compatibility across cloud platforms:

```sql
-- Enable Extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Define HNSW Index for Fast Cosine Vector Retrieval
CREATE INDEX IF NOT EXISTS document_chunk_embedding_hnsw_idx 
ON "DocumentChunk" 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

* **Dimensions:** 1536 floating-point values per vector.
* **Index Method:** Hierarchical Navigable Small World (HNSW).
* **Metadata Schema:**
  ```json
  {
    "schoolId": "uuid-string",
    "documentType": "POLICY | CURRICULUM | CALENDAR",
    "targetAudience": "TEACHER | PARENT | ALL",
    "academicYear": "2026/2027",
    "term": "FIRST"
  }
  ```

---

## 11. Business Model
SchoolFix operates a B2B Software-as-a-Service (SaaS) model billed on a per-term subscription basis:
* **Term Billing:** Schools are charged ₦1,200 per active student per term [ASSUMPTION: Termly subscription is billed based on active enrollments].
* **Setup & Ingestion Fee:** A one-time ₦50,000 onboarding fee covers digital roster migration and document embedding into the RAG vector store.
* **Payment Convenience Fee:** A 1.2% processing fee (capped at ₦1,500) applies to electronic card collections processed directly through the portal; direct bank transfers reconciled manually by the bursar incur zero gateway processing fees.

---

## 12. Success Metrics

| Metric | Target | Measurement Method |
| :--- | :--- | :--- |
| **Attendance Capture Speed** | $< 30$ seconds per class arm | Real-time browser performance timestamps. |
| **Data Synchronization Reliability**| $99.8\%$ successful write rate | Server 201 responses vs. client-side failure retries. |
| **Initial Page Load (3G Mobile)** | $< 1,200\text{ ms}$ | Chrome DevTools Lighthouse metrics on slow network throttle. |
| **Fee Drop-Off Identification** | $100\%$ recorded attempts | Ratio of logged `PaymentAttempt` records to resolved `Payment` entries. |
| **Report Clearance Enforcement** | $0$ unauthorized disclosures | Gating audit logs verifying report card requests for unsettled balances. |

---

## 13. Risks and Mitigations

* **Unstable Mobile Data Connectivity:** Teachers experience connection loss during grade entry.  
  *Mitigation:* The client uses `localStorage` persistent queues; unsynced rows are indicated with status flags and synchronized when connectivity restores.
* **Server-Side Validation Bypass:** Attackers or external scripts submit corrupted grades or invalid fees directly to endpoints.  
  *Mitigation:* Zod boundary schemas parse and sanitize all request bodies, rejecting unauthorized fields and enforcing strict boundaries.
* **Regulatory Compliance (NDPA / GDPR):** Deleting student records on request could destroy required tax and financial audit records.  
  *Mitigation:* Soft-deletion flags anonymize personal identifiers while financial relations enforce `onDelete: Restrict` and `Student.parentId` sets to null on purge.
* **Database Migration Drift:** Automated schema changes during deployment break live services.  
  *Mitigation:* All migrations follow a strict forward-only, propose-and-stop policy executed manually.

---

## 14. Open Questions & Assumptions

* **[ASSUMPTION]** Assessment calculations default to a 40% Continuous Assessment and 60% Terminal Examination split.
* **[ASSUMPTION]** Schools run three academic terms per standard calendar year.
* **[ASSUMPTION]** Class sizes average between 25 and 45 students per class arm.
* **Open Question 1:** Will schools require separate subject-teacher assignment logic where different teachers manage mathematics and English for the same class arm in primary sections?
* **Open Question 2:** Should manual bank transfer verification support physical receipt photo uploads, or is a bank transaction reference string sufficient for bursar clearance?
