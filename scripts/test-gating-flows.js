// scripts/test-gating-flows.js
// Sets up accounts to demonstrate Soft Gating vs Hard Gating flows
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const argon2 = require('argon2');

const prisma = new PrismaClient();

async function main() {
  console.log('=== Setting up Soft Gating & Hard Gating Demonstration Accounts ===\n');

  const password = 'Password123@SchoolFix';
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // 1. Soft Gating Account (Registered, unverified, can log in and view dashboard with warning banner)
  const softEmail = 'softgating.parent@schoolfix.internal';
  const softUser = await prisma.user.upsert({
    where: { email: softEmail },
    update: {
      passwordHash,
      isVerified: false,
      deletedAt: null,
      verificationCode: '748291',
      codeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
    create: {
      email: softEmail,
      fullName: 'Bolanle Adeleke (Soft Gated)',
      passwordHash,
      nin: 'NIN-SOFT-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
      role: 'PARENT',
      isVerified: false,
      verificationCode: '748291',
      codeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });
  console.log(`[Soft Gated User]: ${softUser.fullName} (${softUser.email})`);

  // 2. Hard Gating Account (Stopped at verification gate)
  const hardEmail = 'hardgating.parent@schoolfix.internal';
  const hardUser = await prisma.user.upsert({
    where: { email: hardEmail },
    update: {
      passwordHash,
      isVerified: false,
      deletedAt: null,
      verificationCode: '582914',
      codeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
    create: {
      email: hardEmail,
      fullName: 'Emeka Nwosu (Hard Gated)',
      passwordHash,
      nin: 'NIN-HARD-' + crypto.randomBytes(4).toString('hex').toUpperCase(),
      role: 'PARENT',
      isVerified: false,
      verificationCode: '582914',
      codeExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });
  console.log(`[Hard Gated User]: ${hardUser.fullName} (${hardUser.email})`);

  await prisma.$disconnect();
}

main().catch(console.error);
