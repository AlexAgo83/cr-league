## task_077_orchestrate_league_state_freshness_on_return - Orchestrate league-state freshness on return
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the league-state freshness request chain and keep sibling implementation slices linked.
- Implementation reuses the existing `/leagues/rejoin` path and stale-claim handling while preserving local view/replay state during silent tab-return refresh.

# Plan
- [x] 1. Trace the current rejoinClaim, saved-claim, and run error-handling flow before editing.
- [x] 2. Add the smallest visibilitychange refresh hook that reuses the existing full-state fetch path.
- [x] 3. Guard against hidden tabs, missing claims, admin inspection, and overlapping loading state.
- [x] 4. Add focused tests for refresh, skip, and stale-claim behavior.
- [x] 5. Run typecheck, lint, unit tests, build, and private-league e2e; record any follow-up needed for 0.6 realtime decisions.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; user requested regular commits for delivered subjects.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_174_refresh_active_league_on_tab_return`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `GameApp` listens for `visibilitychange` and calls `rejoinClaim` once when the active tab becomes visible with an active claim.
- request-AC2 -> This task. Proof: the handler skips hidden tabs, missing active league/player claims, admin inspection, loading state, and in-flight tab refreshes.
- request-AC3 -> This task. Proof: refresh uses `{ setDrive: false, notify: false, preserveLocalState: true }` so it applies `LeagueState` without forcing Drive or closing local replay/report state.
- request-AC4 -> This task. Proof: stale 404 refresh errors still route through `run` and `forgetClaim`, clearing only the invalid active claim.
- request-AC5 -> This task. Proof: focused App tests cover visible refresh, skip states, and stale-claim clearing; full gates pass.

# Validation
- `npm run typecheck` passed.
- `npx vitest run apps/web/src/app/App.test.tsx` passed: 31 tests.
- `npm run lint` passed.
- `npm run test` passed: 24 passed, 1 skipped; 225 passed, 4 skipped.
- `npm run build` passed; the existing Vite >500 kB chunk warning remains from the main bundle.
- `npm run test:e2e` passed: 4 Playwright tests.
- `npm run logics:validate` passed after workflow closeout; remaining warnings are unrelated open-doc Mermaid/traceability warnings.
- Finish workflow executed on 2026-07-21.
- Linked backlog/request close verification passed.

# Report
- Added a silent active-league tab-return refresh in `GameApp`.
- Extended `run`/`rejoinClaim` with a local-state-preserving path used only by silent refresh.
- No polling, realtime transport, API contract, or navigation redesign was added.
- Finished on 2026-07-21.
- Linked backlog item(s): `item_174_refresh_active_league_on_tab_return`
- Related request(s): `req_076_refresh_league_state_when_the_player_returns_to_the_tab`

# AI Context
- Summary: Orchestrate league-state freshness on return
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_076_refresh_league_state_when_the_player_returns_to_the_tab`
- Product brief(s): `prod_040_league_state_freshness_on_return_product_brief`
- Architecture decision(s): (none yet)
