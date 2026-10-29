# Rate Limiting Architecture, Counter Storage & The Limits of IP Defense

> **Product:** SchoolFix (Mobile-First School Management & Tuition Reconciliation)  
> **Target Market:** Nigerian Private Primary and Secondary Schools  
> **Policy:** Sliding Window (5 requests per 60 seconds on `/api/login` and `/api/register`, 3 per 60 seconds on `/api/reset`)  
> **Step Reference:** Task 4, Step 8 — Rate Limiting, and Its Limits  
> **Evidence References:**  
> - [`evidence/13-rate-limit-triggered.png`](file:///c:/Users/DT001/Desktop/SchoolFix/task-04-server-security/evidence/13-rate-limit-triggered.png) (Browser lockout banner on 6th attempt)  
> - [`evidence/14-rate-limit-defeated.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-04-server-security/evidence/14-rate-limit-defeated.txt) (Machine terminal log proving defeat via IP rotation)  

---

## 1. Threshold & Window Derivations

In SchoolFix, rate limiting thresholds are derived directly from the operational realities of Nigerian private school administration:

| Endpoint | Threshold | Window | Mathematical & Operational Justification |
| :--- | :---: | :---: | :--- |
| **`/api/login`** | 5 attempts | 60 seconds | A legitimate parent or teacher typing credentials requires 8–15 seconds per login attempt. Allowing 5 attempts in 60 seconds accommodates typos while capping an automated brute-force tool to $\le 300\text{ guesses/hour}$ per key. |
| **`/api/register`** | 5 attempts | 60 seconds | Registering a pupil requires filling name, phone, email, and password. An IP attempting more than 5 enrollments per minute is an automated scraping or bot enumeration script. |
| **`/api/reset`** | 3 attempts | 60 seconds | Password reset triggers transactional email/SMS OTP dispatch. A tight limit of 3/minute protects the school from third-party SMS/email API exhaustion costs and mail server IP reputation blacklisting. |

---

## 2. Why IP-Based Rate Limiting Alone is Insufficient

In [`evidence/14-rate-limit-defeated.txt`](file:///c:/Users/DT001/Desktop/SchoolFix/task-04-server-security/evidence/14-rate-limit-defeated.txt), we proved that after locking out client IP `197.210.64.12` with `HTTP 429`, simply rotating to `102.89.23.45` bypassed the lockout entirely on Request 7.

### Failure Mode 1: Attacker Defeat via IP Churn
- **Residential Proxies & Botnets:** Attackers rent residential proxy pools with millions of IP addresses for a few dollars. Each request is routed through a different exit node, rendering IP-only rate limiters completely ineffective.
- **Mobile Network APN Cycling:** In Nigeria, reconnecting a 4G SIM (toggling airplane mode on MTN or Airtel) assigns a fresh Carrier-Grade NAT (CGNAT) dynamic IP address from the operator's pool within 10 seconds.

### Failure Mode 2: Collateral Denial of Service to Legitimate Users
- **Carrier-Grade NAT (CGNAT):** Nigerian mobile telcos do not issue public IPv4 addresses to individual mobile phones. Tens of thousands of smartphone users across an entire municipal district browse the internet through a small cluster of shared NAT gateway IPs.
- **Shared School Campus / Staff Room Wi-Fi:** If a secondary school with 40 teachers connects via a single Starlink or fiber router, all 40 teachers share **one public IP address**. If two teachers enter the wrong password three times in the morning before homeroom, an IP-only rate limiter locks out the remaining 38 teachers from submitting daily attendance registers!

---

## 3. What Serious Applications Key On (Multi-Key Composite Throttling)

To prevent both attacker bypass and legitimate user lockout, production systems employ multi-dimensional composite keys:

1. **Normalized Target Account (`email`):**  
   - Key: `login:account:${normalizedEmail}` (e.g. 5 attempts / 5 mins).
   - *Impact:* Prevents distributed botnets from spraying passwords against a single bursar account from 500 different IP addresses.
2. **Client IP Address (`x-forwarded-for`):**  
   - Key: `login:ip:${clientIp}` (e.g. 20 attempts / 5 mins).
   - Set with higher headroom to accommodate shared school Wi-Fi networks while still blocking single-host volumetric flooding.
3. **Device / TLS Fingerprinting (JA4 / Client Hello):**  
   - Inspects cipher suites, extensions, and TCP window sizes to identify headless script runtimes (Python `requests`, Node.js `http`, Go `curl`) regardless of user-agent or IP spoofing.

---

## 4. Counter Storage Architecture: In-Memory vs. Shared Redis

| Dimension | In-Memory (Node.js `Map`) | Centralized Shared Store (Redis) |
| :--- | :--- | :--- |
| **Latency** | Sub-microsecond (< 0.001 ms) | 0.5 ms – 2.0 ms (Network roundtrip) |
| **Server Restarts** | Counters wiped on every server restart or deployment | Counters persist across server reboots |
| **Horizontal Scaling** | **Fails across multi-instance pods:** Request 1 hits Pod A, Request 2 hits Pod B. Attacker gets $N \times$ budget across $N$ pods. | **Single Source of Truth:** All pods share atomic `INCR` and `EXPIRE` counters. |
| **Infrastructure Complexity** | Zero dependencies | Requires Redis cluster, connection pooling, and health checks |

---

## 5. The Fail-Open vs. Fail-Closed Architectural Dilemma

When the rate limit storage engine (e.g. Redis) crashes, experiences network timeouts, or becomes unreachable:

### The Two Alternatives
1. **Fail Closed (Reject Everything):** All incoming authentication requests return `HTTP 500` or `HTTP 503`.
   - *Security:* High. Guarantees that no un-throttled brute-force attacks can slip through.
   - *Availability:* Catastrophic. Locks out 100% of legitimate users during an infrastructure glitch.
2. **Fail Open (Allow and Log):** The rate limiter catches the store error, logs an alert, and permits the authentication request to proceed un-throttled.

### SchoolFix Policy: Fail Open for Parents, Fail Closed for Bursary Admin
- For standard parent logins and pupil registrations, **we Fail Open**. A morning attendance or tuition reconciliation deadline cannot be halted because a caching server glitched. The memory-hard Argon2id hash still provides fundamental defense against offline attacks.
- For high-privilege administrative functions (Bursar bulk ledger modifications and payout reconciliations), **we Fail Closed** to protect legal financial integrity.
