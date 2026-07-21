## task_082_orchestrate_card_economy_rebalance - Orchestrate card economy rebalance
> From version: 0.3.26
> Schema version: 1.0
> Status: Blocked
> Understanding: 90%
> Confidence: 85
> Progress: 0%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Non-semantic edit: 2026-07-21 set Status Blocked per owner decision (held, coupled with stat differentiation); repointed audit reference to docs/audits.
> Blocked by: owner decision 2026-07-21 - HELD and coupled with stat differentiation (audit cause A). Do NOT start: rebalancing cards against the current flat stat model would be invalidated once stats diverge. Unblock only after `req_084_differentiate_circuit_stats_and_make_bot_configurations_react_to_circuit_identity` lands with a fresh AI-playtest baseline. See road_002 (0.5) and docs/audits/AUDIT_CR_LEAGUE.md (TICKET-07/08).

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.
- `req_084` is the prerequisite chain for forcing circuit traits and bot strategy variation to matter before this card-economy rebalance starts.

# Plan
- [ ] 1. Baseline the current economy with scripts/balance-simulations.ts and scripts/ai-playtest.ts and confirm the dead/duplicate cards from docs/audits/playtest-ai.md.
- [ ] 2. Propose price and effect changes for adjustable_wing, pit_relay, fleet_maintenance, and rain_mapping, and a consolidation or differentiation for the weather duplicates, keeping each distinct from the free knobs.
- [ ] 3. Apply the changes in economy/constants.ts and simulateRace.ts, updating deterministic tests to the intended magnitudes.
- [ ] 4. Re-run the balance kit and AI playtest; iterate until no card is dead and no card dominates all three of points, win rate, and credit margin.
- [ ] 5. Record updated balance/playtest evidence and run typecheck, test, build, lint, and logics:validate in closeout.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_179_reprice_and_re_role_dead_and_duplicate_cards_with_balance_kit_validation`

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
- Summary: Orchestrate card economy rebalance
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_081_rebalance_card_economy_to_remove_dead_cards_and_redundant_duplicates`
- Product brief(s): `prod_045_card_economy_rebalance_product_brief`
- Architecture decision(s): (none yet)
