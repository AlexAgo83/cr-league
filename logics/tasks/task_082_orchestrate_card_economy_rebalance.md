## task_082_orchestrate_card_economy_rebalance - Orchestrate card economy rebalance
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Non-semantic edit: 2026-07-21 set Status Blocked per owner decision (held, coupled with stat differentiation); repointed audit reference to docs/audits.
> Owner: codex

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.
- Circuit stat differentiation and bot strategy variation are complete; this task uses that refreshed baseline to rebalance card economy.

# Plan
- [x] 1. Baseline the current economy with scripts/balance-simulations.ts and scripts/ai-playtest.ts and confirm the dead/duplicate cards from docs/audits/playtest-ai.md.
- [x] 2. Propose price and effect changes for adjustable_wing, pit_relay, fleet_maintenance, and rain_mapping, and a consolidation or differentiation for the weather duplicates, keeping each distinct from the free knobs.
- [x] 3. Apply the changes in economy/constants.ts and simulateRace.ts, updating deterministic tests to the intended magnitudes.
- [x] 4. Re-run the balance kit and AI playtest; iterate until no card is dead and no card dominates all three of points, win rate, and credit margin.
- [x] 5. Record updated balance/playtest evidence and run typecheck, test, build, lint, and logics:validate in closeout.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_179_reprice_and_re_role_dead_and_duplicate_cards_with_balance_kit_validation`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `docs/audits/playtest-ai.md` shows every card bought at least 16 times in the 50-agent/3-season playtest.
- request-AC2 -> This task. Proof: `docs/audits/balance-latest.json` shows no single card leads points, win rate, and credit margin together after using real `CARD_PRICES`.
- request-AC3 -> This task. Proof: `packages/shared/src/economy/constants.ts` reprices dead expensive cards; `packages/shared/src/simulation/simulateRace.ts` differentiates `rain_mapping` from `rain_grip` and reduces `hard_tires` dominance.
- request-AC4 -> This task. Proof: `fleet_maintenance` keeps the mechanic-save effect, `rain_mapping` now trades weaker rain gain for dry baseline value, and `hard_tires` no longer duplicates reliability prep at dominant strength.
- request-AC5 -> This task. Proof: card copy stayed descriptive; no best/recommended/optimal copy was introduced.
- request-AC6 -> This task. Proof: deterministic simulation and descriptor tests were updated and `npm test` passed.
- request-AC7 -> This task. Proof: `docs/audits/playtest-ai.md`, `docs/audits/playtest-ai.json`, and `docs/audits/balance-latest.json` were refreshed; full gates passed.

# Validation
- `npm test`
- `npm run test:e2e`
- `npm run typecheck`
- `npm run build`
- `npm run lint`
- `npm run logics:validate`
- `git diff --check`
- `npm run playtest:ai -- --agents 50 --seasons 3 --rounds 6 --report docs/audits/playtest-ai.md --json docs/audits/playtest-ai.json`
- `npm run balance:sim -- --runs 300 --circuits 4 --limit 10 --json docs/audits/balance-latest.json`
- Card economy rebalance applied; AI playtest PASS with every card bought; balance kit refreshed with real CARD_PRICES; npm test, npm run test:e2e, npm run typecheck, npm run build, npm run lint, npm run logics:validate, git diff --check, playtest:ai, and balance:sim passed.
- Finish workflow executed on 2026-07-21.
- Linked backlog/request close verification passed.

# Report
- 2026-07-21 wave: repriced `fleet_maintenance`, `adjustable_wing`, `rain_mapping`, `pit_relay`, `hard_tires`, `defensive_order`, and `calculated_attack`; nerfed `hard_tires`; differentiated `rain_mapping` as a lower rain gain with dry baseline value.
- 2026-07-21 evidence: AI playtest PASS with every card bought; balance kit now uses real `CARD_PRICES` and shows no card dominating points, win rate, and credit margin together.
- Finished on 2026-07-21.
- Linked backlog item(s): `item_179_reprice_and_re_role_dead_and_duplicate_cards_with_balance_kit_validation`
- Related request(s): `req_081_rebalance_card_economy_to_remove_dead_cards_and_redundant_duplicates`

# AI Context
- Summary: Orchestrate card economy rebalance
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_081_rebalance_card_economy_to_remove_dead_cards_and_redundant_duplicates`
- Product brief(s): `prod_045_card_economy_rebalance_product_brief`
- Architecture decision(s): (none yet)
