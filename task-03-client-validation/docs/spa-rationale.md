# Architectural Rationale: Single-Page Authentication vs. Multi-Page Architecture

> **Module:** Task 3 — The Form, Attacked from Both Sides  
> **Application:** SchoolFix (Mobile-First School Management & Tuition Reconciliation)  
> **Target Demographic:** Nigerian Private Primary and Secondary Schools (Parents, Teachers, Bursars)

---

## 1. Why Instant Form Switching Matters for Nigerian Schools

In Nigeria, over 80% of parents and primary school teachers access school administration platforms from sub-$100 Android smartphones (Tecno, Infinix, Itel) running on metered 3G and congested 4G prepaid cellular connections (MTN, Airtel, Glo).

On metered connections, data is purchased in small daily bundles (e.g., 100MB or 500MB). A traditional multi-page architecture forces a round-trip network request for every navigation event between `/login`, `/register`, and `/reset-password`. Over fluctuating cellular towers with round-trip times (RTT) exceeding 400ms:
1. **Network Friction:** Switching between "Sign In" and "Create Account" takes 1.2 to 2.8 seconds, frequently stalling out entirely if the cellular carrier experiences temporary packet loss or signal fade.
2. **Bandwidth Waste:** Each multi-page transition re-downloads document HTML, font files, and CSS stylesheets, burning 150KB–400KB of paid cellular data before a single field is submitted.
3. **Draft Retention & Re-Entry Frustration:** Parents frequently begin typing their email address into the Login form, realize they have not yet registered their student profile, and click "Create Account". In a multi-page setup, the browser unloads the document, wiping the typed input and forcing the parent to re-enter their information.

By collapsing authentication into a single-page state machine (`/auth?mode=login|register|reset`), tab switching executes in **0 milliseconds** directly on the device with **0 bytes transferred over the network** (`evidence/04-form-switch-logs.txt`). Furthermore, shared component state (`AuthCard.tsx`) preserves the parent's email address across tabs, providing a frictionless transition between signing in, registering, and requesting recovery codes.

---

## 2. What the User Experience Was Before (The Multi-Page Failure Mode)

Before the SPA consolidation, the application served separate routes: `/login`, `/register`, and `/reset-password` (`evidence/01-page-count-before.txt`).

During usability testing on a simulated 3G connection (400ms RTT, 750 kbps throughput):
- **White Flash & Layout Shifts:** Clicking "Forgot Password?" from the login screen caused the browser viewport to blank out while negotiating DNS and TLS handshake for the new document.
- **Cognitive Disorientation:** Parents on cracked mobile screens or in outdoor sunlight experienced disorientation, unsure whether the browser had crashed or was still loading.
- **Abandonment on Drop-Off:** If network connectivity dropped for two seconds during document fetch, the browser rendered an unstyled browser error page ("No Internet Connection"), losing all context.

With the unified `/auth` architecture, the entire authentication shell loads once. Switching modes toggles local React view state, instantly re-rendering only the inner card inputs while updating the browser address bar via `window.history.pushState` (`evidence/03-url-states.png`).

---

## 3. When Separate Pages Would Be the Better Choice (The Architectural Trade-Off)

Single-Page Architecture is an intentional engineering compromise, not a universal dogma. A student who cannot name when separate pages are superior has memorized a design pattern rather than understood a trade-off.

Separate, isolated physical pages (`/login`, `/register`, `/reset-password`) are the superior architectural choice in the following concrete scenarios:

### 1. Enterprise SSO & Federated Identity Protocols (SAML 2.0 / OIDC)
If SchoolFix were selling to large multi-campus educational trusts or universities utilizing enterprise identity providers (e.g., Microsoft Entra ID / Okta / Google Workspace for Education), authentication relies on full HTTP 302 browser redirects to identity provider assertion consumer endpoints. In federated SAML flows, holding all three views in a single client-side React component provides zero value, as identity handoffs inherently force external document navigation.

### 2. Low-End Device Memory & Initial JavaScript Parse Cost
An SPA auth bundle bundles the JavaScript for all three forms into one payload (`app/auth/AuthCard.tsx`). While modern code-splitting mitigates this, very low-end Android Go smartphones with 1GB RAM suffer when loading monolithic client components. A lightweight, server-rendered multi-page architecture using zero client-side JavaScript (pure HTML form `POST` actions) would achieve faster Initial Server Response and lower memory consumption on ultra-constrained hardware.

### 3. Screen Reader Focus Management & Accessibility Predictability
In a multi-page setup, the browser handles document reload, reading the new page title and automatically resetting the virtual accessibility cursor to the top `<h1>` element. In a client-side SPA state machine, switching tabs without explicit programmatic focus management (`element.focus()`, `aria-live="polite"`, `role="tabpanel"`) leaves blind users using screen readers (such as TalkBack or NVDA) stranded in the tab list, unaware that the underlying inputs have dynamically replaced the previous form.

### 4. Granular Web Analytics & Marketing Attribution
Marketing teams running paid ad campaigns for student enrollment rely on deterministic URL landing pages to track conversion drop-offs. While query parameters can be tracked, traditional server-side marketing analytics, server access logs, and content delivery networks (CDNs) cache and analyze discrete route paths far more reliably than client-mutated query states.
