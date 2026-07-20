## item_147_send_the_recovery_code_at_profile_creation - Send the recovery code at profile creation
> From version: 0.3.11
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 45%
> Complexity: Low
> Theme: Ship rails
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The plaintext code is shown exactly once at creation; a player who skips the onboarding panel has no recourse but admin support.

# Scope
- In:
  - Call the mailer from createProfile after the profile commits; a mail failure must not fail profile creation (log and continue).
  - Have the API response indicate whether a mail was sent so the web can adapt its copy.
  - Update the creation status and onboarding copy in EN and FR to mention the email when sent; keep the save-your-code panel as-is.
  - API tests: mail recorded on create in active mode, creation unchanged in no-op mode, creation survives a throwing mailer.
- Out:
  - Changing what the creation response returns beyond the sent flag.
  - Email verification of the address.

# Acceptance criteria
- AC1: Active mode sends the code to the profile email at creation; no-op mode changes nothing.
- AC2: A mailer failure never fails profile creation.
- AC3: Web copy reflects whether the email was sent, in both locales.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: Active mode sends the code to the profile email at creation; no-op mode changes nothing.
- request-AC5 -> This backlog slice. Proof: AC2: A mailer failure never fails profile creation.
- request-AC7 -> This backlog slice. Proof: AC3: Web copy reflects whether the email was sent, in both locales.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_025_email_backed_profile_recovery_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_061_email_backed_profile_recovery_send_codes_on_creation_and_self_service_re_issue`
- Primary task(s): `task_062_orchestrate_email_backed_profile_recovery`

# Implementation Notes
- Wave 1: `createProfile` calls the injected mailer after the profile exists, returns `recoveryEmailSent`, and keeps profile creation successful when the mailer is inactive or throws.
- Validation wave 1: `rtk npm run typecheck` passed; `rtk npm test -- apps/api/src/app.admin.test.ts` covers active, inactive, and failing mailers.

# AI Context
- Summary: Send the recovery code at profile creation
- Keywords: scaffolded-backlog, send the recovery code at profile creation, implementation-ready
- Use when: Implementing the scaffolded slice for Send the recovery code at profile creation.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
