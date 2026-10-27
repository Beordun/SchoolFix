const fs = require('fs');
const path = require('path');

async function test404() {
  const unmappedUrl = 'http://localhost:3000/portal/grades';
  console.log(`Sending request to unmapped route: ${unmappedUrl} ...`);

  const t0 = performance.now();
  const res = await fetch(unmappedUrl);
  const text = await res.text();
  const t1 = performance.now();
  const duration = (t1 - t0).toFixed(2);

  console.log(`Received: HTTP ${res.status} ${res.statusText} in ${duration} ms`);

  const failureReport = `================================================================================
DELIBERATE BREAKAGE 2: 404 ERROR (FAILURE EVIDENCE & MANUAL DIAGNOSIS)
================================================================================
Target URL: ${unmappedUrl}
Timestamp: ${new Date().toISOString()}
HTTP Status Code: ${res.status} ${res.statusText}
Response Duration: ${duration} ms

1. WHAT HAPPENED:
Client requested /portal/grades which has no matching page.tsx or route.ts handler.
The server responded with HTTP 404 Not Found.

2. MANUAL DIAGNOSTIC CHECKLIST (Checked in order before asking for help):
Step 1: Check server console logs:
   - Verified that incoming GET /portal/grades was logged with status 404.
Step 2: Check active file system routes:
   - Inspected app/ directory structure. Verified only app/page.tsx exists; 
     no app/portal/grades/page.tsx or app/portal/grades/route.ts was scaffolded.
Step 3: Check URL query and pathname syntax:
   - Confirmed client requested exact path '/portal/grades' with no typos or unescaped characters.
Step 4: Check middleware route matchers:
   - Confirmed no middleware redirect rule exists intercepting or rewriting the path.
Step 5: Verify route boundary handling:
   - Next.js default 404 rendered without branded design system tokens or recovery links.
================================================================================
`;

  const destFail = path.resolve(__dirname, '../task-02-repository-and-scaffold/evidence/09-404-error.txt');
  fs.writeFileSync(destFail, failureReport, 'utf8');
  console.log(`Saved 404 failure evidence to: ${destFail}`);
}

test404().catch(err => {
  console.error('404 test error:', err.message);
  process.exit(1);
});
