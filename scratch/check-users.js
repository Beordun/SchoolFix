const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, fullName: true, role: true, isVerified: true }
  });
  console.log('Registered Users:', users);
}

check().catch(console.error).finally(() => prisma.$disconnect());
