# Task Three: Mandatory Defect Log

> **Product:** SchoolFix (Mobile-First School Management & Tuition Reconciliation)  
> **Target Market:** Nigerian Private Primary and Secondary Schools  
> **Requirement:** Inviolable Operating Rule 5 — Real defect documentation with exact `file:line` references, architectural explanations, and production cost analysis.

---

### Defect 1: Password Length Validation Accepts Pure Whitespace (`AuthCard.tsx:106`)
* **Exact Reference:** [`app/auth/AuthCard.tsx:106`](file:///c:/Users/DT001/Desktop/SchoolFix/app/auth/AuthCard.tsx#L106)
* **Code as Written:**
  ```typescript
  const regPasswordError = useMemo(() => {
    if (!touched.password) return '';
    if (!password) return 'Password is required.';
    if (password.length < 8) return 'Password must be at least 8 characters long.';
    return '';
  }, [password, touched.password]);
  ```
* **Why It Happened:**
  The developer used raw `.length` without checking character composition or invoking `.trim()`. When an adversarial attack entered 8 space characters (`"        "`), `password.length` evaluated to `8 >= 8`, satisfying the client condition and enabling the submit button.
* **Production Cost if Unpatched:**
  Users could inadvertently create accounts with space-only passwords that are invisible on mobile keyboards, rendering the account impossible to log into later. Alternatively, automated account creation bots could register thousands of accounts with blank passwords, bypassing password entropy requirements.
* **Remediation:**
  Enforce `.trim().length >= 8` on client validation and mandate complex character classes (uppercase, lowercase, numeric digits) via Zod on the server boundary in Task 4.

---

### Defect 2: Missing Server-Side Terms Acceptance Enforcement (`route.ts:24`)
* **Exact Reference:** [`app/api/register/route.ts:24`](file:///c:/Users/DT001/Desktop/SchoolFix/app/api/register/route.ts#L24)
* **Code as Written:**
  ```typescript
  const { fullName, email, password, role } = await req.json();
  // acceptedTerms is never extracted or checked!
  ```
* **Why It Happened:**
  The backend API route assumed the client-side button disabling logic in `AuthCard.tsx` would guarantee that only users who checked the NDPA consent checkbox could reach the server.
* **Production Cost if Unpatched:**
  A direct API call (as evidenced in `evidence/16-direct-request-command-and-response.txt`) successfully persisted user `5d8e9b4e-76d3-4f6b-84d0-02dd50411ae5` without terms acceptance. Under the Nigeria Data Protection Act (NDPA) 2023 §31 and §65, processing the personal and financial data of parents and dependent pupils without verifiable statutory consent exposes SchoolFix to regulatory enforcement notices and fines up to ₦10,000,000 or 2% of annual gross turnover.
* **Remediation:**
  Close the boundary gap in Task 4 by adding `acceptedTerms: z.literal(true)` to the server-side Zod validation schema, rejecting un-consented registrations with `400 Bad Request`.

---

### Defect 3: HTML `<input type="number">` Strips Leading Zero on Phone Numbers (`AuthCard.tsx:422`)
* **Exact Reference:** [`app/auth/AuthCard.tsx:422`](file:///c:/Users/DT001/Desktop/SchoolFix/app/auth/AuthCard.tsx#L422)
* **Code as Written:**
  ```tsx
  <input
    id="reg-phone"
    type="number"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
  />
  ```
* **Why It Happened:**
  The engineer chose `type="number"` based on the semantic intuition that phone numbers consist of digits. However, the HTML5 specification defines `input[type=number]` as a floating-point numeric value, parsing input through `parseFloat()`.
* **Production Cost if Unpatched:**
  When a Nigerian parent typed `08031234567`, the browser automatically stripped the leading zero, transforming the value into integer `8031234567`. This caused the 11-digit regex validation (`^0[789][01]\d{8}$`) to fail perpetually, locking out legitimate users. Furthermore, on mobile touchscreens, accidental vertical scrolling triggered the numeric stepper increments, altering numbers without user knowledge.
* **Remediation:**
  Refactored to `<input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={11} />`. This brings up the numeric keypad on Android/iOS while preserving the crucial leading zero as an immutable text string.
