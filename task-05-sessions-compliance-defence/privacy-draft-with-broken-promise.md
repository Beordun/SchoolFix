# SchoolFix Privacy Notice (Initial Draft with Unfulfillable Operational Promise)

> **Document Status:** Pre-Audit Engineering Draft (Contains Broken Operational Promise)  
> **Topic:** Task 5 Step 8 Compliance Forensics  
> **Artifact:** `task-05-sessions-compliance-defence/privacy-draft-with-broken-promise.md`  

---

## Pre-Audit Draft Text

### 1. Information We Collect
SchoolFix collects parent names, mobile phone numbers for WhatsApp emergency notices, email addresses, student names, classroom arm assignments, daily attendance marks, and Continuous Assessment test scores.

### 2. How We Handle Account Deletion
We respect your right to privacy under Nigerian data protection laws. 

> **[THE UNFULFILLABLE PROMISE — TO BE REMOVED]:**  
> *"If at any time you wish to leave SchoolFix, you may simply walk into the school bursar's office, inform the front desk secretary verbally, or send a WhatsApp message to the school administrator. Upon receiving your oral request, all your personal information, login credentials, attendance records, and complete tuition payment histories will be permanently wiped from our database servers within 24 hours."*

### 3. Data Retention
We retain student Continuous Assessment grades for academic transcripts and delete all other data immediately upon request.

---

## Compliance Audit & Defect Forensics

### The Two Versions:
- **Pre-Audit Draft (Broken Promise):**
  Promised that parents could orally request deletion at the school front desk or via WhatsApp, and that all records—including complete tuition payment histories—would be completely wiped within 24 hours.
- **Post-Audit Production Policy (`privacy.md`):**
  Excised the oral front-desk/WhatsApp promise and the promise of financial ledger erasure. Replaced with the authentic, automated system reality:
  1. Deletion requests must be initiated through the authenticated portal gateway or via formal signed administrative ticket.
  2. The account undergoes an immediate soft-delete with a mandatory **7-day grace period lock**.
  3. Personal identifiers are anonymized, but **tuition receipts and payment attempts are strictly retained for six (6) years** as required by CAMA 2020 § 374 and tax audit laws.

### Two-Sentence Explanation of How Such a Promise Gets Written:
*Promises like this get written when non-technical founders or compliance copywriters draft policies based on what sounds accommodating and reassuring to customers rather than what the relational schema and statutory accounting laws actually support. They confuse customer service empathy with distributed systems capabilities, creating a legal commitment to perform an action that would both corrupt relational database ledgers and violate Nigerian federal tax retention statutes.*
