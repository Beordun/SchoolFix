// lib/security/rate-limiter.ts
// In-Memory Sliding Window Rate Limiter for SchoolFix Authentication Endpoints

import { NextRequest } from 'next/server';

interface RateLimitRecord {
  timestamps: number[];
}

// Global in-memory storage for sliding window counters
const rateLimitStore = new Map<string, RateLimitRecord>();

export interface RateLimitConfig {
  maxRequests: number; // Maximum allowed requests in window (e.g. 5)
  windowMs: number;    // Window duration in ms (e.g. 60,000 for 1 minute)
}

export interface RateLimitResult {
  isLimited: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  clientIp: string;
}

/**
 * Extracts client IP from incoming Next.js request headers.
 * Supports X-Forwarded-For and X-Real-IP to enable testing and legitimate proxy handling.
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Left-most IP is the original client IP in standard proxy chains
    const ips = forwardedFor.split(',').map((ip) => ip.trim());
    if (ips[0]) return ips[0];
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return (req as any).ip || '127.0.0.1';
}

/**
 * Applies sliding window rate limiting for a specific action and client IP.
 */
export function checkRateLimit(
  req: NextRequest,
  action: 'register' | 'login' | 'reset',
  config: RateLimitConfig = { maxRequests: 5, windowMs: 60000 }
): RateLimitResult {
  const clientIp = getClientIp(req);
  const key = `${action}:${clientIp}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  const record = rateLimitStore.get(key) || { timestamps: [] };

  // Retain only timestamps within the active sliding window
  const activeTimestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (activeTimestamps.length >= config.maxRequests) {
    const oldestTimestamp = activeTimestamps[0];
    const resetSeconds = Math.max(1, Math.ceil((oldestTimestamp + config.windowMs - now) / 1000));

    return {
      isLimited: true,
      limit: config.maxRequests,
      remaining: 0,
      resetSeconds,
      clientIp,
    };
  }

  // Record current request timestamp
  activeTimestamps.push(now);
  rateLimitStore.set(key, { timestamps: activeTimestamps });

  return {
    isLimited: false,
    limit: config.maxRequests,
    remaining: config.maxRequests - activeTimestamps.length,
    resetSeconds: Math.ceil(config.windowMs / 1000),
    clientIp,
  };
}

/**
 * Clear rate limit store (used in test benchmarks)
 */
export function resetRateLimitStore(): void {
  rateLimitStore.clear();
}
