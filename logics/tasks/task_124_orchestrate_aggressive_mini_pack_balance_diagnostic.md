## task_124_orchestrate_aggressive_mini_pack_balance_diagnostic - Orchestrate aggressive mini-pack balance diagnostic
> From version: 0.4.6
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 45%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Run or extend existing diagnostics to group replayability output by approach, preparation, pit strategy, card, and profile.
- [ ] 2. Run a larger deterministic sample and compare grouped results against the latest baseline report.
- [ ] 3. Decide whether aggressive mini-pack concentration is confirmed, inconclusive, or acceptable.
- [ ] 4. If confirmed, make the smallest scoped balance change and cover it with focused tests or balance gate evidence.
- [ ] 5. Re-run typecheck, test, lint, build, playtest:replayability, and logics:validate; record before/after metrics in closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_306_group_replayability_and_balance_diagnostics_by_strategy_axes`
- `item_307_apply_minimal_balance_tuning_only_if_diagnostics_confirm_skew`

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
- Wave 1: added `npm run playtest:browser:fun` to aggregate real browser-agent fun/frustration across multiple profiles.
- Wave 1 finding: the fun score rewarded negative `positionDelta` events; corrected it to reward positive events plus grid-to-finish comebacks. Same 4-profile/2-GP browser sweep now has no `Fun <= 4` rounds: sprinter 5.5, rain-reader 9.5, banker 5.0, closer 7.5 average fun.
- Next: continue grouped replayability diagnostics for aggressive/mini-pack concentration before any balance retune.

# AI Context
- Summary: Orchestrate aggressive mini-pack balance diagnostic
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_123_aggressive_mini_pack_balance_diagnostic_verify_and_correct_win_concentration_without_blind_nerfs`
- Product brief(s): `prod_075_aggressive_mini_pack_balance_diagnostic_product_brief`
- Architecture decision(s): (none yet)
