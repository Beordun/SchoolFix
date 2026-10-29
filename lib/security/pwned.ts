// lib/security/pwned.ts
// k-Anonymity Breached Password Checker using HaveIBeenPwned API

import crypto from 'crypto';

export interface PwnedCheckResult {
  isPwned: boolean;
  breachCount: number;
}

/**
 * Checks whether a password has been compromised in known data breaches
 * using the k-Anonymity mathematical model.
 * 
 * Mechanism:
 * 1. Compute SHA-1 hash of the password (e.g. 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8 for 'password').
 * 2. Transmit ONLY the first 5 characters ('5BAA6') to the HIBP API.
 * 3. Receive ~500 suffix matches with breach frequencies.
 * 4. Search locally for the remaining 35 characters ('1E4C9B93F3F0682250B6CF8331B7EE68FD8').
 * 5. Neither the plaintext password nor the full hash is ever exposed across the network.
 */
export async function checkBreachedPassword(password: string): Promise<PwnedCheckResult> {
  try {
    const sha1Hash = crypto
      .createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase();

    const prefix = sha1Hash.substring(0, 5);
    const suffix = sha1Hash.substring(5);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'User-Agent': 'SchoolFix-Security-Scanner/1.0',
        'Add-Padding': 'true', // Mitigates response length side-channel attacks
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      // Fail open if external HIBP service is down or rate-limited
      console.warn(`[HIBP Warning]: API responded with status ${res.status}. Failing open.`);
      return { isPwned: false, breachCount: 0 };
    }

    const responseText = await res.text();
    const lines = responseText.split('\n');

    for (const line of lines) {
      const [hashSuffix, countStr] = line.trim().split(':');
      if (hashSuffix && hashSuffix.toUpperCase() === suffix) {
        const breachCount = parseInt(countStr, 10) || 1;
        return { isPwned: true, breachCount };
      }
    }

    return { isPwned: false, breachCount: 0 };
  } catch (error: any) {
    console.warn('[HIBP Error]: Network error checking breached passwords. Failing open to prevent registration denial.', error.message);
    return { isPwned: false, breachCount: 0 };
  }
}
