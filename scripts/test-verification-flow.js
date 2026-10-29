// scripts/test-verification-flow.js
// Tests the complete verification lifecycle and the 3 mandatory failure states

const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function sendPost(path, payload) {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify(payload);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(dataString),
          'X-Forwarded-For': '197.210.64.101',
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(dataString);
    req.end();
  });
}

async function main() {
  console.log('=== STEP 10: TESTING VERIFICATION FLOW & 3 FAILURE STATES ===\n');

  const testEmail = `verif.parent.${Date.now()}@schoolfix.internal`;

  // 1. Register Account
  console.log(`1. Registering parent account: ${testEmail}...`);
  const regRes = await sendPost('/api/register', {
    fullName: 'Zainab Balogun',
    email: testEmail,
    phone: '09012345678',
    password: 'SecureSchoolPass#2026',
    acceptedTerms: true,
  });

  console.log('Registration Status:', regRes.status);
  
  // 2. Fetch User and OTP from Database
  const user = await prisma.user.findUnique({
    where: { email: testEmail },
  });

  console.log('\n2. Database Row Retrieved:');
  console.log({
    id: user.id,
    email: user.email,
    isVerified: user.isVerified,
    verificationCode: user.verificationCode,
    codeExpiresAt: user.codeExpiresAt,
  });

  const validOtp = user.verificationCode;

  // 3. FAILURE STATE 1: EXPIRED CODE
  console.log('\n--------------------------------------------------');
  console.log('3. Testing FAILURE CASE 1: Expired Code');
  // Intentionally set expiration to 1 hour in the past
  await prisma.user.update({
    where: { id: user.id },
    data: { codeExpiresAt: new Date(Date.now() - 3600000) },
  });

  const expiredRes = await sendPost('/api/verify', {
    email: testEmail,
    code: validOtp,
  });
  console.log('Status (Expected 410):', expiredRes.status);
  console.log('Body:', expiredRes.data);

  // 4. FAILURE STATE 2: WRONG CODE
  console.log('\n--------------------------------------------------');
  console.log('4. Testing FAILURE CASE 2: Wrong Code');
  // Reset expiration to future
  await prisma.user.update({
    where: { id: user.id },
    data: { codeExpiresAt: new Date(Date.now() + 600000) },
  });

  const wrongRes = await sendPost('/api/verify', {
    email: testEmail,
    code: '000000', // Invalid OTP
  });
  console.log('Status (Expected 400):', wrongRes.status);
  console.log('Body:', wrongRes.data);

  // 5. SUCCESSFUL VERIFICATION
  console.log('\n--------------------------------------------------');
  console.log('5. Testing SUCCESSFUL Verification with Valid Code');
  const successRes = await sendPost('/api/verify', {
    email: testEmail,
    code: validOtp,
  });
  console.log('Status (Expected 200):', successRes.status);
  console.log('Body:', successRes.data);

  // 6. FAILURE STATE 3: CODE REUSED / ALREADY VERIFIED
  console.log('\n--------------------------------------------------');
  console.log('6. Testing FAILURE CASE 3: Valid Code Reused After Verification');
  const reusedRes = await sendPost('/api/verify', {
    email: testEmail,
    code: validOtp,
  });
  console.log('Status (Expected 409):', reusedRes.status);
  console.log('Body:', reusedRes.data);

  await prisma.$disconnect();
}

main().catch(console.error);
