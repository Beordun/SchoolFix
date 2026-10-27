# Task One: The Design System, and Proving the Agent Used It

## 1. What This Task Was
Design and prove an end-to-end design token system for **SchoolFix**, an administrative operating system for Nigerian private schools. The objective is to translate brand and operational constraints into a rigorous token system in Figma, export it as machine-readable JSON, transform it into semantic CSS variables, and prove via automated inspection that the coding agent strictly consumed the tokens without raw styling regressions.

## 2. What We Built
* **Docs & Rationale:**
  * [business-brief.md](file:///c:/Users/DT001/Desktop/SchoolFix/task-01-design-system/docs/business-brief.md) - Context, user profile, and typography drivers.
  * `colour-roles.md` - Semantic role mapping, primitive targets, and WCAG contrast audit.
  * `type-scale.md` - 15-style scale (Display, Headline, Title, Body, Label) with formula-driven line heights.
  * `shadows.md` - Elevation shadows tinted with brand primary color.
  * `divergences.md` - Material baseline divergences and their explicit failure modes.
  * `prompts.md` - Verbatim prompt transcripts for agent conversion.
  * `defects.md` - Documented real defect, file/line reference, and production cost analysis.
  * `interview-answers.md` - Defense answers for 12 technical questions.
* **Evidence:**
  * Palettes (before and after pinning Primary 40).
  * Display Large letter-spacing visual comparison.
  * Incomplete vs complete token JSON export.
  * Raw hex scan script output across codebase.
  * Agent interrogation log on typography choices.
  * Deliberate regression capture and unmerged git branch log.

## 3. What We Decided
*(To be detailed as each step is completed)*

## 4. What We Got Wrong (Defects & Iterations)
*(To be detailed with exact file and line references)*
