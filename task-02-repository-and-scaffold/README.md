# Task 2: Repository Scaffolding, Diagnostics & Information Design

> **Audience:** Technical Interviewer / Hiring Manager (4-minute read)  
> **Product:** SchoolFix — Mobile-First School Management & Tuition Reconciliation  
> **Target Market:** Nigerian Private Primary and Secondary Schools  
> **Repository:** [Beordun/SchoolFix](https://github.com/Beordun/SchoolFix) | **PR Link:** [Pull Request #1](https://github.com/Beordun/SchoolFix/pull/1)

---

## 1. What This Task Was
Task 2 tested taking an enterprise codebase from zero using an AI agent under strict human engineering governance: scaffolding from grounded context files, managing local development servers, diagnosing intentional and real environmental failures, proving persistent database writes versus "false success" UI patterns, and establishing production-grade Git branching and information design.

---

## 2. What We Built
1. **Grounded Scaffolding (`docs/scaffold-prompt.md`, `evidence/01` & `02`):** Directed the agent using a strict Stop-and-Propose approval gate to build only the foundation (Next.js 14 App Router, TypeScript, Prisma ORM, vanilla CSS design tokens) without unbounded feature sprawl.
2. **Database Persistence & Diagnostic Verification (`evidence/11` to `13`):** Configured PostgreSQL on port 5432 with 10 core relational tables. Built `app/api/register/route.ts` with Zod schema validation and Argon2id hashing, proving writes with explicit HTTP `201 Created` status codes, unique UUIDs, and sequential timestamps.
3. **The False-Success Investigation (`docs/false-success.md`):** Severed the database connection to port 5433, proving the system rejects writes with HTTP `503 Service Unavailable` rather than masking failures behind fraudulent client-side success screens.
4. **Git Branching, PR & Unmerged Deletion (`evidence/15-git-log-graph.txt`):** Checked out `feature/information-design`, implemented Step 10, opened Pull Request #1, merged into `main` via non-fast-forward merge, and created/deleted experimental branch `feature/discarded-badge` unmerged.
5. **Information Design & Responsive Typography (`docs/information-design.md`, `evidence/16` to `20`):** Handcrafted an SVG favicon, dynamic route `<title>` switching (`/` vs `/auth`), `<10-word` tagline, collapsed cognitive choices into a unified portal gateway, deliberate `max-width: 620px` headline wrap, and mathematical `clamp()` typography scaling across $360\text{px}$ (sub-$100 Android) to $1280\text{px}$ desktop.

---

## 3. What We Decided
- **Strict CP Distributed Profile:** We chose strict consistency (PostgreSQL with `onDelete: Restrict`) over eventual consistency (NoSQL). In Nigerian private schools, tuition disputes lead to legal action; phantom writes or corrupted ledger totals are intolerable.
- **Client Cache with `PENDING_SYNC`:** For offline classroom attendance on prepaid 3G networks, we cache mutations in `localStorage` with explicit dirty flags, rejecting partition writes at the server boundary with HTTP 503 until reconnected.
- **Unified Portal Gateway:** Collapsed competing "Teacher Login" and "Parent Sign In" buttons into a single primary action (`Enter School Portal →`). Mobile visitors should not be forced into a branching decision before understanding the product.
- **Padding in `rem` Units:** Sized buttons with `rem` units and a `2.75rem` ($44\text{px}$) minimum touch target, ensuring full WCAG 2.5.5 compliance and preventing text clipping under Android system font scaling.

---

## 4. What We Got Wrong (Real Engineering Defects)
1. **Prisma CLI vs Next.js Environment Resolution (`package.json:10` / `scripts/inspect-db.js:1`):** Next.js reads `.env.local`, but Prisma CLI standalone commands look strictly for `.env`. Early setup scripts failed with `Environment variable not found: DATABASE_URL`. Fixed by loading `.env.local` explicitly and synchronizing `.env`.
2. **Platform Extension Crash (`prisma/schema.prisma:102`):** Windows PostgreSQL lacked pre-compiled `pgvector` binaries, crashing initial migrations. Resolved by creating `prisma/init-schema.sql` to initialize all 10 non-vector relational tables and isolating vector search for Linux containers.
3. **Password Exposure in Debug Scripts (`scripts/inspect-db.js:5`):** Ad-hoc test scripts initially contained literal local connection strings. Caught during pre-commit audit and sanitized to read `process.env.DATABASE_URL` with dummy credentials.

---

## Deliverables & Evidence Index

```text
task-02-repository-and-scaffold/
├── README.md                                  # This 4-minute technical summary
├── docs/
│   ├── scaffold-prompt.md                     # Scaffolding prompt first & final versions
│   ├── model-choices.md                       # Antigravity vs fast models analysis
│   ├── performance-note.md                    # Cold start (836ms) vs first load (1,120ms) analysis
│   ├── false-success.md                       # False-success break analysis & prevention
│   ├── readme-test.md                         # External tester verbatim log & setup fixes
│   ├── working-tree.md                        # Working tree analysis & failure modes
│   ├── information-design.md                  # Browser head, cognitive design & clamp typography
│   ├── defects.md                             # 3 real defects with file:line and production costs
│   └── interview-answers.md                   # 15 technical viva interview answers
└── evidence/
    ├── 01-agent-plan.txt                      # Scaffolding plan before approval
    ├── 02-files-created.txt                   # Inventory of created files
    ├── 03-server-start.txt                    # Server boot logs with port 3000
    ├── 04-first-load.txt                      # First load HTTP status and latency
    ├── 05-nested-folder-error.txt             # Break 1: Nested directory failure
    ├── 06-nested-folder-fixed.txt             # Recovery 1: Rescaffold & cd fix
    ├── 07-port-conflict.txt                   # Break 2: Port 3000 collision
    ├── 08-port-conflict-resolved.txt          # Recovery 2: PID kill & recovery
    ├── 09-404-error.txt                       # Break 3: Missing route 404
    ├── 10-404-resolved.txt                    # Recovery 3: Route repair & verification
    ├── 11-write-succeeded-logs.txt            # DB write logs with HTTP 201 Created
    ├── 12-database-rows.png                   # Database inspector row persistence proof
    ├── 13-write-failed-logs.txt               # Inverse broken connection HTTP 503 logs
    ├── 14-working-tree-drawing.jpg            # Hand-drawn working tree with handwritten date
    ├── 15-git-log-graph.txt                   # Git log graph, PR #1, and unmerged deletion
    ├── 16-head-route-one.png                  # Route 1 rendered <head> metadata
    ├── 17-head-route-two.png                  # Route 2 rendered <head> dynamic title
    ├── 18-heading-wrap-bad.png                # Unconstrained bad headline wrap
    ├── 19-heading-wrap-good.png               # Deliberate 2-line headline wrap
    └── 20-responsive-three-widths.png         # Responsive clamp() scaling across 360/768/1280px
```
