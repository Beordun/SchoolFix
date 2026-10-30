# SchoolFix Data Retention Matrix & Legal Compliance Standard

> **Platform:** SchoolFix — Mobile-First Attendance & Tuition Reconciliation  
> **Regulatory Jurisdiction:** Federal Republic of Nigeria  
> **Primary Statutory Frameworks:**  
> - **NDPA 2023:** Nigeria Data Protection Act (NDPA 2023) §§ 24, 34, 39, 65  
> - **CAMA 2020:** Companies and Allied Matters Act 2020 § 374 (6-Year Books of Account Mandate)  
> - **CITA 2004 (as amended):** Companies Income Tax Act § 63 & FIRS Statutory Audit Directives  
> - **MLPPA 2022:** Money Laundering (Prevention and Prohibition) Act 2022 § 7 (5-Year Transaction Records)  
> **Document Reference:** `task-05-sessions-compliance-defence/docs/retention-matrix.md`  

---

## 1. Comprehensive Schema Column Retention & Purge Matrix

The following table categorizes every relational entity and significant attribute across SchoolFix's 11 frozen schema models upon receipt of a lawful NDPA § 34 Right to Erasure request.

| Model / Table | Attribute / Column | Retention Disposition | Regulatory or Business Justification | Statutory Basis & Retention Period |
| :--- | :--- | :--- | :--- | :--- |
| **`User`** | `fullName` | **Purged (Anonymized)** | Personal Identifier (PII). Replaced with `"Anonymized Parent (NDPA Purged)"` upon 7-day grace period expiration. | NDPA 2023 § 34(1)(a). Immediate lock $\rightarrow$ Purged after 7 days. |
| **`User`** | `email` | **Purged (Anonymized)** | Direct personal contact address. Overwritten with surrogate: `purged_<uuid>@schoolfix.internal` to prevent contact while preserving relational foreign keys. | NDPA 2023 § 34(1)(a). 7-day grace period. |
| **`User`** | `passwordHash` | **Purged (Overwritten)** | Cryptographic credential. Overwritten with constant `$purged$v=19$ndpa-erased$` to permanently prevent account revival. | Security Best Practice & NDPA § 39. Overwritten immediately upon purge. |
| **`User`** | `nin` | **Purged (Masked)** | National Identification Number (High-risk government PII). Overwritten with truncated surrogate `PURGED-<hash>`. | NDPA 2023 § 24 & NIMC Identity Protection Mandate. Purged after 7 days. |
| **`User`** | `role` | **Retained** | Authorization role enum (`PARENT`, `TEACHER`, `ADMIN`). Retained to preserve ledger referential integrity. | Legitimate Business Interest (Non-PII structural classification). Retained permanently. |
| **`User`** | `isVerified`, `deletedAt` | **Retained** | Audit flags verifying historical account legitimacy and recording lawful erasure timestamp. | NDPA 2023 § 34(3) Proof of Compliance. Retained for 6 years. |
| **`Session`** | `sessionToken`, `ipAddress`, `userAgent` | **Purged (Hard Delete)** | Active and historical device fingerprints and access bearer tokens. Deleted atomically upon erasure request. | NDPA 2023 § 34(1)(a). Hard-deleted immediately on Stage 1 soft delete. |
| **`Student`** | `fullName` | **Retained** | Academic student enrollment record. Belongs to child educational institution register. | National Policy on Education & WAEC/NECO transcript verification. Retained 10 years. |
| **`Student`** | `admissionNum` | **Retained** | School-assigned unique academic matriculation identifier. Non-PII institutional record. | Official School Registry. Retained permanently. |
| **`Student`** | `parentId` | **Purged (Unlinked)** | Relational foreign key binding child to requesting parent. Nullified (`parentId = null`) upon purge. | NDPA 2023 § 34 Right to Sever Association. Purged after 7 days. |
| **`ClassArm`** | `name`, `id` | **Retained** | Institutional class structure (e.g., "JSS 2 Diamond"). Institutional infrastructure data. | Operational Record. Retained permanently. |
| **`TeacherClassAssignment`** | `teacherId`, `classArmId` | **Retained** | School administrative staffing records. Subject to employment tax audit. | Nigerian Labour Act & Personal Income Tax Act (PITA). Retained 6 years. |
| **`FeeSchedule`** | `term`, `academicYear`, `expectedAmount` | **Retained** | Approved school fee schedule and institutional billing tariff. | CAMA 2020 § 374 & School Board Governance. Retained 6 years. |
| **`Attendance`** | `date`, `status` (`PRESENT`, `ABSENT`, etc.) | **Retained** | Regulatory school register verifying compulsory education attendance. Linked to student admission number, not parent PII. | Compulsory, Free Universal Basic Education Act 2004. Retained 5 years post-graduation. |
| **`Assessment`** | `caScore` (40 max), `examScore` (60 max), `letterGrade` | **Retained** | Certified academic transcript records. Mandatory for tertiary admission and WAEC validation. | Nigerian Educational Research & Development Council (NERDC) Guidelines. Retained permanently. |
| **`Payment`** | `amount`, `reference`, `receiptNumber`, `date` | **Retained (Immutable)** | Primary financial accounting ledger entry. Records statutory school revenue and settlement. | **CAMA 2020 § 374, CITA § 63 & MLPPA 2022 § 7.** Strict retention: **6 Years Minimum.** |
| **`PaymentAttempt`** | `reference`, `amount`, `status`, `channel`, `failureReason` | **Retained (Immutable)** | Dual-ledger transaction audit trail for abandoned, failed, or disputed banking settlements. | Central Bank of Nigeria (CBN) Electronic Payments Guidelines & Tax Audit. Retained **6 Years.** |
| **`DocumentChunk`** | `content`, `embedding`, `metadata` | **Retained** | Institutional policy manuals, parent handbook text, and grading criteria for Vector RAG search. Non-personal. | School Intellectual Property & Administrative Policies. Retained permanently. |

---

## 2. The Fundamental Legal Conflict: Erasure vs. Statutory Financial Retention

A central question in Nigerian enterprise software architecture is resolving statutory contradictions between privacy law and commercial revenue governance:

### The Conflict:
- **The Parent's Right:** Under **NDPA 2023 § 34(1)**, a data subject possesses the fundamental right to demand complete erasure of all personal data held by a data controller without undue delay.
- **The School's Obligation:** Under **CAMA 2020 § 374** and **CITA § 63**, every registered private educational business in Nigeria is legally obligated to preserve all books of account, receipt registers, and transaction vouchers for a **minimum statutory period of six (6) years** from the date of the transaction, punishable by corporate sanctions and personal director liability for destruction of financial records.

### Statutory Resolution: Who Wins and on What Legal Basis?
**The Financial Retention Obligation Wins.**
Under **NDPA 2023 § 34(2)(b)**, the right to erasure is explicitly limited:
> *"The provisions of subsection (1) shall not apply to the extent that processing is necessary for compliance with a legal obligation to which the data controller is subject by law..."*

### Architectural Reconciliation Mechanism:
SchoolFix satisfies both statutes simultaneously through **Cryptographic Pseudonymization and Decoupling**:
1. When a parent exercises their right to erasure, SchoolFix **strictly refuses** to delete rows from the `Payment` or `PaymentAttempt` tables (`onDelete: Restrict`).
2. The user's direct PII (`fullName`, `email`, `phone`, `nin`) is permanently expunged and replaced with non-reversible surrogate hashes (`purged_<id>@schoolfix.internal`).
3. The financial receipt remains immutable: an auditor or tax authority investigating a ₦185,000 tuition settlement from 14 months ago inspects the reference, receipt number, bank settlement timestamp, and terminal class arm, satisfying CAMA § 374, while the identity of the deleted parent is decoupled from active school communications, satisfying NDPA § 34.

---

## 3. Backups Synchronization & Rolling Tombstone Strategy

Backups represent a major compliance vulnerability: if an application deletes a user's record from the production PostgreSQL cluster, but restores an un-synced database snapshot 3 months later during disaster recovery, the deleted user's PII is resurrected, violating NDPA § 34 and exposing the school to regulatory fines up to ₦10,000,000 under NDPA § 48.

### SchoolFix Backup Lifecycle & Sync Protocol:
1. **Primary Database Backup Cadence:**
   - Automated physical WAL (Write-Ahead Log) archiving via continuous PostgreSQL streaming to an encrypted AWS S3 / Wasabi cold vault located in the South Africa (af-south-1) region.
   - Nightly point-in-time full database snapshot executed at `02:00 UTC+1` (Nigerian Local Time).
2. **Backup Snapshot Retention Window:**
   - Full snapshots are retained for exactly **30 days**, governed by automated S3 bucket lifecycle rules with cryptographic expiration (`ExpirationInDays: 30`).
3. **Disaster Recovery Replay & Tombstone Sync:**
   - SchoolFix maintains an immutable, write-only compliance audit table: `DeletionTombstone (id, originalSubjectHash, purgedAt, surrogateId)`.
   - In the event of a total disaster recovery restore from a 14-day-old snapshot, the recovery runbook executes a mandatory post-restore reconciliation script:
     ```sql
     -- Re-apply purge transformations against resurrected snapshot rows
     UPDATE "User" u
     SET "fullName" = 'Anonymized Parent (NDPA Purged)',
         "email" = 'purged_' || u.id || '@schoolfix.internal',
         "isAnonymized" = true
     WHERE u.id IN (SELECT "originalSubjectId" FROM "DeletionTombstone");
     ```
   - This ensures that resurrected snapshots drop all previously deleted data before traffic is routed back to production.

---

## 4. Anonymisation vs. Deletion: Why Anonymised Data Can Be Retained

Under **NDPA 2023 § 65** and **GDPR Recital 26**, the definition of "personal data" explicitly excludes information that does not relate to an identified or identifiable natural person:
> *"Personal data means any information relating to an identified or identifiable natural person... The principles of data protection do not apply to anonymous information, namely information which does not relate to an identified or identifiable natural person or to personal data rendered anonymous in such a manner that the data subject is not or no longer identifiable."*

### Why SchoolFix Anonymizes Rather Than Wipes:
1. **Preservation of Cohort Analytics:** Private schools require aggregate historical performance metrics:
   - Average terminal Mathematics exam score for JSS 2 in 2024.
   - Total term tuition collected vs. total tuition defaulted across five years.
   - Term-by-term attendance percentage across different age cohorts.
2. **Preventing Broken Relational Invariants:**
   If a user row is dropped completely (`DELETE FROM "User"`), relational database foreign keys either cascade delete (destroying attendance and payment logs) or throw foreign key constraint errors (`RESTRICT`).
3. **Mathematical Irreversibility:**
   By overwriting names with static strings, hashing emails with unique per-row salts, and wiping NINs, the data ceases to be personal data under law. It becomes aggregate historical telemetry, legally permitted for permanent retention.
