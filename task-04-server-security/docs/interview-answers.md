# Technical Interview Viva Answers (Task 4: Server Security)

> **Product:** SchoolFix (Mobile-First School Management & Tuition Reconciliation)  
> **Target Market:** Nigerian Private Primary and Secondary Schools  
> **Mandatory Standard:** Concise, viva-ready answers ($\le 200$ words each) defending engineering decisions, cryptography, rate limiting, and real empirical benchmarks.

---

### Hashing

#### 1. Why should you hash passwords?
Passwords must be hashed using a one-way mathematical function so the database never stores plaintext credentials. Storing plaintext means any database leak, accidental query log export, or untrusted insider immediately compromises every user across all services where they reuse credentials. Hashing ensures that even if an attacker steals the database dump, they obtain only non-invertible digests. The server validates logins by hashing the candidate password and comparing the resulting digest against the stored hash, verifying identity without ever knowing or storing the underlying secret.

#### 2. Why use bcrypt (or Argon2id) instead of SHA-256 for passwords?
SHA-256 is an algorithm optimized for speed and high throughput in data integrity checks. On modern hardware, a single consumer GPU (like an RTX 4090) computes over 55 billion SHA-256 hashes per second, making offline dictionary attacks trivial. In contrast, password-hashing algorithms like Argon2id or bcrypt are intentionally slow and resource-intensive. Argon2id requires dedicated memory (64 MiB in our configuration) and multiple iterations, which starves GPU memory bandwidth. This forces an economic inversion: a defender pays ~82ms once during login, while an attacker must spend millennia to brute-force candidate passwords.

#### 3. What is a salt and why do you need it?
A salt is a cryptographically secure random value generated uniquely for each user and concatenated with the password before hashing. Without salts, identical passwords produce identical hashes. An attacker could precompute hashes for common passwords into a "rainbow table" and instantly look up thousands of stolen accounts in seconds. Salts invalidate precomputed tables by forcing the attacker to recompute the entire dictionary for every single user's unique salt ($2^{128}$ combinations), and prevent observers from seeing who shares a common password.

#### 4. What salt rounds, or what work factor, should you use? Give a number and defend it.
For Argon2id, we use memory: 65,536 KiB (64 MiB), time iterations: 3, and parallelism: 4 threads. For bcrypt, a work factor of 12 rounds is standard. We defend this based on empirical latency: on our production hardware, this configuration computes in approximately 82 milliseconds. An 82ms delay is completely imperceptible to a human parent logging into SchoolFix, but severely limits an offline attacker to approximately 12 hashes per second per CPU core, rendering bulk offline cracking mathematically infeasible while keeping server login overhead sub-100ms.

#### 5. You are storing user passwords in a database. Of plain text, SHA-256, AES-256 encryption and adaptive hashing, which is correct and why are the other three wrong? Note that one of the three wrong answers is wrong for a different reason from the other two.
Adaptive hashing (Argon2id/bcrypt) is the only correct choice. Plaintext is wrong because any data breach immediately exposes raw credentials. SHA-256 is wrong because it is too fast and lacks memory hardness, allowing billions of GPU guesses per second. AES-256 encryption is wrong for a fundamentally different reason: encryption is **two-way** (reversible). Storing encrypted passwords requires maintaining an encryption key. If an attacker breaches the application server or memory dump, they steal the key and decrypt 100% of passwords back to plaintext. Hashing is permanently one-way.

---

### Validation

#### 6. Why is client-side validation not enough?
Client-side validation exists purely for user guidance, responsive feedback, and network optimization. It provides zero security boundary protection because the client environment is completely untrusted. Anyone attacking an application skips the browser interface entirely and issues direct HTTP requests via terminal scripts, curl, or Postman. As proved in our Task 3 experiment, our defenseless endpoint accepted an incomplete payload with omitted terms and missing phone numbers. The server must be the authoritative source of truth and validate every incoming field independently.

#### 7. What security checks belong in the frontend, and what must the server enforce regardless?
The frontend should enforce instant UX feedback: visual formatting rules, empty field blur warnings, masking, inputMode toggles, and button states that guide legitimate users. The server must enforce all security and data integrity invariants regardless: schema structure, maximum string lengths, strict regex constraints (e.g. Nigerian NCC phone prefixes), type narrowing, mandatory legal terms acceptance, credential hashing, rate limiting, and authorization roles. Frontend checks guide humans; server checks protect system state and data integrity.

#### 8. The user interface hides the delete button for non-administrators. Is that enough? If not, what does an attacker do instead?
Hiding a button in the UI is cosmetic obfuscation, not authorization. An attacker simply inspects the client JavaScript bundle, identifies the API route (e.g. `DELETE /api/users/[id]`), and issues the HTTP request directly using their own session cookies or tokens. If the backend route handler does not explicitly inspect the user's role and verify administrative privilege against the database or session claims, the server executes the deletion. Security must always be enforced at the server endpoint, never delegated to CSS `display: none`.

#### 9. What is the difference between validation, encoding and sanitisation?
Validation inspects input against an expected schema and rejects the request (`HTTP 400`) if it fails structural rules. Sanitisation modifies incoming data by stripping potentially dangerous tokens (e.g. removing HTML tags or trimming trailing whitespace) while keeping the request alive. Encoding transforms characters into a safe format for a specific output interpreter (e.g. converting `<` to `&lt;` for HTML or escaping quotes for SQL) so that untrusted input is treated strictly as data rather than executable instructions.

#### 10. Why would you replace the incoming request body with the parsed and validated data rather than leaving both available?
Leaving the raw request body available creates a dangerous attack surface where downstream handlers, database queries, or logging calls accidentally reference un-sanitized, un-trimmed input. Zod's `safeParse()` outputs a typed `data` object containing only fields explicitly declared in the schema, with transformations (such as trimming and email lowercasing) applied. Consuming exclusively the parsed output guarantees mass-assignment immunity: unexpected or malicious fields injected by an attacker are discarded before touching the service layer.

#### 11. Why validate route parameters and query strings, not just the body?
Route parameters (such as `/api/students/[id]`) and query parameters (such as `?mode=verify`) are unauthenticated client inputs just like request bodies. If unvalidated, malformed UUIDs can cause database driver exceptions, unhandled 500 errors, or SQL/NoSQL injection vulnerabilities. Validating parameters ensures that IDs conform to expected UUIDv4 structures, filters match allowed enumeration values, and pagination bounds (`limit`, `offset`) cannot be manipulated to cause database denial of service via memory exhaustion.

---

### Rate Limiting

#### 12. How do you rate limit unauthenticated requests, and what is the problem with the header you would reach for first?
Unauthenticated requests are typically rate limited by client IP address. The first header developers reach for is `X-Forwarded-For`. The problem is that in poorly configured networks, `X-Forwarded-For` is completely client-controlled and spoofable: an attacker can send arbitrary IP strings in every request and bypass the limiter entirely (as proved in our `evidence/14-rate-limit-defeated.txt`). Furthermore, in mobile networks using Carrier-Grade NAT (CGNAT) or school Wi-Fi, thousands of legitimate users share one public IP, causing accidental mass lockouts.

#### 13. Which rate limiting algorithm would you choose for a production API, and what is the boundary burst problem?
I would choose the **Sliding Window Counter** or **Token Bucket** algorithm. The Fixed Window algorithm suffers from the boundary burst problem: if a user is allowed 100 requests per hour, they could send 100 requests at 1:59 PM and another 100 requests at 2:00 PM. Although technically respecting both hourly windows, the server receives 200 requests within two seconds, creating a burst that can overwhelm database connection pools. Sliding windows smooth traffic across moving intervals.

#### 14. Why use a shared store for your counters rather than in-memory counters on each server?
In modern cloud architectures, applications run across multiple load-balanced containers or serverless instances. In-memory counters live in the isolated memory space of a single Node.js process. If an API allows 5 attempts and runs across 4 pods, an attacker simply sprays requests across pods, effectively multiplying their attack budget to 20 attempts. A shared store like Redis provides an atomic, centralized single source of truth for rate limit counters across all running application instances.

#### 15. What HTTP status code should a rate limiter return, and why is 403 the wrong choice?
A rate limiter must return **`HTTP 429 Too Many Requests`**, accompanied by a `Retry-After` header indicating how many seconds the client must wait. `HTTP 403 Forbidden` is incorrect because 403 signifies an authorization failure where the client lacks permission to access the resource regardless of request volume. 429 explicitly informs the client that the request was structurally valid and authenticated, but was throttled due to temporary volume constraints.

#### 16. What do you do when your rate limit store is unavailable: fail open or fail closed? Answer for your own application specifically.
For SchoolFix parent and teacher interactions, **we fail open**. If our rate limit store experiences network timeouts, we log a critical alert and permit authentication attempts to proceed un-throttled. Our memory-hard Argon2id hashing still protects passwords from brute force. Failing closed would lock out hundreds of teachers from recording morning attendance registers or parents paying school fees during an infrastructure glitch. However, for bursar bulk payment reconciliation endpoints, we fail closed to preserve financial integrity.

---

### On Your Own Work

#### 17. You have two timing numbers for hashing, from your own machine. Walk me through what they mean for an attacker who has stolen your user table.
On our machine, SHA-256 completed in **0.0920 milliseconds** while Argon2id (`m=65536, t=3, p=4`) required **82.21 milliseconds**—an 894× slowdown. For an attacker who steals our database dump, SHA-256 would allow an RTX 4090 GPU to compute over 55 billion guesses per second, cracking an 8-character password in 51 seconds. Under our Argon2id parameters, each guess requires 64 MiB of RAM, saturating the GPU's 24 GB VRAM at just 384 concurrent threads. Cracking throughput drops to ~2,100 guesses/sec, expanding cracking time to 91,000 years.

#### 18. How does a breached password check avoid sending the password anywhere? Explain the mechanism in your own words, then say what the naive version would leak.
We implement k-anonymity via HaveIBeenPwned. The client hashes the password locally with SHA-1, extracts only the first 5 characters of the hex digest (the prefix), and transmits solely that prefix over the network. The API responds with ~500 anonymous hash suffixes matching that prefix. SchoolFix searches locally for our matching 35-character suffix. The naive version would send the plaintext password or full hash across the internet, creating a centralized surveillance honeypot and violating the Nigerian Data Protection Act.

#### 19. Wrong-answer analysis. A candidate says: "I hash passwords with SHA-256 plus a random salt per user, which means even if the database is stolen the passwords cannot be reversed, because hashing is one-way. I also rate limit login attempts by IP, so brute force is not possible." Every sentence contains something true. Say what is wrong, in order of severity, and what the candidate has misunderstood about the threat model.
1. **Critical Flaw (Offline Threat Model):** The candidate assumes rate limiting protects salted SHA-256. Rate limiting only protects *online* web forms. Once the database is stolen, the attacker works *offline* on their own GPU cluster where web rate limits do not exist. SHA-256 is fast and lacks memory hardness, so salting only prevents rainbow tables; it does not stop high-speed GPU brute force.
2. **Secondary Flaw (IP Limitation):** Online brute force easily defeats IP rate limiting via residential botnets or rotating proxies.
