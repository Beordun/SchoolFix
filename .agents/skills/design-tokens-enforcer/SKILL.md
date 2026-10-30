---
name: design-tokens-enforcer
description: Enforces strict adherence to SchoolFix semantic design tokens, audits raw hex/RGB leaks, and runs the token compiler.
---

# Design Tokens Enforcer Skill

## Purpose
Enforces zero aesthetic drift and maintains `design-tokens/tokens.css` as the single source of truth for the SchoolFix application.

## Core Rules
1. **Universal Page & Session Coverage:** All designs, public landing pages, authenticated portals, and session screens (including session inspector, auth routes, administrative views, error boundaries, and modals) MUST strictly carry and consume the compiled semantic design tokens. No screen or developer session is exempt from token inheritance.
2. **Never use raw color values:** Writing `#4B0082`, `#111827`, `rgb(...)`, or any un-aliased color code in components or CSS is strictly forbidden.
3. **Never consume primitive variables directly:** UI components must consume semantic CSS variables (`--color-surface`, `--color-primary`, `--color-on-primary`, `--color-error`), NEVER internal primitive scales (`--_primitive-*`).
4. **Typography Formula:** All typography styles must map to the 15 Bricolage Grotesque tokens with $1.4\times$ line-height multipliers.
5. **Touch Targets & Spacing:** Touch targets must be at least `var(--size-touch-target)` or `2.75rem`. Button padding must be defined in `rem` units with an explicit `border-radius: 8px`.

## Operational Workflows

### 1. Compile Tokens from JSON Source
When tokens in `design-tokens/design-tokens.tokens.json` are modified, recompile them immediately:
```bash
node scripts/build-tokens.js
```
This updates `design-tokens/tokens.css`, `task-01-design-system/tokens.css`, and the root `tokens.css`.

### 2. Audit Codebase for Raw Style Leaks
Run this search to ensure zero hardcoded hex or RGB colors exist in application components:
```bash
node scripts/search-raw-values.js
```
Expected output: 0 matches outside the compiled token files.
