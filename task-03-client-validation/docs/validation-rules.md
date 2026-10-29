# Client-Side Validation Rules & Operational Derivations

> **Module:** Task 3 — The Form, Attacked from Both Sides  
> **Target Demographic:** Nigerian Private Primary and Secondary Schools  
> **Mandatory Standard:** Every rule must be derived for the business domain. For every rule, state: (1) What the rule is, (2) What goes wrong without it, and (3) What legitimate user it will wrongly block.

---

## 1. Full Name Validation Rule

### What the Rule Is
The full name field requires a minimum of two distinct words separated by a space, with each word consisting of at least 2 alphabetic characters (e.g., `Adeleke Folashade`). Maximum length is capped at 60 characters.

### What Goes Wrong Without It
Without this rule, automated web crawlers and malicious bots populate registration tables with single-token placeholders like `"a"`, `"test"`, `"admin"`, or `"User"`. In Nigerian private schools, parents and students are identified across paper ledgers, WAEC/NECO examination registers, and bank deposit tellers by their compound family name and given name. Single-token names make it impossible for the bursar to cross-reference offline bank transfer narrations (*"Paid for Adeleke"*) against the student roster, causing fees to sit in suspense accounts.

### What Legitimate User It Will Wrongly Block
**Cost to Legitimate Users:**  
This rule strictly blocks legitimate individuals who legally possess only **one single name (mononyms)**. While less common in southern Nigeria, mononymic naming traditions exist in certain northern Sahelian communities (e.g., individuals officially named simply *"Mamman"* or *"Balarabe"*). Furthermore, certain international expatriate teachers (e.g., Indonesian or Afghan nationals) have no legal surname. By enforcing a mandatory space and two words, these legitimate users are blocked at the frontend, forcing them to enter duplicate names (e.g., *"Mamman Mamman"*) or contact administrative support.

---

## 2. Nigerian Mobile Phone Number Validation Rule

### What the Rule Is
The phone number field requires exactly 11 numeric digits conforming strictly to Nigerian telecommunications numbering plans administered by the Nigerian Communications Commission (NCC), starting with valid network prefixes: `070`, `080`, `081`, `090`, or `091` (e.g., `08031234567`).

### What Goes Wrong Without It
In Nigeria, over 90% of urgent school communications (such as sudden student illness, emergency early dismissals, or impending tuition cutoff dates) are transmitted via automated WhatsApp notifications and SMS gateways. Without strict phone validation, parents enter malformed strings (e.g., 9-digit numbers missing prefixes or random keystrokes). When the emergency broadcast job fires, the third-party SMS/WhatsApp API (e.g., Termii) returns fatal delivery failures, racking up API rejection costs and leaving the school legally vulnerable if a child falls ill and the parent was unreachable.

### What Legitimate User It Will Wrongly Block
**Cost to Legitimate Users:**  
This rule strictly blocks **diaspora parents living abroad** whose children attend Nigerian boarding schools. A Nigerian parent working in the United Kingdom or United States paying tuition via international credit card will possess a UK (+44 7XXX) or US (+1 XXX) phone number. An 11-digit rule starting with `080/090` wrongly blocks them from registering, forcing them to purchase a local Nigerian SIM or register using a local relative's phone.

---

## 3. Real-Time vs. On-Submit Email Validation Rule

### What the Rule Is
- **On Registration:** The email field checks formatting in **real-time** as the user types (`name@domain.tld`), immediately flagging missing `@` symbols, missing Top-Level Domains (TLDs), or illegal whitespace.
- **On Login:** Email format checking is strictly deferred to **form submission**. No inline errors fire while typing existing credentials.

### What Goes Wrong Without It
- *On Registration:* If real-time format enforcement is omitted, a user rushing to complete enrollment may type `adeleke@gmail` (forgetting `.com`). Because ownership cannot be verified until an activation email is sent, an invalid syntax guarantees that the cryptographic verification token vanishes into the ether. The parent waits endlessly for a code that can never arrive.
- *On Login:* If real-time format checking is aggressively applied on login, a user typing their email experiences persistent red flashing borders and error messages (*"Invalid email"*) after typing their first character (`a`). This creates aggressive interface friction and user irritation.

### What Legitimate User It Will Wrongly Block
**Cost to Legitimate Users:**  
Strict regex email format checking blocks users with newly accredited internationalized domain names (IDNs) or esoteric Top-Level Domains (e.g., `.sch.ng`, `.academy`, or non-Latin Unicode scripts).

---

## 4. Why Checking Email "Existence" is Pointless

Applications check **syntax and format**, never existence, because:
1. **SMTP VRFY/RCPT Is Blocked:** Virtually all modern mail providers (Google Workspace, Microsoft 365, Yahoo) reject or spoof SMTP `VRFY` and `RCPT TO` commands to prevent spam harvesters from brute-forcing user directories. An application attempting to ping an SMTP server will receive false positives or have its IP blacklisted as a spam crawler.
2. **Format Does Not Equal Control:** Even if a mailbox physically exists on a server, that fact does not prove the person sitting at the browser is the legitimate owner of that mailbox. Cryptographic ownership can only be established asynchronously by generating a secure verification code and requiring the recipient to retrieve it.
