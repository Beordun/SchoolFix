# SchoolFix: Colour System and Semantic Role Mapping

## 1. Brand Colour Origin
* **Brand Colour:** `#4B0082` (Deep Indigo / Academic Purple).
* **Derivation:** In Nigerian private education, deep indigo and regal purple are historically associated with institutional pedigree, discipline, and academic distinction (frequently used in school crests, blazers, and graduation robes). Functionally, SchoolFix operates in a high-stress administrative environment where school fees, attendance records, and exam clearances are routinely disputed. 
* **Distinction:** A cool, saturated indigo establishes an authoritative, institutional presence that stands completely apart from alert states. Unlike fintech blues or generic software slates, this deep tone instantly signals school administration, while leaving pure amber and crimson entirely unpolluted for payment arrears, attendance flags, and system errors.

## 2. Pinning Primary 40 & Visible Difference
* **Pinning Action:** The brand color `#4B0082` was explicitly pinned as `Primary 40` in the Material tonal palette generator rather than allowing the generator to synthesize an arbitrary tone 40 based on standard perceptual lightness curves.
* **Evidence:** 
  * Unpinned / Initial Palette: `evidence/01-palette-before-pin.png`
  * Pinned Primary 40 Palette: `evidence/02-palette-after-pin.png`
* **Visible Difference Rationale:** When the generator runs unpinned, it shifts deep purple towards a generic, washed-out violet at Tone 40 in order to hit uniform mathematical lightness, absorbing the brand's distinct density. By pinning `#4B0082` as `Primary 40`, the entire tonal ladder is forced to anchor against the actual brand color. The resulting dark tones (10, 20, 30) retain rich eggplant and midnight indigo depths, while the lighter tones (80, 90, 95) retain clean lavender-tinted clarity that prevents cards and input backgrounds from turning dull grey.

## 3. Tonal Palette Architecture
* **Tones Generated per Hue:** 14 discrete tones:
  `0`, `10`, `20`, `30`, `40`, `50`, `60`, `70`, `80`, `90`, `95`, `98`, `99`, `100`.
* **Light and Dark Source Sufficiency:** 
  A 14-step tonal scale provides symmetric perceptual contrast steps across both light and dark modes from a single mathematical source:
  * In **Light Mode**: High-lightness tones (`95`, `98`, `99`) form clean surfaces and containers, paired with deep tones (`10`, `20`, `40`) for text and primary elements.
  * In **Dark Mode**: Low-lightness tones (`10`, `20`) form low-glare dark surfaces, paired with high tones (`80`, `90`) for accessible foreground text and controls.
  * The granular upper range (`90`, `95`, `98`, `99`) provides subtle elevation differentiation without needing artificial drop shadows or thick borders, critical for mobile rendering on low-contrast screens.

## 4. Functional Colours
* **Error:** Key `#FF0000` $\rightarrow$ Pinned Tone 40: `#BA1A1A`. Dedicated strictly to form errors, failed payment transactions, and exam clearance blocks.
* **Warning:** Key `#FF8D28` $\rightarrow$ Pinned Tone 40: `#8E4B00`. Dedicated to unpaid fee balances nearing cut-off dates, impending term transitions, and low attendance warnings.
* **Success:** Key `#34C759` $\rightarrow$ Pinned Tone 40: `#006D2E`. Dedicated to confirmed tuition bank reconciliations, complete continuous assessments, and saved registers.

## 5. Semantic Colour Roles
Colour roles represent jobs on the interface, never static hex values or primitive tone names.

| Role | Primitive Source | Hex Code | Purpose / Job on UI |
| :--- | :--- | :--- | :--- |
| `primary` | `primary 40` | `#4B0082` | Primary call to action, active navigation tabs, major submit buttons. |
| `on-primary` | `primary 100` | `#FFFFFF` | Text and icons rendered directly on top of `primary` buttons. |
| `primary-container` | `primary 95` | `#E5D0FB` | Subtle interactive highlights, selected row state in fee registers. |
| `on-primary-container` | `primary 10` | `#1C0035` | High-contrast text on top of `primary-container` chips and tags. |
| `surface` | `neutral 98` | `#F8F7FA` | Global background canvas for mobile and desktop screens. |
| `on-surface` | `neutral 10` | `#1C1B1F` | Primary body copy, student names, fee amounts, and table headings. |
| `on-surface-variant` | `neutral-variant 30` | `#49454E` | Secondary metadata (timestamps, guardian phone numbers, class designations). |
| `surface-container` | `neutral 95` | `#F5F0F4` | Card backgrounds, input field fills, elevated student record modals. |
| `outline` | `neutral-variant 50` | `#79757F` | Form input borders, table dividing rules, chip boundaries. |
| `error` | `error 40` | `#BA1A1A` | Blocked status badges, input error borders, critical alert banners. |
| `on-error` | `error 100` | `#FFFFFF` | Text rendered on top of `error` callouts. |
| `warning` | `warning 40` | `#8E4B00` | Overdue fee tags, partial payment indicators. |
| `on-warning` | `warning 100` | `#FFFFFF` | Text rendered on top of `warning` badges. |
| `success` | `success 40` | `#006D2E` | Cleared fee indicators, attendance verified badges. |
| `on-success` | `success 100` | `#FFFFFF` | Text rendered on top of `success` badges. |

## 6. Contrast Audit and Compliance
All contrast ratios were verified using the WCAG relative luminance formula $((L_1 + 0.05) / (L_2 + 0.05))$.

| Role Foreground | Role Background | Hex FG | Hex BG | Measured Ratio | WCAG AA Status | Intended Use / Restriction |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| `on-primary` | `primary` | `#FFFFFF` | `#4B0082` | **12.95:1** | **PASS (AAA)** | Primary action button labels. |
| `on-primary-container`| `primary-container`| `#1C0035` | `#E5D0FB` | **13.40:1** | **PASS (AAA)** | Active status chips & filter pills. |
| `on-surface` | `surface` | `#1C1B1F` | `#F8F7FA` | **16.05:1** | **PASS (AAA)** | Standard body copy & numeric figures. |
| `on-surface-variant` | `surface` | `#49454E` | `#F8F7FA` | **8.77:1** | **PASS (AAA)** | Timestamps, table subheads, help text. |
| `primary` (link text) | `surface` | `#4B0082` | `#F8F7FA` | **12.13:1** | **PASS (AAA)** | In-text navigation links & action icons. |
| `on-error` | `error` | `#FFFFFF` | `#BA1A1A` | **6.46:1** | **PASS (AA)** | Error banner text and critical badge labels. |
| `on-warning` | `warning` | `#FFFFFF` | `#8E4B00` | **6.65:1** | **PASS (AA)** | Arrears badge labels and overdue notices. |
| `on-success` | `success` | `#FFFFFF` | `#006D2E` | **6.51:1** | **PASS (AA)** | Clearance badge text and payment stamps. |
| `outline` | `surface` | `#79757F` | `#F8F7FA` | **4.22:1** | **DOCUMENTED** | **Non-text UI components only.** Meets WCAG 2.1 AA 1.4.11 (min 3.0:1 for graphical boundaries/borders). **Strictly prohibited for body copy or text.** |
## 7. Extended Container Roles (Portal Dashboard)
Added after a defect audit: the parent dashboard referenced 13 colour roles that `scripts/build-tokens.js` never emitted, so every card fill, badge tint and divider silently resolved to nothing.

| Role | Primitive Source | Hex Code | Purpose / Job on UI |
| :--- | :--- | :--- | :--- |
| `outline-variant` | `neutral-variant 80` | `#C9C4D0` | Decorative card dividers and accordion separators. |
| `surface-container-lowest` | `neutral 100` | `#FFFFFF` | Highest-lift cards (fee overview, modal sheets). |
| `surface-container-low` | `neutral 95` | `#F5F0F4` | Expanded accordion panels, nested list rows. |
| `surface-container-high` | `neutral 90` | `#E6E1E5` | Avatars, neutral pills, term status chip. |
| `secondary` | `secondary 40` | `#752FB6` | Secondary emphasis text and icons. |
| `secondary-container` | `secondary 90` | `#EEDBFF` | Secondary chips (e.g. grade track badges). |
| `on-secondary-container` | `secondary 10` | `#270044` | Text on `secondary-container`. |
| `error-container` | `error 90` | `#FFDAD6` | Restricted report card banner fill. |
| `on-error-container` | `error 10` | `#410002` | Text on `error-container`. |
| `success-container` | `success 95` | `#C7FED0` | Verified payment / present badge fill. |
| `on-success-container` | `success 10` | `#00210A` | Text on `success-container`. |
| `warning-container` | `warning 90` | `#FFDCC2` | Late / partial payment badge fill. |
| `on-warning-container` | `warning 10` | `#2E1500` | Text on `warning-container`. |

| Role Foreground | Role Background | Hex FG | Hex BG | Measured Ratio | WCAG AA Status | Intended Use / Restriction |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| `on-secondary-container` | `secondary-container` | `#270044` | `#EEDBFF` | **13.86:1** | **PASS (AAA)** | Grade track chips. |
| `on-error-container` | `error-container` | `#410002` | `#FFDAD6` | **13.26:1** | **PASS (AAA)** | Report restriction banner copy. |
| `on-success-container` | `success-container` | `#00210A` | `#C7FED0` | **15.15:1** | **PASS (AAA)** | Verified / present badges. |
| `on-warning-container` | `warning-container` | `#2E1500` | `#FFDCC2` | **13.30:1** | **PASS (AAA)** | Late / partial badges. |
| `secondary` | `surface` | `#752FB6` | `#F8F7FA` | **6.93:1** | **PASS (AA)** | Secondary emphasis text. |
| `on-surface-variant` | `surface-container-high` | `#49454E` | `#E6E1E5` | **7.25:1** | **PASS (AAA)** | Metadata inside neutral chips. |
| `outline-variant` | `surface` | `#C9C4D0` | `#F8F7FA` | **1.60:1** | **DECORATIVE ONLY** | Fails WCAG 1.4.11 (3:1). Permitted only for dividers between content that is already separated by spacing. **Never the sole boundary of an input or control** — use `outline`. |

## 8. Dimension System (4-Point Grid, Hybrid rem/em)
Every layout dimension is an integer multiple of 4px, expressed in `rem` (n × 0.25rem at the 16px root) so it scales when a parent enlarges Android system font size.

| Token | Value | px @16 | Grid |
| :--- | :--- | :---: | :---: |
| `--spacing-1` … `--spacing-12` | 0.25rem … 3rem | 4 … 48 | n × 4 |
| `--spacing-small / medium / large` | `var(--spacing-2 / 4 / 6)` | 8 / 16 / 24 | 2 / 4 / 6 × 4 |
| `--radius-small / medium / large` | 0.5 / 0.75 / 1rem | 8 / 12 / 16 | 2 / 3 / 4 × 4 |
| `--radius-full` | 9999px | — | keyword (pill) |
| `--size-touch-target` | 2.75rem | 44 | 11 × 4 |
| `--inset-1 … --inset-4` | 0.25em … 1em | 4 … 16 at 16px text | text-relative |

**Hybrid trade-off (accepted):** `--inset-*` tokens are `em`, so button and pill padding tracks the element's own font size. They land exactly on the 4px grid only when the element's text is 16px; on a 12px label `--inset-2` resolves to 6px. Layout spacing (`--spacing-*`) is `rem` and always on-grid.
