# Task Two: Scaffolding Prompt Documentation

---

## 1. Candidate First Draft (Initial Version)

```markdown
# Scaffolding Prompt: SchoolFix Foundation Setup

## Role and Goal
You are a Staff Infrastructure and Security Software Engineer. 
Your goal is to scaffold the initial foundation for "SchoolFix"—a mobile-first school management web application designed for private primary and secondary schools in Africa.

You must build ONLY the project foundation, dependencies, configuration files, and a minimal, responsive landing home screen. Do NOT attempt to build authentication flows, attendance registers, report cards, or fee portals in this pass. Scaffolding takes 30 to 45 minutes when done properly.

---

## Operating Instructions & Mandatory Process (Stop & Propose Rule)
Before writing or executing any code, you must execute the following sequence:

1. **Context Ingestion:**
   - Read `task-02-repository-and-scaffold/docs/prd.md` completely.
   - Read our design system files:
     - `task-01-design-system/evidence/06-tokens-complete.json`
     - `task-01-design-system/docs/colour-roles.md`
     - `task-01-design-system/docs/type-scale.md`
   - These files represent the single source of truth. If any requirement conflicts between documents, stop and ask me directly rather than guessing.

2. **The Approval Gate (DO NOT SKIP):**
   - Summarize your exact execution plan.
   - List every file and folder you intend to create.
   - Explicitly list every technical assumption you are making. If you make zero assumptions, explain what you verified to make that determination.
   - **WAIT for my explicit approval before writing any code or generating files.**

---

## Technical Stack & Architectural Constraints
- **Framework:** Next.js (App Router, latest stable)
- **Language:** TypeScript (strict mode enabled in `tsconfig.json`)
- **Database & ORM:** PostgreSQL with Prisma ORM (include `pgvector` extension flag in `schema.prisma`)
- **Validation:** Zod (installed for boundary data validation)
- **Styling:** CSS Modules or Tailwind CSS wired strictly to our CSS custom properties generated from the design system tokens.

---

## Non-Negotiable Engineering & Security Rules

### 1. Token & Design System Enforcement
- Under NO circumstances may you write raw hex color codes (`#...`), hardcoded pixel margins/paddings, or arbitrary font styles into components or CSS rules.
- You must exclusively reference the semantic CSS variables derived from our design system (e.g., `var(--color-primary)`, `var(--color-surface)`, `var(--font-headline-large)`).
- Typography must map directly to our 15 defined styles. Button padding must use `rem` units with explicit corner radii.

### 2. Directory & Execution Integrity
- **Nested Folder Prohibition:** Create all project configurations and source trees directly in the current working root directory. Do NOT create an inner folder like `/schoolfix/schoolfix/`.
- Verify the working directory path before running initialization commands.

### 3. Database & Migration Propose-and-Stop Rule
- Configure `prisma/schema.prisma` with the exact models specified in Section 8 of `prd.md` (`User`, `Session`, `ClassArm`, `TeacherClassAssignment`, `FeeSchedule`, `Student`, `Attendance`, `Assessment`, `Payment`, `PaymentAttempt`, `DocumentChunk`).
- Ensure foreign keys on financial models (`Payment`, `PaymentAttempt`) strictly enforce `onDelete: Restrict`.
- **CRITICAL:** Do NOT run `prisma migrate dev` or execute automated database migrations. You may only generate the Prisma client (`prisma generate`) and validate schema syntax.

### 4. Security & Zero-Trust Baseline
- **Zero Secrets Committed:** Never generate or commit API keys, plaintext database passwords, or JWT secrets to repository files.
- Create a sanitized `.env.example` file containing key names with empty or dummy values (e.g., `DATABASE_URL=""`, `SESSION_SECRET=""`). Add `.env` and `.env.local` to `.gitignore` immediately.
- Ensure all public-facing HTTP headers include hardened baseline security configurations:
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`

### 5. Information Design for the Home Screen
The minimal home screen must include:
- A dynamic page title in `<head>` reflecting the route ("SchoolFix — Attendance & Tuition Clarity").
- Meta description under 10 words: "Mobile-first school records and fee reconciliation for African schools."
- Valid Open Graph tags (`og:title`, `og:description`, `og:type`).
- Responsive viewport meta tag.
- Visual body: Main headline constrained with a max-width to wrap deliberately, responsive type scaling using `clamp()`, and a single unified call-to-action button linking to `/auth?mode=login` (no split login/signup confusion).
- Pointer cursors and visible hover states on all interactive elements.

---

## Expected Delivery for this Step
1. Output your comprehensive summary plan and stated assumptions.
2. Provide the complete directory tree of files to be created.
3. Pause and wait for my instruction before proceeding to file creation.
```

---

## 2. Tightened Final Version (Strengthened for Agent Compliance)

```markdown
# Scaffolding Prompt: SchoolFix Foundation Setup (Final Tightened Specification)

## Role and Mandatory Operating Boundary
You are a Staff Infrastructure and Security Software Engineer. Your sole mission is to scaffold the foundation for **SchoolFix**, a mobile-first school administration and fee reconciliation platform for Nigerian private schools.

**STRICT SCOPE BOUNDARY:** 
You must build ONLY the project foundation, package dependencies, runtime configuration, and a minimal responsive landing home screen. Do NOT attempt to implement authentication controllers, attendance registers, report cards, or fee payment flows in this pass. Any attempt to write application business logic before foundation verification will result in immediate rejection. Scaffolding takes 30 to 45 minutes when done properly.

---

## Step-by-Step Protocol & Approval Gate (The Stop-and-Propose Rule)

Before creating or editing any code or configuration files, you must execute this sequence in order:

### 1. Ingest Context Files (The Only Source of Truth)
Read and strictly adhere to:
* `task-02-repository-and-scaffold/docs/prd.md` (Product Requirements, Architecture, Schema)
* `task-01-design-system/tokens.css` & `task-01-design-system/evidence/06-tokens-complete.json` (Design Tokens)
* `task-01-design-system/docs/colour-roles.md` (Semantic Roles & WCAG Ratios)
* `task-01-design-system/docs/type-scale.md` (Typography Scale & 1.4x Multipliers)

**Conflict Rule:** If any instruction in this prompt or between context files appears to conflict, you must stop, state the discrepancy explicitly, and ask for clarification rather than assuming or resolving it silently.

### 2. Propose Before Execution (Mandatory Approval Gate)
Respond first with:
1. **Summary of Understanding:** A concise summary demonstrating you understand the business context, hardware constraints (sub-$100 Android phones, 3G data), and architectural model (CP system with client-edge caching).
2. **Execution Plan:** Step-by-step breakdown of how the foundation will be initialized.
3. **Target Directory Tree:** An exact list of every file and folder you intend to create or touch.
4. **Explicit List of Assumptions:** Enumerate every technical assumption you are making. If you claim to make zero assumptions, explicitly describe what you verified in the context files to eliminate ambiguity.
5. **HALT:** End your response and explicitly wait for human approval before executing any file operations or shell commands.

---

## Technical Stack & Architectural Standards
* **Framework:** Next.js (App Router, latest stable LTS, standalone build support).
* **Language:** TypeScript with `strict: true`, `noImplicitAny: true`, and strict null checks in `tsconfig.json`.
* **Database & ORM:** Prisma ORM connected to PostgreSQL. The `schema.prisma` must include the `pgvector` extension flag and match the 11 models in PRD Section 8 (`User`, `Session`, `ClassArm`, `TeacherClassAssignment`, `FeeSchedule`, `Student`, `Attendance`, `Assessment`, `Payment`, `PaymentAttempt`, `DocumentChunk`).
* **Financial Integrity:** Strict foreign key constraints (`onDelete: Restrict`) on all financial ledgers (`Payment`, `PaymentAttempt`).
* **Validation:** Zod library installed for boundary contract enforcement.
* **Styling & Tokens:** Plain CSS Modules / Vanilla CSS importing `tokens.css`. Zero hardcoded hex colors, zero arbitrary line-heights, zero arbitrary border-radii.

---

## Prohibited Behaviors & Automatic Fail Conditions
1. **NO Nested Directory Scaffolding:** You must scaffold directly into the working directory root. Do NOT create an internal nested folder (e.g., `SchoolFix/SchoolFix/` or `SchoolFix/app/`). Verify your working directory before running any initialization.
2. **NO Autonomous Migrations:** You are strictly forbidden from running `prisma migrate dev` or pushing schema changes to a live database. You may only configure `schema.prisma` and run `prisma generate` to synthesize types. Migrations must be run deliberately by the human engineer.
3. **NO Raw Style Values:** Writing `#4B0082`, `#111827`, or any raw hex, rgb, or unscaled pixel dimension into component styles is an automatic fail. All styling must consume semantic CSS variables (`var(--color-primary)`, `var(--shadow-soft)`, `var(--type-headline-large-size)`).
4. **NO Committed Secrets:** Never output or commit real API credentials, database passwords, or JWT secrets. Provide a sanitized `.env.example` with empty keys and ensure `.env` and `.env.local` are placed in `.gitignore`.

---

## Information Design Requirements for the Minimal Home Screen
The minimal home screen must be an exemplary demonstration of information design:
1. **Dynamic Page Title:** Dynamic route title (`SchoolFix — Attendance & Tuition Clarity`).
2. **Meta Description:** Concise, compelling tagline strictly under 10 words (`"Mobile-first school records and fee reconciliation for African schools."`).
3. **Metadata & Open Graph:** Full Open Graph tags (`og:title`, `og:description`, `og:type`, `og:image`).
4. **Deliberate Typography Shape:** Main headline must utilize CSS `max-width` and `clamp()` to produce a balanced, deliberate wrap that directs visual attention on mobile viewports.
5. **Unified Action Hierarchy:** A single primary action button routing to `/auth?mode=login`. Do not offer a split choice between login and registration for new visitors.
6. **Padding in rem Units:** Buttons must use proportional `rem` padding and defined corner radius (`border-radius: 8px`).
7. **Interactive Feedback:** Visible hover transitions and explicit `cursor: pointer` on all interactive targets.

---

## Post-Scaffold Self-Audit Deliverable
Once approved and after generating files, you must output:
1. **Files Created List:** A complete list of every file created and modified.
2. **Stated Assumptions Audit:** A review confirming whether any new assumptions arose during execution.
3. **Self-Audit Checklist:** A verified checklist auditing your output line-by-line against every constraint in this prompt.
```

---

## 3. Paragraph on What Changed Between Drafts and Why

The initial draft written by the candidate captured the core engineering requirements well, but left subtle procedural loopholes that AI coding agents frequently exploit to cause project drift. In the tightened final version, three critical enhancements were introduced:

First, **the Approval Gate and Halt Condition were elevated from a guideline to a strict protocol barrier**; the prompt now explicitly mandates that the agent must cease generation after outputting its summary, planned directory tree, and stated assumptions, forbidding it from generating code until explicit human sign-off is granted. 

Second, **the eight evaluation criteria from the syllabus were structured into enforceable boundaries**: the prohibition against running automated migrations was fortified into a formal "Propose-and-Stop" rule, the nested directory failure mode was highlighted as an automatic fail condition, and the Information Design specifications (max-width headline wrapping, 10-word meta description, unified CTA) were formalized into unambiguous acceptance criteria.

Finally, **a mandatory Post-Scaffold Self-Audit was added**, requiring the agent to audit its own output against every prompt constraint upon completion. This forces the model to verify token compliance and file boundaries rather than assuming completion, directly preventing the ungrounded scaffolding mistakes common to agentic builds.
