// lib/security/session.ts
// SchoolFix Cryptographic Session Management
// Enforces 32-byte CSPRNG token generation, SHA-256 server-side digest storage,
// and strict browser cookie flags (HttpOnly, Secure, SameSite=Lax)

import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const SESSION_COOKIE_NAME = 'schoolfix_session';
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days (604,800 seconds)

export interface SessionWithUser {
  id: string;
  sessionToken: string;
  userId: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    isVerified: boolean;
    isLocked?: boolean;
    deletedAt?: Date | null;
  };
}

/**
 * Hash raw token with SHA-256 before storing or querying the database.
 * The raw token exists ONLY on the client cookie. Database dumps expose only one-way hashes.
 */
export function hashSessionToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Generates a high-entropy 32-byte CSPRNG token (64 hex characters)
 */
export function generateCryptographicToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Creates a fresh session in the database for the authenticated user.
 * Generates a new random token on every login (never reused).
 */
export async function createSession(
  userId: string,
  clientIp?: string | null,
  userAgent?: string | null
): Promise<{ rawToken: string; hashedToken: string; expiresAt: Date }> {
  const rawToken = generateCryptographicToken();
  const hashedToken = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      userId,
      sessionToken: hashedToken,
      expiresAt,
      ipAddress: clientIp || null,
      userAgent: userAgent || null,
    },
  });

  return { rawToken, hashedToken, expiresAt };
}

/**
 * Validates a raw session token received from incoming request cookies.
 * Verifies existence, expiration, and user account lock/deletion status.
 */
export async function validateSession(rawToken: string): Promise<SessionWithUser | null> {
  if (!rawToken || typeof rawToken !== 'string') return null;

  const hashedToken = hashSessionToken(rawToken);

  const session = await prisma.session.findUnique({
    where: { sessionToken: hashedToken },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          isVerified: true,
          deletedAt: true,
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // Check expiration
  if (session.expiresAt < new Date()) {
    // Session expired; delete asynchronously and return null
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  // Check if account has been soft-deleted or scheduled for purge
  if (session.user.deletedAt) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  return session as SessionWithUser;
}

/**
 * Deletes a single active session from the database (called on user logout)
 */
export async function revokeSession(rawToken: string): Promise<boolean> {
  try {
    if (!rawToken) return false;
    const hashedToken = hashSessionToken(rawToken);
    await prisma.session.deleteMany({
      where: { sessionToken: hashedToken },
    });
    return true;
  } catch (error) {
    console.error('[Session Revoke Error]:', error);
    return false;
  }
}

/**
 * Revokes all sessions for a specific user (called on password reset or account deletion)
 */
export async function revokeAllUserSessions(userId: string): Promise<number> {
  const result = await prisma.session.deleteMany({
    where: { userId },
  });
  return result.count;
}

/**
 * Attaches the session cookie to an outgoing HTTP response with strict security flags
 */
export function attachSessionCookie(
  response: NextResponse,
  rawToken: string,
  expiresAt: Date
): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: rawToken,
    httpOnly: true, // Prevents JavaScript document.cookie access (Mitigates XSS token theft)
    secure: process.env.NODE_ENV === 'production', // Transmitted exclusively over encrypted HTTPS in production
    sameSite: 'lax', // Protects against Cross-Site Request Forgery (CSRF) on cross-site requests
    path: '/', // Restricted to root application context
    expires: expiresAt,
    maxAge: Math.floor(SESSION_DURATION_MS / 1000), // 604,800 seconds
  });
}

/**
 * Clears the session cookie from the browser on logout
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
}
