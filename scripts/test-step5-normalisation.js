// scripts/test-step5-normalisation.js
// Tests email lowercasing and password whitespace trimming across registration and login

const http = require('http');

function makeRequest(path, payload) {
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

async function runTest() {
  console.log('=== STEP 5: EMAIL LOWERCASE & PASSWORD TRIMMING TEST ===\n');

  const testEmailUppercase = `Parent.Aminu.${Date.now()}@SchoolFix.Internal`;
  const rawPasswordWithTrailingSpace = 'KanoSchool#2026!   '; // 3 spaces at end
  const cleanPasswordTrimmed = 'KanoSchool#2026!';

  console.log('1. Registering user with:');
  console.log(`   - Uppercase Email: "${testEmailUppercase}"`);
  console.log(`   - Password with Trailing Spaces: "${rawPasswordWithTrailingSpace}" (length: ${rawPasswordWithTrailingSpace.length})`);

  const regRes = await makeRequest('/api/register', {
    fullName: 'Aminu Dantata',
    email: testEmailUppercase,
    phone: '08021112233',
    password: rawPasswordWithTrailingSpace,
    acceptedTerms: true,
  });

  console.log(`\nRegistration Response (Status ${regRes.status}):`);
  console.log(JSON.stringify(regRes.data, null, 2));

  const registeredEmail = regRes.data?.user?.email;
  console.log(`\nStored Email in Database: "${registeredEmail}"`);
  const isLowercased = registeredEmail === testEmailUppercase.toLowerCase();
  console.log(`Email successfully converted to lowercase? ${isLowercased}`);

  console.log('\n--------------------------------------------------');
  console.log('2. Testing Login with LOWERCASE email and TRIMMED password:');
  console.log(`   - Email: "${testEmailUppercase.toLowerCase()}"`);
  console.log(`   - Password without spaces: "${cleanPasswordTrimmed}" (length: ${cleanPasswordTrimmed.length})`);

  const loginRes = await makeRequest('/api/login', {
    email: testEmailUppercase.toLowerCase(),
    password: cleanPasswordTrimmed,
  });

  console.log(`\nLogin Response (Status ${loginRes.status}):`);
  console.log(JSON.stringify(loginRes.data, null, 2));

  console.log('\n--------------------------------------------------');
  console.log('3. Testing Login with UPPERCASE email and TRAILING SPACES:');
  const loginRes2 = await makeRequest('/api/login', {
    email: testEmailUppercase,
    password: rawPasswordWithTrailingSpace,
  });
  console.log(`\nLogin Response (Status ${loginRes2.status}):`);
  console.log(JSON.stringify(loginRes2.data, null, 2));
}

runTest().catch(console.error);
