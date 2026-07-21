## req_081_rebalance_card_economy_to_remove_dead_cards_and_redundant_duplicates - Rebalance card economy to remove dead cards and redundant duplicates
> From version: 0.3.26
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Economy and card depth
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.
> Non-semantic edit: 2026-07-21 repointed audit/playtest evidence references to tracked docs/audits copies.

# Status note
- HELD (owner decision 2026-07-21): do not start. Coupled with stat differentiation (audit cause A); see road_002 (0.5) and docs/audits/AUDIT_CR_LEAGUE.md (TICKET-07/08). Orchestration task task_082 is Blocked.

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
- This request pairs with a later stat-differentiation request; because rebalancing cards shifts the numbers that stat work would measure, card economy is sequenced first and stat differentiation follows once this lands.

# Acceptance criteria
- AC1: No card is a dead choice: after the change, an AI playtest of comparable size shows every card is bought or played a non-trivial number of times, with no card at zero purchases.
- AC2: No single card dominates points, win rate, and credit margin simultaneously in the balance kit economy summary.
- AC3: The confirmed outliers (adjustable_wing, pit_relay, fleet_maintenance, rain_mapping) are repriced or re-roled so each has a distinct, evidenced reason to be picked; near-duplicate weather cards are consolidated or differentiated.
- AC4: Each paid card provides an effect or condition the free approach/preparation knobs do not already grant.
- AC5: Card copy remains descriptive and never labels a card as best, recommended, or optimal.
- AC6: Determinism holds; updated deterministic tests reflect intended magnitude changes and still pass.
- AC7: Balance and playtest evidence (updated reports) is recorded, and npm run typecheck, npm test, npm run build, npm run lint, and npm run logics:validate pass.

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
- docs/balance-simulations.md
- Playtest evidence (docs/audits/playtest-ai.md, 50 agents x 3 seasons x 6 GP): adjustable_wing bought 0 times (price 500), pit_relay bought 0, fleet_maintenance bought 0, defensive_order 3, rain_mapping 5 versus rain_grip 149; a cheap cluster (rain_grip, final_surge, qualifying_focus, fleet_sponsorship, economy_mode) dominates purchases.
- Balance evidence (docs/audits/balance-latest.json): avgPoints spread of 9.45 between best (balanced/speed/rain_grip 13.04) and worst (prudent/weather/fleet_sponsorship 3.59); speed preparation outperforms reliability on average.
- Code truth: rain_grip (120) and rain_mapping (250) share the same mid-only weather check but rain_grip pays more for less money; adjustable_wing (500) underperforms launch_boost (180); pit_relay (250) has no downside; soft_tires/hard_tires partly re-sell what free approach/preparation knobs already grant (simulateRace.ts:498-537).

# AI Context
- Summary: Rebalance card economy to remove dead cards and redundant duplicates
- Keywords: request-chain-scaffold, rebalance card economy to remove dead cards and redundant duplicates, development-ready
- Use when: You need to implement or review the scaffolded workflow for Rebalance card economy to remove dead cards and redundant duplicates.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_179_reprice_and_re_role_dead_and_duplicate_cards_with_balance_kit_validation`
