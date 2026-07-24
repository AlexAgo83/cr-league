## item_273_centralize_leagues_route_error_guard_404_handling_behind_one_helper - Centralize leagues route error/guard/404 handling behind one helper
> From version: 0.4.5
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100
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
- request-AC3 -> This backlog slice. Evidence needed: App.tsx delegates each screen concern to a focused child component with identical rendered output and behavior, and no single web component file remains an 800+ line grab-bag.
- request-AC4 -> This backlog slice. Evidence needed: Overall branch coverage rises meaningfully toward line coverage by covering previously-uncovered error and rule-violation branches, with no assertions weakened or tests skipped to inflate the number.
- request-AC6 -> This backlog slice. Evidence needed: The duplicated object-shape preamble in the leagues/routes.ts body guards is extracted into one shared helper used by all 14 guards, with their field checks and accepted/rejected inputs unchanged.
- request-AC7 -> This backlog slice. Evidence needed: The inlined per-view second-formatting (lap/best times and gaps) is centralized in one web helper, with rendered text byte-identical to today.

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

# Notes
- Delivered (commit 6f75d4f): one jsonRoute helper now runs the body guard (per-route 400 message preserved), maps null to 404, and catches LeagueRuleError; routes.ts dropped 510->404 lines with byte-identical responses (app.test.ts green).
- Task `task_116_orchestrate_repo_review_maintainability_follow_up` was finished via `logics-manager flow finish task` on 2026-07-24.

# Tasks
- `task_116_orchestrate_repo_review_maintainability_follow_up`
