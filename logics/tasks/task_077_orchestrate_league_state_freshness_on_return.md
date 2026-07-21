## task_077_orchestrate_league_state_freshness_on_return - Orchestrate league-state freshness on return
> From version: 0.3.26
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Trace the current rejoinClaim, saved-claim, and run error-handling flow before editing.
- [ ] 2. Add the smallest visibilitychange refresh hook that reuses the existing full-state fetch path.
- [ ] 3. Guard against hidden tabs, missing claims, admin inspection, and overlapping loading state.
- [ ] 4. Add focused tests for refresh, skip, and stale-claim behavior.
- [ ] 5. Run typecheck, lint, unit tests, build, and private-league e2e; record any follow-up needed for 0.6 realtime decisions.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_174_refresh_active_league_on_tab_return`

# Definition of Done (DoD)
- [ ] Generated request, product, backlog, and task docs are present.
- [ ] Context-pack handoff is available when requested.
- [ ] Validation passes.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.

# Validation
- Run `python3 -m logics_manager lint --require-status`.
- Run scaffold command tests.

# Report
- Implementation complete.

# AI Context
- Summary: Orchestrate league-state freshness on return
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_076_refresh_league_state_when_the_player_returns_to_the_tab`
- Product brief(s): `prod_040_league_state_freshness_on_return_product_brief`
- Architecture decision(s): (none yet)
