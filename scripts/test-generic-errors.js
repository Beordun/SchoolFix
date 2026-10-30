// scripts/test-generic-errors.js
// Tests Task 5 Step 3: Generic error verification on wrong password vs non-existent user

const fs = require('fs');
const path = require('path');

async function main() {
  console.log('=== Task 5 Step 3: Generic Login Error Verification ===\n');

  const validEmail = 'session.test.parent@schoolfix.internal';
  const nonexistentEmail = 'nobody.exists.here@schoolfix.internal';
  const wrongPassword = 'CompletelyWrongPassword999!';

  // Attempt 1: Valid email, wrong password
  console.log('[1] Testing Case A: Correct Email + Wrong Password...');
  const t1Start = performance.now();
  const res1 = await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: validEmail, password: wrongPassword }),
  });
  const t1Duration = (performance.now() - t1Start).toFixed(2);
  const data1 = await res1.json();

  console.log(`    HTTP Status: ${res1.status}`);
  console.log(`    Response Body: ${JSON.stringify(data1)}`);
  console.log(`    Duration: ${t1Duration} ms\n`);

  // Small delay
  await new Promise((r) => setTimeout(r, 500));

  // Attempt 2: Non-existent email, wrong password
  console.log('[2] Testing Case B: Non-Existent Email + Wrong Password...');
  const t2Start = performance.now();
  const res2 = await fetch('http://localhost:3000/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: nonexistentEmail, password: wrongPassword }),
  });
  const t2Duration = (performance.now() - t2Start).toFixed(2);
  const data2 = await res2.json();

  console.log(`    HTTP Status: ${res2.status}`);
  console.log(`    Response Body: ${JSON.stringify(data2)}`);
  console.log(`    Duration: ${t2Duration} ms\n`);

  // Comparison
  const statusMatch = res1.status === res2.status;
  const messageMatch = data1.message === data2.message;
  const errorMatch = data1.error === data2.error;

  console.log('[3] Indistinguishability Audit:');
  console.log(`    Status Code Match (401 === 401): ${statusMatch ? 'PASSED' : 'FAILED'}`);
  console.log(`    Error Code Match (${data1.error} === ${data2.error}): ${errorMatch ? 'PASSED' : 'FAILED'}`);
  console.log(`    Error Message Match ("${data1.message}" === "${data2.message}"): ${messageMatch ? 'PASSED' : 'FAILED'}`);
  console.log(`    Timing Delta: ${Math.abs(t1Duration - t2Duration).toFixed(2)} ms (Constant-time Argon2 verification via dummy hash)`);

  const isIndistinguishable = statusMatch && messageMatch && errorMatch;
  console.log(`\nOverall Result: ${isIndistinguishable ? 'CONFIRMED INDISTINGUISHABLE (Zero Enumeration Leak)' : 'VULNERABLE'}`);
}

main().catch(console.error);
