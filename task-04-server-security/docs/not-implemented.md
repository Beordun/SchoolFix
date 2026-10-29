# Security Controls Considered and Intentionally Deferred

> **Product:** SchoolFix (Mobile-First School Management & Tuition Reconciliation)  
> **Target Market:** Nigerian Private Primary and Secondary Schools  
> **Step Reference:** Task 4, Step 12 — What You Decided Not to Do  

---

## 1. SMS OTP Delivery for Registration (Cellular Shortcode Relays)

### What It Is
Transmitting the 6-digit account confirmation code directly to the parent's phone number via cellular SMS gateways (e.g. Termii, Twilio, or Africa's Talking) rather than email.

### Why It Was Not Worth It at This Stage
1. **Unbounded Financial Exposure (SMS Pumping Attacks):** In Nigeria, SMS delivery costs range from ₦4.50 to ₦15.00 per message depending on the destination telco (MTN, Airtel, Glo). If an attacker targets the unauthenticated registration endpoint with automated scripts, they can trigger thousands of SMS dispatches within minutes, draining the school's communication budget before a human intervenes.
2. **DND (Do Not Disturb) Blackholes:** Millions of Nigerian mobile lines are enrolled in the NCC's mandatory Do Not Disturb (DND) registry, causing transactional SMS traffic to be silently dropped by telco firewalls unless transmitted via expensive international routes.

### What Would Have to Change to Add It
We would implement SMS delivery only after:
- A subscribing school funds a dedicated prepaid communication wallet with strict monthly spending caps.
- Cloudflare Turnstile or proof-of-work challenges sit in front of the phone dispatch handler.
- SMS is restricted to high-stakes financial receipts (e.g., tuition payment confirmations), keeping registration verification on email.

---

## 2. Hardware Security Keys & WebAuthn / FIDO2 Passkeys

### What It Is
Requiring or offering cryptographic FIDO2 hardware tokens (e.g. YubiKeys) or biometric device passkeys (TouchID / FaceID) for passwordless authentication.

### Why It Was Not Worth It at This Stage
1. **Target Hardware Incompatibility:** SchoolFix's target demographic utilizes sub-$100 Android smartphones (Tecno, Infinix, itel) running Android Go or older Android versions. Hardware keystores are frequently absent, biometric sensors are unreliable or disabled due to cracked screens, and WebAuthn browser APIs have erratic support across older mobile Chrome/Opera Mini builds.
2. **Shared Family Device Usage:** In Nigerian households, a single smartphone is frequently shared between husband, wife, and older children. Device-bound passkeys bind authentication to one specific handset, preventing a mother from checking fee clearance from her office desktop if the father holds the registered phone.

### What Would Have to Change to Add It
WebAuthn passkeys would be introduced strictly as an **optional administrative enhancement** for school bursars and proprietors accessing high-value tuition disbursement ledgers on desktop workstations, never as a mandatory barrier for parents.

---

## 3. Permanent Account Lockout After 5 Failed Passwords

### What It Is
Hard-locking a user's account in PostgreSQL (setting `isLocked: true` or disabling the row) when 5 consecutive incorrect passwords are submitted, requiring administrative bursary intervention to restore access.

### Why It Was Not Worth It at This Stage
1. **Denial-of-Service (DoS) Attack Vector Against School Staff:** In Nigerian schools, staff and teacher email addresses are publicly known or predictable (e.g. `adeleke@schoolfix.internal`). An attacker or mischievous secondary school pupil could enter 5 incorrect passwords for all 30 classroom teachers at 7:50 AM, permanently locking out the entire faculty from submitting morning attendance registers.
2. **Support Overhead:** Private school bursars are already overwhelmed during the first two weeks of term. Flooding the bursary with manual account unlock requests degrades core tuition collection operations.

### What Would Have to Change to Add It
Instead of permanent lockout, we implement **progressive exponential backoff** (locking the client IP for 60 seconds, then 5 minutes, then 15 minutes) combined with generic error messaging, ensuring brute force is mathematically impossible while preventing malicious account freezing.

---

## 4. Mutual TLS (mTLS) for API Endpoints

### What It Is
Requiring clients to present an x509 cryptographic certificate during the TLS handshake to establish bidirectional authentication between browser and server.

### Why It Was Not Worth It at This Stage
1. **Consumer Usability Barrier:** mTLS requires distributing, installing, and managing cryptographic client certificates inside mobile browser trust stores. Expecting non-technical Nigerian parents to import PKCS#12 certificate bundles onto an Android phone to enroll their primary school child is operational suicide.
2. **Certificate Lifecycle Friction:** Certificate revocation lists (CRLs) and expiration management would require dedicated PKI infrastructure that provides zero tangible benefit over HttpOnly session cookies.

### What Would Have to Change to Add It
mTLS would be implemented exclusively for **machine-to-machine integrations**, such as securing the webhook pipeline between the Flutterwave payment gateway and SchoolFix's dual-ledger reconciliation endpoint.
