## item_148_self_service_recovery_code_re_issue_by_email - Self-service recovery-code re-issue by email
> From version: 0.3.11
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 45%
> Complexity: Medium
> Theme: Ship rails
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Only the hash is stored, so a lost code cannot be re-sent, and the only recovery today is the admin console reset.
- A naive re-issue endpoint would allow account enumeration and let an attacker rotate a victim's working code at will.

# Scope
- In:
  - Add a POST endpoint accepting only an email: when a profile exists, generate a fresh code with the item_135 generator, store its hash, stamp the new recoveryEmailSentAt cooldown field, and email the code; always return the same neutral 200 body regardless of profile existence, cooldown, or send outcome.
  - Apply the item_135 rate limiter per normalized email and per IP; enforce a per-profile cooldown via the new nullable timestamp (single additive Prisma migration).
  - Extend the web recover flow with the request-by-email path and neutral success copy in EN and FR.
  - API tests: rotation invalidates the old code, unknown email gets the identical response, rate limit returns 429, cooldown suppresses re-send without changing the response body.
  - Document the endpoint and Gmail operational notes in docs/runtime-configuration.md.
- Out:
  - Tokens or links in the email (code-only flow).
  - Admin-console changes; the existing reset stays.

# Acceptance criteria
- AC1: A player can obtain a fresh working code by email with no admin involvement, and the previous code stops working.
- AC2: Responses are indistinguishable between existing and unknown emails, including under cooldown.
- AC3: Rate limit and cooldown protect against enumeration and hostile rotation, with tests.
- AC4: The runbook documents the shipped flow.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: A player can obtain a fresh working code by email with no admin involvement, and the previous code stops working.
- request-AC4 -> This backlog slice. Proof: AC2: Responses are indistinguishable between existing and unknown emails, including under cooldown.
- request-AC5 -> This backlog slice. Proof: AC3: Rate limit and cooldown protect against enumeration and hostile rotation, with tests.
- request-AC6 -> This backlog slice. Proof: AC4: The runbook documents the shipped flow.
- request-AC7 -> This backlog slice. Proof: AC4: The runbook documents the shipped flow.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_025_email_backed_profile_recovery_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_061_email_backed_profile_recovery_send_codes_on_creation_and_self_service_re_issue`
- Primary task(s): `task_062_orchestrate_email_backed_profile_recovery`

# Implementation Notes
- Wave 1: added `Profile.recoveryEmailSentAt`, `POST /profiles/recovery-code`, neutral success response for known/unknown/cooldown/send-failure cases, and reuse of the existing recovery limiter for email/IP throttling.
- Wave 1: the re-issue path rotates the stored hash only after an active mailer accepts the new code, avoiding no-SMTP lockout in local/no-op mode.
- Validation wave 1: `rtk npm run typecheck` passed; `rtk npm test -- apps/api/src/app.admin.test.ts` covers rotation, neutral unknown response, limiter, and cooldown.

# AI Context
- Summary: Self-service recovery-code re-issue by email
- Keywords: scaffolded-backlog, self-service recovery-code re-issue by email, implementation-ready
- Use when: Implementing the scaffolded slice for Self-service recovery-code re-issue by email.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
