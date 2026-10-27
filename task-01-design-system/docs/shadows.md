# SchoolFix: Elevation & Shadow System

## 1. Specification: The Three Elevation Shadows

All shadows in SchoolFix are constructed using the primary brand color (`#4B0082`, Deep Indigo) rather than a neutral black or gray (`#000000`).

| Elevation Level | X Offset | Y Offset | Blur Radius | Spread | Color Source | Hex with Alpha | Computed Opacity | UI Job / Intended Usage |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Soft Shadow** | 1.6px | 6.0px | 20.0px | 0px | Primary Brand (`#4B0082`) | `#4B00821F` | **12%** | Resting cards, student profile tiles, interactive table rows on hover. |
| **Medium Shadow** | 4.0px | 6.0px | 24.0px | 0px | Primary Brand (`#4B0082`) | `#4B00822E` | **18%** | Floating dropdown menus, fee breakdown drawers, sticky action footers. |
| **Hard Shadow** | 6.0px | 10.0px | 10.0px | 0px | Primary Brand (`#4B0082`) | `#4B008233` | **20%** | Critical modal dialogs (e.g. Exam Clearance Override, Payment Reversals). |

---

## 2. Why a Brand-Tinted Shadow Reads Differently from Black

In the physical world, shadows are never pure black; they absorb and reflect ambient light bouncing off surrounding colored surfaces, making a pure black shadow in digital software appear unnaturally dirty, muddy, and disconnected from the interface canvas. 

By tinting the shadows with the deep indigo of the primary brand (`#4B0082`), elevated surfaces feel as though they are physically illuminated by ambient school-brand light, creating warmth, organic depth, and subconscious visual coherence across the UI without adding distracting decorative borders.
