require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/schoolfix_db?schema=public' } },
});

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
  console.log(`Database: schoolfix_db | Host: localhost:5432 | Total Rows: ${users.length}\n`);
  console.table(users);
  await prisma.$disconnect();
}

main().catch(console.error);
