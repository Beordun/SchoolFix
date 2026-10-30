// scripts/test-sync-vs-job-timing.js
// Measures registration response latency: Synchronous Email Delivery vs Asynchronous Background Queue Worker

const http = require('http');

function sendRegistration(mode, email, clientIp) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      fullName: 'Bilikisu Danjuma',
      email,
      phone: '08139988776',
      password: 'SecureSchoolPass#2026',
      acceptedTerms: true,
    });

    const start = process.hrtime.bigint();
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: `/api/register?mode=${mode}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'X-Forwarded-For': clientIp,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          const end = process.hrtime.bigint();
          const durationMs = Number(end - start) / 1e6;
          try {
            resolve({ durationMs, status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ durationMs, status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log('=== STEP 10 BENCHMARK: REGISTRATION RESPONSE TIMING (SYNC VS BACKGROUND JOB) ===\n');

  // 1. Synchronous Email Delivery (Blocking Request Thread)
  const syncEmail = `sync.parent.${Date.now()}@schoolfix.internal`;
  console.log('1. Testing SYNCHRONOUS Email Delivery inside registration request...');
  const syncResult = await sendRegistration('sync', syncEmail, '197.210.64.91');
  console.log(`   - HTTP Status: ${syncResult.status}`);
  console.log(`   - Server Total Latency: ${syncResult.durationMs.toFixed(2)} ms`);
  console.log(`   - Server Telemetry:`, syncResult.data?.telemetry);

  console.log('\n--------------------------------------------------');

  // 2. Asynchronous Background Worker Queue Delivery
  const asyncEmail = `async.parent.${Date.now()}@schoolfix.internal`;
  console.log('2. Testing ASYNCHRONOUS Background Worker Queue delivery...');
  const asyncResult = await sendRegistration('async', asyncEmail, '197.210.64.92');
  console.log(`   - HTTP Status: ${asyncResult.status}`);
  console.log(`   - Server Total Latency: ${asyncResult.durationMs.toFixed(2)} ms`);
  console.log(`   - Server Telemetry:`, asyncResult.data?.telemetry);

  console.log('\n=== EMPIRICAL COMPARISON RESULTS ===');
  console.log(`Synchronous Registration Latency:  ${syncResult.durationMs.toFixed(2)} ms`);
  console.log(`Background Job Registration Latency: ${asyncResult.durationMs.toFixed(2)} ms`);
  const difference = syncResult.durationMs - asyncResult.durationMs;
  const speedup = syncResult.durationMs / asyncResult.durationMs;
  console.log(`Background worker queue saves ${difference.toFixed(2)} ms per registration (${speedup.toFixed(1)}x faster response to parent device).`);
}

main().catch(console.error);
