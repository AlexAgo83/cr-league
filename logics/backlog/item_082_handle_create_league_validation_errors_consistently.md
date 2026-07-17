## item_082_handle_create_league_validation_errors_consistently - Handle create-league validation errors consistently
> From version: 0.3.5
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
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
