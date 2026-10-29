# Technical Viva Interview Answers — Task 3

> **Scope:** 14 viva defense questions covering Client Validation, Single Page Architecture, Accessibility (WCAG 2.1 AA), Forward Deployed Engineering, and Adversarial Form Attacks.  
> **Constraint:** Strictly maximum 200 words per answer.

---

### 1. Why is client-side validation not enough?
Client-side validation executes within the user's browser, an untrusted runtime environment completely under client control. An attacker, bot, or curl script can bypass the browser entirely and issue direct HTTP POST requests to the backend API (`/api/register`).

In our SchoolFix test (`evidence/16-direct-request-command-and-response.txt`), a direct Node.js HTTP call omitted the required Nigerian phone number and NDPA terms acceptance entirely. Because the endpoint lacked server boundary validation, PostgreSQL committed user `5d8e9b4e-76d3-4f6b-84d0-02dd50411ae5` with `201 Created`. 

Client checks exist solely for user experience: immediate feedback, reduced network round-trips on metered 3G connections, and accessible guidance. The server must treat all client inputs as adversarial.

---

### 2. What security checks belong in the frontend, and what must the server enforce regardless?
**Frontend Checks (UX & Performance):**
- Real-time format checking (e.g., regex pattern feedback).
- Empty required field blur detection.
- Guiding accessible UI announcements (`aria-describedby`, caution icons).
- Preventing premature submission to conserve metered cellular bandwidth.

**Server Checks (Inviolable Security):**
- Authentication, authorization, and session signature verification.
- Authoritative boundary schema validation (e.g., Zod) ensuring types, lengths, and required legal consents exist.
- Slow cryptographic hashing (Argon2id) and breached password corpus lookups.
- IP/Token-bucket rate limiting to mitigate denial-of-service and brute-force attacks.
- Business rule integrity (e.g., verifying fees balance before issuing terminal report cards).

---

### 3. The user interface hides the delete button for non-administrators. Is that enough?
No. Hiding a button in the DOM is visual obscurity, not security. The client DOM and JavaScript bundles are public assets. A non-administrator can inspect network traffic, extract the API route (`DELETE /api/students/[id]`), and dispatch a forged HTTP DELETE request using browser devtools, Postman, or terminal curl.

If the server relies on the UI to restrict actions, unauthorized users can delete student records and tuition ledgers. The server endpoint must independently authenticate the session, decode the caller's role, and verify RBAC permissions against the database before executing mutations.

---

### 4. What is the difference between validation, encoding and sanitisation?
- **Validation:** Verifying that incoming data conforms strictly to predefined structural, type, and length constraints (e.g., checking that a Nigerian phone number matches `^0[789][01]\d{8}$`). It accepts or rejects data without altering it.
- **Sanitisation:** Modifying or stripping dangerous elements from input before processing or storage (e.g., stripping `<script>` tags from school policy notes or calling `.trim()` on emails).
- **Encoding:** Transforming data into a safe output format so an interpreter treats it as literal data rather than executable code (e.g., HTML entity encoding `&lt;` to prevent Cross-Site Scripting, or URL percent-encoding parameters).

---

### 5. Why should you validate route parameters and query strings, not just the body?
Route parameters (`/portal/reports/[studentId]`) and query strings (`?mode=login`) are untrusted user inputs transmitted directly in the HTTP request line. 

Failing to validate them opens critical vulnerabilities:
1. **SQL/Prisma Injection & Type Mismatches:** Passing an arbitrary string into a UUID database query causes unhandled database crashes or injection if raw queries are used.
2. **IDOR (Insecure Direct Object Reference):** Tampering with `studentId` allows unauthorized parents to view other children's academic grades and financial balances.
3. **SSRF / Open Redirects:** Unchecked redirect query parameters allow attackers to bounce users to phishing portals.

---

### 6. Explain what a single page application is, and how you make one discoverable by search engines.
A Single Page Application (SPA) loads a single initial HTML shell and dynamically rewrites the view in response to user interaction via client-side JavaScript, eliminating full page reloads.

To make an SPA discoverable by search engines:
1. **Server-Side Rendering (SSR) / Static Site Generation (SSG):** Frameworks like Next.js render complete HTML and semantic meta tags on the server before sending them to web crawlers.
2. **Semantic URL States:** Use the History API (`pushState`) so every distinct view maps to an indexable URL (e.g., `/auth?mode=login`).
3. **Structured Metadata & Open Graph:** Include distinct `<title>`, `<meta name="description">`, canonical links, and Open Graph tags per route.

---

### 7. What are the advantages and disadvantages of a single page application against a multi-page application?
**Advantages:**
- **Zero-Latency State Transitions:** Switching authentication modes executes in 0ms on the client with zero network bytes transferred, critical for metered 3G networks.
- **Persistent State:** Client state (e.g., entered email or theme preference) is preserved across tab transitions.
- **App-Like Feel:** Fluid transitions mimic native mobile applications.

**Disadvantages:**
- **Initial Bundle Overhead:** Requires downloading a larger JavaScript bundle on cold load, delaying First Contentful Paint.
- **Memory Footprint:** Long-running client sessions can accumulate memory leaks in low-end smartphone WebViews.
- **Fragility:** If client-side JavaScript fails to execute due to legacy browser incompatibility, the entire application becomes inaccessible.

---

### 8. Can you explain the four principles of the Web Content Accessibility Guidelines, with examples from your own work?
The WCAG 2.1 principles are **POUR**:
1. **Perceivable:** Information cannot rely on a single sense. In SchoolFix, validation errors use SVG caution icons alongside color, ensuring color-blind users perceive errors.
2. **Operable:** All controls are keyboard/touch navigable. Submit buttons remain in the tab order via `aria-disabled="true"` rather than native `disabled`, preventing screen reader users from getting lost.
3. **Understandable:** Content and operation are clear. Inputs use explicit `<label>` tags and descriptive `aria-describedby` error announcements.
4. **Robust:** Code works across assistive technologies. We used semantic HTML `<form>`, `<input>`, and ARIA live regions compatible with NVDA and TalkBack.

---

### 9. Discuss the importance of semantic HTML in the context of accessibility.
Semantic HTML (`<header>`, `<main>`, `<label>`, `<button>`) communicates structural hierarchy and behavioral contracts to the browser's Accessibility Tree. Assistive technologies (like NVDA or TalkBack) rely entirely on this tree to announce roles, states, and keyboard shortcuts.

When developers use generic `<div>` or `<span>` tags with `onClick` handlers:
- Screen readers announce them merely as "text" or "clickable group", leaving visually impaired users unaware that an action is available.
- Browser keyboard navigation (Tab and Enter/Space activation) breaks unless manually re-engineered with `tabIndex` and key listeners.
Semantic HTML delivers accessibility natively without custom scripting.

---

### 10. Tell me about a time when you disagreed with what a customer wanted to build.
A private school proprietor wanted parents to input their National Identification Number (NIN), home residential address, and child blood group directly on the initial registration form.

I pushed back against this request. Under Nigeria Data Protection Act (NDPA) 2023 §24(1)(b), collecting non-essential personal identifiers violates data minimization principles. Furthermore, on low-cost smartphones over 3G networks, a 12-field registration form causes severe drop-off rates (>65%). 

I persuaded the school administration to restrict registration to 4 essential fields (Name, Email, Phone, Password) and defer secondary medical records to post-admission student onboarding.

---

### 11. How would you explain to a non-technical executive why their AI implementation is not performing as expected?
"Think of modern AI like an exceptionally fast, confident junior intern who has memorized millions of textbooks but has never worked a day inside your school. 

When you ask it to build a school registration system, it produces what *looks* like a finished form in seconds. But it builds for a polite, cooperative user with perfect vision on high-speed fiber internet. It does not know that Nigerian phone numbers lose their leading zero in standard number fields, that metered mobile data penalizes multi-page reloads, or that hackers bypass forms completely to attack the server directly.

AI generates syntax; engineers design architecture, boundary defenses, and user accessibility."

---

### 12. One of your validation rules wrongly blocks a category of legitimate user. Name the rule, name the users, and defend the trade-off or say you got it wrong.
Our full name validation rule requires at least two space-separated words, each at least 2 characters (`^[a-zA-Z]{2,}(?:\s+[a-zA-Z]{2,})+$`).

**Legitimate Users Blocked:**
1. Mononymic users (individuals with only one legal name, common in parts of Northern Nigeria).
2. Users whose surname or first name is a single letter (e.g., "O Ade").

**Defense of Trade-off:**
In Nigerian school administration, single-word names cause severe student fee reconciliation duplication (e.g., twelve different parents entering "Ibrahim"). Requiring surname and first name is a deliberate trade-off prioritizing database uniqueness and financial reconciliation over edge-case mononyms.

---

### 13. You sent a request directly to your own endpoint. Say exactly what happened and what it tells you about the eight rules you spent two days writing.
I sent a raw HTTP POST via Node.js to `/api/register` with no phone number and no NDPA terms acceptance. The server returned `HTTP 201 Created` and committed user `5d8e9b4e-76d3-4f6b-84d0-02dd50411ae5` to PostgreSQL.

This proves that all eight client-side rules (empty checks, length limits, phone regex, terms gates, ARIA states) are **client-side illusions that provide zero security**. They exist purely for user feedback and bandwidth conservation. An application is only as secure as the validation enforced on the server boundary.

---

### 14. Wrong-answer analysis: A candidate says: "I use strong client-side validation with regex on every field, disable the submit button until everything is valid, and sanitise all inputs in the browser before sending them. That covers the main injection and bad-data risks."
**Useless Parts:**
- "Sanitise all inputs in the browser before sending": Attackers bypass the browser entirely, rendering client sanitisation useless.
- "Disable submit button until valid": Headless HTTP requests do not click buttons.

**Actively Misleading:**
- "Covers the main injection risks": SQL injection, XSS, and command injection execute on the server or database. Client regex provides zero injection defense.

**The Candidate's Confusion:**
The candidate has confused **user experience scaffolding** with **defensive boundary security**, falsely assuming that the browser is an authenticated, tamper-proof execution boundary.

---

### Addendum: What is user enumeration, and how do error messages contribute to it?
User enumeration occurs when an attacker probes an authentication system to compile a list of valid user accounts by observing differential system responses.

Error messages directly facilitate enumeration when they distinguish between non-existent accounts and incorrect credentials (e.g., returning *"No account found with this email"* vs *"Incorrect password"*). An attacker can automate requests across millions of leaked email addresses, noting which return "incorrect password" to identify active parent/staff accounts.

**Remediation:** Always return generic, uniform responses on authentication failure: *"Invalid email or password."*
