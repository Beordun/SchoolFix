# SchoolFix: Typography Baseline Divergences & Trade-Off Analysis

The Material Design 3 (MD3) typography baseline provides generic defaults intended for broad consumer applications. SchoolFix deliberately diverges from the MD3 baseline in three specific areas to meet the harsh operating realities of Nigerian private school administration.

---

## Divergence 1: Primary Typeface Family

* **Material Baseline Default:** `Roboto` (or standard system neo-grotesque like Inter).
* **SchoolFix Chosen Value:** `Bricolage Grotesque`.
* **Why We Chose It:**
  Nigerian private schools operate in high-friction administrative contexts where parents, teachers, and bursars frequently dispute fee balances, arrears, and continuous assessment marks. Teachers like Mrs. Adeleke review records on secondhand Android smartphones with cracked 5.5-inch screens under direct equatorial sunlight. Roboto and generic neo-grotesques feature uniform stroke widths and closed apertures that cause digits (`3`, `8`, `0`, and `6`) to blur together on low-density displays. Bricolage Grotesque provides exaggerated x-height, distinct character geometry, and wide open counters that make numbers and student IDs instantly scannable without misinterpretation.
* **In What Situation This Choice Would Be the Wrong One:**
  This choice would be completely wrong in an enterprise desktop application that renders dense financial spreadsheets with hundreds of tabular rows and columns (e.g. an institutional accounting ledger or multi-year tax audit). Bricolage Grotesque possesses wide horizontal proportions and expressive, idiosyncratic character widths. In a dense, multi-column spreadsheet, it consumes significantly more horizontal space than a condensed neo-grotesque like Roboto or Inter, causing columns to truncate prematurely and introducing unnecessary visual fatigue when scanning rows across a 24-inch monitor.

---

## Divergence 2: Uniform Line-Height Multiplier ($1.4\times$)

* **Material Baseline Default:** Variable line heights often reaching $1.5\times$ to $1.6\times$ on body text, or fixed baseline grid increments (e.g., 64px line height on 57px display text, which is ~1.12×, paired with 24px line height on 16px body, which is 1.5×).
* **SchoolFix Chosen Value:** A uniform, formula-driven **$1.4\times$ multiplier** across all 15 roles ($\text{Line Height} = \text{Font Size} \times 1.4$).
* **Why We Chose It:**
  Mobile viewports on sub-$100 Android phones offer severely constrained vertical screen real estate. Generous line-heights ($1.5\times$ or $1.6\times$) push fee clearance statuses and "Clear for Exams" action buttons off the bottom of the screen. Compacting the vertical spacing to $1.4\times$ keeps complete student record cards within a single viewport while still providing sufficient clearance to prevent ascender/descender collisions.
* **In What Situation This Choice Would Be the Wrong One:**
  This choice would be wrong for long-form narrative reading, such as the school's comprehensive employee handbook, legal terms and conditions, or extended educational inspection reports. In continuous prose spanning multiple paragraphs, a tight $1.4\times$ line-height creates dark "rivers" of text and increases cognitive load, causing readers' eyes to inadvertently skip lines when returning to the left margin.

---

## Divergence 3: Systematic Negative Letter-Spacing (-3.5% Tracking)

* **Material Baseline Default:** Neutral tracking ($0\text{px}$) for display headers, and positive tracking ($+0.1\text{px}$ to $+0.5\text{px}$) for labels and captions to improve small-text legibility.
* **SchoolFix Chosen Value:** Uniform **-3.5% tracking** ($\text{Letter Spacing} = -0.035 \times \text{Font Size}$) across headings and display styles.
* **Why We Chose It:**
  Bricolage Grotesque is naturally wide-set. At sizes above 24px, the default character spacing feels disjointed and causes short titles (such as "Second Term Tuition Summary") to wrap onto two or three lines on a narrow 360px-wide mobile screen. Pulling the tracking in by -3.5% binds letters into solid optical words, preventing awkward line wrapping and maintaining compact visual rhythm.
* **In What Situation This Choice Would Be the Wrong One:**
  This choice would be disastrous on low-contrast inverse displays (e.g., light text on dark backgrounds displayed on low-brightness screens) or for users with visual impairments such as dyslexia or astigmatism. Negative tracking narrows character gaps, causing letter pairs like `r` + `n` to merge into `m`, or `c` + `l` to merge into `d`, dramatically impairing reading comprehension for accessibility-assisted users.
