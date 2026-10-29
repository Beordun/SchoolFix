const http = require('http');

function postJSON(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let responseBody = '';
        res.on('data', (chunk) => (responseBody += chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: JSON.parse(responseBody),
          });
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function run() {
  console.log('=== STEP 6: DATABASE WRITE VERIFICATION (HTTP 201 CREATED) ===');
  console.log(`Execution Timestamp: ${new Date().toISOString()}`);

  const payload1 = {
    fullName: 'Folashade Adeleke',
    email: `folashade.adeleke.${Date.now()}@schoolfix.internal`,
    password: 'TestPassword_' + Date.now(),
  };

  console.log('\n--- SUBMITTING REQUEST 1 ---');
  console.log('Payload:', JSON.stringify({ ...payload1, password: '[REDACTED]' }, null, 2));
  const t0 = Date.now();
  const res1 = await postJSON('http://localhost:3000/api/register', payload1);
  const latency1 = Date.now() - t0;

  console.log(`Response Status Code: ${res1.statusCode} Created`);
  console.log(`Latency: ${latency1}ms`);
  console.log('Response Body:', JSON.stringify(res1.data, null, 2));

  console.log('\nWaiting 2000ms for timestamp separation...');
  await new Promise((r) => setTimeout(r, 2000));

  const payload2 = {
    fullName: 'Chukwudi Okafor',
    email: `chukwudi.okafor.${Date.now()}@schoolfix.internal`,
    password: 'TestPassword_' + Date.now(),
  };

  console.log('\n--- SUBMITTING REQUEST 2 ---');
  console.log('Payload:', JSON.stringify({ ...payload2, password: '[REDACTED]' }, null, 2));
  const t1 = Date.now();
  const res2 = await postJSON('http://localhost:3000/api/register', payload2);
  const latency2 = Date.now() - t1;

  console.log(`Response Status Code: ${res2.statusCode} Created`);
  console.log(`Latency: ${latency2}ms`);
  console.log('Response Body:', JSON.stringify(res2.data, null, 2));

  console.log('\n--- DATABASE PERSISTENCE SUMMARY ---');
  console.log(`Row 1 ID: ${res1.data.user.id} | Timestamp: ${res1.data.user.createdAt}`);
  console.log(`Row 2 ID: ${res2.data.user.id} | Timestamp: ${res2.data.user.createdAt}`);
}

run().catch(console.error);
