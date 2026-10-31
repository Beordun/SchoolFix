const fs = require('fs');

const s = fs.readFileSync('scratch/chatgpt_stream.txt', 'utf8');

// The string was in: window.__reactRouterContext.streamController.enqueue("...")
// In JS strings, quotes were escaped as \" and newlines as \n etc.
// The cleanest way is JSON.parse('"' + s + '"') or custom unescape.

let unescaped;
try {
  unescaped = JSON.parse('"' + s.replace(/\\"/g, '___QUOTE___').replace(/"/g, '\\"').replace(/___QUOTE___/g, '\\"') + '"');
} catch(e) {
  // alternative
  unescaped = s.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}

try {
  const parsed = JSON.parse(unescaped);
  console.log('Parsed stream successfully! Items:', parsed.length);
  // Find all text elements in this React router serialized state
  const texts = [];
  for (const item of parsed) {
    if (typeof item === 'string' && item.length > 50) {
      texts.push(item);
    }
  }
  console.log('Found long text strings:', texts.length);
  fs.writeFileSync('scratch/chatgpt_texts.txt', texts.join('\n\n====================\n\n'));
  console.log('Saved scratch/chatgpt_texts.txt');
} catch (e) {
  console.log('Parse error:', e.message);
  // Let's do regex extraction of strings
  const stringMatches = s.match(/"([^"\\]*(\\.[^"\\]*)*)"/g) || [];
  console.log('String matches:', stringMatches.length);
  const longStrings = stringMatches
    .map(str => {
      try { return JSON.parse(str); } catch { return str; }
    })
    .filter(str => typeof str === 'string' && str.length > 80);
  console.log('Long strings:', longStrings.length);
  fs.writeFileSync('scratch/chatgpt_texts.txt', longStrings.join('\n\n====================\n\n'));
}
