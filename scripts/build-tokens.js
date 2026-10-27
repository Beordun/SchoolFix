#!/usr/bin/env node

/**
 * SchoolFix Design Tokens Compiler
 * Reads exported Figma tokens and generates semantic, accessible CSS variables.
 * Enforces: Private primitive scales + Public semantic role aliasing.
 */

const fs = require('fs');
const path = require('path');

// 1. Locate Token File
const possibleInputPaths = [
  path.resolve(__dirname, '../design-tokens.tokens.json'),
  path.resolve(__dirname, 'design-tokens.tokens.json'),
  path.resolve(__dirname, '../task-01-design-system/evidence/06-tokens-complete.json')
];

let inputPath = possibleInputPaths.find(p => fs.existsSync(p));

if (!inputPath) {
  console.error('[Error] Missing token file: Could not find design-tokens.tokens.json');
  process.exit(1);
}

console.log(`[Tokens Compiler] Reading tokens from: ${inputPath}`);

let tokens;
try {
  const rawData = fs.readFileSync(inputPath, 'utf8');
  tokens = JSON.parse(rawData);
} catch (err) {
  console.error(`[Error] Failed to parse token JSON: ${err.message}`);
  process.exit(1);
}

// 2. Helper Functions
function hex8ToRgba(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 8) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = (parseInt(hex.slice(6, 8), 16) / 255).toFixed(2);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  } else if (hex.length === 6) {
    return `#${hex}`;
  }
  return `#${hex}`;
}

function kebabCase(str) {
  return str.toLowerCase().replace(/[\s_]+/g, '-');
}

// 3. Semantic Role Mappings to Primitives (as documented in colour-roles.md)
const semanticRoleDefinitions = [
  { role: 'primary', group: 'primary', tone: 'primary 40' },
  { role: 'on-primary', group: 'primary', tone: 'primary 100' },
  { role: 'primary-container', group: 'primary', tone: 'primary 95' },
  { role: 'on-primary-container', group: 'primary', tone: 'primary 10' },
  { role: 'surface', group: 'neutral', tone: 'neutral 98' },
  { role: 'on-surface', group: 'neutral', tone: 'neutral 10' },
  { role: 'on-surface-variant', group: 'neutral variant', tone: 'neutral variant 30' },
  { role: 'surface-container', group: 'neutral', tone: 'neutral 95' },
  { role: 'outline', group: 'neutral variant', tone: 'neutral variant 50' },
  { role: 'error', group: 'error', tone: 'error 40' },
  { role: 'on-error', group: 'error', tone: 'error 100' },
  { role: 'warning', group: 'warning', tone: 'warning 40' },
  { role: 'on-warning', group: 'warning', tone: 'warning 100' },
  { role: 'success', group: 'success', tone: 'success 40' },
  { role: 'on-success', group: 'success', tone: 'success 100' }
];

// 4. Build Output Sections
const primitiveVars = [];
const semanticColorVars = [];
const shadowVars = [];
const typographyVars = [];
const typographyClasses = [];

// A. Extract Primitive Palettes as Private CSS Variables (--_primitive-*)
if (tokens.primitives && tokens.primitives['colour palettes']) {
  const palettes = tokens.primitives['colour palettes'];
  for (const [paletteName, tones] of Object.entries(palettes)) {
    for (const [toneName, toneObj] of Object.entries(tones)) {
      if (toneObj && toneObj.value) {
        const varName = `--_primitive-${kebabCase(toneName)}`;
        const hexVal = toneObj.value.slice(0, 7); // strip alpha for solid colors
        primitiveVars.push(`  ${varName}: ${hexVal};`);
      }
    }
  }
} else {
  console.warn('[Warning] No primitives.colour palettes found in tokens');
}

// B. Map Public Semantic Color Roles (--color-*)
semanticRoleDefinitions.forEach(({ role, tone }) => {
  const targetPrimitiveVar = `--_primitive-${kebabCase(tone)}`;
  semanticColorVars.push(`  --color-${role}: var(${targetPrimitiveVar});`);
});

// C. Shadows (--shadow-*)
if (tokens.effect) {
  for (const [shadowKey, shadowObj] of Object.entries(tokens.effect)) {
    const val = shadowObj.value || shadowObj;
    if (val && val.radius !== undefined) {
      const rawName = kebabCase(shadowKey);
      const cleanName = rawName.replace(/-shadow$/, '');
      const colorStr = hex8ToRgba(val.color);
      const cssVal = `${val.offsetX}px ${val.offsetY}px ${val.radius}px ${val.spread}px ${colorStr}`;
      shadowVars.push(`  --shadow-${cleanName}: ${cssVal};`);
      if (cleanName !== rawName) {
        shadowVars.push(`  --shadow-${rawName}: var(--shadow-${cleanName});`);
      }
    }
  }
} else {
  console.warn('[Warning] No effect collection found for shadows');
}

// D. Typography (--type-*)
const fontSource = tokens.font || tokens.typography;
if (fontSource) {
  for (const [styleName, fontData] of Object.entries(fontSource)) {
    const val = fontData.value || fontData;
    if (val && val.fontSize) {
      const baseName = kebabCase(styleName);
      const family = val.fontFamily ? `'${val.fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` : 'sans-serif';
      const sizePx = `${val.fontSize}px`;
      const sizeRem = `${(val.fontSize / 16).toFixed(4).replace(/\.?0+$/, '')}rem`;
      const weight = val.fontWeight || 400;
      const lineHeightPx = `${val.lineHeight}px`;
      const letterSpacingPx = `${val.letterSpacing}px`;

      typographyVars.push(`  /* ${styleName} */`);
      typographyVars.push(`  --type-${baseName}-font-family: ${family};`);
      typographyVars.push(`  --type-${baseName}-size: ${sizeRem}; /* ${sizePx} */`);
      typographyVars.push(`  --type-${baseName}-weight: ${weight};`);
      typographyVars.push(`  --type-${baseName}-line-height: ${lineHeightPx};`);
      typographyVars.push(`  --type-${baseName}-letter-spacing: ${letterSpacingPx};`);

      // Utility Class
      typographyClasses.push(`.type-${baseName} {`);
      typographyClasses.push(`  font-family: var(--type-${baseName}-font-family);`);
      typographyClasses.push(`  font-size: var(--type-${baseName}-size);`);
      typographyClasses.push(`  font-weight: var(--type-${baseName}-weight);`);
      typographyClasses.push(`  line-height: var(--type-${baseName}-line-height);`);
      typographyClasses.push(`  letter-spacing: var(--type-${baseName}-letter-spacing);`);
      typographyClasses.push(`}\n`);
    }
  }
} else {
  console.warn('[Warning] No font/typography styles found in tokens');
}

// 5. Assemble Complete CSS
const cssContent = `/**
 * SchoolFix Design System Tokens
 * Generated by scripts/build-tokens.js
 * Source: ${path.basename(inputPath)}
 * DO NOT EDIT DIRECTLY. Re-run \`node scripts/build-tokens.js\` to update.
 */

:root {
  /* ==========================================================================
     PRIVATE PRIMITIVE TOKENS (Internal Referencing Only - Do Not Consume Directly)
     ========================================================================== */
${primitiveVars.join('\n')}

  /* ==========================================================================
     PUBLIC SEMANTIC COLOR ROLES (Consume these in UI components)
     ========================================================================== */
${semanticColorVars.join('\n')}

  /* ==========================================================================
     ELEVATION & SHADOW SYSTEM (Tinted with Primary Brand)
     ========================================================================== */
${shadowVars.join('\n')}

  /* ==========================================================================
     TYPOGRAPHY TOKENS (15 Styles, Bricolage Grotesque, 1.4x Line-Height)
     ========================================================================== */
${typographyVars.join('\n')}
}

/* ==========================================================================
   TYPOGRAPHY UTILITY CLASSES
   ========================================================================== */
${typographyClasses.join('\n')}
`;

// 6. Write Output File
const outputPaths = [
  path.resolve(__dirname, '../task-01-design-system/tokens.css'),
  path.resolve(__dirname, '../tokens.css')
];

outputPaths.forEach(outPath => {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, cssContent, 'utf8');
  console.log(`[Tokens Compiler] Generated: ${outPath}`);
});

console.log('[Tokens Compiler] Build completed successfully.');
