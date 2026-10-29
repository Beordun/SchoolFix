# Version Control Provenance: Roll Back Without Hallucination

> **Product:** SchoolFix (Mobile-First School Administration & Tuition Reconciliation)  
> **Target Context:** Nigerian Private Primary and Secondary Schools  
> **Step Reference:** Task 3, Step 9 — Roll Back Without Hallucination  
> **Canonical Evidence:** [`task-03-client-validation/evidence/17-commit-list-and-rollback.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-03-client-validation/evidence/17-commit-list-and-rollback.txt)  
> **Active Branch:** `feature/task-3-client-validation`  
> **Timestamp:** 2026-10-29T14:39:35Z  

---

## 1. The Deliberate Mistake: Unwanted Security Clutter

To rigorously test version control recovery without hallucinating commit hashes or inventing state transitions, we introduced a deliberate regression into `app/auth/AuthCard.tsx`.

### The Defective Change
We injected an unnecessary form field: `"Child's Favorite Pet Name (Experimental Clutter)"`.

### Why This Was an Architectural Violation
Under the 3 criteria established in [`docs/field-justification.md`](file:///c:/Users/DT001/Desktop/SchoolFix/task-03-client-validation/docs/field-justification.md):
1. **Can the user accomplish their critical path without it?** Yes. Parents create accounts solely to view attendance and settle tuition; pet names have no operational relevance.
2. **Does this impose unnecessary cognitive friction on 3G mobile devices?** Yes. Extra inputs waste screen real estate on cracked or compact Android displays and increase abandonment.
3. **Does it violate data minimization under statutory compliance?** Yes. Under NDPA 2023 §24(1)(b), collecting arbitrary personal trivia without specific legal or operational justification creates unnecessary compliance liability.

We committed this defect to the branch with commit hash `ad4d501`:
```bash
git add app/auth/AuthCard.tsx
git commit -m "feat(auth): add experimental pet name security field (deliberate mistake)"
```

---

## 2. Commit List Inspection (`git log -n 5`)

Before executing any rollback, we inspected the branch history using `git log -n 5 --oneline`:

```text
ad4d501 feat(auth): add experimental pet name security field (deliberate mistake)
171a725 feat(task-3): document form attack results and client-side bypass whitepaper
d0644eb feat: add client-side authentication validation rules and supporting documentation
80b9258 feat(auth): add accessible password visibility eye toggle to eliminate mistype re-entry
811290e feat(task-3): collapse authentication pages into single-page query state machine with page count proof
```

From this real, machine-generated history, we identified the target commit immediately preceding the defect:
- **Defective Commit:** `ad4d501`
- **Target Rollback Target:** `171a725` (`feat(task-3): document form attack results and client-side bypass whitepaper`)

---

## 3. Executing the Rollback

We rolled back the branch to the exact target hash using:
```bash
git reset --hard 171a725
```

### Terminal Output
```text
HEAD is now at 171a725 feat(task-3): document form attack results and client-side bypass whitepaper
```

A subsequent `git status` confirmed the working tree was completely restored and clean:
```text
On branch feature/task-3-client-validation
nothing to commit, working tree clean
```

---

## 4. Architectural Analysis: `git reset --hard` vs `git revert`

A critical competency in professional version control is knowing when to use `reset` versus `revert`:

| Evaluation Criterion | `git reset --hard <commit-id>` | `git revert <commit-id>` |
| :--- | :--- | :--- |
| **Mechanism** | Rewinds the `HEAD` pointer, working tree, and index back to the target commit. The unwanted commit is detached from the branch history. | Creates a new, forward-facing commit that applies the exact inverse diff of the target commit. |
| **History Impact** | Completely cleanses the branch commit log; removes noisy or defective trial commits. | Preserves all historical commits and explicitly documents the rollback as a new historical event. |
| **Public Collaboration Safety** | **DANGEROUS on shared branches.** If commits were already pushed to a public remote (`origin/main`), resetting requires a destructive `git push --force`, which overwrites collaborators' branches. | **SAFE on shared branches.** Because it moves forward linearly, collaborators can pull the new revert commit without merge conflicts or rebases. |
| **Local Feature Branch Suitability** | **OPTIMAL for local feature branches.** Before a PR is opened or merged, maintaining an atomic, clean, logical commit history is best practice. | Adds unnecessary clutter (`"Revert 'feat(auth): ...'"`) to an unmerged feature branch. |

### Decision Rationale
For this step, `git reset --hard 171a725` was the objectively correct architectural decision because `ad4d501` existed solely on our local feature branch `feature/task-3-client-validation`. It had never been merged into `main` or pulled by team members. Resetting cleanly erased the clutter before merging.

---

## 5. Forensic Safety: The Role of `git reflog`

Even when `git reset --hard` is executed, Git never immediately destroys commits. The Git Reference Log (`git reflog`) maintains a chronological journal of every pointer movement:

```text
171a725 HEAD@{0}: reset: moving to 171a725
ad4d501 HEAD@{1}: commit: feat(auth): add experimental pet name security field (deliberate mistake)
171a725 HEAD@{2}: commit: feat(task-3): document form attack results and client-side bypass whitepaper
d0644eb HEAD@{3}: commit: feat: add client-side authentication validation rules and supporting documentation
80b9258 HEAD@{4}: commit: feat(auth): add accessible password visibility eye toggle to eliminate mistype re-entry
```

If an engineer accidentally resets to the wrong hash, `git reflog` allows instantaneous recovery of the lost SHA (`git reset --hard ad4d501` or `git checkout HEAD@{1}`). This proves that version control provides deterministic, non-hallucinatory rollback capabilities when wielded with technical precision.
