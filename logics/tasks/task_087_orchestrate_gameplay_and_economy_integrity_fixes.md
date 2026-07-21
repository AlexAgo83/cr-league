## task_087_orchestrate_gameplay_and_economy_integrity_fixes - Orchestrate gameplay and economy integrity fixes
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
- [ ] 1. Read req_085 first; this request is the gameplay/economy sibling of that structural pass and must not collide with its JSON-column locking work (only the bot-card path is touched here).
- [ ] 2. Fix the economy item: make the payout curve monotonic with a retained tail cushion, and stop auto-consuming a non-submitting human's card; add the payout-monotonicity and default-resolve inventory tests and run balance:sim.
- [ ] 3. Make resolution deterministic from the stored circuit and reject self-targeted rivals, with tests that vary the request body and assert unchanged output.
- [ ] 4. Do the hardening item: limiter pruning without short-circuit miscount, the Team.profileId index migration, and the bot-card re-read.
- [ ] 5. Run typecheck, tests, build, lint, e2e, and Logics validation; record proof at closeout and note any balance:sim deltas.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_190_monotonic_payout_and_no_unplayed_card_consumption`
- `item_191_deterministic_resolution_and_self_rival_rejection`
- `item_192_limiter_pruning_profileid_index_and_bot_card_write_hygiene`

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
- Summary: Orchestrate gameplay and economy integrity fixes
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_086_gameplay_and_economy_integrity_comeback_payout_curve_unplayed_card_consumption_resolve_determinism_and_decision_validation`
- Product brief(s): `prod_050_gameplay_and_economy_integrity_product_brief`
- Architecture decision(s): (none yet)
