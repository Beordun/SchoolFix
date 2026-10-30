# Database Migrations Architecture & The Zero-Downtime Rule

> **Product:** SchoolFix (Mobile-First School Management & Tuition Reconciliation)  
> **Database Engine:** PostgreSQL 16 + Prisma ORM  
> **Step Reference:** Task 4, Step 3 — Migrations, Run Deliberately  
> **Evidence References:**  
> - [`evidence/03-initial-migration.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-04-server-security/evidence/03-initial-migration.txt) (Initial schema migration)  
> - [`evidence/04-required-column-failure.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-04-server-security/evidence/04-required-column-failure.txt) (Required column failure on populated table)  
> - [`evidence/05-required-column-three-steps.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-04-server-security/evidence/05-required-column-three-steps.txt) (Expand $\rightarrow$ Backfill $\rightarrow$ Contract)  
> - [`evidence/06-drift-error.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-04-server-security/evidence/06-drift-error.txt) (Intentional schema drift runtime error)  

---

## 1. The Core Principle: Forward-Only Migrations

In relational database engineering, production databases are persistent, living state machines. Unlike ephemeral application servers or stateless frontend bundles that can be re-deployed or destroyed at will, database tables hold immutable historical transactions, legal custody records, and parental identities.

### Why You May Never Edit a Past Migration
1. **Checksum Ledger Corruption:**  
   Prisma tracks applied migrations in the `_prisma_migrations` metadata table using cryptographic SHA-256 checksums (`checksum` column). If an engineer retroactively modifies an applied SQL migration file:
   - Prisma detects the mismatch between the file checksum and the database record (`Migration checksum mismatch`).
   - The migration engine halts, marking the database as corrupt and demanding a full schema reset (`prisma migrate reset`), which drops all tables and destroys production data.
2. **Environment Divergence & Split-Brain State:**  
   If migration `20261029153928_init` was executed on staging and production, editing that migration file locally means developers now run a completely different DDL than production. Downstream queries tested locally fail in staging because the physical schemas have diverged.
3. **The Immutability Law:**  
   **All schema alterations must be forward-only.** If a column was incorrectly named, added with the wrong constraints, or needs deletion, the only acceptable architectural response is to generate a new, sequential migration (`ALTER TABLE ...`) that moves the state machine forward.

---

## 2. The Three-Step Migration Pattern (Zero-Downtime Safe Column Addition)

Adding a `NOT NULL` (required) column to an existing table with live data is one of the most common causes of production downtime and deployment failures.

### The Problem: Immediate Constraint Violation
In our live experiment recorded in [`evidence/04-required-column-failure.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-04-server-security/evidence/04-required-column-failure.txt), we seeded an existing user (`Folashade Adeleke`, ID `51e2ccc9-8849-464b-a8a8-1ab18ab084e0`) and attempted to introduce a required National Identification Number column (`nin String` without a default value) in a single step.

The PostgreSQL engine and Prisma immediately rejected the migration:
```text
Error: 
⚠️ We found changes that cannot be executed:
  • Step 1 Added the required column `nin` to the `User` table without a default value. 
    There are 1 rows in this table, it is not possible to execute this step.
```

If executed blindly on PostgreSQL via raw DDL (`ALTER TABLE "User" ADD COLUMN "nin" TEXT NOT NULL;`), the database engine attempts to scan every existing row. Because existing rows contain `NULL` for the new column, the database aborts the transaction with error code `23502 (not_null_violation)`. On a table with 50,000 parent records, attempting this locks the table, stalls active web workers, and takes the entire tuition portal offline.

### The Solution: Expand $\rightarrow$ Backfill $\rightarrow$ Contract

To safely introduce a required column without downtime or data corruption, we executed the three-step pattern documented in [`evidence/05-required-column-three-steps.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-04-server-security/evidence/05-required-column-three-steps.txt):

```text
[Step 1: EXPAND]      ALTER TABLE "User" ADD COLUMN "nin" TEXT;
                             │  (Column is nullable; existing and new writes succeed)
                             ▼
[Step 2: BACKFILL]    UPDATE "User" SET "nin" = <generated_nin> WHERE "nin" IS NULL;
                             │  (Background worker batches updates until 0 NULLs remain)
                             ▼
[Step 3: CONTRACT]    ALTER TABLE "User" ALTER COLUMN "nin" SET NOT NULL;
                                (Column is locked into strict required constraint)
```

1. **Step 1: Expand (Nullable Column Creation)**  
   - Update `schema.prisma` with `nin String?` (optional).
   - Generate and apply migration `20261029160541_add_optional_nin`.
   - **SQL Applied:** `ALTER TABLE "User" ADD COLUMN "nin" TEXT;`
   - *Result:* Existing rows remain valid with `NULL`. Application code continues writing records without disruption.

2. **Step 2: Backfill (Asynchronous Data Population)**  
   - Run background script [`scripts/backfill-nin.js`](file:///c:/Users/DT001/Desktop/SchoolFix/scripts/backfill-nin.js).
   - In Nigerian school administration, student/parent records lacking an official government NIN are flagged, or assigned temporary system-generated reconciliation tokens (`NIN-aca2b467f2c`) pending manual parent documentation submission.
   - The script verified that 100% of existing rows were populated and confirmed `0 rows contain NULL`.

3. **Step 3: Contract (Enforce NOT NULL Constraint)**  
   - Update `schema.prisma` with `nin String` (required).
   - Generate and apply migration `20261029160708_make_nin_required`.
   - **SQL Applied:** `ALTER TABLE "User" ALTER COLUMN "nin" SET NOT NULL;`
   - *Result:* Because zero rows contain `NULL`, the constraint is applied instantaneously ($O(1)$ on PostgreSQL 16) without holding exclusive table locks or failing transactions.

---

## 3. Schema Drift: Anatomy, Detection & Production Risk

Schema drift occurs when the application codebase expects a schema structure that does not match the physical database catalog.

### Intentional Drift Experiment (`evidence/06-drift-error.txt`)
In Step 3 Part 3, we deliberately induced schema drift:
1. Added `emergencyContact String?` to `model User` in `schema.prisma`.
2. Ran `npx prisma generate` to update the TypeScript client bindings.
3. Executed [`scripts/test-drift.js`](file:///c:/Users/DT001/Desktop/SchoolFix/scripts/test-drift.js) without running a database migration.

### The Resulting Failure
The Node.js runtime threw an unhandled exception:
```text
Invalid `prisma.user.findFirst()` invocation:
The column `User.emergencyContact` does not exist in the current database.
```

### Why Drift Is Insidious
- **Type Safety False Sense:** `tsc` (TypeScript compiler) reports 0 errors because the generated `@prisma/client` types define `emergencyContact` as valid.
- **Silent Failures in CI/CD:** If unit tests mock the database or run against an ephemeral SQLite database rather than the real PostgreSQL migration chain, tests will pass in CI but fail immediately upon deployment to production.
- **Remediation:** CI pipelines must enforce `prisma migrate status` or `prisma migrate deploy` prior to application boot, verifying that the physical database migration version matches the compiled client.

---

## 4. Human-Governed vs. Autonomous Agent Migrations (Rule 4 Justification)

In SchoolFix's authoritative operating standard ([`AGENTS.md`](file:///c:/Users/DT001/Desktop/SchoolFix/AGENTS.md)), **Inviolable Rule 4** explicitly prohibits autonomous agent migrations:
> *"The agent is strictly forbidden from running `npx prisma migrate dev`, `prisma db push`, or executing automated migrations on live databases. Migrations must be run deliberately by the human engineer with recorded command output."*

### Why This Rule Is Non-Negotiable in Production Systems
1. **Interactive Reset Catastrophes:**  
   When Prisma encounters a migration conflict or drift, it interactively prompts: `We need to reset the "public" schema at "localhost:5432". Do you want to continue? All data will be lost. (y/N)`.  
   An autonomous agent or non-interactive script running without terminal guards may pass `--force` or accidentally pipe `yes`, dropping all student academic ledgers and historical tuition receipts.
2. **Locking & Transaction Exhaustion:**  
   Certain DDL commands (such as table rewrites or index builds without `CONCURRENTLY`) require an `ACCESS EXCLUSIVE` lock on PostgreSQL. An autonomous agent running migrations during school operating hours (e.g., morning attendance roll call or end-of-term tuition reconciliation) can lock the `Attendance` or `Payment` tables, causing connection pool exhaustion (`503 Service Unavailable`).
3. **Accountability & Audit Trails:**  
   Statutory compliance (such as the Nigerian Data Protection Act 2023 and FIRS accounting standards) mandates that database schema mutations must be attributed to an authorized human engineer who reviewed the SQL changes, verified backfill completion, and verified rollback contingencies.
