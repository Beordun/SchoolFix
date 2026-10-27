# Task One: Documented Defects & Production Cost Analysis

According to the assessment guidelines, a defect-free submission is a failure to account for real engineering trade-offs. The following real defects occurred during the execution of Task One.

---

## Defect 1: Redundant Token Naming in Shadow Compiler (`scripts/build-tokens.js`)

* **File:** `scripts/build-tokens.js`
* **Line Number:** Line 109 (prior to patch at lines 109–116)
* **The Defect:**
  The token exporter from Figma keyed shadow styles as `"soft shadow"`, `"medium shadow"`, and `"hard shadow"`. In the initial compiler implementation, the key was transformed directly via `kebabCase(shadowKey)`, producing CSS custom properties named:
  ```css
  --shadow-soft-shadow: ...;
  --shadow-medium-shadow: ...;
  --shadow-hard-shadow: ...;
  ```
  However, component stylesheets (and design specifications) referenced the canonical role names `--shadow-soft`, `--shadow-medium`, and `--shadow-hard`.
* **What It Would Cost in Production:**
  In production, CSS variables that resolve to `undefined` cause browser fallbacks or silently drop the declaration. Elevated components (such as modal dialogues, floating action buttons, and dropdown filter menus) would render completely flat against background surfaces with zero elevation. On low-contrast Android screens, users would be unable to distinguish an active modal dialogue from the background student roster, causing high click error rates, mis-tapped form buttons, and broken hierarchy.
* **The Fix:**
  Stripped trailing `-shadow` in `scripts/build-tokens.js` and created both clean role names (`--shadow-soft`) and backward-compatible aliases.

---

## Defect 2: Text Contrast Vulnerability on `--color-outline` (`task-01-design-system/tokens.css`)

* **File:** `task-01-design-system/tokens.css`
* **Line Number:** Line 136 (`--color-outline: var(--_primitive-neutral-variant-50); /* #79757F */`)
* **The Defect:**
  The measured contrast ratio of `--color-outline` (`#79757F`) against the canvas surface `--color-surface` (`#F8F7FA`) is **4.22:1**. While this exceeds the **3.0:1** requirement for graphical objects and non-text UI component boundaries under **WCAG 2.1 AA 1.4.11**, it falls below the **4.5:1** requirement for standard body and caption text under **WCAG 1.4.3**.
* **What It Would Cost in Production:**
  If a frontend developer accidentally consumes `--color-outline` for disabled input placeholders, helper hints, or timestamp captions, text becomes illegible for teachers and parents experiencing age-related vision degradation or viewing phones under bright Nigerian outdoor glare. An accessibility audit would flag the school portal for WCAG compliance failure.
* **The Resolution / Guardrail:**
  Strict architectural restriction: `--color-outline` is formally designated in `docs/colour-roles.md` as non-text UI borders only. Secondary body copy must strictly consume `--color-on-surface-variant` (`#49454E`), which provides a compliant **8.77:1** ratio.
