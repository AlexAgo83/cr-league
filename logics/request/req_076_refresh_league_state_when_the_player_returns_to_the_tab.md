## req_076_refresh_league_state_when_the_player_returns_to_the_tab - Refresh league state when the player returns to the tab
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Complexity: Low
> Theme: Hosted beta responsiveness
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Refresh the active league state when a player returns to an already-open browser tab so opponent submissions and resolved GP state do not remain stale.
- Use a simple visibilitychange/focus-style refetch, not polling, SSE, websockets, or background sync.
- Keep the refresh silent unless it fails in a way that invalidates the saved claim or requires user action.
- Preserve current local navigation, replay/report state, and modal behavior while the refreshed state is applied.

# Context
- The current product is moving from the 0.3 playtest loop into the 0.4 beta-readiness line.
- Private leagues are asynchronous: another player or admin action can change the league while a tab is hidden.
- The app already stores profile/team claims locally and can rejoin a league through /leagues/rejoin.
- Polling and live subscriptions are intentionally deferred until beta evidence proves they are needed.

# Acceptance criteria
- AC1: When document.visibilityState changes back to visible and an active player claim exists, the app refreshes the current LeagueState once without polling.
- AC2: The refresh is skipped when no league/player claim is active, while an existing request is already loading, or when the tab is still hidden.
- AC3: Successful refresh updates league state without forcing the player back to the drive view, clearing non-conflicting local plan form state, or showing a noisy notification.
- AC4: Stale/expired claims still use the existing stale-claim handling path and remove only the invalid claim.
- AC5: Unit tests cover visible-tab refresh, hidden/no-claim skip, and stale-claim handling; build, typecheck, lint, and private-league e2e pass.

# AC Traceability
- AC1 -> `item_174_refresh_active_league_on_tab_return`. Proof: `GameApp` refreshes active saved claims through `/leagues/rejoin` on visible `visibilitychange`.
- AC2 -> `item_174_refresh_active_league_on_tab_return`. Proof: tests cover hidden/no-claim/loading skip states; code also skips admin inspection and in-flight refreshes.
- AC3 -> `item_174_refresh_active_league_on_tab_return`. Proof: silent refresh uses `setDrive: false`, `notify: false`, and `preserveLocalState: true`; focused test keeps Garage open after refresh.
- AC4 -> `item_174_refresh_active_league_on_tab_return`. Proof: stale 404 refresh errors still flow through `run` and `forgetClaim`, clearing only the invalid active claim.
- AC5 -> `item_174_refresh_active_league_on_tab_return`. Proof: focused App tests, typecheck, lint, full tests, build, e2e, and Logics validation passed.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_040_league_state_freshness_on_return_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- apps/web/src/app/App.tsx
- apps/web/src/app/sessionActions.ts
- apps/web/src/app/appStorage.ts
- apps/web/src/app/types.ts
- apps/web/src/app/App.test.tsx
- tests/e2e/private-league.spec.ts
- Current diagnostic: GameApp automatically rejoins the saved league once on initial mount, and explicit actions refresh league state after mutations.
- Current diagnostic: the web app currently has no visibilitychange/focus refresh hook for returning to a previously open league tab.
- Current diagnostic: rejoinClaim already knows how to fetch a LeagueState from a saved teamId/claimCode pair and handle stale claims through the existing run/isStaleLeagueError path.

# AI Context
- Summary: Refresh league state when the player returns to the tab
- Keywords: request-chain-scaffold, refresh league state when the player returns to the tab, development-ready
- Use when: You need to implement or review the scaffolded workflow for Refresh league state when the player returns to the tab.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_174_refresh_active_league_on_tab_return`
