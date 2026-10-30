# What I Do Not Know: An Honest Technical Audit of Architectural Boundaries

> **Platform:** SchoolFix (Next.js 14.2.35 + PostgreSQL 16 + Prisma ORM)  
> **Purpose:** Locating Ignorance, Investigating System Boundaries & Future Research Roadmaps  
> **Document Reference:** `task-05-sessions-compliance-defence/docs/what-i-do-not-know.md`  

---

### Item 1: How the TLS Session Ticket and Browser Cookie Are Actually Encrypted at the Transport Layer
- **What It Is:** How the operating system kernel and TLS cryptographic library (OpenSSL / BoringSSL) encrypt the `schoolfix_session` HTTP cookie over the wire during HTTPS transmission, specifically how Diffie-Hellman ephemeral key exchanges generate symmetric AES-256-GCM session keys and how session resumption tickets persist in browser memory.
- **How I Know I Do Not Understand It:** I know that setting `Secure: true` instructs the browser to transmit cookies exclusively over HTTPS, and I can verify TLS handshakes in Wireshark. But if asked to explain the exact mathematical state machine by which an ephemeral pre-master secret is derived without a shared secret over an untrusted channel, or how TLS 1.3 0-RTT early data leaves session cookies vulnerable to replay attacks, I rely on abstraction rather than implementation mastery.
- **What I Would Need to Learn It:** A comprehensive study of RFC 8446 (The Transport Layer Security Protocol Version 1.3), writing a minimal TLS 1.3 client in C or Go from scratch, and analyzing packet captures of 0-RTT replay vectors using Wireshark and `tcpdump`.

---

### Item 2: What Prisma and PostgreSQL Actually Do When a Migration Fails Halfway Through Non-Transactional DDL
- **What It Is:** The exact recovery and rollback behavior of the database engine when a migration script fails midway through execution, specifically when combining transactional DDL with statements that cannot run inside a PostgreSQL transaction block (such as `CREATE INDEX CONCURRENTLY` or `VACUUM`).
- **How I Know I Do Not Understand It:** In Task 4, when our required column migration failed, Prisma rolled back cleanly because PostgreSQL wraps standard `ALTER TABLE` statements in a transaction. However, when researching zero-downtime indexing for our 11-model schema, I discovered that `CREATE INDEX CONCURRENTLY` automatically disables transactions. If a migration script drops a table column, creates an un-transactional concurrent index, and then crashes on a syntax error on line 4, I do not know the exact catalog state Prisma leaves in `_prisma_migrations`, or whether manual human intervention in `pg_catalog` is required to untangle the aborted index lock.
- **What I Would Need to Learn It:** Intentionally writing a flawed multi-statement migration combining concurrent index creation and synthetic syntax errors against a staging PostgreSQL instance, inspecting the internal `pg_class`, `pg_index`, and `_prisma_migrations` system catalogs, and scripting recovery procedures.

---

### Item 3: Rate Limiting Memory State Survival Across Node.js Clustering and Worker Restarts
- **What It Is:** How in-memory sliding-window counters behave when an application scales from a single Node.js process to a clustered environment managed by PM2 or Kubernetes, and how counter state survives process crashes.
- **How I Know I Do Not Understand It:** In Task 4, I built an in-memory sliding-window rate limiter using JavaScript `Map` objects. I know that if the Node.js process restarts, that map is completely erased, resetting all lockout counters to zero. I also know that running multiple PM2 cluster workers creates separate memory spaces, meaning a malicious client could cycle through 4 worker threads to get 4× the allowed attempts. While I know that "Redis is the industry solution", I have not implemented a distributed Redis token-bucket script with atomic Lua primitives, nor do I know how Redis clustering handles master failover during an active brute-force flood.
- **What I Would Need to Learn It:** Setting up a local Redis cluster, writing atomic Lua evaluation scripts for sliding-window log algorithms, and profiling latency deltas against in-memory maps under distributed load testing with `k6`.

---

### Item 4: Scheduled Cron Worker Recovery When the Server Is Powered Down During the Execution Window
- **What It Is:** How background job schedulers handle "missed executions" when the host machine or cloud container is powered down, rebooting, or experiencing an outage at the exact timestamp when a recurring job (like our 7-day NDPA deletion purge) was scheduled to fire.
- **How I Know I Do Not Understand It:** Our background worker relies on a Node.js timer loop. If the server is offline at 02:00 UTC when the purge job is supposed to execute, the job simply does not run. When the server reboots at 03:30 UTC, does a professional scheduler (like BullMQ, Temporal, or pg_cron) know that it missed an execution window, or does it wait until 02:00 the following day? I cannot explain the state machine that differentiates between an intended catch-up run and a dangerous duplicate execution.
- **What I Would Need to Learn It:** Studying persistent distributed job queues (such as BullMQ on Redis or Temporal.io workflow engines), configuring dead-letter queues, and designing persistent heartbeat schedulers that query missed database time windows on boot.

---

### Item 5: Whether Our Retention Matrix Would Survive an Aggressive Cross-Border Legal Challenge
- **What It Is:** The legal enforceability of SchoolFix's Data Retention Matrix when an expatriate or dual-citizen parent (e.g., a British citizen residing in Lagos) exercises their Right to Erasure under UK/EU GDPR Article 17, demanding that the school wipe all payment records, directly conflicting with Nigerian CAMA 2020 § 374.
- **How I Know I Do Not Understand It:** In `docs/retention-matrix.md`, I asserted that CAMA § 374 and CITA § 63 "win" over NDPA § 34 based on the statutory exemption for legal obligations under NDPA § 34(2)(b). However, I am a software engineer, not a privacy lawyer. If an international parent files a formal complaint with the UK Information Commissioner's Office (ICO) claiming extraterritorial jurisdiction, I do not know how Nigerian private international law treats foreign data protection judgments versus domestic tax accounting statutes.
- **What I Would Need to Learn It:** Formal consultation with a certified Data Protection Compliance Organization (DPCO) in Nigeria, reading legal case law on cross-border conflict of laws in commercial contracts, and analyzing NDPC regulatory guidelines.

---

### Item 6: Microarchitectural CPU Side-Channel Attacks Against In-Memory Password Verification
- **What It Is:** How CPU hardware vulnerabilities (Spectre, Meltdown, cache-timing side channels) could allow a tenant in a shared cloud virtual machine to deduce Argon2id password hash memory access patterns.
- **How I Know I Do Not Understand It:** I understand that Argon2id was specifically engineered to combine Argon2d (data-dependent memory access, maximizing GPU resistance) with Argon2i (data-independent memory access, defeating cache-timing side channels). But if an interviewer asked me to draw the microarchitectural CPU cache line fetch sequence or explain how branch target injection could bypass our constant-time dummy hash comparison in `app/api/login/route.ts:55`, I would be reciting high-level whitepaper summaries without deep assembly understanding.
- **What I Would Need to Learn It:** Studying computer systems architecture at the assembly level, inspecting x86-64 SIMD instructions generated by the Argon2 C core, and reading academic security research on microarchitectural cache-timing attacks.

---

### Item 7: PostgreSQL Write-Ahead Log (WAL) Snapshot Replay Races During Disaster Recovery Re-Sync
- **What It Is:** The exact concurrency guarantees when replaying physical WAL segments against a restored PostgreSQL database while our custom `DeletionTombstone` reconciliation script executes.
- **How I Know I Do Not Understand It:** In `docs/retention-matrix.md`, I proposed a disaster recovery protocol where restored snapshots are reconciled against a tombstone table to re-purge deleted accounts. What happens if a live application write commits to a newly restored database while the tombstone reconciliation script is still scanning the `User` table? Could an incoming registration reuse an email address currently being evaluated by the tombstone script, causing an accidental erasure of a brand-new customer? I have not tested this race condition on a live replica.
- **What I Would Need to Learn It:** Configuring PostgreSQL physical replication, testing WAL replay mechanics with `pg_waldump`, and benchmarking distributed snapshot isolation levels (`SERIALIZABLE` transactions) during synthetic disaster recovery drills.

---

### Item 8: Flutterwave Webhook Retry Exponential Backoff and Idempotency Key Retention Lifetimes
- **What It Is:** How payment gateway webhook dispatchers (specifically Flutterwave) manage retry queues, backoff ceilings, and idempotency key caching when an application endpoint experiences intermittent 500 errors.
- **How I Know I Do Not Understand It:** Our dual-ledger model specifies that webhooks must be idempotent: if a duplicate webhook arrives with the same `transactionReference`, our endpoint returns `200 OK` without creating a second `Payment` record. But if SchoolFix’s database is unavailable for 6 hours during a major cloud outage, what is Flutterwave’s exact exponential backoff ceiling? Do they retry for 24 hours or 72 hours? How long must SchoolFix retain historical `PaymentAttempt` references in high-speed memory before an un-reconciled webhook can safely be discarded?
- **What I Would Need to Learn It:** Reading Flutterwave’s low-level partner API specifications, executing chaos-engineering network throttling tests against webhook mock servers, and testing distributed Redis idempotency key expiration policies under long-duration outage simulations.
