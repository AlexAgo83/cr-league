## item_174_refresh_active_league_on_tab_return - Refresh active league on tab return
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Low
> Theme: State freshness
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Players can leave CR League open while another participant submits a plan or a GP is resolved.
- When the player returns, the tab may continue showing the old league state until they perform a local action.
- A lightweight visibility refresh should solve this without realtime infrastructure.

# Scope
- In:
  - Add a visibilitychange handler around the existing active league/player claim state.
  - Reuse /leagues/rejoin or the smallest existing API path that returns a full LeagueState for the current player.
  - Prevent overlapping refreshes and skip refreshes during active loading/mutation work.
  - Apply refreshed LeagueState silently and preserve the current selected view unless the claim is stale.
  - Add focused unit coverage for the visibility handler behavior.
- Out:
  - Polling or timed refresh intervals.
  - SSE, websocket, push notification, or service worker support.
  - Refreshing admin console data or saved league lists.
  - Changing copy unless an existing status/error label already fits.

# Acceptance criteria
- AC1: Returning to a visible tab refreshes the active league exactly once per visibility event.
- AC2: Hidden/no-active-claim/loading states do not trigger a request.
- AC3: Successful refresh is silent and keeps the current view stable.
- AC4: Stale claim errors clear the invalid saved claim through existing behavior.
- AC5: Tests and build gates pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: visible-tab `visibilitychange` calls the existing rejoin path for the active saved claim.
- request-AC2 -> This backlog slice. Proof: tests cover hidden, no-claim, and loading skip states; handler also skips admin inspection and in-flight tab refreshes.
- request-AC3 -> This backlog slice. Proof: successful refresh uses `preserveLocalState` and a test verifies the Garage view remains open.
- request-AC4 -> This backlog slice. Proof: stale 404 still clears the invalid active claim through `run`/`forgetClaim`.
- request-AC5 -> This backlog slice. Proof: focused App tests plus typecheck, lint, full tests, build, and e2e passed.

# Notes
- No polling, SSE, websocket, service worker, or API contract change was added.
- Task `task_077_orchestrate_league_state_freshness_on_return` owns closeout validation.
- Task `task_077_orchestrate_league_state_freshness_on_return` was finished via `logics-manager flow finish task` on 2026-07-21.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_040_league_state_freshness_on_return_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_076_refresh_league_state_when_the_player_returns_to_the_tab`
- Primary task(s): `task_077_orchestrate_league_state_freshness_on_return`

# AI Context
- Summary: Refresh active league on tab return
- Keywords: scaffolded-backlog, refresh active league on tab return, implementation-ready
- Use when: Implementing the scaffolded slice for Refresh active league on tab return.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
