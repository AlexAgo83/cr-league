## req_084_differentiate_circuit_stats_and_make_bot_configurations_react_to_circuit_identity - Differentiate circuit stats and make bot configurations react to circuit identity
> From version: 0.3.26
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Circuit identity and strategic depth
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make Grip, Attack, and Endurance meaningfully change which configurations are strong on each circuit.
- Force circuit traits into the race outcome enough that moving approach, preparation, and pit strategy choices has visible value.
- Make bot decisions vary pit strategy and setup based on circuit identity, weather, and simple archetype intent instead of mostly fixed templates.
- Preserve deterministic race results for a given seed and update tests intentionally.
- Use this as the prerequisite for the blocked card economy rebalance, not as a separate speculative tuning pass.

# Context
- The card economy rebalance is blocked by owner decision because tuning cards against the current flat stat model would be invalidated once stats diverge.
- Current bot decisions mostly inherit fixed demo/profile pit strategies, which makes opponent configurations feel repetitive.
- The player-facing Plan already uses Grip, Attack, and Endurance vocabulary, so simulation and bot choices should make those labels matter.
- Balance evidence and AI playtest reports already show shallow card choices; this request should create the stat foundation before card prices/effects are changed.

# Acceptance criteria
- AC1: Simulation scoring makes Grip, Attack, and Endurance produce distinct strategic pressures instead of one flat pace-dominant shape.
- AC2: Representative tests show at least one circuit where heavy_pack/reliability is favored, one where mini_pack/aggression is favored, and one where grip/weather control is favored.
- AC3: Bot default decisions vary pit strategy across standard, heavy_pack, and mini_pack based on circuit traits, likely weather, standings/archetype, or deterministic seed.
- AC4: Bot strategy variation remains deterministic for the same league, GP, team, and seed.
- AC5: Plan risk/readability copy and trait hints remain honest after the stat model change.
- AC6: No card price/effect rebalance is included in this request except tests or docs needed to keep the blocked dependency clear.
- AC7: Balance simulation and AI playtest evidence are recorded to establish the new baseline before unblocking card economy.
- AC8: Typecheck, lint, unit tests, build, e2e, balance smoke, AI playtest, and Logics validation pass.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_048_circuit_stat_differentiation_and_bot_strategy_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- docs/audits/AUDIT_CR_LEAGUE.md
- docs/audits/playtest-ai.md
- docs/audits/balance-latest.json
- packages/shared/src/simulation/simulateRace.ts
- packages/shared/src/domain/circuits.ts
- apps/api/src/features/leagues/store.ts
- scripts/ai-playtest.ts
- scripts/balance-simulations.ts
- apps/web/src/app/raceFlow.ts
- apps/web/src/features/DirectivePanel.tsx
- User decision 2026-07-21: if needed, force circuit stats to matter so changing race configurations makes sense.
- User feedback 2026-07-21: bots show too little pit-stop variation; this should be treated with circuit/stat differentiation rather than isolated bot randomness.

# AI Context
- Summary: Differentiate circuit stats and make bot configurations react to circuit identity
- Keywords: request-chain-scaffold, differentiate circuit stats and make bot configurations react to circuit identity, development-ready
- Use when: You need to implement or review the scaffolded workflow for Differentiate circuit stats and make bot configurations react to circuit identity.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_183_make_circuit_traits_force_distinct_setup_tradeoffs`
- `item_184_make_bot_pit_strategy_react_to_circuit_identity`
