## item_136_api_trust_boundary_and_atomicity_fixes - API trust-boundary and atomicity fixes
> From version: 0.3.11
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 15%
> Complexity: Medium
> Theme: API integrity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- createDemoLeague and joinLeagueByCode trust any existing profileId from the request body, so a leaked cuid lets a stranger attach teams to another player's account.
- restartLeague runs its destructive sequence outside a transaction; a mid-sequence failure leaves the league with no current Grand Prix and no recovery path.
- The admin token comparison leaks timing, localhost CORS origins ship to production, and GET /leagues/:leagueId hands the invite code to any reader.

# Scope
- In:
  - Require proof of profile ownership (profile-scoped secret derived from the existing recovery/claim material) on createDemoLeague and joinLeagueByCode; reject a bare profileId that is not accompanied by its proof.
  - Wrap the full restartLeague sequence in runWrite so it commits or rolls back atomically, preserving the memory-db test path.
  - Replace the admin token !== check with crypto.timingSafeEqual over equal-length buffers.
  - Only add localhost origins to the CORS set when the environment is not production.
  - Omit league.code from league state responses unless the caller is an authenticated member or owner.
  - Tests: foreign-profileId rejection, restart rollback on injected failure, code hidden from non-members, CORS set per environment.
- Out:
  - Full auth or session management.
  - Changing the invite-code format or join UX.
  - Reworking pass-4 ownership self-healing.

# Acceptance criteria
- AC1: A request with someone else's profileId and no ownership proof is rejected on demo-league creation and league join.
- AC2: An injected failure mid-restart leaves the league state exactly as before the call.
- AC3: The production CORS set contains only the configured web origin, and admin token checks are constant-time.
- AC4: Non-members never receive the league invite code in any response.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: A request with someone else's profileId and no ownership proof is rejected on demo-league creation and league join.
- request-AC3 -> This backlog slice. Proof: AC2: An injected failure mid-restart leaves the league state exactly as before the call.
- request-AC4 -> This backlog slice. Proof: AC3: The production CORS set contains only the configured web origin, and admin token checks are constant-time.
- request-AC9 -> This backlog slice. Proof: AC4: Non-members never receive the league invite code in any response.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_022_repo_review_remediation_pass_5_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_058_repo_review_remediation_pass_5_account_security_api_trust_boundaries_web_decomposition_and_ci_hardening`
- Primary task(s): `task_059_orchestrate_repo_review_remediation_pass_5`

# AI Context
- Summary: API trust-boundary and atomicity fixes
- Keywords: scaffolded-backlog, api trust-boundary and atomicity fixes, implementation-ready
- Use when: Implementing the scaffolded slice for API trust-boundary and atomicity fixes.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
