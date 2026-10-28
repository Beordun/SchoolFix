---
name: auth-cryptography
description: Implements Argon2id password hashing, cryptographic session tokens, and timing benchmark measurements.
---

# Authentication & Cryptography Skill

## Purpose
Enforces production-grade defensive cryptography for user credentials and session tokens, eliminating fast-hash vulnerabilities (SHA-256) and insecure cookies.

## Core Directives
1. **Never Hash Passwords with SHA:** Plain SHA algorithms are fast and facilitate brute-force cracking. Passwords must be hashed strictly using Argon2id.
2. **Argon2id Specification:**
   - Memory cost: 65,536 KiB (64 MiB)
   - Time cost: 3 iterations
   - Parallelism: 4 threads
3. **Session Token Cryptography:**
   - 32-byte cryptographically secure random bytes via `crypto.randomBytes(32).toString('hex')`.
   - Raw token is delivered to the client inside an `HttpOnly`, `Secure`, `SameSite=Lax` cookie.
   - The database table `Session.sessionToken` stores ONLY the SHA-256 hash of this raw token to prevent database leak compromise.
4. **Global Invalidation:** Password resets and explicit logouts must delete all active database sessions for that user.

## Operational Workflows

### 1. Timing Benchmark Measurement (Task 4 Evidence)
Measure and document the execution speed of Argon2id vs SHA-256 on the local machine:
```typescript
import argon2 from 'argon2';
import crypto from 'crypto';

// 1. Time Argon2id
const t0 = performance.now();
await argon2.hash('SamplePassword123!', {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4
});
const argonTime = performance.now() - t0;

// 2. Time SHA-256
const t1 = performance.now();
crypto.createHash('sha256').update('SamplePassword123!').digest('hex');
const shaTime = performance.now() - t1;

console.log(`Argon2id: ${argonTime.toFixed(2)}ms | SHA-256: ${shaTime.toFixed(4)}ms`);
```
Calculate and document the attacker guess differential in `evidence/08-timing-argon-vs-sha.txt`.
