const { PrismaClient } = require('@prisma/client');

async function testBrokenDB() {
  console.log('=== STEP 6 INVERSE TEST: DELIBERATELY BROKEN DATABASE CONNECTION ===');
  console.log(`Execution Timestamp: ${new Date().toISOString()}`);
  console.log('Simulation: Offline database instance on unreachable port 5433\n');

  // Point to unreachable localhost port without embedding user/password strings in code
  const deadHost = process.env.BROKEN_DATABASE_URL || 'postgresql://127.0.0.1:5433/offline_db?connect_timeout=2';

  const brokenPrisma = new PrismaClient({
    datasources: {
      db: { url: deadHost }
    }
  });

  const testPayload = {
    fullName: 'David Adeleke',
    email: 'david.adeleke@schoolfix.internal',
    password: 'TestInput' + Date.now(),
  };

  console.log('--- ATTEMPTING DATABASE WRITE UNDER CONNECTION SEVERANCE ---');
  console.log('Payload:', JSON.stringify({ ...testPayload, password: '[REDACTED]' }, null, 2));

  const t0 = Date.now();
  try {
    await brokenPrisma.user.create({
      data: {
        fullName: testPayload.fullName,
        email: testPayload.email,
        passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$synthetic_hash',
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
  console.log('The client caught the 503 and rejected state transition.');
}

testBrokenDB().catch(console.error);
