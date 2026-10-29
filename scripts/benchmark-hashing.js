// scripts/benchmark-hashing.js
// Benchmarks Argon2id (memory-hard, resistant to GPU attacks) vs SHA-256 (fast, insecure for password storage)

const argon2 = require('argon2');
const crypto = require('crypto');

const SAMPLE_PASSWORD = 'StMonicaSchool2026@Secure';

// Strict parameters derived from PRD §8 and AGENTS.md
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536, // 64 MiB (65,536 KiB)
  timeCost: 3,       // 3 iterations
  parallelism: 4,    // 4 threads
};

async function demonstrateSaltUniqueness() {
  console.log('=== PART 1: SALT UNIQUENESS PROOF (SAME PASSWORD TWICE) ===');
  console.log(`Input Plaintext Password: "${SAMPLE_PASSWORD}"`);
  
  const hash1 = await argon2.hash(SAMPLE_PASSWORD, ARGON2_OPTIONS);
  const hash2 = await argon2.hash(SAMPLE_PASSWORD, ARGON2_OPTIONS);
  
  console.log('\nRun 1 Hash Output:');
  console.log(hash1);
  console.log('\nRun 2 Hash Output:');
  console.log(hash2);
  
  const areIdentical = hash1 === hash2;
  console.log(`\nHashes are strictly identical? ${areIdentical}`);
  console.log(`Verification 1: ${await argon2.verify(hash1, SAMPLE_PASSWORD)}`);
  console.log(`Verification 2: ${await argon2.verify(hash2, SAMPLE_PASSWORD)}`);
  
  return { hash1, hash2 };
}

async function benchmarkHashing(iterations = 10) {
  console.log(`\n=== PART 2: TIMING BENCHMARK (${iterations} ITERATIONS) ===`);
  console.log(`Argon2id Config: Memory=${ARGON2_OPTIONS.memoryCost} KiB (64 MiB), Time=${ARGON2_OPTIONS.timeCost}, Parallelism=${ARGON2_OPTIONS.parallelism}`);
  
  const argonTimes = [];
  const shaTimes = [];

  // 1. Argon2id Benchmark
  console.log('\nMeasuring Argon2id...');
  for (let i = 0; i < iterations; i++) {
    const start = process.hrtime.bigint();
    await argon2.hash(SAMPLE_PASSWORD, ARGON2_OPTIONS);
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1e6;
    argonTimes.push(durationMs);
    process.stdout.write(`  Run ${i + 1}: ${durationMs.toFixed(2)} ms\n`);
  }

  // 2. SHA-256 Benchmark
  console.log('\nMeasuring SHA-256...');
  for (let i = 0; i < iterations; i++) {
    const start = process.hrtime.bigint();
    crypto.createHash('sha256').update(SAMPLE_PASSWORD).digest('hex');
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1e6;
    shaTimes.push(durationMs);
    process.stdout.write(`  Run ${i + 1}: ${durationMs.toFixed(4)} ms\n`);
  }

  const avgArgon = argonTimes.reduce((a, b) => a + b, 0) / iterations;
  const avgSha = shaTimes.reduce((a, b) => a + b, 0) / iterations;
  const speedRatio = avgArgon / avgSha;

  console.log('\n=== SUMMARY RESULTS ===');
  console.log(`Average Argon2id Duration: ${avgArgon.toFixed(2)} ms`);
  console.log(`Average SHA-256 Duration:   ${avgSha.toFixed(4)} ms (${(avgSha * 1000).toFixed(2)} µs)`);
  console.log(`Argon2id is ${speedRatio.toFixed(0)}x slower than SHA-256 per hash on this hardware.`);
}

async function main() {
  await demonstrateSaltUniqueness();
  await benchmarkHashing(10);
}

main().catch(console.error);
