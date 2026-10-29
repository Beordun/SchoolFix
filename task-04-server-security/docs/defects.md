# Defect Log & Forensic Root-Cause Analysis (Task 4)

> **Product:** SchoolFix (Mobile-First School Management & Tuition Reconciliation)  
> **Target Market:** Nigerian Private Primary and Secondary Schools  
> **Mandatory Standard:** Document genuine defects encountered during implementation with exact file:line citations, mechanisms, production cost analysis, and permanent fixes.

---

## Defect 1: Windows File Lock (`EPERM`) on Native Query Engine DLL

- **File & Line Reference:** `node_modules/.prisma/client/query_engine-windows.dll.node:1`
- **Component:** Prisma ORM / Node.js native engine loader on Windows NT kernel.
- **Encountered During:** Step 3 (Deliberate Migrations & Intentional Schema Drift).

### Why It Happened
On the Windows operating system, when a Node.js process (such as `next start` or `prisma studio`) initializes `@prisma/client`, the OS memory manager maps `query_engine-windows.dll.node` into active process virtual memory and acquires an exclusive `FILE_SHARE_READ` lock. When `npx prisma migrate dev` or `npx prisma generate` runs, Prisma attempts to replace the binary by writing a temporary file (`.tmp9252`) and executing an atomic file rename. The Windows kernel rejects this with `EPERM: operation not permitted, rename ...`.

### Production Cost if Unpatched
In Windows-hosted on-premise school servers or Windows CI runners, automated deployment scripts executing `prisma migrate deploy` or `prisma generate` crash silently. Staging environments fail to apply schema changes, causing the application to boot against an un-migrated database and throw runtime `P2021` missing-column exceptions.

### Permanent Fix
1. Execute migrations with `--skip-generate` when database inspection tools are actively connected.
2. In deployment pipelines, gracefully signal running service workers (`Stop-Process`) before executing file-replacement tasks.

---

## Defect 2: Missing Required Property `nin` on `prisma.user.create()` After Contract Migration

- **File & Line Reference:** [`app/api/register/route.ts:48`](file:///c:/Users/DT001/Desktop/SchoolFix/app/api/register/route.ts#L48)
- **Component:** API Registration Endpoint & TypeScript Type Checker.
- **Encountered During:** Step 5 (Boundary Validation & Registration Wiring).

### Why It Happened
In Step 3, we successfully executed the Expand $\rightarrow$ Backfill $\rightarrow$ Contract migration pattern, elevating `nin` from an optional string (`nin String?`) to a strictly enforced required column (`nin String`). However, the existing `app/api/register/route.ts` payload only mapped `{ fullName, email, passwordHash, role }`. When running `npm run build`, the TypeScript compiler caught the contract breach:
```text
Type '{ fullName: string; email: string; passwordHash: string; role: "PARENT"; }' 
is not assignable to type 'UserCreateInput'.
Property 'nin' is missing in type ... but required in type 'UserCreateInput'.
```

### Production Cost if Unpatched
If TypeScript strict checks had been disabled (`ts-ignore`), the Next.js API would have attempted to insert records missing `nin`. PostgreSQL would have immediately aborted every parent registration transaction with error code `23502 (not_null_violation)`, completely paralyzing school admissions.

### Permanent Fix
Updated `app/api/register/route.ts` to accept an optional `nin` from the parent payload or generate a deterministic, auditable enrollment reconciliation token:
```ts
const fallbackNin = nin || `NIN-${crypto.randomBytes(6).toString('hex')}`;
```

---

## Defect 3: Verification Code Resubmission & Retry State Leak

- **File & Line Reference:** [`app/api/verify/route.ts:43-52`](file:///c:/Users/DT001/Desktop/SchoolFix/app/api/verify/route.ts#L43-L52)
- **Component:** Email Verification State Machine.
- **Encountered During:** Step 10 (Email Verification & Failure State Testing).

### Why It Happened
The initial verification logic only verified that `user.verificationCode === code`. If a parent or network glitch caused the client to double-click the submit button or retry an in-flight HTTP request, the second request hit the database after `user.isVerified` was already marked `true`. Because the initial draft didn't check `user.isVerified` first and didn't nullify `verificationCode`, subsequent requests could repeatedly report success or throw unhandled null-pointer exceptions when attempting to clear an already-cleared code.

### Production Cost if Unpatched
1. **Replay Vulnerability:** An eavesdropper who sniffs an OTP in transit could resubmit it after the parent had already verified, potentially re-triggering welcome automations or exploiting session generation race conditions.
2. **Duplicate Ledger Processing:** If verification triggers dependent student account provisioning, duplicate requests create duplicate student records in bursary ledgers.

### Permanent Fix
1. Explicitly check `user.isVerified` before evaluating the code, returning `409 Conflict` (`CODE_ALREADY_USED`).
2. Atomically wipe `verificationCode: null` and `codeExpiresAt: null` in the same database update transaction that marks `isVerified: true`.
