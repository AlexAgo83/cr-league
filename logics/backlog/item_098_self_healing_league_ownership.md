## item_098_self_healing_league_ownership - Self-healing league ownership
> From version: 0.3.6
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: League authority
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- A league whose ownerTeamId is null (backfill found no human team) or points at a deleted team returns 403 to every member on all admin endpoints.
- There is no recovery path, so such a league is permanently unadministrable.

# Scope
- In:
  - In requireAdminClaim, when ownerTeamId is null or the referenced team no longer exists in the league, resolve the earliest-created human team as the effective owner and persist it to league.ownerTeamId.
  - Keep the 403 for valid non-owner members unchanged.
  - Add API tests: null owner falls back to the earliest human team and persists; a dangling owner reference heals the same way; a non-owner still gets 403 after healing.
- Out:
  - Ownership transfer endpoints or UI.
  - Multi-admin or role support.

# Acceptance criteria
- AC1: A league with a null or dangling owner accepts the earliest human team's claim on admin endpoints and persists it as owner.
- AC2: Non-owner members still receive 403 after the fallback resolves.
- AC3: Tests cover both degraded-owner cases.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: A league with a null or dangling owner accepts the earliest human team's claim on admin endpoints and persists it as owner.
- request-AC8 -> This backlog slice. Proof: AC2: Non-owner members still receive 403 after the fallback resolves.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_016_repo_review_remediation_pass_4_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_045_repo_review_remediation_pass_4_ownership_resilience_race_window_closure_and_replay_polish`
- Primary task(s): `task_046_orchestrate_repo_review_remediation_pass_4`

# AI Context
- Summary: Self-healing league ownership
- Keywords: scaffolded-backlog, self-healing league ownership, implementation-ready
- Use when: Implementing the scaffolded slice for Self-healing league ownership.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
