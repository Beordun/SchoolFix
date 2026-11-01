# SchoolFix: Teacher Onboarding Flow

*Frontend design notes · October 31, 2026*

## Recommendation

The admin should onboard teachers, but by sending an **invite**, not by sharing a password. Teachers should never self-register as teachers, and the admin should never know or choose their password.

## Why not open self-registration

- Anyone could sign up and claim to be a teacher. The `Role` enum defaults to `PARENT`, and a teacher can see and edit grades, so role assignment has to be controlled by the school.
- The admin has to link each teacher to a class arm anyway, so the admin is already doing the setup work.

## Why not "admin creates the account and shares the login"

- It breaks the audit trail. If the admin knows the password, any grade change could be blamed on the admin or the teacher.
- Passwords shared over WhatsApp stay in chat history, and people reuse them.
- It conflicts with the existing security design. Sessions are hashed and invalidated on reset, so a manually distributed credential undermines that work.

## Recommended flow: admin invites, teacher activates

1. The admin enters the teacher's name, phone or email, and assigned class arm(s). The role is fixed to `TEACHER` by the admin, not chosen by the teacher.
2. The system generates a **single-use invite link** that expires in 48 to 72 hours. Store only a hash of the token, like sessions.
3. The admin taps **Share via WhatsApp** (pre-filled message) or email. This fits the no-in-app-messaging rule and how Nigerian schools already communicate.
4. The teacher opens the link, confirms their name, **sets their own password**, and lands directly on their class attendance screen. This takes about 30 seconds and doubles as verification.
5. The admin's teacher list shows a status per teacher: *Invited*, *Active*, or *Expired*, with a **Resend invite** button.

## Practical fallback: one-time setup code

Some teachers have poor email access or struggle with links. Offer a **one-time setup code** shown to the admin (for example 6 digits, expires in 24 hours). The teacher enters it on `/auth` along with their phone or email and sets their own password. This is the "admin hands them a slip of paper" option, and it never exposes a long-term password.

## Parents

Parents can be handled similarly. Create parent accounts from the student import and send invites, or let them self-register but **link them to their child using the admission number plus a school-issued code**. This stops strangers from attaching themselves to a student and viewing their records.

## Schema implications

- **Email is currently required and unique** on `User`. If many teachers or parents only have phones, you'll need an optional email and a unique phone field, or invites that work by phone.
- Add an `Invitation` model with: `tokenHash`, `role`, `classArmIds`, `invitedBy`, `expiresAt`, `usedAt`.
- A **teacher-to-`ClassArm` assignment** table is needed. It was already missing from the schema, and the "assigned ClassArm" rule in section 6.2 of the PRD depends on it.
- Log invite creation and acceptance in the audit trail.

## Next steps

- Sketch the admin's "Invite teacher" screen.
- Sketch the teacher's activation screen.
