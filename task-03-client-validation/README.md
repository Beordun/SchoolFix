# Task Three: The Form, Attacked from Both Sides

> **Technical Interviewer Overview (4-minute read)**  
> **Business:** [SchoolFix](docs/field-justification.md) — Mobile-First School Management & Tuition Reconciliation for Nigerian Private Primary and Secondary Schools.  
> **Key User:** Mrs. Folashade Adeleke (Parent / Level Coordinator) accessing student fee balance and attendance records over metered 3G/4G connectivity on a sub-$100 Android smartphone.  
> **Assessment Requirement:** Ship & Found Assessment Curriculum — Task 3.

---

## 1. What This Task Was

In Task 3, we engineered, audited, attacked, and defended the authentication and user onboarding layer of SchoolFix. Rather than accepting naive AI-generated form defaults that cater only to a sighted, cooperative user on fiber internet, we grounded every form interaction in the harsh reality of Nigerian mobile networks and regulatory compliance (NDPA 2023).

We collapsed multi-page authentication into a zero-latency Single Page Application (SPA) state machine, derived four rigorous categories of client validation, executed an in-depth WCAG 2.1 AA accessibility audit with real screen reader transcripts, and concluded by attacking our own application from both sides: through browser edge cases and around the browser via raw HTTP socket requests that completely bypassed client-side validation.

---

## 2. What We Built

### Written Architectural Documentation (`docs/`)
* [spa-rationale.md](docs/spa-rationale.md) — Detailed rationale for collapsing multi-page auth into an SPA state machine (`/auth?mode=login|register|reset`), saving 150–400 KB of metered mobile data per tab switch, paired with an honest trade-off analysis of when separate pages are superior.
* [field-justification.md](docs/field-justification.md) — Systematic evaluation of all registration fields (Name, Email, Phone, Password, Terms) against three foundational questions, documenting 4 rejected fields under data minimization principles.
* [validation-rules.md](docs/validation-rules.md) — Mathematical and operational derivations for 4 validation categories, what breaks without them, and the specific legitimate users they wrongly block (mononyms and diaspora numbers).
* [terms-note.md](docs/terms-note.md) — Statutory legal basis under Nigeria Data Protection Act (NDPA) 2023 §31 and §65 and CBN consumer protection regulations.
* [enumeration.md](docs/enumeration.md) — Eliminating format hints for school admission PINs, reducing the attack keyspace from $10^{12}$ to $10^4$ to prevent enumeration.
* [accessibility-audit.md](docs/accessibility-audit.md) — Field-by-field accessibility evaluation against 5 criteria, documenting 4 genuine problems fixed, complete with NVDA / TalkBack announcement transcripts before and after remediation.
* [client-side-is-not-security.md](docs/client-side-is-not-security.md) — Architectural whitepaper analyzing the forensic bypass of client validation, the 0 of 5 rules enforced on the direct endpoint request, and the Task 4 Zod defense roadmap.
* [rollback.md](docs/rollback.md) — Step-by-step documentation of the version control rollback experiment, analyzing `git reset --hard` vs `git revert` and reflog safety.
* [defects.md](docs/defects.md) — Mandatory defect log documenting 3 genuine production defects with exact `file:line` references, architectural root causes, and business cost analysis.
* [interview-answers.md](docs/interview-answers.md) — Thorough, viva-ready answers to all 14 technical interview questions ($\le 200$ words each) plus user enumeration addendum.

### Machine-Specific Evidence (`evidence/`)
* `01-page-count-before.txt` & `02-page-count-after.txt` — Route count proof showing reduction from 4 routes (`/`, `/login`, `/register`, `/reset-password`) to 2 routes (`/`, `/auth`).
* `03-url-states.png` — Three-panel composite capturing address bar synchronization across `?mode=login`, `?mode=register`, and `?mode=reset`.
* `04-form-switch-logs.txt` — Terminal logs proving instantaneous 0ms client-side mode switching with zero network document fetches and zero new sessions.
* `05-empty-field-error.png` — Visual proof of touched-state blur validation on empty inputs with SVG caution icons.
* `06-length-rule-blocking.png` — Verification of full name 2-token structure enforcement.
* `07-email-realtime-signup.png` & `08-email-on-submit-login.png` — Proof of asymmetrical email validation (real-time typing validation on signup vs. on-submit validation on login).
* `09-number-input-annoying.png` & `10-text-input-working.png` — Visual capture of HTML `<input type="number">` stripping leading zeroes vs. `<input type="text" inputMode="numeric">` preserving Nigerian phone formats.
* `13-button-hidden-version.png` & `14-button-disabled-version.png` — Demonstration of hidden submit button anti-pattern vs. accessible disabled state with explanation banner on click.
* `15-form-attack-results.txt` — Results of attacking the browser UI, documenting the discovery of the whitespace-only password defect.
* `16-direct-request-command-and-response.txt` — Terminal capture of raw HTTP POST to `POST /api/register`, receiving `HTTP 201 Created` and committing un-consented user `5d8e9b4e-76d3-4f6b-84d0-02dd50411ae5` to PostgreSQL.
* `17-commit-list-and-rollback.txt` — Git log and reflog verification of hard rollback to commit `171a725`, cleanly excising deliberate regression `ad4d501`.

---

## 3. What We Decided

1. **Query-Driven SPA Authentication (`/auth?mode=...`):** Collapsed isolated routes into a single client-side query state machine, eliminating multi-page cold reloads and conserving precious cellular bandwidth for Nigerian school staff.
2. **Text Input with Numeric InputMode for Phone Numbers:** Rejected standard HTML `type="number"` because it parses input as a float and strips the essential leading zero (`08031234567` $\rightarrow$ `8031234567`). Used `type="text" inputMode="numeric" pattern="[0-9]*"` to summon the numeric keypad while preserving leading zeroes.
3. **Retaining Disabled Buttons in Tab Order (`aria-disabled="true"`):** Native HTML `disabled` strips buttons from keyboard and screen reader tab orders, leaving blind users disoriented. We kept the button reachable, applied `aria-disabled="true"`, and wired click handlers to surface actionable remediation notices.
4. **Asymmetrical Email Validation:** Enforced real-time regex checking on registration to catch typos before costly email verification dispatches, but deferred login email checking to form submission to prevent premature nagging.
5. **Elimination of Sensitive Format Placeholders:** Removed structured format hints from student admission and bursar PIN fields, increasing the brute-force attack keyspace from $10^4$ to $10^{12}$.

---

## 4. The Attack and The Defeat

To prove that client-side validation is not security, we bypassed the browser entirely and dispatched a direct HTTP request via Node.js:

```bash
node -e "const http = require('http'); ... req.write(JSON.stringify({ fullName: 'Bypass Attacker', email: '...', password: 'PasswordWithSpaces123' })); req.end();"
```

* **Server Response:** `HTTP 201 Created`
* **Database Persisted:** User `5d8e9b4e-76d3-4f6b-84d0-02dd50411ae5` committed to PostgreSQL.
* **Client Rules Enforced:** **0 of 5 rules enforced.** The phone number was missing, and the legal NDPA terms checkbox was omitted entirely.

This forensic defeat confirmed that client-side checks exist purely for user guidance and network optimization. In **Task 4**, we establish true security at the server boundary using strict Zod schemas, slow Argon2id hashing, and rate limiting.

---

## 5. What We Got Wrong (Real Defects)

* **Whitespace Password Defect (`AuthCard.tsx:106`):** The client length check `password.length >= 8` omitted `.trim()`, allowing 8 space characters (`"        "`) to be accepted as a valid password.
* **Missing Server Terms Check (`route.ts:24`):** The registration API route extracted user data without validating `acceptedTerms: true`, allowing direct HTTP callers to bypass statutory NDPA consent requirements.
* **Number Input Leading Zero Loss (`AuthCard.tsx:422`):** Specifying `type="number"` on the phone input stripped the leading `0`, perpetually breaking Nigerian phone number validation and causing form lockouts.
