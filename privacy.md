# SchoolFix Privacy Notice & NDPA Compliance Policy

> **Effective Date:** October 2026  
> **Platform:** SchoolFix (Mobile-First School Management & Tuition Reconciliation)  
> **Governing Law:** Nigeria Data Protection Act (NDPA 2023)  
> **Target Audience:** Nigerian Parents, Guardians, Classroom Teachers, and School Administrators  

---

## 1. Introduction in Plain Language

SchoolFix is an administrative portal built for Nigerian private primary and secondary schools. We manage classroom attendance, Continuous Assessment (CA) scores, and tuition fee reconciliation. 

We believe privacy policies should be straightforward, honest, and explain what actually happens to your data in the computer systems, without deceptive legal jargon.

---

## 2. What Information We Collect and Why

We collect only information necessary to operate the school portal:
1. **Parent / Guardian Details:** Full name, registered email address, Nigerian mobile phone number (for fee reminders and attendance notifications), and National Identification Number (NIN) where required by regulatory compliance.
2. **Dependent Student Records:** Student full name, school admission number, and assigned class arm (e.g., *JSS 1 Gold*). Students have **no login accounts**; their profiles are managed exclusively by parents and authorized teachers.
3. **Daily Attendance:** Marks indicating whether a student was Present, Absent, Late, or Excused on each school day.
4. **Academic Performance:** Continuous Assessment marks (maximum 40.00 marks) and Terminal Examination marks (maximum 60.00 marks).
5. **Financial Records:** Electronic transaction references, bank transfer timestamps, payment amounts, and official tuition receipts generated through Flutterwave or manual bursary cash reconciliation.
6. **Technical Session Data:** IP addresses, browser types, and session tokens stored as cryptographic SHA-256 hashes to secure accounts against hijacking.

---

## 3. How to Request Account Deletion

You have the lawful right to request erasure of your personal data under **NDPA 2023 § 34**.

Because verbal requests or casual WhatsApp messages cannot be cryptographically verified, deletion requests must be initiated through one of two verified channels:
1. **Self-Service Portal:** Log in to your parent dashboard at `/portal/dashboard`, navigate to the **NDPA Account Erasure Rights** section, and click **Request Account Deletion**.
2. **Written Administrative Request:** Submit a signed written request to the School Bursar or Data Protection Officer with your registered email and mobile number.

---

## 4. The 3-Stage Deletion Lifecycle & Our 7-Day Grace Period

When you request account deletion, SchoolFix does not execute an immediate raw wipe. Deletion follows a structured 3-stage process designed to protect you from accidental loss:

### Stage 1: Immediate Account Lock (Soft Delete)
- The moment your request is confirmed, your account is marked as `deletedAt = now()`.
- All active browser sessions across all devices are immediately terminated in PostgreSQL.
- Your login credentials are disabled. Anyone attempting to log in receives a notice that the account is locked.

### Stage 2: The 7-Day Grace Period
- Your account remains in a secure, locked state for **seven (7) calendar days**.
- If your request was submitted by mistake, or if your child re-enrolls, you can contact the school bursar during this 7-day window to reinstate your account without data loss.

### Stage 3: Automated Background Purge
- Once the 7-day grace period expires, an automated background worker executes an atomic database transaction to purge your personal data.

---

## 5. What Is Purged vs. What Is Retained

To balance your right to privacy with mandatory Nigerian financial and educational laws, our system handles records as follows:

### What Is Permanently Purged:
- **Personal Identifiers:** Your full name is replaced with `"Anonymized Parent (NDPA Purged)"`, your email is converted to a non-contact surrogate (`purged_<id>@schoolfix.internal`), and your phone number and NIN are permanently scrubbed.
- **Access Credentials:** Your Argon2id password hash is replaced with an unmatchable invalid string.
- **Session History:** All session rows, device IP fingerprints, and verification OTP codes are deleted permanently.
- **Child Relationship Link:** The relational link between your account and dependent student records is unlinked.

### What Is Retained and Why:
1. **Tuition Payment Ledgers (`Payment` & `PaymentAttempt`):**
   - **Retained for Six (6) Years.**
   - **Legal Obligation:** Under the **Companies and Allied Matters Act (CAMA 2020) § 374** and the **Companies Income Tax Act (CITA) § 63**, schools are legally mandated to retain books of account, bank transaction references, and receipt records for at least six years for statutory tax audits.
   - Financial entries are preserved with non-PII transaction IDs and receipt numbers; personal names are decoupled.
2. **Student Academic Transcripts & Attendance:**
   - **Retained for Ten (10) Years.**
   - **Educational Mandate:** Under Nigerian national educational guidelines, historical grades and attendance records belong to the student’s academic transcript and are required for future secondary school testimonials, WAEC/NECO registrations, and university verifications.

---

## 6. Backup Synchronization

We maintain nightly encrypted database snapshots for disaster recovery. Backups are subject to an automated **30-day rolling expiration window**. 

If a database backup is ever restored, our automated recovery script syncs with our compliance tombstone register to immediately re-purge any accounts that were deleted during that window, ensuring your data is never resurrected.

---

## 7. Contacting Our Data Compliance Team

If you have questions regarding your rights under the Nigeria Data Protection Act 2023, you may contact:
- **Data Protection Officer (DPO):** `compliance@schoolfix.internal`
- **School Bursary Office:** Administration Building, SchoolFix Partner Schools, Lagos, Nigeria.
