# Why We Made Our Password Hashing 894× Slower: An Engineering Case Study in Nigerian EdTech

> **Author:** SchoolFix Engineering Team  
> **Target Publication:** Substack / Medium / Dev.to Engineering Blog  
> **Topic:** The Security Inversion, Argon2id Tuning, and Background Job Architecture  
> **Document Reference:** `task-05-sessions-compliance-defence/docs/article.md`  

---

## 1. The Trap of "Fast Is Good"

In web development, engineers are conditioned to worship speed. We optimize database indexes to shave five milliseconds off a query, compress JavaScript bundles to drop initial paint times, and boast about sub-millisecond API responses.

When our team was scaffolding **SchoolFix**—a mobile-first school management and tuition reconciliation platform for Nigerian private primary and secondary schools—we were presented with an initial authentication implementation using SHA-256. 

On our local development machines, SHA-256 looked breathtakingly efficient. When we timed it, hashing a standard parent password took just **0.0920 milliseconds**. An engineer glancing at those performance metrics would naturally declare victory: the CPU was barely idling, and user requests were completing in the blink of an eye.

That conclusion was dead wrong. In password cryptography, **fast is a catastrophic security failure**.

---

## 2. The Arithmetic of a Stolen Database

To understand why 0.092 milliseconds is a disaster, you have to invert the threat model. 

When a parent logs into SchoolFix from their Android smartphone in Lagos to check their child's term tuition balance, they hash their password exactly **once**. An extra 80 milliseconds of computational delay is completely imperceptible to a human being tapping a touchscreen over a cellular network.

Now, consider the attacker who compromises the database.

Whether through a SQL injection flaw in a legacy module, an accidental backup bucket exposure on Amazon S3, or an unpatched operating system vulnerability, the attacker dumps the entire `User` table containing 5,000 parent and teacher credential hashes.

The attacker does not query our API or respect our sliding-window rate limiters. They copy the hash dump to an offline workstation equipped with an NVIDIA RTX 4090 GPU and execute Hashcat.

Against SHA-256, an RTX 4090 computes roughly **8.5 billion hashes per second**.
$$\text{Guesses per second (SHA-256): } 8,500,000,000 \text{ hashes/sec}$$

A dictionary attack containing 100 million common passwords (incorporating common Nigerian names, dates of birth, and simple variations like `Password123!` or `Lagos2024`) completes in **0.011 seconds**. Within twenty minutes, the attacker has reversed 85% of the parent and administrator passwords in the school. Three of those parents used the identical password for their commercial banking applications.

By making our server "fast", we handed the keys of the kingdom to an offline brute-force attack.

---

## 3. What We Tried: Benchmarking the Slow Alternative

We decided to migrate our entire authentication boundary to **Argon2id**, the winner of the Password Hashing Competition (PHC) and the gold standard recommended by OWASP.

Unlike traditional algorithms, Argon2id is not just CPU-hard; it is **memory-hard**. It forces the processor to allocate a large block of RAM that must be continually shuffled and read during computation. This renders specialized GPU and ASIC cracking rigs economically unviable, because GPUs have high core counts but severely constrained per-core memory bandwidth.

We wrote a rigorous microbenchmark script ([`scripts/benchmark-hashing.js`](file:///c:/Users/DT001/Desktop/SchoolFix/scripts/benchmark-hashing.js)) on our local Windows development machine. We benchmarked 10 iterations of SHA-256 against 10 iterations of Argon2id tuned with the following operational parameters:
- **Memory Cost (`m`):** 65,536 KiB (64 MB of RAM allocated per hash)
- **Time Cost (`t`):** 3 iterations
- **Parallelism (`p`):** 4 threads

### The Empirical Results from Our Machine:
```text
=== Local Machine Microbenchmark (10 Iterations) ===
Average SHA-256 Hashing Duration:     0.0920 ms
Average Argon2id Hashing Duration:   82.2100 ms

Slowdown Factor: Argon2id is 893.59x SLOWER than SHA-256.
```

### The Math for the Attacker:
Against Argon2id with 64 MB of RAM allocation, an attacker’s RTX 4090 cannot run thousands of parallel threads simultaneously. Its memory bus chokes. The attacker’s guessing throughput drops from 8.5 billion guesses per second to approximately **1,200 guesses per second**.

To test that same 100-million-word dictionary against our stolen Argon2id hashes now requires:
$$\frac{100,000,000 \text{ combinations}}{1,200 \text{ guesses/sec}} \approx 83,333 \text{ seconds} \approx \mathbf{23.1 \text{ days per single user}}.$$

To crack 500 parents would take over **31 years** of continuous high-power GPU computation. Slowing down our authentication by 82 milliseconds cost our users nothing measurable, and cost the attacker everything.

---

## 4. What Went Wrong: The Registration Latency Crisis

Having settled the cryptographic defense, we implemented Argon2id in our registration route ([`app/api/register/route.ts`](file:///c:/Users/DT001/Desktop/SchoolFix/app/api/register/route.ts)).

We then executed an end-to-end performance audit. We loaded our mobile registration view, entered parent details, tapped "Create Account", and measured the round-trip latency.

The request took **3,085.14 milliseconds**. Over three full seconds!

On a development machine on local loopback, three seconds is an eternity. On a real Tecno smartphone connected to an intermittent 3G network in suburban Lagos, a 3-second server delay causes network timeouts, double-click form submissions, and massive user drop-off.

Our initial diagnosis was defensive: we suspected that Argon2id was too heavy for our server. We wondered if we had over-tuned the memory parameters.

We opened the server profiler and dissected the request timeline line by line:
1. **Schema Boundary Validation (Zod):** 0.0958 ms
2. **Argon2id Hashing (64MB, 3 iterations):** 82.21 ms
3. **PostgreSQL Database Write (`prisma.user.create`):** 18.40 ms
4. **Synchronous SMTP Email Dispatch:** **2,984.44 ms**

The culprit was not Argon2id. The culprit was **synchronously dispatching a 6-digit verification email inside the HTTP request loop**.

Our registration handler was waiting for a complete TCP/TLS handshake with Google's SMTP mail servers (`smtp.gmail.com:587`), awaiting the EHLO protocol negotiation, sending the authentication payload, and awaiting delivery confirmation before sending an HTTP response back to the parent! We had tied our user experience directly to the latency of someone else’s remote mail cluster.

---

## 5. What We Changed: Decoupling Email with Background Workers

To fix this, we decoupled email delivery from the HTTP request lifecycle entirely.

We created an in-memory asynchronous job worker ([`lib/security/email-worker.ts`](file:///c:/Users/DT001/Desktop/SchoolFix/lib/security/email-worker.ts)). When a parent registers:
1. Zod validates the incoming payload at the boundary.
2. Argon2id hashes the password in 82 ms.
3. The user record is created in PostgreSQL with `isVerified: false` and a CSPRNG 6-digit confirmation code.
4. Instead of awaiting SMTP transmission, the route handler pushes a job onto the background queue:
   ```ts
   emailQueue.enqueue({
     userId: user.id,
     email: user.email,
     fullName: user.fullName,
     code: verificationCode,
   });
   ```
5. The endpoint immediately returns `HTTP 201 Created` with a 32-byte cryptographic session.
6. The background worker picks up the job off the event loop and handles SMTP network retries asynchronously.

### The Impact:
When we re-measured the registration latency using our timing test ([`scripts/test-sync-vs-job-timing.js`](file:///c:/Users/DT001/Desktop/SchoolFix/scripts/test-sync-vs-job-timing.js)), the numbers were staggering:
- **Synchronous Registration Duration:** 3,085.14 ms
- **Asynchronous Background Queue Duration:** **438.06 ms**
- **Improvement:** **7.0× faster response time.**

---

## 6. The Mistake We Made Along the Way

No honest engineering story is complete without its blunders.

During Step 10, while writing an automated diagnostic script to test and verify how our SMTP dispatcher gracefully handles authentication failures, I authored a simulated diagnostic log in [`scripts/test-smtp-diagnostics.js`](file:///c:/Users/DT001/Desktop/SchoolFix/scripts/test-smtp-diagnostics.js). To illustrate Google Workspace’s 16-character dedicated application password format, I included a mock string: `"xkvm wjpq ozle ydrh"`.

It was complete gibberish, generated randomly on my keyboard. But GitHub’s automated secret scanner runs a regex pattern matching `(?i)[a-z]{4}\s[a-z]{4}\s[a-z]{4}\s[a-z]{4}`.

The moment I pushed the commit, GitHub triggered a high-severity alert: *"Google App Password detected in commit 1e87989."*

I had violated Rule 5 of our operating directives: zero un-sanitized secrets. Even though the password was synthetic, automated security tools cannot infer intent. 

I had to immediately sanitize every file with `[REDACTED_APP_PASSWORD]`, run `git commit --amend`, and force-push with lease (`git push --force-with-lease origin feature/task-4-server-security`) to scrub the remote branch ref. The lesson was immediate and indelible: **in production systems, test fixtures and mock strings must never structurally mimic real credential syntax.**

---

## 7. The Core Takeaway

Engineering is not about making everything fast; it is about knowing **what to slow down, and what to take off the main thread**.

We made our password hashing 894× slower to protect our parents from industrial GPU dictionary attacks. Then, we made our registration 7.0× faster by refusing to let external network operations block the user’s phone. 

Understanding that trade-off—and having the empirical machine evidence to prove it—is the difference between someone who prompts an AI agent to generate code, and a real software engineer.
