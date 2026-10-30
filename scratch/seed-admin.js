const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function seedAdmin() {
  const password = 'Password123@SchoolFix';
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  const email = 'admin.bursar@schoolfix.internal';
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: 'ADMIN',
      isVerified: true,
      deletedAt: null,
    },
    create: {
      email,
      fullName: 'Alhaji Rasheed Adeleke (Chief Bursar)',
      passwordHash,
      nin: 'NIN-ADMIN-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log('Seeded Admin User:');
  console.log('  ID:       ', user.id);
  console.log('  Email:    ', user.email);
  console.log('  Role:     ', user.role);
  console.log('  Password: ', password);
}

seedAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
