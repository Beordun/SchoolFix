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
