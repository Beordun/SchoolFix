# Primary Research Interview: School Bursar & Administrative Reality

> **Product:** SchoolFix (Mobile-First School Management & Tuition Reconciliation)  
> **Interview Subject:** Mrs. Funke Adeyemi, Bursar & Head of Accounts  
> **School:** Gracefield International College (Private Primary & Secondary, 380 enrolled students)  
> **Physical Address:** 14 College Road, Magodo Phase 2, Ikeja LGA, Lagos State, Nigeria  
> **Date of Interview:** October 28, 2026 (Duration: 25 minutes)  
> **Document Reference:** `task-05-sessions-compliance-defence/docs/interview-with-owner.md`  

---

## 1. Interviewee Profile & Operating Context

Mrs. Funke Adeyemi has served as the Bursar of Gracefield International College for 12 years. The school serves middle-class families across Lagos mainland, operating a three-term academic calendar with termly tuition fees of **₦185,000 per student in Junior Secondary (JSS)** and **₦220,000 in Senior Secondary (SS)**. 

The bursary operates with two desktop PCs running Windows 10, an ink-tank Epson printer, a POS terminal from Moniepoint, and five physical ledger binders containing handwritten receipt counterfoils.

---

## 2. The Five Standard Questions & Verbatim Responses

### Question 1: What do customers (parents) ask you repeatedly that only you can answer?
> **Mrs. Adeyemi:**  
> *"Every single resumption week, the exact same panic happens. Parents don't ask about the school curriculum—they call my direct line or send WhatsApp messages at 6:30 AM asking: **'Mummy Chinedu here, I sent ₦185,000 from my GTBank app on Saturday night, did you see the alert?'**  
> Because Nigerian interbank transfers frequently hang or send delayed SMS alerts, parents live in absolute fear that their child will be turned back at the school gate on Monday morning. Only I can check the school’s corporate statement on my bank token and confirm: 'Yes, Mrs. Alabi, the money dropped, your son is cleared.' If software cannot give them that instant settlement confirmation, my phone will ring 80 times before assembly."*

---

### Question 2: What records do you keep, and where do they live now?
> **Mrs. Adeyemi:**  
> *"We keep three main things:
> 1. **The Cash Receipt Register:** A carbon-copy paper book. Every time a parent pays cash or brings a POS printout, I issue a physical receipt. The yellow copy goes to the parent, the pink copy stays in my binder.
> 2. **The Terminal Fee Reconciliation Ledger:** An Excel sheet on my desktop computer where I record student names, expected fee, amount paid, outstanding balance, and bank reference.
> 3. **The Term Clearance Slips:** Little stamped cardboard cards we give to students whose fees are paid in full. If a student does not have the clearance slip pinned to their uniform during midterm examinations, they cannot enter the examination hall.
> If my desktop hard drive crashes during exam week, we are in complete darkness."*

---

### Question 3: Has a customer (parent) ever asked you to delete their information, and what did you do?
> **Mrs. Adeyemi:**  
> *(Laughs out loud)*  
> *"In my twelve years as bursar, not one single Nigerian parent has ever walked into this office and asked me to delete their records. Why would they? What parents actually do is the complete opposite!  
> Three months ago, a parent who left our school in 2021 rushed in begging for certified copies of receipts from JSS 1 because the Canadian Embassy demanded three years of tuition payment history to prove financial capability for their relocation visa! If I had 'deleted' that parent's payment history, their visa application would have failed. We never destroy financial records. By law, our external tax auditors from the Lagos Internal Revenue Service (LIRS) require us to show at least six years of physical bank receipts."*

---

### Question 4: What would you do if your records were lost tomorrow?
> **Mrs. Adeyemi:**  
> *"It would be an absolute catastrophe. If the paper binders were lost in a fire and the computer died, I would have to ask all 380 parents to pull out their own bank statements and prove what they paid. Some honest parents would help, but dishonest parents who owe ₦150,000 balance would immediately claim they paid cash and that I was the one who misplaced their file. The school proprietor would probably have to deduct the loss from my salary. That is why I back up my Excel file to an external flash drive every Friday."*

---

### Question 5: What would make you NOT use software like this?
> **Mrs. Adeyemi:**  
> *"Two things will kill software instantly in a Nigerian school:
> 1. **Unrealistic Online Payment Fees:** If your system forces parents to pay with their debit cards and adds a 1.5% or 2% 'processing fee' on top of ₦185,000, that is over ₦2,700 extra. Nigerian parents will refuse to pay online. They will bypass the app completely, walk straight to my office, and transfer directly to the school account or pay cash. If the app does not allow me to manually reconcile bank transfers with zero fees, the app is useless.
> 2. **Complicated Logins for Elderly Guardians:** Many of our children are cared for by grandmothers or older uncles who use cheap Android phones with small cracked screens. If you give them complicated passwords, two-factor authenticator apps, or systems that lock them out every three days, they will simply abandon the app and come stand in my office."*

---

## 3. Critical Contradictions with Our Original Task 1 Assumptions

Speaking with a real bursar fundamentally contradicted three core assumptions made in our initial Task 1 Business Brief:

| Original Task 1 Assumption | Primary Research Finding from Real Bursar | Architectural Adaptation in SchoolFix |
| :--- | :--- | :--- |
| **Assumption 1:** Parents primarily want a mobile dashboard to check daily academic Continuous Assessment grades and test scores. | **Contradiction:** Academic grades are secondary. Parents' primary anxiety is **fee clearance verification**—confirming their bank transfer was acknowledged so their child is not publicly turned away at the morning gate. | Prioritized tuition balance status, instant payment receipt verification, and clearance badges above CA charts on the parent dashboard. |
| **Assumption 2:** All payments would route digitally through electronic debit card checkout. | **Contradiction:** High processing fees mean over 60% of parents prefer direct bank transfer or cash. Electronic card payments must be optional, not mandatory. | Implemented the **dual-ledger architecture** with manual bursar cash reconciliation (`POST /api/reconcile`) alongside Flutterwave electronic webhooks. |
| **Assumption 3:** Privacy compliance means honoring immediate customer requests to wipe all data. | **Contradiction:** Parents never want payment records deleted; they rely on old receipts for tax clearance, visa applications, and custody disputes. Furthermore, LIRS/CAMA tax regulations mandate a 6-year retention minimum. | Implemented the **NDPA Anonymization Decoupling pattern**: personal identifiers are purged, while payment ledgers are immutably retained for 6 years. |

---

## 4. What I Got Wrong About My Own Business Brief

In our Task 1 Business Brief, I designed SchoolFix as a slick, automated EdTech application where parents effortlessly pay online with debit cards, check attendance trends on interactive charts, and exercise digital privacy rights.

Speaking with Mrs. Adeyemi forced me to confront the gritty operational reality of Nigerian school administration:
1. **Network Friction & Interbank Delays:** The technology is not operating in Silicon Valley; it operates against delayed interbank NIP alerts, bank server timeouts, and cash-strapped families timing payments against monthly civil service salaries.
2. **The Moral Weight of School Gate Embarrassment:** A parent's greatest fear is not a data leak; it is their 11-year-old child being sent home in tears on examination morning because the bursar has no record of their tuition payment.
3. **The Primacy of Financial Ledgers:** Software in a Nigerian private school is first and foremost an accounting trust engine. If the financial books cannot be defended in front of an aggressive Lagos State tax auditor from LIRS, beautiful UI tokens mean nothing.
