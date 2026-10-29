# Sensitive Data Protection: User & Institution Enumeration Prevention

> **Module:** Task 3 — Step 5 (Do Not Leak the Shape of Sensitive Data)  
> **Application:** SchoolFix (Mobile-First School Management & Tuition Reconciliation)  
> **Target Demographic:** Nigerian Private Primary and Secondary Schools

---

## 1. Which Field, and Why Its Shape is Sensitive

### The Field: School Institution Access Code / Student Admission PIN
In SchoolFix, student account linking and bursar portal routing rely on an alphanumeric identifier: the **School Institution Code** (e.g., `SFX-8241`) and the **Student Admission Number**.

### Why Its Shape is Sensitive
In initial template designs, the agent generated input placeholders showing the exact internal shape:
- *Placeholder Previously Displayed:* `e.g. SFX-1234`
- *Input Character Length Mask:* Restricted strictly to 8 characters (`maxlength="8"`).

Revealing the exact shape, prefix (`SFX-`), and character length transforms an unknown secret into a tiny, enumerable keyspace. A student admission PIN functions like a secondary credential. Giving public web visitors explicit structural blueprints allows attackers to target the system without needing access to school rosters.

---

## 2. What an Attacker Gains from Knowing the Shape

1. **Massive Reduction in Search Space:**
   - If an attacker knows that the school code is strictly `SFX-` followed by exactly 4 numeric digits, the total number of combinations is reduced from an astronomically large alphanumeric keyspace ($36^8 \approx 2.8 \times 10^{12}$) down to just **10,000 possibilities** ($10^4$).
   - Over a high-speed script running against un-rate-limited endpoints, 10,000 requests can be enumerated in under 3 minutes, revealing the active directory of registered Nigerian schools.
2. **Targeted Phishing & Social Engineering:**
   - Once valid school codes are enumerated, attackers can craft tailored WhatsApp phishing campaigns targeting parents with fake school bank account details for tuition fee payments.
3. **Account Enumeration via Error Messages:**
   - If the system indicates *"School code must be 8 characters"* or returns distinct errors for *"Invalid School Code"* vs *"Incorrect Password"*, an attacker confirms whether a targeted school or parent exists in the database.

---

## 3. The Trade-Off Accepted

### The Usability Cost to Legitimate Users
Removing the specific format placeholder (`SFX-1234`) and replacing it with a neutral, non-leaking placeholder (`Enter your school code`) means legitimate parents and teachers do not receive an immediate visual cue regarding whether they need to include dashes or prefixes.
- **Friction Score:** Low to Moderate. Legitimate parents might type `8241` without the `SFX-` prefix, requiring a post-blur validation error or server normalization.

### Why It Is Worth It
The trade-off is decisively worth it. In Nigerian private education, tuition fee diversion fraud (where rogue actors intercept parent fee payments) is a rampant criminal threat. Hardening the institution identifier by withholding its structural blueprint prevents automated directory harvesting while costing legitimate parents only a split-second of guidance from their physical school admission letters.
