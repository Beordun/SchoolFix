# Task One: Technical Interview Defence

All answers strictly adhere to the 200-word limit per question, grounded in the technical decisions made for SchoolFix.

---

### 1. How would you structure design tokens?
I structure design tokens into a 3-tier hierarchy: **Global (Primitives)**, **Semantic (Roles)**, and **Component-specific**.

* **Primitives (Tier 1):** Raw values representing scale definitions with zero contextual meaning (e.g., `primary-40: #4B0082`, `neutral-98: #F8F7FA`, `spacing-16: 1rem`).
* **Semantic Roles (Tier 2):** Contextual tokens that describe intent and function rather than physical appearance (e.g., `color-surface: var(--_primitive-neutral-98)`, `color-primary: var(--_primitive-primary-40)`). Components consume ONLY Tier 2 tokens.
* **Component Tokens (Tier 3):** Scoped aliases for isolated component properties (e.g., `button-primary-bg: var(--color-primary)`).

This separation of concerns ensures primitive palettes can change or support theme swaps without breaking component styling contracts.

---

### 2. When is a token change breaking?
A token change is breaking under three conditions:

1. **Deletion or Renaming:** Removing a token key (e.g., changing `--color-surface-container` to `--color-surface-subtle`) breaks any component consuming the old variable, silently reverting properties to browser defaults.
2. **Type or Unit Mutation:** Modifying the data structure or unit expectation (e.g., changing a numeric rem dimension `--space-md: 1rem` into a string or px unit that breaks `calc()` equations).
3. **Semantic Inversion / Contrast Failure:** Altering a background token’s luminance so that existing paired text tokens no longer satisfy WCAG AA contrast (e.g., darkening a light surface token from tone 98 to tone 50 without updating `--color-on-surface`).

---

### 3. How would you support multiple brands and themes?
By decoupling semantic roles from primitive values. 

In CSS, primitives are defined in a shared or brand-specific palette stylesheet, while semantic roles map to those primitives under scoped selector blocks (e.g., `[data-theme="dark"]` or `[data-brand="schoolfix-academy"]`). To toggle themes, you swap the underlying primitive mapping without changing a single line of component CSS. In dark mode, `--color-surface` simply points to `--_primitive-neutral-10` while `--color-on-surface` points to `--_primitive-neutral-90`. The UI components only consume the invariant semantic role.

---

### 4. Can tokens guarantee accessible contrast?
No. Design tokens define isolated values; they cannot independently enforce relational contrast.

A token system can provide compliant pairs by convention (e.g., pairing `--color-primary` with `--color-on-primary`), but CSS custom properties cannot prevent a developer from pairing `--color-on-surface-variant` on top of `--color-primary`, resulting in an inaccessible contrast failure. Tokens are static data. Accessible contrast can only be guaranteed when token pairings are audited in Figma, enforced via lint rules (e.g., stylelint contrast plugins), and validated through automated CI/CD DOM accessibility tests.

---

### 5. How do you ensure that colour contrast guidelines are met within a website or application's design?
1. **Mathematical Verification in Design:** Calculate relative luminance $((L_1 + 0.05) / (L_2 + 0.05))$ in Figma across all paired roles to verify a minimum 4.5:1 ratio for normal text and 3.0:1 for large text/graphical UI boundaries.
2. **Strict Semantic Contract:** Forbid mixing roles arbitrarily; text rendered on a surface must strictly use that surface's `on-*` counterpart.
3. **Automated Pipeline Testing:** Run headless accessibility scanners (axe-core, Lighthouse) in CI pipelines against rendered HTML states.
4. **Hardware Validation:** Test interfaces on low-brightness, low-gamut mobile screens under simulated outdoor glare.

---

### 6. Can you discuss the differences between WCAG levels A, AA and AAA?
* **Level A (Minimum Baseline):** Essential accessibility requirements without which assistive tech users cannot access content (e.g., basic alt text, non-color-dependent signaling, full keyboard navigation). No contrast threshold is mandated.
* **Level AA (Legal & Commercial Standard):** Addresses the most common barriers for disabled users. Requires minimum 4.5:1 contrast for normal body text, 3:1 for large text (>18pt or >14pt bold) and UI components, visible focus indicators, and reflow without loss of content.
* **Level AAA (Specialized / Highest Standard):** Strictest standard, demanding 7:1 contrast for normal text, 4.5:1 for large text, sign language interpretation for audio, and comprehensive reading level adaptations. Not applicable across all content types.

---

### 7. Discuss the importance of semantic HTML in the context of accessibility.
Semantic HTML elements (`<main>`, `<nav>`, `<article>`, `<button>`, `<header>`) provide immediate structural meaning and accessibility tree roles without requiring custom JavaScript or manual ARIA tagging. 

Screen readers rely on semantic tags to construct navigation landmarks, announce element states, and present interactive controls in the tab order. Using a `<div onClick>` instead of a `<button>` robs keyboard users of Enter/Space activation, hides focus indicators, and fails to announce button semantics to screen readers. Semantic HTML guarantees accessibility by default at the browser engine level.

---

### 8. How do you handle design handoff to developers using Figma?
Handoff is structured around **tokens as code contracts** rather than visual redlines:

1. **Variables & Token Architecture:** Ensure Figma Variables map 1:1 with repository tokens, using identical naming conventions (kebab-case semantic roles).
2. **Automated Token Export:** Use plugins or GitHub Actions to export tokens directly into JSON, running automated build scripts (`scripts/build-tokens.js`) to generate CSS variables.
3. **Dev Mode Annotations:** Specify responsive constraints, focus states, and component variant properties in Figma Dev Mode.
4. **Living Shared Documentation:** Maintain a shared design-system catalog where developers and designers inspect the same live CSS variables.

---

### 9. Why do AI-generated interfaces tend to look generic, and what specifically do you hand an agent to stop it?
AI models generate generic interfaces because LLMs predict the statistical average of their training data. When prompted with "build a dashboard," an agent generates the median web pattern: uninspired Tailwind slate grays, Inter font, generic 8px border radiuses, and blue primary buttons.

To stop this, you do not hand the agent prose instructions; you hand it **formal constraints**:
1. A machine-readable token file with strict semantic roles.
2. An invariant typography scale with an explicit multiplier formula.
3. A rule prohibiting raw color hex codes, inline CSS values, or unaliased primitives.
4. A concrete business brief detailing the physical environment, user persona, and edge-case operational realities.

---

### 10. Your line height for display large is a specific number. Why that number and not one step either side of it? What would you lose with each?
Our Display Large is 64px, with a line height of **89.6px** derived strictly via $64 \times 1.4$.

* **One step lower (e.g., $1.3\times = 83.2\text{px}$):** The ascenders and descenders collide. In Bricolage Grotesque, the tall capitals and deep loops on characters like `g`, `p`, and `y` overlap when titles wrap onto two lines, creating visual noise and slowing teacher scannability.
* **One step higher (e.g., $1.5\times = 96\text{px}$):** The lines detach optically. On a 5.5-inch Android phone, excessive vertical whitespace pushes the student attendance roster and fee clearance status below the fold, forcing unnecessary scrolling.

---

### 11. Point at one place in your own token structure that you would build differently if you started again. Say what you would do instead and what it would cost.
I would explicitly separate **Elevation Shadows** into distinct light and dark mode token sets rather than defining a single fixed alpha shadow.

Currently, `--shadow-soft` uses `#4B00821F` (Indigo at 12% opacity). While this produces organic depth on our light surface (`#F8F7FA`), a dark shadow is physically invisible when rendered against a dark surface (`#1C1B1F`). To fix this, I would generate elevated surface tint tokens (e.g. `--color-surface-container-high`) for elevation in dark mode. The migration cost would require refactoring our compiler script to output mode-specific shadow maps and updating all component elevated cards.

---

### 12. Wrong-answer analysis: "I set up design tokens by exporting the hex values from Figma into a CSS file, so every colour in the codebase comes from one place. That makes it a single source of truth." What is missing and what will go wrong in month four?
This candidate confuses **primitives** with a **design system**.

**What is missing:** A semantic abstraction layer. Exporting raw hex codes directly into CSS variables (e.g., `--indigo-500: #4B0082`) creates a palette, not a design system. Roles like `surface`, `primary`, and `on-primary` do not exist.

**What goes wrong in month four:**
1. **Rebranding Nightmare:** Changing brand color requires manually finding every component using `--indigo-500` and deciding if it was meant to be brand primary or an accent badge.
2. **Theming Impossibility:** Dark mode cannot be built because components are hardcoded to specific color hues rather than dynamic semantic roles.
3. **Broken Accessibility:** Developers pair arbitrary hex values, inevitably generating unreadable contrast failures across the UI.
