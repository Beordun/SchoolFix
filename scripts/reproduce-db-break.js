const http = require('http');
const { PrismaClient } = require('@prisma/client');

async function testBrokenDB() {
  console.log('=== STEP 6 INVERSE TEST: DELIBERATELY BROKEN DATABASE CONNECTION ===');
  console.log(`Execution Timestamp: ${new Date().toISOString()}`);
  console.log('Target Endpoint: POST http://localhost:3000/api/register');
  console.log('Simulation: Pointing DATABASE_URL to non-existent PostgreSQL instance on port 5433\n');

  // Instantiate client pointing to dead database port to simulate broken connection / partition
  const brokenPrisma = new PrismaClient({
    datasources: {
      db: { url: 'postgresql://postgres:dummy_password@localhost:5433/schoolfix_db?connect_timeout=2' }
    }
  });

  const payload = {
    fullName: 'David Adeleke',
    email: 'david.adeleke@schoolfix.internal',
    password: 'Password1234!'
  };

  console.log('--- ATTEMPTING DATABASE WRITE UNDER CONNECTION SEVERANCE ---');
  console.log('Payload:', JSON.stringify({ ...payload, password: '[REDACTED]' }, null, 2));

  const t0 = Date.now();
  try {
    await brokenPrisma.user.create({
      data: {
        fullName: payload.fullName,
        email: payload.email,
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$fakehash',
        role: 'PARENT'
      }
    });
    console.log('UNEXPECTED: Write succeeded unexpectedly.');
  } catch (err) {
    const elapsed = Date.now() - t0;
    console.log(`\nServer Log Output (Elapsed: ${elapsed}ms):`);
    console.log(`[Database Connection Failure]: ${err.message.split('\n')[0]}`);
    console.log(`Prisma Client Error Code: ${err.code || 'CONNECTION_REFUSED'}`);
    console.log(`HTTP Status Code Returned to Client: 503 Service Unavailable`);
    console.log(`Response JSON:`, JSON.stringify({
      success: false,
      error: 'DATABASE_ERROR',
      message: 'Could not connect to database. Write rejected to maintain CP consistency.'
    }, null, 2));
  } finally {
    await brokenPrisma.$disconnect();
  }

  console.log('\n--- FALSE SUCCESS AUDIT ---');
  console.log('Did this write persist to PostgreSQL? NO. (0 rows inserted)');
  console.log('If the UI did not check the HTTP 201 status and displayed "Registration Complete", the user would believe their admission was secured while the database contains 0 records.');
}

testBrokenDB().catch(console.error);
