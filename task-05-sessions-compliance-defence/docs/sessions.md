# Architectural Note: Cryptographic Sessions, Cookie Flags & Hijacking Mitigation

> **Platform:** SchoolFix (Next.js 14.2.35 + PostgreSQL 16 + Prisma ORM)  
> **Topic:** Session Security Architecture & Damage Limitation  
> **Document:** `task-05-sessions-compliance-defence/docs/sessions.md`  

---

## 1. What Session Hijacking Is

Session hijacking (cookie theft / side-jacking) occurs when an attacker obtains a legitimate user's active session token and impersonates them without having access to their password or second-factor credentials.

In web applications, HTTP is a stateless protocol. Once a user authenticates, the server assigns an identity credential (the session token) that the browser transmits in every subsequent HTTP request. If an adversary captures that token, the server cannot distinguish between the authorized user and the adversary.

### Attack Vectors in Nigerian School Contexts:
1. **Shared Devices & Cybercafés:** In Nigeria, parents and teachers frequently access school portals from shared desktop computers in cybercafés, business centers, or school administrative staffrooms. If an application relies solely on frontend logout or long-lived unhashed cookies, the next visitor on that terminal can inspect browser storage or history and resume the active session.
2. **Cross-Site Scripting (XSS):** If malicious script executes in the client browser context (e.g., through an unsanitized rich text announcement or third-party tracking widget), client-accessible cookies (`document.cookie`) can be exfiltrated to an attacker-controlled endpoint.
3. **Network Eavesdropping on Public / Insecure Wi-Fi:** When users connect via unencrypted or compromised networks, cleartext HTTP cookies can be captured via packet sniffers.

---

## 2. How a Stolen Identifier Is Used

Once an attacker possesses a valid raw session token:
1. **Direct Header Injection:** The attacker crafts an HTTP request injecting the captured cookie into their own browser or automated client:
   ```http
   GET /portal/dashboard HTTP/1.1
   Host: schoolfix.internal
   Cookie: schoolfix_session=be4699fb1bf1416f80a24b69f0cd7de48792012fa5bd1603d8503d46be1fea14
   ```
2. **Bypassing Authentication Barriers:** Because the token satisfies the server's session lookup, the attacker bypasses the login form, password checks, rate limits, and CAPTCHAs.
3. **Privilege Exploitation:** For a school portal:
   - As a **Parent:** Inspecting confidential terminal report cards, student medical notes, and outstanding tuition balances.
   - As a **Classroom Teacher:** Altering Continuous Assessment (CA) scores or forging attendance records.
   - As a **Bursar:** Reconciling fictitious manual cash settlements or diverting tuition payment references.

---

## 3. What Logging Out Does to a Session

Badly engineered applications implement "client-side logout" only: the frontend clears local state, wipes the client cookie, and redirects to `/login`. However, the session record in the database remains active until natural expiry. An attacker who previously intercepted the token retains full unauthorized access for days or weeks.

### SchoolFix Server-Enforced Invalidation Lifecycle:
When a user clicks "Log Out" in SchoolFix:
1. **Server-Side Revocation:** An atomic `DELETE` query executes against the database:
   ```sql
   DELETE FROM "Session" WHERE "sessionToken" = digest($1, 'sha256');
   ```
   The session identifier is permanently destroyed from the database ledger.
2. **Immediate Token Invalidation:** Even if the attacker retains the raw token string in memory, subsequent requests fail the server database lookup with `HTTP 401 Unauthorized` and are redirected to `/auth?mode=login`.
3. **Client Cookie Evacuation:** The server emits an explicit cookie deletion header with `Max-Age=0` and `Expires=Thu, 01 Jan 1970 00:00:00 GMT`, instructing the browser to scrub the cookie from storage immediately.

---

## 4. Why SchoolFix Hashes the Session Cookie

In SchoolFix, the raw session token exists **only in the user's browser cookie**. The server never stores the raw token in plaintext.

```
Client Browser Cookie:
  rawToken = 32-byte CSPRNG hex ("be4699fb1bf1...")
      │
      ▼ (HTTPS Request)
Server In-Memory:
  hash = SHA-256("be4699fb1bf1...") ("26a44ba91189...")
      │
      ▼
Database (PostgreSQL 'Session' Table):
  stores only "26a44ba91189..."
```

### The Security Defense:
If an attacker compromises the production database (e.g., via a SQL injection vulnerability, backup exposure, or an untrusted hosting environment dump), they gain access to the `Session` table.
- Because SHA-256 is a one-way cryptographic hash with no reverse lookup, the attacker **cannot** inject the stored database hashes into their browser as session cookies.
- Every incoming request requires the raw token preimage. The stolen database hashes are completely useless as bearer tokens.

---

## 5. Cookie Security Flags & What Each Flag Prevents

SchoolFix serializes the `schoolfix_session` cookie with four mandatory security flags:

| Flag | Value in SchoolFix | What It Prevents | What It Fails to Protect Against |
| :--- | :--- | :--- | :--- |
| **`HttpOnly`** | `true` | **Cross-Site Scripting (XSS) Token Theft:** JavaScript (`document.cookie`) cannot read or access the cookie. Even if malicious script runs on the page, the session token cannot be exfiltrated via script. | Does not prevent Cross-Site Request Forgery (CSRF) or browser-level packet interception if transmitted over plain HTTP. |
| **`Secure`** | `true` (prod) | **Man-in-the-Middle (MitM) Eavesdropping:** Restricts cookie transmission strictly to TLS/HTTPS encrypted connections. Prevents packet sniffers on unencrypted Wi-Fi networks from capturing the token. | Does not prevent client-side physical theft or malicious browser extensions installed locally on the user's device. |
| **`SameSite`** | `Lax` | **Cross-Site Request Forgery (CSRF):** The cookie is withheld from cross-site subrequests (e.g., unauthorized POST requests or embedded images from external sites), while permitting top-level GET navigation. | Does not protect against CSRF if state-changing actions are improperly implemented via HTTP GET requests. |
| **`Path`** | `/` | **Cross-App Context Leaks:** Constrains the cookie scope to the root of the SchoolFix domain, preventing sub-applications or unintended paths from receiving credentials. | Does not isolate cookies between subdomains unless explicit domain restrictions are applied. |
| **`Max-Age`** | `604800` (7 days) | **Perpetual Stale Sessions:** Enforces an absolute lifetime bound. Prevents abandoned sessions on shared terminals from remaining valid indefinitely. | Does not invalidate a stolen token before the 7-day window expires unless the user explicitly logs out or resets their password. |

---

## 6. How SchoolFix Limits Damage If a Token Is Stolen

Even with strict cookie flags, an adversary who obtains physical access to an unlocked phone or computer might copy the active session. SchoolFix implements three layers of defense-in-depth:

1. **IP & User-Agent Fingerprinting:**
   The `Session` table logs `ipAddress` and `userAgent` upon token creation. Anomalous requests (e.g., a session issued to an MTN Nigeria Android IP suddenly making requests from a foreign datacenter IP) can be flagged and challenged.
2. **Password Reset Kills All Active Sessions:**
   Under Step 5, triggering a password reset executes `prisma.session.deleteMany({ where: { userId } })`. If a user suspects their account has been accessed, changing their password immediately purges every active session across all devices.
3. **Hard-Gated Financial & Grade Clearance:**
   Administrative tuition reconciliation, fee adjustments, and unmasked report card distribution require continuous database re-verification of bursar authorization and clearance status. The session token grants identity access, but cannot bypass underlying row-level domain RBAC checks.
