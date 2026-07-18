## item_082_handle_create_league_validation_errors_consistently - Handle create-league validation errors consistently
> From version: 0.3.5
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: API error handling
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- /leagues directly calls createDemoLeague without catching LeagueRuleError.
- Invalid league name, invalid team name, or missing profile can bubble as 500 even though sibling routes map LeagueRuleError to a client-safe conflict.

# Scope
- In:
  - Wrap /leagues in the same try/catch pattern used by /profiles, /leagues/join, and other league routes.
  - Add tests for invalid league name, invalid team name, and unknown profileId.
  - Keep response format aligned with existing { error: 'Conflict', message } bodies unless a 400 is already clearly expected by tests.
- Out:
  - Refactoring all route error handling into a generic wrapper unless the diff is smaller than duplicating this one catch.
  - Changing createDemoLeague validation rules.

# Acceptance criteria
- AC1: Invalid create-league business inputs return client-safe 4xx responses, not 500.
- AC2: Successful league creation response is unchanged.

# AC Traceability
- request-AC5 -> This backlog slice. Proof: AC1: Invalid create-league business inputs return client-safe 4xx responses, not 500.
- request-AC8 -> This backlog slice. Proof: AC2: Successful league creation response is unchanged.
- request-AC3 -> This backlog slice. Evidence needed: Concurrent calls to resolve the same Grand Prix cannot apply points, credits, or card consumption more than once; a second resolver receives a conflict or returns the already-resolved state without duplicate rewards.
- request-AC4 -> This backlog slice. Evidence needed: Concurrent card purchases cannot reduce credits below zero, cannot lose an appended card update, and cannot buy when the pre-update balance is insufficient.
- request-AC6 -> This backlog slice. Evidence needed: League codes and claim codes are generated with crypto random bytes and collision retries that respect the existing unique database constraints.
- request-AC7 -> This backlog slice. Evidence needed: npm run typecheck, npm test, npm run build, npm run logics:validate, and npm run lint pass from a clean worktree.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_012_api_integrity_hardening_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_041_api_integrity_hardening_from_repo_review`
- Primary task(s): `task_042_orchestrate_api_integrity_hardening`

# AI Context
- Summary: Handle create-league validation errors consistently
- Keywords: scaffolded-backlog, handle create-league validation errors consistently, implementation-ready
- Use when: Implementing the scaffolded slice for Handle create-league validation errors consistently.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_042_orchestrate_api_integrity_hardening`

# Notes
- Task `task_042_orchestrate_api_integrity_hardening` was finished via `logics-manager flow finish task` on 2026-07-18.
