# SchoolFix — Agent Skills Catalog & Operational Playbook

> **Repository:** SchoolFix  
> **Target Framework:** Next.js App Router, PostgreSQL 16, Prisma ORM, Zod, Flutterwave  
> **Location of Native Skills:** `.agents/skills/<skill-name>/SKILL.md`  

---

## 1. Overview

SchoolFix uses modular agent skills configured in [`.agents/skills/`](file:///c:/Users/DT001/Desktop/SchoolFix/.agents/skills) to enforce high engineering rigor, prevent ungrounded scaffolding, and preserve compliance across all five tasks of the *Ship & Found* curriculum.

```text
.agents/
├── rules/
│   └── rules.md                          # Mandatory operating constraints (sync of AGENTS.md)
└── skills/
    ├── design-tokens-enforcer/           # Design token compilation and hex-leak prevention
    │   └── SKILL.md
    ├── database-diagnostics/             # PostgreSQL verification, 201 logs, and false-success tests
    │   └── SKILL.md
    ├── flutterwave-reconciliation/       # Dual-ledger payment handling and webhook verification
    │   └── SKILL.md
    ├── auth-cryptography/                # Argon2id benchmarking, session tokens, and cookie flags
    │   └── SKILL.md
    ├── accessibility-auditor/            # WCAG audits and screen reader transcript generation
    │   └── SKILL.md
    ├── ndpa-compliance-purger/           # 3-stage account erasure and financial ledger retention
    │   └── SKILL.md
    └── security-leak-prevention/         # Prevents committing secrets, DB credentials, and PII
        └── SKILL.md
```

---

## 2. Skills Index

| Skill Name | Task Mapping | Primary Command / Check | Key Directives |
| :--- | :---: | :--- | :--- |
| [`design-tokens-enforcer`](.agents/skills/design-tokens-enforcer/SKILL.md) | **Task 1 & 2** | `node scripts/build-tokens.js`<br>`node scripts/search-raw-values.js` | Zero raw hex/rgb values; exclusively consume `--color-*` semantic CSS variables; $1.4\times$ line-height formula. |
| [`database-diagnostics`](.agents/skills/database-diagnostics/SKILL.md) | **Task 2 & 4** | `npx prisma generate`<br>Database row verification queries | Strictly **no autonomous migrations**; verify `201 Created` responses with database row timestamps; diagnose false success. |
| [`flutterwave-reconciliation`](.agents/skills/flutterwave-reconciliation/SKILL.md) | **Task 2 & 4** | Inbound webhook verification (`verif-hash`) & settlement transactions | Dual ledger (`PaymentAttempt` vs `Payment`); strict `onDelete: Restrict`; 1.2% electronic convenience fee capped at ₦1,500. |
| [`auth-cryptography`](.agents/skills/auth-cryptography/SKILL.md) | **Task 3 & 4** | Argon2id benchmarking script vs SHA-256 | Passwords hashed exclusively with Argon2id (65,536 KiB, 3 iterations, 4 parallelism); 32-byte session tokens stored as SHA-256 hashes in DB. |
| [`accessibility-auditor`](.agents/skills/accessibility-auditor/SKILL.md) | **Task 3** | Screen reader navigation & audit transcript log | Color independence (caution icon + border); buttons preserved in tab order while disabled; field-by-field screen reader logs. |
| [`ndpa-compliance-purger`](.agents/skills/ndpa-compliance-purger/SKILL.md) | **Task 5** | Purge transaction script with idempotency verification | 3-stage erasure lifecycle (Soft delete $\rightarrow$ 7-day grace lock $\rightarrow$ scheduled anonymization purge); unlinks `Student.parentId` while retaining ledger. |
| [`security-leak-prevention`](.agents/skills/security-leak-prevention/SKILL.md) | **All Tasks** | `git diff --cached` secret scanning audit | Zero secrets committed across entire git history (automatic fail condition); `.env.local`, DB dumps (`*.sql`, `*.dump`), and live keys strictly git-ignored. |

---

## 3. How the Agent Consumes Skills

1. **Lightweight Indexing:** The AI coding agent indexes the `name` and `description` of each skill without filling the context window.
2. **On-Demand Activation:** When a task milestone is reached (e.g., verifying payments or running Argon2id benchmarks), the agent loads the specific `SKILL.md` to follow its step-by-step procedures.
3. **Audit Readiness:** All code and documentation produced via these skills conform strictly to the rules established in [`AGENTS.md`](file:///c:/Users/DT001/Desktop/SchoolFix/AGENTS.md).
