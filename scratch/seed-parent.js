const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function seedParent() {
  const password = 'Password123@SchoolFix';
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const email = 'parent.michael@schoolfix.internal';
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      isVerified: true,
      deletedAt: null,
    },
    create: {
      email,
      fullName: 'Biodun Michael',
      passwordHash,
      nin: 'NIN-MICHAEL-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
      role: 'PARENT',
      isVerified: true,
    },
  });

  console.log('Seeded parent user:', user.email, 'password:', password);
}

seedParent().catch(console.error).finally(() => prisma.$disconnect());
