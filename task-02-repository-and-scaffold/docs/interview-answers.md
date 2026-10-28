# Technical Viva Interview Answers — Task 2

> **Scope:** 15 technical viva questions covering Version Control, Forward Deployed Engineering, and SchoolFix Implementation Diagnostics.  
> **Constraint:** Maximum 200 words per answer.

---

### 1. What is the difference between Git Flow and trunk-based development, and why have a lot of teams moved toward trunk-based?
Git Flow relies on long-lived branches (`develop`, `release`, `feature`, `hotfix`) where code integrates infrequently over multi-week release cycles. Trunk-based development requires all engineers to merge small, frequent commits into a single shared branch (`main`) multiple times per day, typically protected by short-lived feature branches (<24–48 hours) and feature flags.

Teams moved to trunk-based development because Git Flow introduces severe "merge debt" and integration hell. When multiple long-lived branches diverge, resolving semantic merge conflicts during release prep stalls delivery and obscures regressions. Trunk-based development reduces inventory risk, enforces continuous automated testing (CI), enables rapid rollbacks via forward fixes, and matches modern continuous deployment cadences.

---

### 2. What does git push --force actually do, and why is --force-with-lease generally safer?
`git push --force` (`-f`) unconditionally overwrites the remote branch ref with your local commit history, destroying any commits that exist on the remote repository that are not present in your local branch.

`--force-with-lease` is safer because it performs an atomic check-and-set: it inspects whether your local remote-tracking ref (e.g., `origin/main`) matches the actual tip of the remote repository before overwriting. If another engineer pushed commits to the branch while you were rebasing locally, the remote ref will have advanced beyond your local tracking ref. In that case, `--force-with-lease` aborts the push immediately, preventing accidental destruction of your teammate's work.

---

### 3. Why is rewriting history, through rebase, amend or force push, dangerous on a shared branch?
Git commit hashes are cryptographic SHA-1/SHA-256 digests computed over the commit contents, parent commit hashes, author metadata, and timestamps. Amending or rebasing rewrites these hashes, creating entirely new commits with identical changes but different identifiers.

On a shared branch, other engineers base their local branches on the original commit hashes. When upstream history is rewritten and force-pushed, their local branches diverge from the remote tracking branch. When they subsequently pull or merge, Git attempts to reconcile the duplicate commit lineages, resulting in repeated merge conflicts, resurrecting previously discarded commits, and corrupting team audit trails.

---

### 4. What is the difference between git merge and git rebase, and when would you actually pick one over the other?
`git merge` creates a new "merge commit" combining two distinct commit histories with multiple parents, preserving the exact chronological sequence and branch topology. `git rebase` replays local commits on top of another branch tip one by one, producing a linear, clean commit history without extra merge nodes.

**When to pick merge:** Use `git merge --no-ff` when merging finished feature branches or Pull Requests into production branches (`main`). It preserves verifiable audit history, branch lifetime provenance, and allows single-command rollbacks (`git revert -m 1`).  
**When to pick rebase:** Use interactive rebase (`git rebase -i`) locally on private feature branches before opening a PR to clean up "work-in-progress" commits.

---

### 5. What causes a merge conflict, and what is actually happening in the file when you see the conflict markers?
A merge conflict occurs when two branches make different modifications to the exact same lines of a file (or when one branch edits a file that another deleted) since their common ancestor (`merge-base`), and Git cannot determine mathematically which version takes precedence.

When conflict markers appear (`<<<<<<<`, `=======`, `>>>>>>>`):
- Text between `<<<<<<< HEAD` and `=======` represents the version in your currently checked-out branch.
- Text between `=======` and `>>>>>>> <branch_name>` represents the incoming changes from the branch being merged.
Git halts execution and leaves both conflicting blocks directly in your working directory, requiring a human to reconcile the code before committing.

---

### 6. What is the difference between the working directory, the staging area and the repository?
- **Working Directory:** The physical file tree on your operating system where files are created, edited, and compiled. Changes here are untracked and ephemeral until staged.
- **Staging Area (Index):** A binary file (`.git/index`) that holds a prepared snapshot of proposed changes ready for the next commit. It decouples what you have edited from what you deliberately choose to record.
- **Repository (`.git` store):** Git's permanent object database containing immutable blobs (file snapshots), trees (directory structures), commits, and references (`refs/heads/*`). Once committed here, changes are cryptographically secured and recoverable via reflog.

---

### 7. What is branch protection, and what does it typically enforce?
Branch protection is a repository governance control enforced by remote hosting platforms (GitHub/GitLab) preventing direct or unauthorized mutations to critical branches like `main`.

It typically enforces:
1. **No Direct Pushes:** Mandates all changes arrive via Pull Requests.
2. **Required Status Checks:** Automated CI test suites, linter runs, and security secret scans must pass with exit code 0 before merging.
3. **Peer Review Approvals:** Requires at least one code review approval from designated code owners.
4. **Linear History / Dismissal Rules:** Forbids force pushes (`git push -f`), prevents branch deletions, and dismisses stale approvals when new commits are pushed.

---

### 8. Walk me through a technical project you built end to end.
I built SchoolFix, a mobile-first school management and tuition reconciliation web application tailored for Nigerian private schools. The product addresses the daily breakdown between classroom attendance and tuition settlement over metered 3G networks.

I engineered the application using Next.js App Router, TypeScript, and PostgreSQL with Prisma. I designed a frozen 11-model relational schema enforcing strict foreign-key immutability (`onDelete: Restrict`) on financial ledgers. I created an atomic dual-ledger payment subsystem integrating Flutterwave webhooks with idempotent verification checks, derived a 15-style design token system based on Bricolage Grotesque with brand-tinted Indigo shadows, and built offline optimistic queuing with local persistence.

---

### 9. Tell me about a time when something you built broke in production.
During database initialization for SchoolFix, the server crashed due to an unsupported `pgvector` extension on Windows PostgreSQL. PRD §8.2 defined a `DocumentChunk` model with vector embeddings for policy search, which aborted table creation across all relational entities.

**Resolution:** Because relational persistence was blocked, I immediately isolated the failure. I authored `prisma/init-schema.sql` cleanly defining the 10 core relational tables and foreign keys without the vector extension, unblocking database writes and Next.js server boots. I documented the platform boundary in the project README, configuring `pgvector` to run exclusively inside Docker/Linux container builds.

---

### 10. How do you approach learning a new technical platform or codebase quickly when starting a new engagement?
I apply an outside-in, execution-first approach:
1. **Trace the Data & Boundaries:** Inspect the database schema (`schema.prisma`) and API entry routes to understand the domain entities, invariants, and authorization boundaries.
2. **Verify Local Reproducibility:** Execute the setup commands from a clean terminal. I identify broken dependencies, missing environment variables, or outdated scripts immediately.
3. **Follow a Core Request Lifecycle:** Trace a single write transaction from client input, through validation schemas (Zod), ORM queries, to persistent storage.
4. **Deliberate Diagnostics:** Introduce a deliberate break (e.g., severe connection) to observe failure logging, error codes, and resilience behavior.

---

### 11. What is the difference between code that is correct and code that is complete?
**Correct code** satisfies the happy path specification under ideal conditions: given valid inputs and a live database, it executes business logic and returns the anticipated output.

**Complete code** handles the entire operational lifecycle and environment failure envelope. Complete code:
- Enforces strict input validation and rejection boundaries.
- Rejects writes atomically during database partitions without data loss.
- Handles retries idempotently without duplicate billing.
- Emits structured machine-readable error logs with appropriate HTTP status codes (201, 400, 409, 503).
- Implements accessible UI feedback and clean teardown on failure.

---

### 12. How do you design software for a customer who will need to maintain it after you are gone?
1. **Derive, Don't Guess:** Bind all architectural choices, data types, and retention policies to the customer's operational domain rather than generic frameworks.
2. **Zero Magic & Minimal Dependencies:** Use standard framework primitives (Next.js, vanilla CSS tokens, standard SQL) rather than esoteric libraries or complex metaprogramming.
3. **Rigorous Context Artifacts:** Author a verified `README.md` containing exact startup commands tested on external developers, an explicit `.env.example`, and an unvarnished defect log.
4. **Defensive Schema Design:** Use explicit database-level constraints (foreign keys, `onDelete: Restrict`, composite unique indices) so data integrity is enforced by the database engine itself.

---

### 13. Your first page load took a specific number of milliseconds. Where did that time go? Name the parts you can measure and the parts you are guessing about.
Our cold server startup required **836 ms** (`evidence/03-server-start.txt`) and first page compilation took **1,120 ms** (`evidence/04-first-load.txt`).

**Measurable Parts:**
- Next.js server initialization and route manifest parsing: logged at 836 ms.
- Dynamic route server-side rendering (SSR) and React component tree tree-shaking: logged at 1,120 ms.
- Static asset serving for embedded font file (`BricolageGrotesque.ttf`): 42 ms over local loopback.

**Guessed Parts:**
- Windows NTFS file system inode resolution latency during multi-chunk JavaScript bundling.
- V8 engine JIT compilation overhead for unoptimized modules on cold start.

---

### 14. Your application reported success to the user while writing nothing to the database. Explain the mechanism that allowed that, and name the one check that would have caught it in thirty seconds.
**Mechanism:**  
The frontend form handler executed a submission and blindly displayed a "Registration Successful!" banner based solely on receiving an HTTP 200 response or without awaiting server validation. On the backend, the handler wrapped database calls in a blanket `try/catch` block that logged the error but returned `{ success: true }`, or the route failed to verify `DATABASE_URL`, leaving the database empty.

**The 30-Second Check:**  
Inspect the server logs for **`HTTP 201 Created`** and run a database query (`SELECT COUNT(*) FROM "User";`) immediately following form submission. If the table count does not increment, the write failed.

---

### 15. Wrong-answer analysis. A candidate says: "I always check my app is working by signing up a test user and confirming I get taken to the dashboard. If the dashboard loads, the backend is working." Say what is wrong with this, what it would miss, and what you would do instead.
**What is wrong:**  
Loading a dashboard route is purely client-side routing. It only proves that a frontend route transition fired; it does not prove data was persisted to persistent relational storage.

**What it misses:**  
1. Database connectivity failures where errors are caught and swallowed.
2. Missing or failed `INSERT` transactions.
3. Unverified credentials, broken password hashing, or failed ledger creations.
4. Incomplete data structures that crash subsequent queries.

**What to do instead:**  
Verify the backend HTTP status code is **`201 Created`**, inspect server logs, and query the database directly with row ID and timestamp proof (`evidence/11-write-succeeded-logs.txt`).
