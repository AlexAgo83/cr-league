## item_091_document_prototype_localstorage_secret_boundary - Document prototype localStorage secret boundary
> From version: 0.3.5
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Security boundary
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- claimCode and recoveryCode are stored in localStorage as prototype convenience secrets.
- Without an explicit boundary, future agents may either overtrust them as secure auth or accidentally clear them with broad preference reset code.

# Scope
- In:
  - Add a short docs note or implementation closeout section explaining that localStorage claim/recovery codes are prototype-grade secrets.
  - State the upgrade path: server-side sessions or account auth before public multi-user security is required.
  - Ensure existing preference reset/forget flows do not clear claim/recovery data except through explicit profile/league forget actions.
  - Add or keep tests that durable profile/session/player claim keys survive UI preference reset.
- Out:
  - Moving secrets out of localStorage in this pass.
  - Encrypting localStorage values.
  - Building account management.

# Acceptance criteria
- AC1: The prototype security limitation is documented where future implementation agents will see it.
- AC2: Tests protect durable localStorage keys from accidental broad clearing.
- AC3: No new visible UI exposes claimCode or recoveryCode beyond existing profile/recovery flows.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: The prototype security limitation is documented where future implementation agents will see it.
- request-AC7 -> This backlog slice. Proof: AC2: Tests protect durable localStorage keys from accidental broad clearing.
- request-AC8 -> This backlog slice. Proof: AC3: No new visible UI exposes claimCode or recoveryCode beyond existing profile/recovery flows.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_014_api_surface_follow_up_hardening_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_043_api_surface_follow_up_hardening`
- Primary task(s): `task_044_orchestrate_api_surface_follow_up_hardening`

# AI Context
- Summary: Document prototype localStorage secret boundary
- Keywords: scaffolded-backlog, document prototype localstorage secret boundary, implementation-ready
- Use when: Implementing the scaffolded slice for Document prototype localStorage secret boundary.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
