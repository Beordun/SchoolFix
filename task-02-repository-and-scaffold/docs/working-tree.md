# Task Two: The Working Tree & Branching Mechanics

> **Document:** `task-02-repository-and-scaffold/docs/working-tree.md`  
> **Topic:** What breaks when a tree has one branch, and why that matters more after your first deployment than before it.  
> **Associated Evidence:** `evidence/14-working-tree-drawing.jpg`  

---

## 1. What the Working Tree Actually Is

The Git working tree is not merely a folder on a hard drive; it is an active four-stage pipeline connecting developer intention to end-user execution:

1. **Your Computer (Working Directory & Staging Index):** Where raw code changes are drafted, edited, and staged via `git add`.
2. **Local Git Store (`.git/` Warehouse):** The local object database where snapshots are committed (`git commit`). History here is private, malleable, and fully rewritable.
3. **GitHub (Shared Remote Repository):** The centralized coordination point where branches converge via Pull Requests.
4. **Production (Live Deployment Environment):** The running server where code executes against live PostgreSQL databases and real Nigerian school users.

---

## 2. The Two Critical Architectural Boundaries

In our hand-drawn working tree diagram (`evidence/14-working-tree-drawing.jpg`), two distinct points dictate engineering risk:

### Boundary 1: The Point Past Which a Mistake Can No Longer Be Undone Quietly
* **Location:** The network transition between the **Local Git Store** and **GitHub** (`git push`).
* **Why It Matters:**  
  Inside your local warehouse, mistakes can be eliminated without leaving a trace. A developer can amend a commit (`git commit --amend`), reorder commits via interactive rebase (`git rebase -i`), or squash messy experimental commits. No one else has seen the SHA-1 hash.  
  The moment code is pushed to GitHub, that privacy vanishes. The hash is shared with colleagues and automated CI systems. If you subsequently attempt to rewrite history using `git push --force`, you corrupt the local trees of every teammate who pulled your branch, desynchronize open pull requests, and invite merge conflicts. Pushing past this line means any rollback must now be done publicly—either via a clean `git revert` or through an explicit, auditable pull request.

### Boundary 2: The Point Where Code Becomes Visible to Users
* **Location:** The continuous integration/continuous deployment (CI/CD) trigger between **GitHub** and **Production**.
* **Why It Matters:**  
  Code residing on GitHub may be broken, incomplete, or experimental without harming anyone, provided it sits on an isolated feature branch. However, once merged into `main`, automated pipelines build the Next.js bundle and deploy it to the live web server. At this exact point, a syntax error, a broken database connection, or an unhedged token regression directly impacts school bursars reconciling payments and teachers recording morning attendance.

---

## 3. What Breaks When a Tree Has Only One Branch

Committing directly to `main` (the single-branch antipattern) is deceptively painless during initial solo scaffolding. Because there are no live users and no deployment webhooks, breaking changes have zero immediate cost. 

However, **after your first deployment**, a single-branch tree breaks in three catastrophic ways:

### 1. Inability to Ship Emergency Hotfixes (Pipeline Entanglement)
Imagine you are halfway through implementing a large refactor of the Continuous Assessment calculation engine—an incomplete feature spanning three days. Suddenly, a production bug is discovered: Flutterwave webhook verification is rejecting valid tuition payments due to a missing header check.
* **In a Multi-Branch Model:** You leave your feature branch (`feature/ca-scoring`), check out from the clean `main` branch, branch off `hotfix/flw-header`, fix the bug in three lines, test it, merge it to `main`, and trigger a production patch in 15 minutes.
* **In a Single-Branch Model:** Your unfinished CA calculation code is mixed directly into `main`. You cannot deploy the urgent Flutterwave hotfix without also shipping incomplete, broken grading algorithms to live classrooms. You are forced to choose between leaving tuition broken or shipping broken gradebooks.

### 2. Destruction of the Continuous Deployment Invariant
Modern deployment infrastructure (e.g., Vercel, AWS Amplify, Kubernetes runners) treats the `main` branch as an absolute contract: **everything on `main` is production-ready at all times.**  
In a single-branch workflow, every commit triggers a production build. Developers begin writing defensive "work-in-progress" code or commenting out half-finished components to avoid breaking the build, turning the production repository into a chaotic scratchpad.

### 3. Loss of Code Review & Audit Isolation
When multiple features are committed to a single branch, pull requests lose all semantic cohesion. A single diff contains database schema tweaks, button padding modifications, and authentication fixes all jumbled together. If one part of the change introduces an unexpected regression, you cannot cleanly revert it without undoing all unrelated features shipped in that same batch.

---

## 4. Why This Matters More After Deployment Than Before It

| Factor | Before First Deployment | After First Deployment |
| :--- | :--- | :--- |
| **User Blast Radius** | Zero. Only the developer sees the error. | High. Hundreds of teachers and parents experience downtime. |
| **Database Corruption Risk** | Trivial. You can wipe and recreate local tables. | Severe. Corrupted financial ledgers cause real-world monetary disputes. |
| **Commit Discipline** | "WIP" and scratch commits carry no operational penalty. | Every commit merged into `main` must pass automated tests and build clean. |
| **Recovery Cost** | Seconds to reset hard to an earlier local hash. | Audited rollback procedure requiring communication with school clients. |

Branching is therefore not a cosmetic Git ritual; it is the structural isolation barrier that makes continuous production delivery possible without risking customer downtime.
