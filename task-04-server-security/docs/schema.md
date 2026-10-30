# Database Schema Architecture & Dual-Ledger Specification

> **Product:** SchoolFix (Mobile-First School Management & Tuition Reconciliation)  
> **Target Market:** Nigerian Private Primary and Secondary Schools  
> **Database Engine:** PostgreSQL 16 with `pgvector` Extension & Prisma ORM  
> **Step Reference:** Task 4, Step 1 — Design the Schema Before You Write It  
> **Physical Diagram Reference:** [`task-04-server-security/evidence/01-schema-drawing.jpg`](file:///c:/Users/DT001/Desktop/SchoolFix/task-04-server-security/evidence/01-schema-drawing.jpg)  

---

## 1. Architectural Philosophy: The Server as the Source of Truth

In Task 3, our adversarial direct-request experiment proved that client-side forms provide zero security boundary protection. An external script bypassed the browser, omitted required fields, and successfully invoked `POST /api/register`. 

The database schema is the ultimate line of defense for application consistency. In SchoolFix, where tuition payments, legal custody of student academic records, and daily attendance tracking carry severe financial and statutory implications, the database schema enforces:
1. **Strict CP Consistency:** Zero unhandled partition loss; all transactions write synchronously to PostgreSQL.
2. **Immutable Financial Ledgers:** Strict `onDelete: Restrict` cascading rules on payment tables.
3. **Dual-Ledger Separation:** Complete decoupling of initiated checkout attempts (`PaymentAttempt`) from verified, immutable settlement receipts (`Payment`).
4. **Lawful NDPA Data Minimization:** Dedicated fields for soft deletion, 7-day grace periods, and scheduled anonymization transactions.

---

## 2. Table-by-Table Architectural Specification

The SchoolFix schema consists of 11 relational models. The four core tables mandated by the curriculum are detailed below alongside their supporting entities.

### Table 1: `User` (The People Who Use the System)
Authenticates human actors across three distinct roles: `ADMIN` (Bursars/Proprietors), `TEACHER` (Classroom Instructors), and `PARENT` (Guardians). Students have **no login credentials** and are accessed as dependent records.

| Column | Type | Nullable? | Description & Constraints |
| :--- | :--- | :---: | :--- |
| `id` | `UUID` (String) | No | Primary key, generated via deterministic UUIDv4. |
| `email` | `VarChar(255)` | No | Normalized lowercase email address. Unique constraint. |
| `passwordHash` | `VarChar(255)` | No | Memory-hard Argon2id hash (65,536 KiB memory, 3 iterations, 4 parallelism). Never SHA-256. |
| `fullName` | `VarChar(255)` | No | Legal name (Surname first) for official receipting and reports. |
| `role` | `Enum (Role)` | No | `ADMIN`, `TEACHER`, or `PARENT`. Default: `PARENT`. |
| `isVerified` | `Boolean` | No | Flag indicating email ownership confirmation. Default: `false`. |
| `verificationCode` | `VarChar(6)` | Yes | 6-digit cryptographic verification OTP (CSPRNG). |
| `codeExpiresAt` | `DateTime` | Yes | Expiration timestamp (10-minute window). |
| `isAnonymized` | `Boolean` | No | NDPA compliance flag indicating PII erasure. Default: `false`. |
| `deletedAt` | `DateTime` | Yes | Soft-delete timestamp initiating the 7-day statutory grace period. |
| `scheduledPurgeAt`| `DateTime` | Yes | Background worker timestamp for irreversible anonymization. |
| `createdAt` | `DateTime` | No | Creation timestamp (`now()`). |
| `updatedAt` | `DateTime` | No | Automatic update timestamp. |

* **Relationships:**
  * `sessions` $\rightarrow$ 1-to-many with `Session` (`onDelete: Cascade`).
  * `students` $\rightarrow$ 1-to-many with `Student` (as `parent`, `onDelete: SetNull`).
  * `assignments` $\rightarrow$ 1-to-many with `TeacherClassAssignment` (`onDelete: Cascade`).
* **Indexes & Write Costs:**
  * `@@index([email])`: High query frequency on login. Adds marginal index update overhead on user creation; essential for $O(1)$ email lookups.
  * `@@index([role])`: Optimizes administrative role filtering in bursary panels. Low write penalty due to 3 discrete enum values.

---

### Table 2: `Session` (Active Authenticated Sessions)
Maintains cryptographic session state for authenticated devices without exposing raw session tokens in the database.

| Column | Type | Nullable? | Description & Constraints |
| :--- | :--- | :---: | :--- |
| `id` | `UUID` (String) | No | Primary key (UUIDv4). |
| `sessionToken` | `VarChar(64)` | No | SHA-256 hash of the 32-byte cryptographically random token transmitted via `HttpOnly`, `Secure` cookie. Unique. |
| `userId` | `UUID` (String) | No | Foreign key referencing `User.id` (`onDelete: Cascade`). |
| `ipAddress` | `VarChar(45)` | Yes | Client IP address for session hijacking detection. |
| `userAgent` | `Text` | Yes | Browser and hardware user agent string for device auditing. |
| `expiresAt` | `DateTime` | No | Expiration timestamp (sliding window or fixed 14-day limit). |
| `createdAt` | `DateTime` | No | Session establishment timestamp. |

* **Relationships:**
  * `user` $\rightarrow$ Many-to-1 with `User`.
* **Indexes & Write Costs:**
  * `@@index([sessionToken])`: Read on every authenticated HTTP request via Next.js middleware. Critical for sub-millisecond session validation; write cost incurred only on login/logout.
  * `@@index([userId])`: Allows instantaneous mass revocation of all active sessions during password reset or account compromise.

---

### Table 3: `Payment` (The Immutable Financial Settlement Ledger)
Records finalized, verified, and settled tuition collections. Once written, records in this table are immutable.

| Column | Type | Nullable? | Description & Constraints |
| :--- | :--- | :---: | :--- |
| `id` | `UUID` (String) | No | Primary key (UUIDv4). |
| `studentId` | `UUID` (String) | No | Foreign key referencing `Student.id` (`onDelete: Restrict`). |
| `amount` | `Decimal(12, 2)`| No | Exact Naira amount collected (two decimal places, e.g., ₦125,000.00). |
| `term` | `VarChar(64)` | No | Academic term string (e.g., "First Term 2026/2027"). |
| `reference` | `VarChar(128)`| No | Unique transaction reference (Flutterwave ID or bank NIP session ID). |
| `channel` | `Enum` | No | `BANK_TRANSFER`, `CARD`, or `CASH`. |
| `receiptNumber` | `VarChar(64)` | No | Deterministic sequential receipt identifier (e.g., `SF-REC-2026-00412`). Unique. |
| `verifiedBy` | `VarChar(128)`| No | User ID or automated system worker that authenticated settlement. |
| `verifiedAt` | `DateTime` | No | Timestamp of official gateway or bank verification. |
| `createdAt` | `DateTime` | No | Record insertion timestamp. |

* **Relationships:**
  * `student` $\rightarrow$ Many-to-1 with `Student` (`onDelete: Restrict`). Financial records can never cascade delete.
* **Indexes & Write Costs:**
  * `@@index([studentId])`: Queried on every student tuition balance clearance computation ($\text{Balance} = \text{FeeSchedule} - \sum \text{Payments}$). Essential for report card gating.
  * `@@index([reference])`: Queried during webhook retries to enforce strict payment idempotency.

---

### Table 4: `PaymentAttempt` (The Money-Attempts Table)
Tracks every initiation, drop-off, gateway failure, and abandoned checkout attempt prior to or independent of settlement.

| Column | Type | Nullable? | Description & Constraints |
| :--- | :--- | :---: | :--- |
| `id` | `UUID` (String) | No | Primary key (UUIDv4). |
| `studentId` | `UUID` (String) | No | Foreign key referencing `Student.id` (`onDelete: Restrict`). |
| `amount` | `Decimal(12, 2)`| No | Intended payment amount. |
| `term` | `VarChar(64)` | No | Target academic term. |
| `reference` | `VarChar(128)`| No | Unique attempt reference dispatched to Flutterwave inline checkout. |
| `channel` | `Enum` | No | Payment channel selected by parent. |
| `status` | `Enum` | No | `PENDING`, `SUCCESS`, `FAILED`, or `ABANDONED`. |
| `failureReason`| `Text` | Yes | Error response from gateway (e.g., "Insufficient funds", "3DS verification timeout"). |
| `createdAt` | `DateTime` | No | Attempt initiation timestamp. |

* **Relationships:**
  * `student` $\rightarrow$ Many-to-1 with `Student` (`onDelete: Restrict`).
* **Indexes & Write Costs:**
  * `@@index([studentId])`: Enables parent payment history views and bursar debt follow-ups.
  * `@@index([status])`: Supports automated reconciliation background workers querying unresolved `PENDING` transactions.

---

### Table 5: `DocumentChunk` (Policy Vector Retrieval Chunks)
Stores school policy documents, fee schedules, code of conduct, and examination rules partitioned for RAG vector search.

| Column | Type | Nullable? | Description & Constraints |
| :--- | :--- | :---: | :--- |
| `id` | `UUID` (String) | No | Primary key (UUIDv4). |
| `title` | `VarChar(255)` | No | Document title (e.g., "Continuous Assessment & Grading Policy 2026"). |
| `content` | `Text` | No | 512-token chunk text with 64-token overlap. |
| `metadata` | `Json` | No | JSON payload storing category, target class arms, and author. |
| `embedding` | `vector(1536)` | Yes | PostgreSQL `pgvector` embedding (`text-embedding-3-small`). |
| `createdAt` | `DateTime` | No | Chunk ingestion timestamp. |

* **Indexes & Write Costs:**
  * `@@index([title])`: B-Tree index for administrative document management.
  * HNSW Cosine Index (`<=>`): Created directly via SQL migration on `embedding` for sub-5ms vector nearest-neighbor search.

---

### Supporting Entities Overview

| Model | Purpose | Key Relationships | Index / Constraints |
| :--- | :--- | :--- | :--- |
| **`ClassArm`** | School grade branches (e.g. "JSS 1 Gold", "Primary 4 Blue"). | 1:M with `Student`, `Assessment`, `FeeSchedule`. | B-Tree on `id`. |
| **`TeacherClassAssignment`** | Enforces teacher RBAC boundary isolation. | M:1 with `User` (Teacher), M:1 with `ClassArm`. | `@@unique([teacherId, classArmId])` |
| **`FeeSchedule`** | Expected tuition per class arm per term. | M:1 with `ClassArm`. | `@@unique([classArmId, term])` |
| **`Student`** | Pupil records (admissions, class assignment). | M:1 with `ClassArm`, M:1 with `User` (Parent). | `admissionNum` (Unique), `@@index([classArmId])` |
| **`Attendance`** | Daily student attendance state machine. | M:1 with `Student`. | `@@unique([studentId, date])` |
| **`Assessment`** | Continuous Assessment (40) and Exam (60) scores. | M:1 with `Student`, M:1 with `ClassArm`. | `@@unique([studentId, subject, term])` |

---

## 3. The Dual-Ledger Requirement: Why `PaymentAttempt` Must Be Separate

Most junior engineers make the mistake of combining payments into a single mutable table with a `status` column that gets overwritten from `PENDING` to `SUCCESS`. In SchoolFix, separating `PaymentAttempt` from `Payment` is a mandatory architectural directive driven by two real-world operational requirements:

### Reason 1: Drop-Off Funnel Analytics & Metered 3G Network Failure Diagnostics
Nigerian mobile banking and online card collections operate under frequent network drops, USSD session timeouts, and intermittent bank downtime (e.g., NIBSS switch delays). 

If an application only records completed payments, the school administration is blind to parent payment friction:
* By recording every `PaymentAttempt`, the bursar can inspect why 42 parents failed to pay tuition during the first week of term. The `failureReason` column reveals whether parents abandoned checkout due to Flutterwave 3DS timeouts on slow 3G connections, bank server unavailability, or insufficient funds.
* This allows the school to proactively reach out with alternative collection options (e.g., direct bank transfer or school POS) before parents default.

### Reason 2: Statutory Tax Compliance & The 14-Month Historical Audit Defense
Payment tables represent official accounting records. In Nigeria, businesses are subject to audits by the Federal Inland Revenue Service (FIRS) and State Internal Revenue Services (e.g., LIRS in Lagos).

#### The 14-Month Historical Tax Defense
> **Audit Scenario:** Suppose the State Internal Revenue Service audits the school and demands an explanation for transaction reference `SF-TX-2025-0819-B4` initiated 14 months ago, where bank records show an incoming transfer of ₦150,000 but the school's finalized ledger does not show a corresponding receipt.
>
> **How We Defend It:**  
> Because we maintain an immutable `PaymentAttempt` table, we query the exact historical attempt:
> ```sql
> SELECT id, "studentId", amount, channel, status, "failureReason", "createdAt"
> FROM "PaymentAttempt"
> WHERE reference = 'SF-TX-2025-0819-B4';
> ```
> The query immediately provides forensic proof that on August 19, 2025, a parent initiated checkout for student `STD-2024-089`, but the gateway flagged the attempt as `FAILED` with `failureReason: "Bank network timeout - charge reversal issued"`. 
> 
> We can prove definitively to tax inspectors that the funds were reversed at the merchant switch level and never credited to the school's operating account. Without a separate `PaymentAttempt` log, an auditor would assume the school collected cash off-the-books and committed tax evasion.

---

## 4. Denormalization & Controlled Redundancy

We accepted intentional data redundancy in two specific locations:

1. **`Assessment.classArmId` and `Student.classArmId`:**
   * *Where Stored Twice:* The class arm is stored both on the `Student` record and directly on each `Assessment` row.
   * *Why Accepted:* When a student is promoted from "JSS 1 Gold" to "JSS 2 Blue" at the end of an academic session, `Student.classArmId` is updated to their new class. However, their historical JSS 1 exam scores must permanently remain associated with JSS 1 for historical transcript generation. Denormalizing `classArmId` onto `Assessment` prevents student grade history from being retroactively corrupted by promotions.

2. **`Assessment.totalScore` and `grade`:**
   * *Where Stored Twice:* `totalScore` is mathematically $\text{caScore} + \text{examScore}$, and `grade` is derived from `totalScore`.
   * *Why Accepted:* Computing sums and grading scales on-the-fly across 800 students during end-of-term batch report card generation introduces significant CPU and database aggregation latency. Storing the computed values once on write optimizes read performance on low-resource mobile clients.

---

## 5. Physical Diagram Deliverable

Per curriculum requirements, a physical hand-drawn schema diagram must be prepared on paper, dated, photographed, and archived at:  
[`task-04-server-security/evidence/01-schema-drawing.jpg`](file:///c:/Users/DT001/Desktop/SchoolFix/task-04-server-security/evidence/01-schema-drawing.jpg).
