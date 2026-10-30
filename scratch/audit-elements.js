const fs = require('fs');
const path = require('path');

const dir = 'app/portal/dashboard';

function checkFiles(d) {
  const items = fs.readdirSync(d);
  for (const item of items) {
    const full = path.join(d, item);
    if (fs.statSync(full).isDirectory()) {
      checkFiles(full);
    } else if (full.endsWith('.tsx')) {
      const code = fs.readFileSync(full, 'utf8');
      const lines = code.split('\n');
      lines.forEach((line, i) => {
        // Find tags: <h1, <h2, <h3, <p, <span, <div, <button, <strong, <td, <th, <label
        const tagMatch = line.match(/<([a-z1-6]+)(\s|>)/);
        if (tagMatch) {
          const tag = tagMatch[1];
          if (['h1', 'h2', 'h3', 'p', 'span', 'strong', 'label', 'th', 'td'].includes(tag)) {
            // Check if line or surroundings have className with type-
            if (!line.includes('type-') && !line.includes('className="type') && !line.includes('className={') && !line.includes('style={{') && !line.includes('//')) {
              // could be plain tag
              // console.log(`${full}:${i+1} <${tag}> without type class: ${line.trim()}`);
            }
          }
        }
      });
    }
  }
}

checkFiles(dir);
