## item_208_remove_public_admin_eligibility_lookup - Remove public admin eligibility lookup
> From version: 0.3.27
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: API privacy
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- GET /profiles/:profileId/admin-status returns whether a profile email is configured as admin from a profile id alone.
- The endpoint is not needed for first-login correctness because /profiles and /profiles/recover already return the admin flag after profile proof.
- The current API test suite asserts this public lookup, so the unsafe contract is locked in by tests.

# Scope
- In:
  - Delete GET /profiles/:profileId/admin-status from apps/api/src/features/leagues/routes.ts, or replace it with a proof-required POST only if a live client need is proven.
  - Remove refreshProfileAdminStatus and its startup call path from apps/web/src/app/sessionActions.ts/App.tsx if the endpoint is deleted.
  - Update app.admin.test.ts to assert that admin eligibility is not exposed by profile id alone.
  - Add or update web profile tests to prove create/recover sessions preserve admin: true and the admin console remains reachable for an admin profile.
- Out:
  - Introducing server-side sessions, JWTs, OAuth, CSRF, or cookies.
  - Changing the admin token requirement on /admin/* endpoints.
  - Changing the profile recovery code format.

# Acceptance criteria
- AC1: No public route returns admin eligibility from only profileId.
- AC2: /profiles and /profiles/recover still include admin: true for configured admin emails.
- AC3: The web client starts without calling admin-status and keeps admin access from a recovered session.
- AC4: API and web tests cover the new privacy contract.

# Implementation proof
- Removed GET /profiles/:profileId/admin-status from apps/api/src/features/leagues/routes.ts.
- Updated apps/api/src/app.admin.test.ts so a bare profile-id admin-status lookup returns 404 while profile creation still returns admin: true after proof.
- Removed refreshProfileAdminStatus and its App.tsx startup effect.
- Updated apps/web/src/app/App.profile.test.tsx so a stored admin session keeps admin access without any admin-status fetch.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: removed the public route and added the 404 API regression.
- request-AC2 -> This backlog slice. Proof: create/recover tests still cover admin: true for configured admin emails.
- request-AC3 -> This backlog slice. Proof: removed the client refresh and added the no-fetch stored-admin web regression.
- request-AC5 -> This backlog slice. Proof: targeted API and web profile/admin tests passed.
- request-AC4 -> This backlog slice. Evidence needed: The build warning is either materially reduced by lazy-loading heavy circuit route data, or a measured follow-up note records why the remaining entry chunk is acceptable and what exact import still dominates it.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_056_admin_privacy_and_entry_payload_hardening_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_092_admin_status_privacy_and_entry_bundle_hardening`
- Primary task(s): `task_093_orchestrate_admin_privacy_and_entry_payload_hardening`

# AI Context
- Summary: Remove public admin eligibility lookup
- Keywords: scaffolded-backlog, remove public admin eligibility lookup, implementation-ready
- Use when: Implementing the scaffolded slice for Remove public admin eligibility lookup.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_093_orchestrate_admin_privacy_and_entry_payload_hardening`

# Notes
- Task `task_093_orchestrate_admin_privacy_and_entry_payload_hardening` was finished via `logics-manager flow finish task` on 2026-07-22.
