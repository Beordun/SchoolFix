# Task One: The Design System, and Proving the Agent Used It

> **Technical Interviewer Overview (4-minute read)**  
> **Business:** [SchoolFix](docs/business-brief.md) — Administrative operating system for Nigerian private primary and secondary schools.  
> **Key User:** Mrs. Folashade Adeleke, classroom teacher / level coordinator, using a sub-$100 Android smartphone over metered, variable 3G/4G connectivity.

---

## 1. What This Task Was
We designed, implemented, and proved an end-to-end design token architecture for SchoolFix. Rather than accepting generic AI defaults, we derived every color tone, typography style, line-height ratio, and elevation shadow from the operational constraints of Nigerian schools. We exported these tokens from Figma into machine-readable JSON, compiled them into semantic CSS variables via a custom zero-dependency Node.js compiler (`scripts/build-tokens.js`), and proved through automated codebase scanning, typography interrogation, and an intentional regression branch that the coding agent strictly consumed the design system without hardcoding raw styles.

---

## 2. What We Built

### Written Documentation (`docs/`)
* [business-brief.md](docs/business-brief.md) — 348-word operational brief establishing user hardware constraints, network profile, and the critical path.
* [colour-roles.md](docs/colour-roles.md) — Semantic role definitions, 14-step tonal palette logic, and mathematical WCAG contrast audits.
* [type-scale.md](docs/type-scale.md) — All 15 Bricolage Grotesque styles, the formula-based line-height ($1.4\times$), and optical tracking.
* [shadows.md](docs/shadows.md) — Elevation system tinted with primary brand Indigo (`#4B0082`) rather than muddy black.
* [divergences.md](docs/divergences.md) — Three deliberate divergences from the Material baseline and their explicit failure modes.
* [prompts.md](docs/prompts.md) — Verbatim prompt logs for the JSON-to-CSS compiler with failure calibrations.
* [defects.md](docs/defects.md) — Real defects documented with exact file/line references and production cost analysis.
* [interview-answers.md](docs/interview-answers.md) — Rigorous answers to all 12 technical interview questions ($\le 200$ words each).

### Machine-Specific Evidence (`evidence/`)
* `01-palette-before-pin.png` & `02-palette-after-pin.png` — Visual proof of pinning Primary 40 in Figma.
* `03-spacing-default.png` & `04-spacing-chosen.png` — Optical tracking comparison showing line-wrap reduction on Display Large.
* `05-tokens-incomplete.json` & `06-tokens-complete.json` — The caught omission and the complete export.
* `07-raw-value-search.txt` — Codebase grep proof showing **0 raw hex / rgb colors** in the systematized screen.
* `08-agent-typography-answer.txt` — Verbatim dialogue verifying agent typography style application.
* `09-screen-without-system.png` & `10-screen-with-system.png` — Before/after comparison of the Daily Attendance screen.
* `11-broken-referencing.png` — Capture of the fractured UI caused by hardcoded hex regression.
* `12-git-log-branch-unmerged.txt` — Git reflog and commit graph proving the regression branch was deleted unmerged.

---

## 3. What We Decided
1. **Brand Primary Pinned to Indigo 40 (`#4B0082`):** Grounded in Nigerian academic heritage; pinning prevents the generator from diluting the authoritative brand density into washed-out violet.
2. **Typeface Bricolage Grotesque:** Selected for wide-open counters and pronounced glyph apertures, ensuring numbers (`3`, `8`, `0`, `6`) are never misread on cracked phone displays in outdoor sunlight.
3. **Formula-Driven Line Height ($1.4\times$):** Strict mathematical compacting ($\text{Line Height} = \text{Font Size} \times 1.4$) prevents student clearance tables from being pushed below the fold on 5.5-inch screens.
4. **Brand-Tinted Elevation Shadows:** Shadows tinted with `#4B0082` (12%, 18%, 20% alpha) mimic real-world ambient color bouncing, eliminating the dirty, disconnected look of pure black drop-shadows.
5. **Private Primitives + Public Semantic Roles:** Primitives are compiled as internal variables (`--_primitive-*`), while components strictly consume semantic roles (`--color-surface`, `--color-primary`), making rebranding and theming frictionless.

---

## 4. The Token Omission (Step 5 One-Line Diff)
* **The Missing Content:** The initial export (`05-tokens-incomplete.json`) contained only the `primitives` collection and omitted all 15 typography styles and 3 elevation shadow styles.
* **How We Noticed:** Top-level inspection revealed only the `"primitives"` key because Figma's Design Tokens plugin exported Variables but required Text and Effect Styles to be explicitly toggled in export settings.
* **One-Line Diff:**
  `+ "font": { ... 15 styles ... }, + "effect": { ... 3 shadows ... }`

---

## 5. The Argument for Token Referencing (Step 8 Three Sentences)
When `--color-primary` was hardcoded to a raw hex value while remaining components referenced the primitive palette, rebranding the brand color at the source instantly shattered visual coherence: status pills, tags, and container states updated to emerald green while the primary action button and headers remained stranded on purple. 

Hardcoded color values create silent architectural debt where design changes require error-prone manual searches across hundreds of files. 

Token aliasing ensures that semantic intent is cleanly separated from primitive values, guaranteeing that a single source update cascades universally across every component in the interface without regressions.

---

## 6. What We Got Wrong (Real Defects)
* **Compiler Naming Defect (`scripts/build-tokens.js:109`):** Keyed shadow styles with redundant suffixes (`--shadow-soft-shadow`), causing elevated modals to render flat. Fixed by normalizing variable generation.
* **Outline Contrast Boundary (`tokens.css:136`):** The outline token has a **4.22:1** ratio against surface. While compliant with WCAG AA 1.4.11 for non-text UI boundaries ($\ge 3:1$), it is strictly prohibited for body text to prevent readability failure.
