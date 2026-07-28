## item_340_move_standings_rival_derivation_logic_into_packages_shared - Move standings/rival-derivation logic into packages/shared
> From version: 0.6.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Code organization
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- seasonStandings and derivedRivalForTeam (apps/web/src/app/helpers.ts:129 and :179) are pure domain logic (standings ranking with tie-breaks, rival distance derivation) that takes plain data in and returns plain data out, with no UI/React dependency — yet they live in the web app instead of packages/shared, so the API cannot reuse them (e.g. for a future server-side rival hint or notification).
- Two unrelated 'rival' concepts coexist in this codebase without any cross-reference: the explicit, user-chosen RaceDecision.rivalTeamId (prisma/schema.prisma, apps/api/src/features/leagues/decisions.ts) versus the auto-computed standings-proximity rival in derivedRivalForTeam. Sharing the bare word 'rival' with no comment linking them risks confusing a future contributor into thinking they're the same mechanism.

# Scope
- In:
  - Move seasonStandings and derivedRivalForTeam (and any tightly-coupled helper functions they depend on) from apps/web/src/app/helpers.ts into packages/shared, in a new file (e.g. packages/shared/src/domain/standings.ts) or as an addition to the existing packages/shared/src/domain/league.ts — follow this repo's existing packages/shared file-organization convention.
  - Re-export the moved functions from apps/web/src/app/helpers.ts so every existing web-app import path keeps working with no call-site changes required.
  - Rename the derived-rival function/variable naming to something distinct from the explicit rivalTeamId concept (e.g. standingsRival / impliedRival), updating every call site.
  - Add a short code comment at both the explicit RaceDecision.rivalTeamId definition and the new derived-rival function explaining the other exists and how they differ, so a reader landing on either one understands there are two separate mechanisms.
- Out:
  - Changing the actual standings/rival-derivation algorithm or its output — this is a pure code-movement and renaming slice, not a behavior change.
  - Building any new API endpoint that exposes the now-shared logic to the server side — only make it reusable, do not add a new consumer.
  - Touching the RaceDecision.rivalTeamId schema or its own logic beyond adding the cross-referencing comment.

# Acceptance criteria
- AC1: seasonStandings and derivedRivalForTeam (under their new name) live in packages/shared and are re-exported from apps/web/src/app/helpers.ts.
- AC2: The derived-rival concept has a name distinct from rivalTeamId, and both the explicit and derived rival code have a comment cross-referencing the other.
- AC3: No behavior change — every existing test (unit, e2e) passes unmodified in outcome, only import paths and naming change where required.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: seasonStandings and derivedRivalForTeam (under their new name) live in packages/shared and are re-exported from apps/web/src/app/helpers.ts.
- request-AC13 -> This backlog slice. Proof: AC2: The derived-rival concept has a name distinct from rivalTeamId, and both the explicit and derived rival code have a comment cross-referencing the other.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_082_repo_review_remediation_pass_7_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_130_repo_review_remediation_pass_7_db_indexes_test_fake_drift_0_6_e2e_coverage_code_organization_and_admin_session_hardening`
- Primary task(s): `task_131_orchestrate_repo_review_remediation_pass_7`

# AI Context
- Summary: Move standings/rival-derivation logic into packages/shared
- Keywords: scaffolded-backlog, move standings/rival-derivation logic into packages/shared, implementation-ready
- Use when: Implementing the scaffolded slice for Move standings/rival-derivation logic into packages/shared.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
