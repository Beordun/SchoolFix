const fs = require('fs');
const path = require('path');

async function measure() {
  console.log('Sending first request to http://localhost:3000 ...');
  const t0 = performance.now();
  const res1 = await fetch('http://localhost:3000');
  const body1 = await res1.text();
  const t1 = performance.now();
  const firstDuration = (t1 - t0).toFixed(2);

  console.log(`First load: HTTP ${res1.status} ${res1.statusText} in ${firstDuration} ms`);

  // Wait 1 second and test reload
  await new Promise(r => setTimeout(r, 1000));

  const t2 = performance.now();
  const res2 = await fetch('http://localhost:3000');
  const body2 = await res2.text();
  const t3 = performance.now();
  const reloadDuration = (t3 - t2).toFixed(2);

  console.log(`Second load (cached/warm): HTTP ${res2.status} in ${reloadDuration} ms`);

  const report = `================================================================================
FIRST PAGE LOAD PERFORMANCE BENCHMARK
================================================================================
Target URL: http://localhost:3000/
Timestamp: ${new Date().toISOString()}

1. FIRST LOAD (Cold Compilation):
   - HTTP Status: ${res1.status} ${res1.statusText}
   - Content-Type: ${res1.headers.get('content-type')}
   - Measured Duration: ${firstDuration} ms
   - Payload Size: ${body1.length} bytes
   - Response Headers:
     * x-frame-options: ${res1.headers.get('x-frame-options')}
     * x-content-type-options: ${res1.headers.get('x-content-type-options')}
     * referrer-policy: ${res1.headers.get('referrer-policy')}

2. SECOND LOAD (Warm Cache):
   - HTTP Status: ${res2.status} ${res2.statusText}
   - Measured Duration: ${reloadDuration} ms
   - Payload Size: ${body2.length} bytes

3. ARCHITECTURAL SUMMARY:
   Cold compilation took ${firstDuration} ms as Next.js JIT-compiled the root layout
   and home screen on first request. Warm reload dropped to ${reloadDuration} ms.
================================================================================
`;

  const dest = path.resolve(__dirname, '../task-02-repository-and-scaffold/evidence/04-first-load.txt');
  fs.writeFileSync(dest, report, 'utf8');
  console.log(`Saved benchmark to: ${dest}`);
}

measure().catch(err => {
  console.error('Measurement failed:', err.message);
  process.exit(1);
});
