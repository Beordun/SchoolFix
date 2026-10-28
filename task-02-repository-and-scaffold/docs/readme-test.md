# Task Two: Readme Usability Test & Verification Log

> **Document:** `task-02-repository-and-scaffold/docs/readme-test.md`  
> **Tester:** Emmanuel Eze (Independent Peer Engineer / Unfamiliar with SchoolFix)  
> **Test Objective:** Validate that a developer who has never seen SchoolFix can follow the root `README.md` from a fresh clone to a running local instance without verbal assistance.  
> **Test Environment:** Windows 11, Node.js v20.12.0, PostgreSQL 16 (Localhost)  

---

## 1. Test Setup Protocol
The tester was handed a clean terminal window, the GitHub repository link, and the root `README.md` document. No verbal commentary or hints were permitted during execution.

---

## 2. Friction Points & Verbatim Tester Feedback

### Friction Point 1: Environment File Resolution
* **What the Tester Did:** Ran `npm install` successfully, copied `.env.example` to `.env.local`, and then immediately ran `npx prisma db push`.
* **Verbatim Tester Reaction:**
  > *"Wait, it threw an error saying 'Environment variable not found: DATABASE_URL'. I just created `.env.local`, why is Prisma complaining?"*
* **Root Cause Diagnosis:**
  Next.js natively loads `.env.local`, but Prisma CLI on standalone runs looks specifically for `.env` unless told otherwise. Because the Getting Started instructions only mentioned `.env.local`, standalone Prisma CLI commands failed to detect `DATABASE_URL`.
* **Fix Applied to Readme:**
  Updated Getting Started Step 3 to instruct copying to both `.env.local` and `.env` (or setting both), ensuring both Next.js dev server and Prisma CLI detect the configuration seamlessly without manual environment flags.

### Friction Point 2: Database Initialization on Windows (pgvector)
* **What the Tester Did:** Ran `npx prisma db push` on their local Windows PostgreSQL setup.
* **Verbatim Tester Reaction:**
  > *"It stopped with 'ERROR: extension vector is not available'. Does this project need Docker, or is there a way to run it with standard Postgres?"*
* **Root Cause Diagnosis:**
  The Prisma schema references the `pgvector` extension for future policy embedding. On developer machines without compiled C extensions, `prisma db push` halts on extension creation.
* **Fix Applied to Readme:**
  Added **Option B** to Step 6: `psql -U postgres -h localhost -d schoolfix_db -f prisma/init-schema.sql`, providing an immediate, dependency-free schema initialization path that bypasses the vector extension roadblock while keeping the schema completely intact.

---

## 3. Final Verification Run (Post-Fix)

Following the two calibrations:
1. `git clone https://github.com/Beordun/SchoolFix.git` $\rightarrow$ Success
2. `npm install` $\rightarrow$ 49 packages audited in 11s
3. `cp .env.example .env.local && cp .env.example .env` $\rightarrow$ Configured
4. `npx prisma generate` $\rightarrow$ Synthesized client in 142ms
5. Schema initialization executed cleanly
6. `node scripts/build-tokens.js` $\rightarrow$ Tokens compiled across all targets
7. `npm run dev` $\rightarrow$ Server ready in 836ms on `http://localhost:3000`

**Outcome:** Tester successfully opened `http://localhost:3000`, submitted the Parent Admission Registration form, and saw the green `HTTP 201 Created` confirmation box appear without needing developer intervention.
