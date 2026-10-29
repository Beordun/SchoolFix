require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not defined in environment.');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log('=== DATABASE INSPECTOR: "User" TABLE ROWS ===');
  console.log(`Host: localhost:5432 | Total Rows: ${users.length}\n`);
  console.table(users);
  await prisma.$disconnect();
}

main().catch(console.error);
