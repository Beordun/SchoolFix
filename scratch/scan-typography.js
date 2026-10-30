const fs = require('fs');
const path = require('path');

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      scanDir(full);
    } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/fontSize\s*:/.test(line)) {
          console.log(`${path.relative('.', full)}:${idx+1} [fontSize]: ${line.trim()}`);
        }
        if (/lineHeight\s*:/.test(line)) {
          console.log(`${path.relative('.', full)}:${idx+1} [lineHeight]: ${line.trim()}`);
        }
        if (/fontFamily\s*:/.test(line)) {
          console.log(`${path.relative('.', full)}:${idx+1} [fontFamily]: ${line.trim()}`);
        }
      });
    }
  }
}
scanDir('app/portal/dashboard');
