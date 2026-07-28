## item_343_rate_limit_all_admin_routes - Rate-limit all admin routes
> From version: 0.6.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: API hardening
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Every route under /admin in apps/api/src/features/admin/routes.ts has no rate limiting, unlike league write routes which already use a WRITE_RATE_LIMIT hook (30/min, defined in apps/api/src/features/leagues/routes.ts). Admin token comparison is already timing-safe (constant-time compare with a dummy call on mismatch), but nothing throttles repeated Authorization-header guesses against it.

# Scope
- In:
  - Apply a rate-limit hook consistently across every route registered in apps/api/src/features/admin/routes.ts — reuse the existing WRITE_RATE_LIMIT constant/pattern from the leagues feature, or define an equivalent (optionally stricter, since these are admin-privileged routes) constant local to the admin feature.
  - Verify the rate limit applies to both read (GET /admin/users, /admin/leagues, etc.) and write (POST /admin/test-data-cleanup, etc.) admin routes, not just the write ones.
  - Add or update a test asserting that repeated requests to an admin route past the configured limit are rejected (mirroring however the existing league-route rate-limit behavior is already tested, if it is).
- Out:
  - Changing the admin authentication/token model itself.
  - Adding rate limiting to any non-admin route — those are already covered or out of scope.

# Acceptance criteria
- AC1: Every route in apps/api/src/features/admin/routes.ts has a rate-limit hook applied.
- AC2: A test proves that exceeding the configured limit on at least one admin route is rejected.
- AC3: The full test suite passes with no behavior change to normal (under-limit) admin usage.

# AC Traceability
- request-AC9 -> This backlog slice. Proof: AC1: Every route in apps/api/src/features/admin/routes.ts has a rate-limit hook applied.
- request-AC13 -> This backlog slice. Proof: AC2: A test proves that exceeding the configured limit on at least one admin route is rejected.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_082_repo_review_remediation_pass_7_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_130_repo_review_remediation_pass_7_db_indexes_test_fake_drift_0_6_e2e_coverage_code_organization_and_admin_session_hardening`
- Primary task(s): `task_131_orchestrate_repo_review_remediation_pass_7`

# AI Context
- Summary: Rate-limit all admin routes
- Keywords: scaffolded-backlog, rate-limit all admin routes, implementation-ready
- Use when: Implementing the scaffolded slice for Rate-limit all admin routes.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
