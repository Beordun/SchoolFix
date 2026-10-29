# Validation Placement & Server Boundary Architecture

> **Product:** SchoolFix (Mobile-First School Management & Tuition Reconciliation)  
> **Validation Engine:** Zod (TypeScript-First Schema Validation)  
> **Step Reference:** Task 4, Step 6 & 7 — Schema Validation at the Boundary  
> **Evidence References:**  
> - [`evidence/11-validation-timing.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-04-server-security/evidence/11-validation-timing.txt) (Overhead benchmark: 0.0958 ms)  
> - [`evidence/12-direct-request-before-and-after.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-04-server-security/evidence/12-direct-request-before-and-after.txt) (Forensic side-by-side refusal)  

---

## 1. Where Validation Sits in the Request Lifecycle

In secure server-side architecture, validation is not a feature embedded deep inside database services; it is a **boundary guardrail** positioned at the perimeter of the application server.

```text
[Incoming HTTP Request: POST /api/register]
       │
       ▼
1. TLS Termination & Header Normalization (Reverse Proxy / Edge)
       │
       ▼
2. Rate Limiting Check (Token Bucket / Sliding Window by IP)
       │  (Blocks floods before parsing JSON bodies)
       ▼
3. JSON Body Deserialization (`req.json()`)
       │
       ▼
=============================================================
4. >>> ZOD SCHEMA BOUNDARY VALIDATION (`safeParse`) <<<
   • Structural Shape (keys, types)
   • Data Transformations (trim whitespace, lowercase email)
   • Semantic Invariants (Nigerian phone NCC regex, NDPA consent)
=============================================================
       │
       ├─── [FAILS: 400 Bad Request] ──► Immediate Exit (0.09ms)
       │                                  (Protects all downstream resources)
       ▼ [PASSES: Verified & Typed]
5. Breached Password Check (k-Anonymity HIBP API)
       │
       ▼
6. Memory-Hard Argon2id Hashing (~82.21ms CPU Cost)
       │
       ▼
7. Database Persistence (Prisma ORM INSERT)
       │
       ▼
8. Asynchronous Background Jobs (Email Verification Queue)
       │
       ▼
[Response: 201 Created]
```

---

## 2. What Runs Before Validation

Only operations strictly required to receive and throttle the request may execute prior to schema validation:
1. **TLS / HTTPS Handshake:** Secures the transport channel.
2. **Reverse Proxy Header Normalization:** Reads `X-Forwarded-For` and `Host` headers.
3. **Per-IP Rate Limiting:** Must run before expensive computations. If an attacker floods the server with 1,000 requests/sec, the rate limiter drops them at $0.001\text{ms}$ with `429 Too Many Requests` without executing parsing or hashing.
4. **JSON Deserialization:** Converts raw byte streams into JavaScript objects.

---

## 3. What Must NEVER Run Before Validation

Executing expensive or stateful operations before validation is an architectural vulnerability:
1. **Argon2id / Bcrypt Hashing:** Hashing costs ~82.21 ms of CPU time and 64 MiB of RAM. If hashing runs before validation, an attacker sends 50 requests with missing phone numbers, forcing the server to waste $4.1\text{ seconds}$ of CPU hashing garbage passwords that will ultimately be rejected.
2. **Database Queries & Connections:** Lookups (`findUnique`) or inserts must never run on unvalidated data. Doing so invites SQL injection, unhandled constraint crashes, and database connection pool exhaustion.
3. **Breached Password API Checks:** Making outbound HTTP requests for unvalidated input burns external rate limits and introduces network latency.
4. **Background Queue Enqueueing:** Enqueueing a verification email before verifying input schema results in phantom jobs, failed worker crashes, and uncollected dead-letter queues.

---

## 4. Why Hand-Written `if` Checks Are Worse Than Schemas

Junior developers often write ad-hoc validation directly inside route handlers:
```ts
// THE AD-HOC ANTI-PATTERN:
if (!req.body.email || !req.body.password) {
  return res.status(400).send("Missing fields");
}
if (req.body.phone.length !== 11) { ... }
```

### The Failures of Hand-Written Validation
1. **Silent Undefined Crashes:** If `phone` is omitted entirely, `req.body.phone.length` throws `TypeError: Cannot read properties of undefined (reading 'length')`, crashing the server into an unhandled `500 Internal Server Error`.
2. **Missing Type Narrowing:** Ad-hoc checks leave the payload typed as `any`. TypeScript cannot guarantee that downstream database queries receive safe types.
3. **Inconsistent Error Formats:** One route returns `{ error: "email invalid" }`, while another returns `{ message: "Bad phone" }`. Mobile clients cannot build predictable form error handlers.
4. **No Replacement of the Request Body:** With manual `if` checks, un-trimmed, un-normalized raw inputs remain accessible throughout the handler. With Zod's `safeParse()`, the developer exclusively consumes `validationResult.data`, guaranteeing that only trimmed, lowercased, and sanitized fields can ever reach the database layer.
