# Task One: Prompt Log for Token Generation & CSS Conversion

## Prompt Record (Step 6)

### Attempt 1: The Initial Request
**Prompt given to agent (Verbatim):**
```text
Write a Node.js script (`scripts/build-tokens.js`) to parse our design tokens export at design-tokens.tokens.json and generate an accessible CSS file which will be used for this app.

Requirements:
1. Input Structure: Parse the JSON file which contains primitive scales (neutrals, brand tonal values), semantic color roles (surface, on-surface, primary, on-primary, error, outline), typography (15 styles with font-family, weight, size, letter-spacing, line-height), and elevation shadows.
2. Semantic Enforcement: 
   - CSS variables generated under `:root` must ONLY expose semantic roles and design tokens intended for direct UI consumption (e.g., `--color-primary`, `--color-surface`, `--shadow-soft`, `--type-headline-large-size`).
   - Do NOT expose primitive raw color scales directly as public utility tokens, ensuring components cannot bypass semantic color roles.
3. Token Referencing / Aliasing: Where semantic roles reference primitive values, preserve the token referencing architecture by mapping them to internal CSS custom properties or resolving them accurately according to the token tree.
4. Naming Convention: Use lowercase kebab-case for all CSS variable names (e.g., `--color-on-primary-container`).
5. Execution: Use plain Node.js `fs` and `path` modules with zero external dependencies. Handle missing tokens gracefully by logging a clear error message.
```

---

### What Worked and What Required Calibration

1. **Token Hierarchy:** 
   * In `06-tokens-complete.json`, the Figma tokens plugin separates `primitives` (`key colours` and `colour palettes`), `font` (composite font objects), and `effect` (drop shadows).
   * The script defines private CSS variables (prefixed with `--_primitive-` and `--_font-`) inside `:root` to preserve the reference chain, and aliases public semantic tokens (e.g. `--color-primary: var(--_primitive-primary-40)`) to ensure the design system remains the single source of truth.
2. **Hex Transparency Format:**
   * Figma exported 8-digit hex values (e.g. `#4b00821f`). The script converts these into standard CSS `rgba()` values for clean browser compatibility across older Android webviews.
3. **Typography Properties:**
   * Each of the 15 typography styles exposes semantic CSS custom properties for `font-family`, `font-size`, `font-weight`, `line-height`, and `letter-spacing`, along with a composite font shorthand class for direct application.
