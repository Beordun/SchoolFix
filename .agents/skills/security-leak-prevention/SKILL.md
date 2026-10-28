---
name: security-leak-prevention
description: Prevents exposing or committing sensitive information, API keys, database credentials, real connection strings, and PII to git/GitHub.
---

# Security & Secret Leak Prevention Skill

## Purpose
Guarantees that no sensitive credentials, live database connection strings, API secrets, or personally identifiable data (PII) are ever committed to git, pushed to GitHub, or leaked into public documentation.

> **CRITICAL ASSESSMENT DIRECTIVE:**  
> A secret committed to the repository at ANY point in its git history (even if immediately reverted in a subsequent commit) constitutes an **AUTOMATIC ASSESSMENT FAILURE**. Git history is permanently scanned.

---

## 1. Protected Data Classes

Under NO circumstances may the agent generate, output into committed files, or stage the following:

| Sensitive Class | Prohibited Content | Compliant Handling |
| :--- | :--- | :--- |
| **Database Credentials** | Live PostgreSQL URLs with real passwords (`postgresql://admin:SecretPass123@...`) | Use dummy host in `.env.example`: `postgresql://user:password@localhost:5432/schoolfix_db`. Real values live exclusively in uncommitted `.env.local`. |
| **Payment Gateway Keys** | Real Flutterwave secret keys (`FLWSECK-...`), secret hashes, or webhook verif-hashes | Use sanitized placeholders: `FLWSECK_TEST-xxxxxxxxxxxxxxxxxxxx-X`. |
| **Authentication Secrets** | Real session signing secrets, cookie encryption keys, or private key blocks (`-----BEGIN RSA PRIVATE KEY-----`) | Use empty strings in `.env.example`: `SESSION_SECRET=""`. |
| **Session & Token Dumps** | Raw 32-byte session tokens or plaintext passwords in terminal evidence or logs | Redact before saving to text evidence: `sessionToken: [REDACTED]`, `password: [REDACTED]`. |
| **Personally Identifiable Info (PII)** | Real student/parent phone numbers, NIN/BVN numbers, real bank account numbers | Use synthetic test identities (e.g., `Folashade Adeleke`, `student-001@schoolfix.internal`). |

---

## 2. Inviolable Security Rules

1. **Strict `.gitignore` Verification:**  
   Before running any git staging or commit command, verify that `.env`, `.env.local`, `.env.*.local`, and all database dumps (`*.sql`, `*.dump`) are strictly ignored.
2. **Never Commit Database Dumps:**  
   Database backups, `.sql` schema dumps containing live records, or `.sqlite` local database files must never be added to git tracking.
3. **Redact Terminal Evidence:**  
   Before saving logs into `task-*/evidence/*.txt`, scan for authorization headers, cookie tokens, or connection strings and replace them with `[REDACTED]`.
4. **No Plaintext Passwords in Seeds:**  
   Database seed scripts must only contain pre-hashed Argon2id hashes, never plaintext user passwords.

---

## 3. Operational Workflows

### Pre-Commit Secret Audit
Run an automated grep search across all staged changes before every git commit:
```bash
git diff --cached | grep -Ei "password|secret|key|token|flwseck|database_url"
```
If any real credential appears in the diff, unstage immediately and move it to `.env.local`.

### Viva Emergency Defense Protocol: "Accidental Leak"
If asked in the technical viva: *"How would you handle a situation where you accidentally committed sensitive information to a public repository?"*
- **WRONG Answer:** *"I would make another commit that removes the file or reverts the commit."* (The secret remains accessible in git history).
- **CORRECT Answer:** 
  1. **Immediate Revocation:** Instantly rotate the compromised key at the provider (revoke Flutterwave API secret, change database user password, cycle session secrets). Treat the secret as compromised from second zero.
  2. **History Purge:** Use `git-filter-repo` or BFG Repo-Cleaner to permanently scrub the secret from all commits and trees across the entire git history.
  3. **Force Push with Audit:** Force push the cleaned tree (`git push --force-with-lease`), alert team leads, and review access logs for the window of exposure.
