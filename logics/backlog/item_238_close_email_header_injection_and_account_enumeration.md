## item_238_close_email_header_injection_and_account_enumeration - Close email header injection and account enumeration
> From version: 0.4.1
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: API security
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Non-semantic edit: 2026-07-23 corpus grooming note added; no status/progress change.
> Semantic edit: 2026-07-23 clarified priority rationale during corpus-wide grooming.

# Problem
- normalizeEmail (utils.ts:78-87) only rejects literal spaces, so tabs/newlines pass through into nodemailer sendMail({to}) as a header-injection surface.
- POST /profiles (routes.ts:35) returns a distinct 'email already has a profile' error while recovery endpoints are constant-response, leaking which emails are registered — unauthenticated and unratelimited.

# Scope
- In:
  - Reject any control/whitespace character in normalizeEmail before it can reach the mail transport.
  - Return a neutral response from POST /profiles regardless of whether the email already exists, matching the recovery-endpoint pattern, without weakening the DB-level duplicate guard.
- Out:
  - Rewriting the profile/claim-code model.
  - Adding email verification flows.

# Acceptance criteria
- AC1: normalizeEmail rejects tabs/newlines/control chars so none reach the mail header.
- AC2: POST /profiles no longer reveals whether an email is registered.
- AC3: Legitimate onboarding still works and duplicate accounts are still prevented at the DB.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: normalizeEmail rejects tabs/newlines/control chars so none reach the mail header.
- request-AC8 -> This backlog slice. Proof: AC2: POST /profiles no longer reveals whether an email is registered.
- request-AC3 -> This backlog slice. Evidence needed: All localStorage access in apps/web goes through a safe wrapper; the app starts and operates without throwing when localStorage getItem/setItem throw (disabled or quota-exceeded), verified by a test that stubs a throwing storage.
- request-AC5 -> This backlog slice. Evidence needed: Unauthenticated write routes are IP rate-limited, and the admin profile/league list endpoints filter and paginate at the database level (where/skip/take) rather than loading whole tables into memory.
- request-AC6 -> This backlog slice. Evidence needed: Removing a league's owner human team no longer permanently 403s resolve/next-grand-prix/restart (ownerTeamId is reassigned or falls back to another human claim), and validateReplayTrace has negative tests asserting its specific error strings.
- request-AC7 -> This backlog slice. Evidence needed: Cosmetic replay-trace generation lives in its own module out of the simulation core, the dead normalizeRaceTraits/clampNumber exports are gone, and App.tsx's mutually-exclusive dialogs use a single activeModal state.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_062_review_findings_remediation_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_099_review_findings_remediation_replay_determinism_dead_card_effects_client_storage_safety_api_security_and_scale_admin_config_integrity_and_over_engineering_cleanup`
- Primary task(s): `task_100_orchestrate_review_findings_remediation`

# AI Context
- Summary: Close email header injection and account enumeration
- Keywords: scaffolded-backlog, close email header injection and account enumeration, implementation-ready
- Use when: Implementing the scaffolded slice for Close email header injection and account enumeration.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: These are unauthenticated security gaps that should close before broader beta exposure.

# Tasks
- `task_100_orchestrate_review_findings_remediation`

# Notes
- Task `task_100_orchestrate_review_findings_remediation` was finished via `logics-manager flow finish task` on 2026-07-23.
