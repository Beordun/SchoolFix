# Breached Password Verification Architecture & The k-Anonymity Model

> **Product:** SchoolFix (Mobile-First School Management & Tuition Reconciliation)  
> **Target Market:** Nigerian Private Primary and Secondary Schools  
> **API Standard:** HaveIBeenPwned (HIBP) Pwned Passwords v3 (k-Anonymity Range API)  
> **Step Reference:** Task 4, Step 9 — Breached Password Checks  
> **Evidence Reference:** [`evidence/15-breach-check-rejection.png`](file:///c:/Users/DT001/Desktop/SchoolFix/task-04-server-security/evidence/15-breach-check-rejection.png)  

---

## 1. The Threat Model: Credential Stuffing & Password Reuse

In the educational sector, parents, teachers, and school proprietors reuse passwords across personal email accounts, consumer banking apps, social networks, and educational management portals. 

When a consumer e-commerce site or social media platform experiences a data leak, threat actors compile the exfiltrated plaintext passwords into massive public dictionaries (such as *RockYou2024* or breach databases containing billions of entries). Attackers then run automated credential stuffing attacks against school management portals to compromise bursary records, alter fee clearance ledgers, or access student contact information.

To eliminate this threat vector at enrollment, SchoolFix verifies candidate passwords against known public breaches during **registration only**.

---

## 2. Why the Naive Implementation is a Catastrophic Security Violation

The naive approach to checking breached passwords would look like this:
```text
[Browser] ────► [SchoolFix API] ────► [External Breach API]
                  (Transmits "Password123!" over HTTP POST)
```

### Why Building This Would Be Gross Engineering Negligence
1. **Centralized Interception Honeypot:** Transmitting user passwords to a third-party external server hands an external entity the exact plaintext credentials of your users. If the external breach check service or the transit network is compromised, the security check itself becomes a catastrophic data exfiltration pipeline.
2. **Statutory Breach under NDPA 2023 & GDPR:** Transmitting plaintext passwords to an un-audited third party violates Section 24 of the Nigerian Data Protection Act (Principles of Personal Data Processing: Confidentiality and Integrity) and GDPR Article 32.
3. **Internal Log Poisoning:** Any proxy, load balancer, or network inspection tool sitting between SchoolFix and the external service would log plaintext passwords in HTTP query strings or payload logs.

---

## 3. How k-Anonymity Protects Password Privacy

SchoolFix implements the mathematical model of **$k$-Anonymity** via the HaveIBeenPwned Range protocol:

```text
1. USER TYPES CANDIDATE PASSWORD:
   "Password123!"

2. COMPUTE SHA-1 HASH LOCALLY IN MEMORY:
   SHA-1("Password123!") = "CBFDAC6008F9CAB4083784CBD1874F76618D2A97"

3. SPLIT HASH INTO PREFIX (5 CHARS) AND SUFFIX (35 CHARS):
   • Prefix: "CBFDA"
   • Suffix: "C6008F9CAB4083784CBD1874F76618D2A97"

4. TRANSMIT ONLY THE 5-CHARACTER PREFIX:
   GET https://api.pwnedpasswords.com/range/CBFDA

5. EXTERNAL SERVICE RESPONDS WITH ~500 ANONYMOUS SUFFIXES:
   C5DFB80A526019A1EC3788C526F7996324A:1
   C6008F9CAB4083784CBD1874F76618D2A97:295389  <── [LOCAL MATCH!]
   C605799D0FA946571520119BE082729D81B:4
   ...

6. LOCAL CLIENT MATCH & ACTION:
   SchoolFix identifies that our suffix appears in the list with count 295,389.
   The candidate password is rejected with HTTP 400 Bad Request.
```

### The Mathematics of Anonymity
- A 5-character hexadecimal prefix represents $16^5 = 1,048,576$ possible buckets.
- Across a database of over 1 billion breached passwords, every 5-character prefix maps to an anonymity set of roughly **500 to 1,000 completely unrelated passwords**.
- The external API and any network eavesdropper only learns that the user is selecting *one of a thousand possible passwords that happen to begin with `CBFDA`*. It is mathematically impossible for the external service to reconstruct which specific password was entered.

---

## 4. Empirical Rejection Evidence (`evidence/15-breach-check-rejection.png`)

In [`evidence/15-breach-check-rejection.png`](file:///c:/Users/DT001/Desktop/SchoolFix/task-04-server-security/evidence/15-breach-check-rejection.png), candidate parent `Emeka Okafor` attempted to register using `Password123!`.

1. The server computed the SHA-1 prefix `CBFDA` and queried the HIBP range endpoint.
2. The search returned suffix `C6008F9CAB4083784CBD1874F76618D2A97` with a count of **295,389**.
3. Registration was aborted at the server boundary with `HTTP 400 Bad Request`, displaying the red warning:
   > *"This password has appeared in 295,389 known public data breaches and cannot be used. Please choose a different, unique password."*
4. Zero user records were inserted into PostgreSQL, shielding the school from credential stuffing vulnerability before the account was ever created.
