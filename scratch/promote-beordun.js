const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const res = await prisma.user.updateMany({
    where: { email: 'beordunmichael@gmail.com' },
    data: { role: 'ADMIN', isVerified: true },
  });
  console.log('Promoted beordunmichael@gmail.com to ADMIN:', res.count);
}

main().finally(() => prisma.$disconnect());
