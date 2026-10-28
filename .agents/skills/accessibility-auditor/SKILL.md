---
name: accessibility-auditor
description: Audits HTML forms for WCAG accessibility compliance, color independence, and generates screen reader announcement transcripts.
---

# Accessibility & Screen Reader Audit Skill

## Purpose
Ensures that all forms and interactive controls in SchoolFix are accessible to impaired users, functional on low-end hardware, and pass rigorous assistive technology testing.

## Core Directives
1. **Color Independence:** Never use color alone to signal state. Every inline error must include a caution icon alongside the red border/text.
2. **Keyboard Reachability:** All inputs, checkboxes, and buttons must be navigable via `Tab` with visible `:focus-visible` outlines.
3. **No Disappearing Buttons:** The submit button must remain visible in the DOM while disabled, maintaining its place in the tab order with explanatory messaging.
4. **ARIA Associations:**
   - Error messages must link to their input using `aria-describedby`.
   - Required fields must specify `aria-required="true"`.
   - Invalid fields must specify `aria-invalid="true"`.

## Operational Workflows

### 1. Generating a Verifiable Screen Reader Transcript
When testing forms with screen readers (NVDA, Narrator, or VoiceOver):
1. Navigate through the form field by field using only keyboard arrows and `Tab`.
2. Record the exact spoken text output for both the empty/invalid state and the filled state.
3. Save the transcript with timestamps in `docs/accessibility-audit.md`.

Example transcript format:
```text
[Tab 1] Focus on: Full Name, edit text, required.
[Announcement]: "Full name, edit text, required. Please enter at least two names."
[Tab 2] Focus on: Email Address, edit text, required.
[Announcement]: "Email address, edit text, required. Invalid email format, caution icon displayed."
```
