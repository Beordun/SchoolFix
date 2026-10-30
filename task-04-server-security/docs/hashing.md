# Slow Password Hashing Architecture & The Economics of Defense

> **Product:** SchoolFix (Mobile-First School Management & Tuition Reconciliation)  
> **Target Market:** Nigerian Private Primary and Secondary Schools  
> **Hash Standard:** Argon2id (RFC 9106, Winner of Password Hashing Competition)  
> **Step Reference:** Task 4, Step 4 — Slow Hashing & Why Fast is Wrong  
> **Evidence References:**  
> - [`evidence/07-hash-twice-different.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-04-server-security/evidence/07-hash-twice-different.txt) (Salt uniqueness proof)  
> - [`evidence/08-timing-argon-vs-sha.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-04-server-security/evidence/08-timing-argon-vs-sha.txt) (Argon2id vs SHA-256 empirical benchmark)  

---

## 1. The Architectural Fallacy: "Fast is Good"

In systems engineering, optimizing latency from 100ms down to 100 microseconds is typically celebrated. In password cryptography, **speed is a catastrophic architectural defect**.

General-purpose cryptographic hash functions (such as MD5, SHA-1, and SHA-256) were engineered for data integrity, message authentication codes (HMAC), and blockchain proofs. Their design goals are:
1. Maximize throughput (gigabytes per second processed through CPU pipelining and hardware acceleration like Intel SHA Extensions).
2. Minimal CPU cycles and zero memory allocation beyond tiny register state machines.

When an engineer stores user passwords using SHA-256, they hand attackers an asymmetric advantage that renders password complexity requirements completely obsolete.

---

## 2. Attacker vs. Defender Arithmetic Calculation

Consider a scenario where an attacker exfiltrates SchoolFix's database user table containing 5,000 hashed passwords. The attacker takes the dump offline and uses Hashcat on a single consumer workstation equipped with an NVIDIA GeForce RTX 4090 GPU.

### Case A: SHA-256 (Fast Hashing)
- **RTX 4090 Hashrate (SHA-256):** $\approx 55,000,000,000$ hashes per second ($55\text{ GH/s}$).
- **Dictionary & Brute-Force Feasibility:**
  - An 8-character password using alphanumeric characters plus common symbols ($94^8 \approx 6.09 \times 10^{15}$ combinations).
  - Time to exhaust entire keyspace at $55\text{ GH/s}$:
    $$\text{Time} = \frac{6.09 \times 10^{15}}{55 \times 10^9 \text{ hashes/sec}} \approx 110,727 \text{ seconds} \approx 30.7 \text{ hours}$$
  - A standard 8-character lowercase/digits password ($36^8 \approx 2.82 \times 10^{12}$ combinations):
    $$\text{Time} = \frac{2.82 \times 10^{12}}{55 \times 10^9 \text{ hashes/sec}} \approx 51.2 \text{ seconds}$$
- **Result:** Within 48 hours, the attacker recovers 100% of passwords for teachers, bursars, and parents.

### Case B: Argon2id (Memory-Hard Hashing with SchoolFix Parameters)
- **SchoolFix Configuration:** `memoryCost: 65536` KiB (64 MiB), `timeCost: 3`, `parallelism: 4`.
- **Hardware Bottleneck:**
  - Modern GPUs have massive compute parallelism (thousands of CUDA cores) but shared, limited onboard high-bandwidth memory (VRAM).
  - An RTX 4090 possesses 24 GB of VRAM.
  - Number of parallel Argon2id instances that can physically fit in 24 GB of VRAM at 64 MiB per thread:
    $$\text{Max Concurrent Threads} = \frac{24,576 \text{ MB}}{64 \text{ MB}} = 384 \text{ threads}$$
  - GPU compute cores cannot execute guesses from registers; each thread must continuously write and read 64 MiB of pseudorandom memory blocks across 3 full passes. The attack becomes strictly **memory bandwidth bound**.
- **RTX 4090 Hashrate (Argon2id @ 64 MiB):** $\approx 2,100$ hashes per second.
- **Cracking Time for the Same 8-Character Key:**
  $$\text{Time} = \frac{6.09 \times 10^{15}}{2,100 \text{ hashes/sec}} \approx 2.9 \times 10^{12} \text{ seconds} \approx 91,950 \text{ years}$$
- **Result:** The attack is mathematically and economically infeasible.

---

## 3. The Defender vs. Attacker Economic Inversion

Password security relies on an intentional economic asymmetric inversion:

```text
DEFENDER PERSPECTIVE (Human Login):
• Frequency: Once per session / day.
• Hardware: Server CPU.
• Cost Paid: 82.21 ms CPU time + 64 MiB RAM once.
• User Experience: Completely imperceptible (sub-100ms threshold).

ATTACKER PERSPECTIVE (Offline Brute-Force):
• Frequency: Billions of attempts required.
• Hardware: GPU / ASIC cluster.
• Cost Paid: 82.21 ms × 1,000,000,000 = 82,210,000 seconds per million guesses.
• Hardware Saturation: VRAM runs out immediately at 384 threads.
```

By forcing the hash to require 64 MiB of dedicated RAM, the defender incurs a negligible 82ms one-off penalty, but forces the attacker into crippling memory-bandwidth saturation.

---

## 4. Why Argon2id Over Bcrypt and PBKDF2?

| Dimension | PBKDF2 (HMAC-SHA256) | Bcrypt | Argon2id |
| :--- | :--- | :--- | :--- |
| **Primary Resource Consumed** | CPU Cycles only | L2/L3 Cache (4 KB) | Main System Memory (64 MiB+) |
| **GPU/ASIC Resistance** | Very Poor (ASICs compute millions/sec) | Moderate (Limited by cache size) | **Immense (High memory bandwidth requirement)** |
| **Side-Channel Timing Resistance** | Good | Poor (Susceptible to cache timing attacks) | **Excellent (Hybrid data-dependent & data-independent phases)** |
| **Maximum Password Length** | Unlimited | Truncates at 72 bytes | **Unlimited (up to $2^{32}-1$ bytes)** |
| **RFC Standard** | RFC 2898 | De facto standard | **RFC 9106 (PHC Winner)** |

### Argon2id Hybrid Architecture
- **Argon2d:** Accesses memory array dependent on previous hash values. Provides maximum resistance to GPU cracking (time-memory trade-offs) but is theoretically vulnerable to cache side-channel attacks on shared CPU hardware.
- **Argon2i:** Accesses memory array completely independently of password data, defeating side-channel cache attacks.
- **Argon2id (Our Implementation):** Executes the first half of the first iteration as Argon2i to prevent side-channel timing leaks, then switches to Argon2d for the remainder of the computation to maximize GPU cracking resistance.

---

## 5. Salt Generation & Rainbow Table Invalidation

In [`evidence/07-hash-twice-different.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-04-server-security/evidence/07-hash-twice-different.txt), hashing `"StMonicaSchool2026@Secure"` twice produced two completely unique strings:
- `Run 1:` `$argon2id$v=19$m=65536,p=4,t=3$bnFP56JCLQwHYJk/Z13XNQ$Ba4McKFoyAu0tZHH/X2/XEWNYen10o6e4byloEALR8Y`
- `Run 2:` `$argon2id$v=19$m=65536,p=4,t=3$NTaLee4K3qxh3s4TyAEGfQ$R3pZ2pNkhcKU6Zjwit5Bt2eyoLRf08DMnfIQoOshqIc`

### How the Salt Protects the Database
1. **Rainbow Table Invalidation:** A rainbow table is a precomputed lookup table mapping plaintext passwords to hashes. Because each salt is a 16-byte cryptographically secure random value (`$bnFP56...` vs `$NTaLee...`), an attacker cannot use precomputed tables; they must compute a bespoke table for each individual user salt ($2^{128}$ possible salts).
2. **Identical Password Masking:** If two classroom teachers choose the same default password, their database rows appear completely different. An insider auditing the database cannot deduce who shares a password.
