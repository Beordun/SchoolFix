# Information Design: Form Field Justification Matrix

> **Application:** SchoolFix — Mobile-First School Management & Tuition Reconciliation  
> **Target Demographic:** Nigerian Private Primary and Secondary Schools  
> **Engineering Rule:** Every field must answer three questions: (1) Why is it needed? (2) What does the business do with it? (3) What happens if the user gets it wrong? Any field that fails all three is removed.

---

## 1. Field Justification Matrix

| Field Name | (1) Why Is It Needed? | (2) What Does the Business Do With It? | (3) What Happens If User Gets It Wrong? | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **Full Name** *(Surname First)* | Legal identity matching against paper student dossiers, physical bank tellers, and PTA rosters. | Bursars cross-reference against bank payment narration and WAEC/NECO examination registration records. | Tuition payments cannot be reconciled against the student profile; official report cards print corrupted parent names. | **KEEP** |
| **Email Address** | Primary asynchronous communication channel for cryptographic session tokens, password recovery, and monthly terminal fee ledger clearance receipts. | System dispatches electronic tuition receipts, account verification links, and end-of-term PDF academic performance statements. | Parent never receives fee clearance statements; cannot recover password if locked out; account remains unverified. | **KEEP** |
| **Phone Number** *(WhatsApp/SMS)* | Primary synchronous real-time notification channel in Nigeria, where 90% of school communications occur on WhatsApp. | System sends payment confirmation SMS and emergency pupil health/attendance departure alerts. | Urgent notices (e.g., student illness or sudden school dismissal) fail; parent misses payment deadline warnings. | **KEEP** |
| **Password** | Authentication credential to prevent unauthorized third parties from viewing minor academic records or initiating financial payments. | Hashed using memory-hard Argon2id ($65,536\text{ KiB}$ memory, 3 iterations, 4 parallelism) to authenticate sessions. | Legitimate parent is locked out, requiring self-service reset or bursar administrative verification. | **KEEP** |
| **Terms & NDPA Acceptance** | Statutory compliance requirement under the Nigeria Data Protection Act (NDPA) 2023 for processing student and parent personal data. | Serves as audit evidence for legal compliance, data retention limits, and tuition refund dispute arbitration. | Registration cannot proceed. The application rejects processing to avoid regulatory sanctions from the NDPC. | **KEEP** |

---

## 2. Fields Considered and Explicitly Removed

1. **Title / Honorific (e.g., Chief, Alhaja, Dr., Pastor, Mrs.):**
   - *Why Removed:* Common in Nigerian forms, but purely decorative for authentication. Adding a dropdown or text field increases cognitive load on mobile screens and does not alter database authorization or payment clearing.
2. **Student Admission Number during Initial Parent Registration:**
   - *Why Removed:* Forcing parents to find a 6-to-10-character school admission number before registering creates severe drop-off (parents often sign up while away from home documents). Pupil linkage is deferred to post-login student onboarding.
3. **Physical Home Address:**
   - *Why Removed:* Unnecessary for digital attendance and tuition clearance. Collecting home addresses increases NDPA data liability without adding operational value to ledger reconciliation.
4. **Gender / State of Origin:**
   - *Why Removed:* Irrelevant to financial ledger integrity and creates unnecessary friction on small mobile viewports.

---

## 3. Removal of Non-Functional Decoration
- **What Was Removed:** In standard agent scaffolds, decorative SVG illustrations or redundant brand badges ("SchoolFix ERP Verified") were placed inside the card header right above the form title.
- **Reasoning:** In mobile viewports ($360\text{px}$ width, $640\text{px}$ height), the virtual on-screen keyboard consumes over $40\%$ of the screen. Decorative headers push the first input field below the fold, forcing blind typing and user frustration. Removing all decorative graphics inside the form container keeps the primary input fields directly visible above the virtual keyboard.
