# SchoolFix: Typography Scale Specification

## 1. Typeface Selection
* **Font Family:** `Bricolage Grotesque`
* **Foundational Rationale:** Bricolage Grotesque is an expressive, contemporary grotesque typeface featuring pronounced ink traps, wide-open counters, and an elevated x-height. In Nigerian school administration, classroom teachers like Mrs. Adeleke review and enter student assessment scores and fee balances on cracked, lower-resolution smartphone displays (3GB RAM, Android 11–13) under fluctuating classroom lighting. The distinct optical geometry prevents numerical ambiguity, ensuring digits like `3`, `8`, `0`, and `6` are immediately distinct.

---

## 2. The 15 Typography Styles

All styles adhere strictly to the proportional line-height formula: **$\text{Line Height} = \text{Font Size} \times 1.4$**.

| Role | Size Variant | Font Size (px) | Weight | Letter Spacing (px / %) | Line Height (px) | Multiplier Formula | Intended Use / UI Context |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Display** | Large | 64px | 600 (SemiBold) | -2.24px (-3.5%) | 89.6px | $64 \times 1.4$ | Marketing landing hero headlines, term banner headers. |
| **Display** | Medium | 48px | 600 (SemiBold) | -1.68px (-3.5%) | 67.2px | $48 \times 1.4$ | High-level summary metrics (e.g. Total Term Revenue). |
| **Display** | Small | 38px | 600 (SemiBold) | -1.33px (-3.5%) | 53.2px | $38 \times 1.4$ | Section overview headers, dashboard milestone totals. |
| **Headline** | Large | 36px | 400 (Regular) | -1.26px (-3.5%) | 50.4px | $36 \times 1.4$ | Page titles (e.g. "Fee Clearance Register", "Student Profile"). |
| **Headline** | Medium | 32px | 400 (Regular) | -1.12px (-3.5%) | 44.8px | $32 \times 1.4$ | Modal dialog headers, major drawer titles. |
| **Headline** | Small | 28px | 500 (Medium) | -0.98px (-3.5%) | 39.2px | $28 \times 1.4$ | Class roster subheadings (e.g. "JSS 2 Diamond - 42 Pupils"). |
| **Title** | Large | 24px | 400 (Regular) | -0.84px (-3.5%) | 33.6px | $24 \times 1.4$ | Section card titles (e.g. "Second Term Fee Breakdown"). |
| **Title** | Medium | 20px | 400 (Regular) | -0.70px (-3.5%) | 28.0px | $20 \times 1.4$ | Table block headings, student academic record cards. |
| **Title** | Small | 16px | 500 (Medium) | -0.56px (-3.5%) | 22.4px | $16 \times 1.4$ | Input fieldgroup legends, grouped list subheads. |
| **Body** | Large | 20px | 400 (Regular) | -0.70px (-3.5%) | 28.0px | $20 \times 1.4$ | Emphasized introductory notices, administrative briefs. |
| **Body** | Medium | 16px | 400 (Regular) | -0.56px (-3.5%) | 22.4px | $16 \times 1.4$ | Standard body copy, attendance remarks, parent notices. |
| **Body** | Small | 12px | 500 (Medium) | -0.42px (-3.5%) | 16.8px | $12 \times 1.4$ | Metadata captions, audit timestamps, footnote receipts. |
| **Label** | Large | 16px | 500 (Medium) | -0.56px (-3.5%) | 22.4px | $16 \times 1.4$ | Primary action buttons ("Clear for Exams", "Submit Marks"). |
| **Label** | Medium | 14px | 500 (Medium) | -0.49px (-3.5%) | 19.6px | $14 \times 1.4$ | Secondary buttons, filter chips, table column headers. |
| **Label** | Small | 12px | 500 (Medium) | -0.42px (-3.5%) | 16.8px | $12 \times 1.4$ | Status badges ("Paid in Full", "Arrears Outstanding"). |

---

## 3. Constraints & Formula Justification

### Line-Height Multiplier ($1.4\times$)
* **The Mathematical Rule:** Every style uses an explicit $1.4\times$ multiplier rounded to decimal tenths.
* **Why $1.4\times$ was selected:**
  SchoolFix is an administrative data-dense portal accessed on mobile devices with limited viewport heights (average 5.5 to 6.2 inches). A standard web multiplier of $1.5\times$ or $1.6\times$ introduces excessive vertical whitespace between lines, pushing critical payment ledgers and exam clearance tables beneath the fold. The $1.4\times$ factor ensures tight optical cohesion while preserving sufficient vertical breathing room to prevent descenders (like `g`, `p`, `y`) from colliding with ascenders (`h`, `d`, `k`).

### Letter-Spacing Judged Visually
* **Visual Calibration:** Rather than accepting zero or generic tracking, letter-spacing was visually calibrated at **-3.5%** of the font size ($-0.035 \times \text{fontSize}$) across the scale.
* **Why Compact Tracking Fits Bricolage Grotesque:**
  Bricolage Grotesque has wide, expressive horizontal proportions. At larger display and headline sizes, default tracking makes words feel loose and disconnected, causing headlines to wrap prematurely on narrow mobile viewports. Tightening letter-spacing to -3.5% pulls the glyphs into cohesive word units, vastly improving rapid scanning speed when administrators scan rosters.
