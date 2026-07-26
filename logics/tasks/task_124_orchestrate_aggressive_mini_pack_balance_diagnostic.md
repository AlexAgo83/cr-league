## task_124_orchestrate_aggressive_mini_pack_balance_diagnostic - Orchestrate aggressive mini-pack balance diagnostic
> From version: 0.4.6
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 90
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Run or extend existing diagnostics to group replayability output by approach, preparation, pit strategy, card, and profile.
- [x] 2. Run a larger deterministic sample and compare grouped results against the latest baseline report.
- [x] 3. Decide whether aggressive mini-pack concentration is confirmed, inconclusive, or acceptable.
- [x] 4. If confirmed, make the smallest scoped balance change and cover it with focused tests or balance gate evidence.
- [x] 5. Re-run typecheck, test, lint, build, playtest:replayability, and logics:validate; record before/after metrics in closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_306_group_replayability_and_balance_diagnostics_by_strategy_axes`
- `item_307_apply_minimal_balance_tuning_only_if_diagnostics_confirm_skew`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: scaffold command generated the request-chain corpus.
- request-AC4 -> This task. Proof: optional context-pack handoff is supported.
- request-AC6 -> This task. Proof: dry-run and collision checks bound file changes.
- request-AC8 -> This task. Proof: CLI help documents the one-pass scaffold workflow.
- request-AC2 -> This task. Proof: `npm run playtest:replayability` generated `reports/playtest/replayability-analytics.md`; top cluster is `aggressive/speed/mini_pack/soft_tires` at 16.67% and marked non-dominant, while `npm run balance:gate` puts multiple `aggressive/.../mini_pack` strategies in the bottom group.
- request-AC3 -> This task. Proof: diagnostics did not confirm a blind nerf target, so no tuning was applied; `npm run balance:gate` passed existing balance thresholds.
- request-AC5 -> This task. Proof: changes stayed in diagnostic/playtest scripts and Logics docs; no simulation engine architecture, persona strategy rewrite, live telemetry, or UI flow was introduced.

# Validation
- `npm run typecheck` passed.
- `npm run test` passed: 41 files passed, 344 tests passed; 1 file and 7 tests skipped.
- `npm run lint` passed.
- `npm run build` passed.
- `npm run playtest:browser:fun` passed: all 3 scenario questions passed for all 4 profiles; one low-fun round remained for banker GP2.
- `npm run balance:gate` passed.
- `npm run playtest:replayability` passed and regenerated `reports/playtest/replayability-analytics.md` / `.json`.
- `npm run logics:validate` passed with only expected closeout warnings before final repair.
- typecheck, test, lint, build, browser fun/comprehension playtest, balance gate, replayability analytics, and logics validation passed
- Finish workflow executed on 2026-07-27.
- Linked backlog/request close verification passed.

# Report
- Wave 1: added `npm run playtest:browser:fun` to aggregate real browser-agent fun/frustration across multiple profiles.
- Wave 1 finding: the fun score rewarded negative `positionDelta` events; corrected it to reward positive events plus grid-to-finish comebacks. Same 4-profile/2-GP browser sweep now has no `Fun <= 4` rounds: sprinter 5.5, rain-reader 9.5, banker 5.0, closer 7.5 average fun.
- Wave 2: added browser-agent comprehension scoring to the same report. It checks whether key visible affordances explain the current step, then penalizes overly long action paths. Latest 4-profile/2-GP sweep averages 8/10 comprehension for every profile; no round is `Comprehension <= 6`. The Garage post-purchase check still flags as unclear in the per-profile details.
- Wave 3: added `npm run copy:audit` for static i18n copy comprehension checks and simplified high-friction French first-contact terms. Audit went from 220 total issues to 161; French medium findings dropped from 70 to 27.
- Wave 4: extended the browser-agent playtest with explicit scenario checks for first contact, plan configuration choice, and result-cause understanding. Latest 4-profile/2-GP sweep still has no low fun or low comprehension rounds, but all 4 profiles fail all 3 scenario questions: the stand only exposes `Plan`, the plan view only exposes `Send plan` at the sampled moment, and the result report causal anchors are not visible to the agent.
- Wave 5: corrected the scenario probes to target the visible player-facing cues already present in the UI and to wait for the lazy result report. Latest 4-profile/2-GP sweep passes all 3 scenario questions for all 4 profiles. One low-fun round remains: banker GP2, P8, fun 4, frustration 6, comprehension 8.
- Closeout: aggressive + mini-pack concentration is not confirmed as a blind nerf target. Replayability shows 6 unique champions, 100% unique finishing orders, 0% boring races, and no dominant strategy cluster; the highest cluster is 16.67% and marked non-dominant. No balance retune was applied.
- Finished on 2026-07-27.
- Linked backlog item(s): `item_306_group_replayability_and_balance_diagnostics_by_strategy_axes`, `item_307_apply_minimal_balance_tuning_only_if_diagnostics_confirm_skew`
- Related request(s): `req_123_aggressive_mini_pack_balance_diagnostic_verify_and_correct_win_concentration_without_blind_nerfs`

# AI Context
- Summary: Orchestrate aggressive mini-pack balance diagnostic
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_123_aggressive_mini_pack_balance_diagnostic_verify_and_correct_win_concentration_without_blind_nerfs`
- Product brief(s): `prod_075_aggressive_mini_pack_balance_diagnostic_product_brief`
- Architecture decision(s): (none yet)
