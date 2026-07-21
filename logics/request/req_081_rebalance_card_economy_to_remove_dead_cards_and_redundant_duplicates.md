## req_081_rebalance_card_economy_to_remove_dead_cards_and_redundant_duplicates - Rebalance card economy to remove dead cards and redundant duplicates
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 90
> Complexity: High
> Theme: Economy and card depth
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.
> Non-semantic edit: 2026-07-21 repointed audit/playtest evidence references to tracked docs/audits copies.

# Status note
- IMPLEMENTED (2026-07-21): `task_082_orchestrate_card_economy_rebalance` repriced dead cards, differentiated `rain_mapping`, reduced `hard_tires` dominance, and refreshed balance/playtest evidence.

# Needs
- Give every card a reason to exist by removing dead cards and near-duplicate cards, using the playtest and balance evidence as the starting diagnosis.
- Reprice or re-role the confirmed outliers: adjustable_wing (unbought at 500), pit_relay and fleet_maintenance (unbought), and rain_mapping (dominated by rain_grip).
- Differentiate paid cards from the free approach/preparation knobs so a card offers something the free directive tuning does not.
- Validate every change with the balance kit and an AI playtest so no single card dominates points, win rate, and credit margin at once, and no card is dead.
- Preserve determinism and change no card magnitude in a way that breaks existing deterministic tests without updating them intentionally.
- Keep card copy honest and never recommend a card.

# Context
- This is 0.5 economy and card-depth work; the roadmap gates it on repeated-GP playtest evidence, which docs/audits/playtest-ai.md now provides.
- Card effects are defined in simulateRace.ts (applyDecision and maybeAddCardEvent), prices in economy/constants.ts, prose in cards/definitions.ts; the balance kit (scripts/balance-simulations.ts) and AI playtest (scripts/ai-playtest.ts) already measure card outcomes.
- The design pillars require dilemmas with real trade-offs and forbid recommendations or a single best card.
- This request is now sequenced after `req_084`: first make Grip, Attack, Endurance, and bot pit strategy produce distinct configuration pressure, then rebalance cards against that fresh baseline.

# Acceptance criteria
- AC1: No card is a dead choice: after the change, an AI playtest of comparable size shows every card is bought or played a non-trivial number of times, with no card at zero purchases.
- AC2: No single card dominates points, win rate, and credit margin simultaneously in the balance kit economy summary.
- AC3: The confirmed outliers (adjustable_wing, pit_relay, fleet_maintenance, rain_mapping) are repriced or re-roled so each has a distinct, evidenced reason to be picked; near-duplicate weather cards are consolidated or differentiated.
- AC4: Each paid card provides an effect or condition the free approach/preparation knobs do not already grant.
- AC5: Card copy remains descriptive and never labels a card as best, recommended, or optimal.
- AC6: Determinism holds; updated deterministic tests reflect intended magnitude changes and still pass.
- AC7: Balance and playtest evidence (updated reports) is recorded, and npm run typecheck, npm test, npm run build, npm run lint, and npm run logics:validate pass.

# AC Traceability
- AC1 -> `task_082_orchestrate_card_economy_rebalance`. Proof: `docs/audits/playtest-ai.md` shows every card bought at least 16 times after the rebalance.
- AC2 -> `task_082_orchestrate_card_economy_rebalance`. Proof: `docs/audits/balance-latest.json` uses real `CARD_PRICES`; no single card dominates points, win rate, and credit margin together.
- AC3 -> `task_082_orchestrate_card_economy_rebalance`. Proof: `packages/shared/src/economy/constants.ts` reprices the confirmed outliers and `packages/shared/src/simulation/simulateRace.ts` differentiates weather/reliability effects.
- AC4 -> `task_082_orchestrate_card_economy_rebalance`. Proof: changed cards now lean on distinct trigger/effect shapes: mechanic save, dry-baseline rain map, late pit steadiness, moderated hard tire closing stint, and circuit attack wing.
- AC5 -> `task_082_orchestrate_card_economy_rebalance`. Proof: card prose remains descriptive and no recommendation copy was introduced.
- AC6 -> `task_082_orchestrate_card_economy_rebalance`. Proof: deterministic simulation, card descriptor, API, and e2e tests passed after intentional expectation updates.
- AC7 -> `task_082_orchestrate_card_economy_rebalance`. Proof: updated audit reports are tracked and `npm test`, `npm run test:e2e`, `npm run typecheck`, `npm run build`, `npm run lint`, `npm run logics:validate`, and `git diff --check` passed.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_045_card_economy_rebalance_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- docs/audits/AUDIT_CR_LEAGUE.md
- docs/audits/playtest-ai.md
- docs/audits/balance-latest.json
- packages/shared/src/economy/constants.ts
- packages/shared/src/cards/definitions.ts
- packages/shared/src/simulation/simulateRace.ts
- scripts/balance-simulations.ts
- scripts/ai-playtest.ts
- logics/request/req_084_differentiate_circuit_stats_and_make_bot_configurations_react_to_circuit_identity.md
- docs/balance-simulations.md
- Playtest evidence (docs/audits/playtest-ai.md, 50 agents x 3 seasons x 6 GP after rebalance): PASS; every card is bought at least 16 times, with prior dead cards now active (`adjustable_wing` 16, `pit_relay` 24, `fleet_maintenance` 92, `rain_mapping` 37, `calculated_attack` 42).
- Balance evidence (docs/audits/balance-latest.json, 300 runs x 4 circuits after rebalance): `hard_tires` no longer dominates the top strategies; `rain_grip` leads points/win but not credit margin, while economy cards lead margin without dominating points/win.
- Code truth: `CARD_PRICES` now backs both purchase behavior and balance margin reporting; `rain_mapping` is less explosive than `rain_grip` in rain but gives baseline dry value, and `hard_tires` is a moderated late-race reliability choice rather than the dominant setup.

# AI Context
- Summary: Rebalance card economy to remove dead cards and redundant duplicates
- Keywords: request-chain-scaffold, rebalance card economy to remove dead cards and redundant duplicates, development-ready
- Use when: You need to implement or review the scaffolded workflow for Rebalance card economy to remove dead cards and redundant duplicates.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_179_reprice_and_re_role_dead_and_duplicate_cards_with_balance_kit_validation`
