# Task Two: Model Selection & Engineering Deliberation

---

## 1. Which Model for Which Job

* **Antigravity (Deliberate Planning & Architecture Agent):**
  * **Job:** Project scaffolding, architectural design, context ingestion (PRD and Design Tokens), schema design, and compliance verification.
  * **Rationale:** Antigravity operates on a multi-step deliberation cycle: it reads context files thoroughly, constructs an internal dependency graph, and verifies constraints before invoking any tool. This prevents the catastrophic AI scaffolding failure where an ungrounded model attempts to generate hundreds of broken files in a single pass.
* **Fast / Specialized Code Completion Model (Open Code / Sonnet / Fast Agent):**
  * **Job:** Rapid implementation of mechanical boilerplate, unit test suites, and CSS class mappings.
  * **Rationale:** Once architectural patterns, types, and schemas are strictly defined, rapid completion models excel at velocity without requiring heavy re-planning cycles.

---

## 2. Observed Differences in Practice

| Dimension | Antigravity (Deliberate Planning) | Fast Completion Agent (Direct Coding) |
| :--- | :--- | :--- |
| **Pacing** | Measured, multi-second analysis before tool calls. | Immediate file output within 1–2 seconds. |
| **Context Ingestion** | Reads entire PRD, schema, and token JSON before planning. | Reads immediate prompt only; skims or ignores external context files. |
| **Token Adherence** | Strictly maps CSS variables to `tokens.css`; verifies zero raw hex values. | Frequently hallucinates Tailwind arbitrary values (`bg-[#4b0082]`) or hardcoded pixel font sizes. |
| **Scope Discipline** | Halts at the foundation and home screen as instructed by Rule 6. | Frequently over-scaffolds, generating mock auth controllers, fake databases, and broken stub functions. |

---

## 3. The Task Where We Chose Wrong and Switched

During an early pass at generating the database schema and model interfaces, we initially prompted a fast coding model to generate the Prisma models quickly. 

**What went wrong:**
The fast model ignored the strict dual-ledger requirement in Section 6.4 of `prd.md`. It produced a single generic `Payment` table with an optional `status` string, completely omitting the `PaymentAttempt` model, failing to enforce `onDelete: Restrict` on financial foreign keys, and omitting the `pgvector` extension flag required for document embeddings.

**The Switch:**
We discarded the ungrounded output and switched to Antigravity. By forcing the agent to ingest `prd.md` Section 8 directly, it captured the exact 11 models, preserved financial audit integrity with separate `PaymentAttempt` records, and respected the Propose-and-Stop rule by synthesizing the schema without executing autonomous database migrations.
