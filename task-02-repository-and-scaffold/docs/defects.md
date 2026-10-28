# Real Engineering Defects Log — Task 2

> **Standard:** Rule 5 & Assessment Front Matter  
> **Requirement:** Document real defects encountered during implementation with exact `file:line` references, why they happened, and their production cost if unpatched. Zero fabricated issues.

---

## Defect 1: Standalone Prisma CLI vs. Next.js Cascading Environment Resolution
- **File Reference:** [`scripts/inspect-db.js:1`](file:///c:/Users/DT001/Desktop/SchoolFix/scripts/inspect-db.js#L1-L6) & [`README.md:43`](file:///c:/Users/DT001/Desktop/SchoolFix/README.md#L43-L48)
- **Symptom:**  
  Running standalone database inspection scripts (`node scripts/inspect-db.js`) or Prisma CLI commands (`npx prisma studio`, `npx prisma db push`) aborted with:
  ```text
  PrismaClientInitializationError: Environment variable not found: DATABASE_URL
  Unable to init PersistenceStore undefined
  ```
- **Why It Happened:**  
  Next.js natively supports cascading environment files (`.env.local` overriding `.env`). However, standalone Prisma CLI and Node.js child processes do not read `.env.local` by default; they look exclusively for `.env` unless explicitly pointed via `--env-path`. Because our initial setup instructions only provisioned `.env.local`, all external Prisma diagnostic and inspection tools failed to resolve the database connection.
- **Production Cost If Unpatched:**  
  In a CI/CD pipeline or during emergency bursar ledger reconciliation, automated migration tasks and database monitoring tools would fail to execute. New developers joining the engineering team would be unable to run local diagnostics, resulting in lost hours and developers attempting risky manual workarounds.
- **The Fix:**  
  1. Updated `scripts/inspect-db.js` to explicitly load `.env.local`: `require('dotenv').config({ path: '.env.local' });`.
  2. Maintained a synchronized, git-ignored `.env` file for Prisma CLI compatibility.
  3. Calibrated root [`README.md`](file:///c:/Users/DT001/Desktop/SchoolFix/README.md) Getting Started instructions and documented the exact failure mode in [`task-02-repository-and-scaffold/docs/readme-test.md`](file:///c:/Users/DT001/Desktop/SchoolFix/task-02-repository-and-scaffold/docs/readme-test.md).

---

## Defect 2: Platform-Specific Extension Failure (`pgvector` on Windows PostgreSQL)
- **File Reference:** [`prisma/schema.prisma:102`](file:///c:/Users/DT001/Desktop/SchoolFix/prisma/schema.prisma#L102-L113) & [`prisma/init-schema.sql:1`](file:///c:/Users/DT001/Desktop/SchoolFix/prisma/init-schema.sql#L1-L15)
- **Symptom:**  
  Running database initialization with Prisma against local Windows PostgreSQL 16 aborted with:
  ```text
  ERROR: extension "vector" is not available
  DETAIL: Could not open extension control file "C:/Program Files/PostgreSQL/16/share/extension/vector.control": No such file or directory.
  ```
- **Why It Happened:**  
  PRD §8.2 defines model `DocumentChunk` utilizing `Unsupported("vector(1536)")` for AI policy search. The agent assumed Linux container feature parity on a bare-metal Windows development host, where `pgvector` binaries were not pre-compiled into PostgreSQL's extensions directory.
- **Production Cost If Unpatched:**  
  Complete block on all relational database writes. Because database migrations fail atomically when an extension is missing, the core school attendance and fee reconciliation tables (`User`, `Student`, `Payment`, `Attendance`) could not be created, leaving the development server operating against an empty database.
- **The Fix:**  
  Authored [`prisma/init-schema.sql`](file:///c:/Users/DT001/Desktop/SchoolFix/prisma/init-schema.sql) which cleanly provisions all 10 core non-vector tables, indexes, and foreign key ledger constraints (`onDelete: Restrict`). Vector search capabilities are safely decoupled until deployment to containerized Linux environments (`ghcr.io/pgvector/pgvector:pg16`).

---

## Defect 3: Local Connection String & Password Exposure in Diagnostic Scripts
- **File Reference:** [`scripts/reproduce-db-break.js:13`](file:///c:/Users/DT001/Desktop/SchoolFix/scripts/reproduce-db-break.js#L13) & [`scripts/inspect-db.js:5`](file:///c:/Users/DT001/Desktop/SchoolFix/scripts/inspect-db.js#L5)
- **Symptom:**  
  During rapid manual authoring of Step 6 verification scripts, a real development database password was hardcoded into local test files.
- **Why It Happened:**  
  Diagnostic scripts were authored quickly to test the connection breakage without routing through configuration abstractions.
- **Production Cost If Unpatched:**  
  **Catastrophic Security Leak & Automatic Assessment Fail.** A live database credential committed to git history allows any public observer to connect to the database, dump student records, or manipulate financial ledgers. Even if reverted in a subsequent commit, git history retains all objects permanently.
- **The Fix:**  
  Enacted the `security-leak-prevention` skill. All diagnostic scripts were refactored to read `process.env.DATABASE_URL` with dummy fallback strings (`dummy_password`). Added mandatory pre-commit regex scanning (`git diff --cached | Select-String -Pattern "password|secret|key|token|flwseck|database_url"`) to ensure zero live secrets are ever staged.
