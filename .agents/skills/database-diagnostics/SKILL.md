---
name: database-diagnostics
description: Validates PostgreSQL database connectivity, verifies HTTP 201 writes vs false UI success, and manages Prisma safely without autonomous migrations.
---

# Database Diagnostics & Verification Skill

## Purpose
Enforces database integrity, prevents autonomous schema alterations, and produces verifiable evidence that client actions result in real database writes.

## Critical Guardrails
1. **No Autonomous Migrations:** Never run `npx prisma migrate dev` or `npx prisma db push`. Only the human engineer runs migrations on live databases.
2. **Type Synthesis Only:** The agent may run `npx prisma generate` to generate client types from `prisma/schema.prisma`.
3. **No Schema Alterations:** The 11 models defined in PRD §8.2 are frozen (`User`, `Session`, `ClassArm`, `TeacherClassAssignment`, `FeeSchedule`, `Student`, `Attendance`, `Assessment`, `Payment`, `PaymentAttempt`, `DocumentChunk`).

## Operational Workflows

### 1. Verify Real Database Writes (Step 6 Evidence)
To prove the difference between an interface that claims success and an application that actually writes data:
1. Submit the form endpoint and capture server logs showing the HTTP status code (must be `201 Created`, not `200 OK` or `401 Unauthorized`).
2. Query the PostgreSQL table directly using Prisma client or `psql` to capture the newly inserted row ID and its server timestamp:
   ```typescript
   const record = await prisma.student.findUnique({
     where: { admissionNum: 'SF-2026-001' }
   });
   console.log(record.id, record.createdAt);
   ```
3. Repeat the write minutes later with a second entry to capture sequential, machine-verifiable timestamps.

### 2. Diagnose False-Success (Database Breakage Test)
1. Intentionally break the database connection URL in `.env.local` (e.g., pointing `DATABASE_URL` to an unreachable port or invalid credential).
2. Attempt the submission again.
3. Observe and document what the user interface presents versus what the server logs show. If the UI still shows "Success", document this as a false-success vulnerability in `docs/false-success.md`.
