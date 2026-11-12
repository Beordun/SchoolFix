// lib/security/invite.ts
// SchoolFix Teacher Invitation Primitives
// CSPRNG setup codes, one-way storage hashes, constant-time verification,
// and the 72-hour non-repudiation invite window.
//
// Frozen-schema constraint (AGENTS.md Rule 4 / PRD §8.2): the 11 models may not
// gain invite columns. The invite secret is therefore stored in the existing
// User.verificationCode column (as a SHA-256 hex digest) with the expiry in
// User.codeExpiresAt. The raw code never touches the database.

import crypto from 'crypto';
import argon2 from 'argon2';

export const INVITE_TTL_MS = 72 * 60 * 60 * 1000; // 72 hours, derived from AGENTS.md §4.7
export const SETUP_CODE_PREFIX = 'SF-';
export const SETUP_CODE_DIGITS = 6;

/**
 * Normalises operator/teacher input: trims and upper-cases.
 * " sf-004512 " -> "SF-004512"
 */
export function normalizeSetupCode(code: string): string {
  return code.trim().toUpperCase();
}

/**
 * Generates a uniformly distributed CSPRNG setup code: SF-000000 .. SF-999999.
 * 10^6 keyspace is deliberate: at the enforced 10 attempts/minute/IP ceiling,
 * a 72-hour window allows at most 43,200 guesses (4.32% of the space) against
 * a known invited email. A 4-digit code (10^4) would be exhausted outright.
 */
export function generateSetupCode(): string {
  const digits = crypto.randomInt(0, 10 ** SETUP_CODE_DIGITS);
  return `${SETUP_CODE_PREFIX}${digits.toString().padStart(SETUP_CODE_DIGITS, '0')}`;
}

/**
 * One-way digest stored in User.verificationCode.
 * A database dump cannot be replayed into an activation.
 */
export function hashSetupCode(code: string): string {
  return crypto.createHash('sha256').update(normalizeSetupCode(code)).digest('hex');
}

/**
 * Constant-time comparison of a submitted code against the stored digest.
 * Returns false for missing/malformed records without leaking which branch failed.
 */
export function verifySetupCode(submitted: string, storedHash: string | null | undefined): boolean {
  if (!storedHash) return false;

  const candidate = Buffer.from(hashSetupCode(submitted), 'hex');
  const stored = Buffer.from(storedHash, 'hex');

  // timingSafeEqual throws on length mismatch, so guard first.
  if (candidate.length !== stored.length || stored.length !== 32) return false;

  return crypto.timingSafeEqual(candidate, stored);
}

export function inviteExpiryFrom(now: number = Date.now()): Date {
  return new Date(now + INVITE_TTL_MS);
}

/**
 * Builds the activation link the administrator shares over WhatsApp.
 * The link only carries the code; identity and class arm are resolved server-side.
 */
export function buildInviteLink(origin: string, setupCode: string): string {
  const base = origin.replace(/\/+$/, '');
  return `${base}/auth?mode=activate&code=${encodeURIComponent(normalizeSetupCode(setupCode))}`;
}

export interface InviteMessageInput {
  teacherName: string;
  schoolName?: string;
  classArmName?: string | null;
  inviteLink: string;
  setupCode: string;
  expiresAt: Date;
}

/**
 * Pre-filled WhatsApp message. Admin pastes this into an existing school
 * WhatsApp group/chat; SchoolFix itself never sends chat messages (Rule 6).
 */
export function buildWhatsAppText(input: InviteMessageInput): string {
  const school = input.schoolName || 'your school';
  const arm = input.classArmName ? ` for ${input.classArmName}` : '';
  const expiry = input.expiresAt.toISOString().slice(0, 16).replace('T', ' ');

  return [
    `Hello ${input.teacherName}, you have been invited to join ${school} on SchoolFix as a class teacher${arm}.`,
    '',
    'Activate your account and set your own private password here:',
    input.inviteLink,
    '',
    `Or enter setup code ${input.setupCode} on the SchoolFix activation screen.`,
    `This single-use link expires in 72 hours (${expiry} UTC).`,
    'The administrator will never ask for your password.',
  ].join('\n');
}

/**
 * Placeholder hash for invited-but-not-activated accounts.
 * A valid Argon2id digest of a 32-byte random secret: argon2.verify() returns
 * false cleanly (no malformed-hash exception) and the password is unknowable.
 */
export async function buildUnusablePasswordHash(): Promise<string> {
  return argon2.hash(crypto.randomBytes(32).toString('hex'), {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });
}
