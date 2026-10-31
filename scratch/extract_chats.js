const fs = require('fs');

const p338 = 'C:/Users/DT001/.gemini/antigravity-ide/brain/3fd6357f-1439-4613-838f-f7c638caf08a/.system_generated/steps/338/content.md';
const p339 = 'C:/Users/DT001/.gemini/antigravity-ide/brain/3fd6357f-1439-4613-838f-f7c638caf08a/.system_generated/steps/339/content.md';

const c338 = fs.readFileSync(p338, 'utf8');
const c339 = fs.readFileSync(p339, 'utf8');

// ChatGPT extraction
const m338 = c338.match(/<script type="application\/json" id="client-bootstrap"[^>]*>([\s\S]*?)<\/script>/i);
if (m338) {
  try {
    const data = JSON.parse(m338[1]);
    console.log('ChatGPT client-bootstrap keys:', Object.keys(data));
    fs.writeFileSync('scratch/chatgpt_dump.json', JSON.stringify(data, null, 2));
    console.log('Saved scratch/chatgpt_dump.json');
  } catch (err) {
    console.error('Failed to parse ChatGPT json:', err.message);
  }
}

// React router context stream in ChatGPT
const mStream = c338.match(/window\.__reactRouterContext\.streamController\.enqueue\("([\s\S]*?)"\);/);
if (mStream) {
  console.log('Found react router stream, length:', mStream[1].length);
  fs.writeFileSync('scratch/chatgpt_stream.txt', mStream[1]);
}

// Check Claude data
console.log('Claude content length:', c339.length);
// Check if claude has any json or published artifact
const claudeArtifactMatches = c339.match(/artifact/gi) || [];
console.log('Claude artifact references:', claudeArtifactMatches.length);
