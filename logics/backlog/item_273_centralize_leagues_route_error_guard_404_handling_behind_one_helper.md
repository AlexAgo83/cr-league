## item_273_centralize_leagues_route_error_guard_404_handling_behind_one_helper - Centralize leagues route error/guard/404 handling behind one helper
> From version: 0.4.5
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Backend maintainability
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- ~15 handlers in leagues/routes.ts repeat the same try/catch (LeagueRuleError -> sendLeagueRuleError) / null->404 / 400-guard block.
- The repetition makes the file long and any change to error semantics an error-prone 15-site edit.
- The only per-route variation is the body guard, the store call, and the bad-request message.

# Scope
- In:
  - Add one route helper that runs the body guard (returning the route's specific 400 message on failure), calls the store function, maps null to 404, catches LeagueRuleError via sendLeagueRuleError, and re-throws anything else.
  - Rewrite each affected handler to use the helper, threading its specific bad-request message and success serializer (publicLeagueState vs withPlayer via stateForBody).
  - Confirm status codes and response bodies are byte-identical to today via the existing app tests.
- Out:
  - Changing any status code, response shape, or bad-request message text.
  - Touching admin routes, health, or simulation routes.
  - Adding validation libraries or new dependencies.

# Acceptance criteria
- AC1: All league write/read handlers go through the shared helper with per-route 400 messages preserved.
- AC2: No change to status codes or response bodies, proven by the existing app.test.ts suite.
- AC3: routes.ts is meaningfully shorter with no duplicated try/catch blocks remaining.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: All league write/read handlers go through the shared helper with per-route 400 messages preserved.
- request-AC5 -> This backlog slice. Proof: AC2: No change to status codes or response bodies, proven by the existing app.test.ts suite.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_067_repo_review_maintainability_follow_up_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_115_repo_review_maintainability_follow_up`
- Primary task(s): `task_116_orchestrate_repo_review_maintainability_follow_up`

# AI Context
- Summary: Centralize leagues route error/guard/404 handling behind one helper
- Keywords: scaffolded-backlog, centralize leagues route error/guard/404 handling behind one helper, implementation-ready
- Use when: Implementing the scaffolded slice for Centralize leagues route error/guard/404 handling behind one helper.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
