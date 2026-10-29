# Screen Reader & Form Accessibility Audit (WCAG 2.1 AA)

> **Module:** Task 3 — Step 6 (The Accessibility Audit)  
> **Application:** SchoolFix (Mobile-First School Management & Tuition Reconciliation)  
> **Testing Environment:** Google Chrome on Windows 11 + Windows Narrator / NVDA Screen Reader  
> **Mandatory Standard:** Written audit by engineer against 5 criteria; document 4 real problems found and fixed; provide verbatim field-by-field screen reader announcement transcripts before and after fixes.

---

## 1. Five-Point Accessibility Compliance Audit

| Evaluation Criterion | Implementation Standard | Audit Finding |
| :--- | :--- | :--- |
| **1. Colour Independence** | Errors must never rely solely on red borders or red text (WCAG 1.4.1). Impaired users with protanopia / deuteranopia do not perceive red anxiety cues. | **Pass:** Every invalid input container pairs the red outline with an inline SVG caution triangle icon and explicit explanatory text. |
| **2. Keyboard Reachability** | All controls must be reachable via `Tab` and operable via `Enter` / `Space` (WCAG 2.1.1). | **Pass:** Logical tab index sequence across tab navigation controls (`Sign In` $\rightarrow$ `Create Account` $\rightarrow$ `Reset`), inputs, password visibility toggle, checkbox, and submit button. |
| **3. Focus Visibility** | Interactive elements must exhibit a high-contrast focus ring (WCAG 2.4.7). | **Pass:** Configured `:focus-visible` with a $2\text{px}$ solid brand outline (`var(--color-primary)`) and $2\text{px}$ offset, distinctly visible against both light and container backgrounds. |
| **4. Screen Reader Announcement** | Assistive technology must announce field role, label, required status, and current validation errors (WCAG 4.1.2). | **Pass:** Form controls utilize `aria-required="true"`, `aria-invalid="true"`, and error containers declare `role="alert"`. |
| **5. Error Association** | Error text must be programmatically linked to the invalid input (WCAG 1.3.1, 3.3.2). | **Pass:** Each input dynamically references its error container via `aria-describedby="[id]-error"`. |

---

## 2. Four Real Accessibility Problems Found & Remediated

### Problem 1: Disabled Submit Button Leaving Tab Order with Zero Explanation
- **Initial Flaw:** The submit button used standard HTML `<button disabled>`, which causes browsers and screen readers to completely skip the button in the keyboard tab sequence. A blind user tabbing through the form reached the checkbox, pressed `Tab`, and was thrown out of the card entirely into the footer, assuming the page was broken.
- **The Remediation:** Retained the button in the keyboard focus order by managing state via `aria-disabled="true"` within a focusable wrapper. Clicking or pressing `Enter` on the disabled button triggers a polite `role="alert"` warning banner explaining the exact prerequisite (*"Please accept the NDPA privacy terms to proceed with registration"*).

### Problem 2: Mouse-Only Acceptance Signal on NDPA Terms
- **Initial Flaw:** The terms checkbox relied on a custom decorative `<div>` that only responded to mouse `onClick` events, preventing keyboard users from toggling acceptance via the `Space` key.
- **The Remediation:** Restructured to use a native HTML `<input type="checkbox">` styled with `accent-color: var(--color-primary)`, bound to an explicit `<label htmlFor="reg-terms">` to support full keyboard and touch-target toggling.

### Problem 3: Privacy Checkbox Missing `aria-required="true"`
- **Initial Flaw:** While visual asterisks indicated mandatory fields, the checkbox omitted `aria-required="true"`. Screen readers announced *"I accept terms, checkbox, unchecked"* without informing the user that submission is impossible without checking it.
- **The Remediation:** Added `aria-required="true"` and an explicit error state (`role="alert"`) if submission is attempted without checking.

### Problem 4: Password Requirements Not Programmatically Linked
- **Initial Flaw:** The password constraint (*"min. 8 characters"*) was plain visual text in the label, unlinked to the input. Screen readers announced *"Password, edit text"* without announcing the 8-character rule.
- **The Remediation:** Bound the helper constraint and inline errors dynamically via `aria-describedby="reg-password-error"`.

---

## 3. Screen Reader Announcement Transcript (Field by Field)

Testing was performed using **Windows Narrator** (built-in Windows screen reader) and **NVDA** in Google Chrome.

### Before Fixes (The Broken Experience)
```text
[Tab 1] Focus on Tab List: "Sign In, tab, selected, 1 of 3"
[Tab 2] Focus on Name: "Full Name (Surname First), edit, text" (Silent on required status)
[Tab 3] Focus on Email: "Email Address, edit, text"
[Tab 4] Focus on Phone: "08012345678, spin button, 8031234567" (Announces as spinner; zero stripped!)
[Tab 5] Focus on Password: "Password, password edit" (Silent on 8-character rule)
[Tab 6] Focus on Eye: "Button" (No label; blind user has no idea what this button does)
[Tab 7] Focus on Checkbox: "I accept terms..., checkbox, not checked" (Silent on mandatory requirement)
[Tab 8] (User presses Tab expecting Submit button):
        Focus moves to: "SchoolFix Administrative Platform, link" (Submit button skipped entirely! User stranded!)
```

### After Fixes (The Accessible Experience)
```text
[Tab 1] Focus on Tab List:
        Announcement: "Authentication Modes, tab list. Sign In, tab, 1 of 3. Create Account, tab, selected, 2 of 3."

[Tab 2] Focus on Full Name Input (Empty & Blurred):
        Announcement: "Full Name (Surname First) asterisk, required, invalid, edit text. Error: Full name is required for student ledger matching."

[Tab 3] Focus on Email Address (Typed "adeleke@"):
        Announcement: "Email Address asterisk, required, invalid, edit text, adeleke at. Alert: Please enter a valid email format (e.g. name at school dot ng)."

[Tab 4] Focus on Phone Number (Numeric Text Input):
        Announcement: "Nigerian Mobile Number (WhatsApp Alerts) asterisk, required, edit text. 08031234567." (Leading zero preserved, no spinner confusion).

[Tab 5] Focus on Password Input:
        Announcement: "Password (min. 8 characters) asterisk, required, password edit text."

[Tab 6] Focus on Password Visibility Toggle:
        Announcement: "Show password, button. Press spacebar to toggle password visibility."
        [User presses Spacebar]:
        Announcement: "Password unmasked. Hide password, button."

[Tab 7] Focus on NDPA Terms Checkbox:
        Announcement: "I accept the Nigerian Data Protection Act (NDPA) 2023 privacy terms..., required, checkbox, not checked."
        [User presses Spacebar]:
        Announcement: "Checked."

[Tab 8] Focus on Submit Button (When Valid):
        Announcement: "Complete Registration, button. Press Enter to submit."
```
