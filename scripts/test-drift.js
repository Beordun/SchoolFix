// scripts/test-drift.js
// Intentional Schema Drift Test: Querying a field declared in schema.prisma but not migrated to PostgreSQL

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== STEP 3: TESTING INTENTIONAL SCHEMA DRIFT ===');
  console.log('Attempting to query User.emergencyContact (unmigrated column)...');
  
  try {
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        fullName: true,
        emergencyContact: true,
      },
    });
    console.log('Unexpected success:', user);
  } catch (error) {
    console.error('Captured Schema Drift Error:');
    console.error(error.message || error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
