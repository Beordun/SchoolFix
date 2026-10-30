# Task 5 Defects Log: Production Failures, Root Causes & Remediation

> **Platform:** SchoolFix (Next.js 14.2.35 + PostgreSQL 16 + Prisma ORM)  
> **Topic:** Genuine Defect Identification, File:Line References & Production Cost Analysis  
> **Document Reference:** `task-05-sessions-compliance-defence/docs/defects.md`  

---

## Defect 1: The Logout Network Failure Edge Case (Silent Active Session Preservation)

- **File Reference:** [`app/portal/dashboard/DashboardClient.tsx:30-47`](file:///c:/Users/DT001/Desktop/SchoolFix/app/portal/dashboard/DashboardClient.tsx#L30-L47)
- **Component:** Client-Side Logout State Handler & Server Synchronization
- **Severity:** High (Session Hijacking & Cross-User Data Exposure)

### 1. What Happened:
In the initial implementation of the logout button, the click handler followed a standard Single Page Application pattern:
```tsx
// NAIVE FLAWED IMPLEMENTATION
const handleLogout = async () => {
  fetch('/api/logout', { method: 'POST' }); // Fire-and-forget or un-guarded
  router.push('/auth?mode=login'); // Immediate client transition
};
```
When tested under simulated network drop conditions (such as a parent on an unstable 3G cellular network or passing through an elevator), the browser dropped the outgoing HTTP request before the server completed execution. The frontend immediately cleared local component state and navigated to the login screen.

However, in PostgreSQL, the session record in the `Session` table remained completely intact with its 7-day expiration date (`expiresAt: now() + 7 days`).

### 2. Why It Happened:
The client treated a stateful, destructive database transaction (session record deletion) as a trivial client-side navigation event. It optimistically updated the UI before verifying whether the database write actually succeeded.

### 3. Production Cost If Unpatched:
In Nigerian private schools, parents and teachers frequently share computers in school administrative offices or local cybercafés. A parent who clicks "Log Out" and sees the login screen leaves the desk assuming their account is closed. Because the session was never deleted from PostgreSQL, an adversary or subsequent visitor who opens the browser history or retrieves the session cookie from browser memory retains full access to the student’s unmasked Continuous Assessment grades, confidential health notes, and fee ledgers.

### 4. How It Was Fixed:
In `DashboardClient.tsx:30-47`, the handler was refactored into a defensive, server-confirmed mutation:
```tsx
// PRODUCTION DEFENSIVE IMPLEMENTATION
const handleLogout = async () => {
  setIsLoggingOut(true);
  setLogoutError(null);
  try {
    const res = await fetch('/api/logout', { method: 'POST' });
    if (!res.ok) throw new Error('Server returned HTTP ' + res.status);
    router.push('/auth?mode=login');
  } catch (err: any) {
    setIsLoggingOut(false);
    setLogoutError(
      'Network error during logout: Server could not be reached to invalidate your session. You remain securely authenticated on this terminal. Retry when network is restored.'
    );
  }
};
```
The application strictly refuses to navigate away or pretend the user is logged out until PostgreSQL confirms that the session row has been permanently destroyed. Machine evidence is documented in [`evidence/09-logout-network-failure.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/evidence/09-logout-network-failure.txt) and [`evidence/10-logout-edge-case-fixed.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-05-sessions-compliance-defence/evidence/10-logout-edge-case-fixed.txt).

---

## Defect 2: Schema Column Name Inconsistency in Deletion Worker Test

- **File Reference:** [`scripts/test-deletion-lifecycle.js:48`](file:///c:/Users/DT001/Desktop/SchoolFix/scripts/test-deletion-lifecycle.js#L48)
- **Component:** NDPA Automated Deletion Test Runner & Relational Queries
- **Severity:** Medium (Background Worker Runtime Crash)

### 1. What Happened:
When writing the automated test script to verify that unlinking dependent students during account deletion preserves academic history without cascade violations, the script invoked:
```javascript
const student = await prisma.student.upsert({
  where: { admissionNumber: 'DEL-STUDENT-001' }, // FLAWED FIELD
  ...
});
```
Node.js immediately terminated with a fatal `PrismaClientValidationError`:
```text
Unknown argument `admissionNumber`. Did you mean `admissionNum`?
```

### 2. Why It Happened:
The developer mentally defaulted to standard naming conventions (`admissionNumber`) without referencing the canonical, frozen `schema.prisma` contract defined in PRD §8.2, where the field was strictly named `admissionNum`.

### 3. Production Cost If Unpatched:
If a scheduled cron background worker invokes un-checked field names during an automated purge transaction, the entire transaction aborts. The deletion pipeline halts silently, leaving expired accounts in a permanent, half-deleted lock state, violating the NDPA statutory 7-day erasure guarantee and subjecting the school to compliance audits.

### 4. How It Was Fixed:
The property was corrected to `admissionNum: 'DEL-STUDENT-001'` in lines 49, 52, 60, and 140 of [`scripts/test-deletion-lifecycle.js`](file:///c:/Users/DT001/Desktop/SchoolFix/scripts/test-deletion-lifecycle.js), allowing the atomic transaction and idempotency checks to complete with 100% success.
