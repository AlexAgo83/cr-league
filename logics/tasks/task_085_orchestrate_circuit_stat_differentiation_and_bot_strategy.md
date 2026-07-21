## task_085_orchestrate_circuit_stat_differentiation_and_bot_strategy - Orchestrate circuit stat differentiation and bot strategy
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [x] 1. Baseline current trait and bot pit-strategy behavior using focused tests, balance smoke, and AI playtest output.
- [x] 2. Adjust simulation trait weighting with the smallest deterministic change that makes Grip, Attack, and Endurance favor different setups.
- [x] 3. Derive bot pit strategy from circuit traits, weather, archetype, and deterministic seed without adding a planning engine.
- [x] 4. Update Plan risk/readability copy or tests only where the new model makes old hints inaccurate.
- [x] 5. Record balance and AI-playtest evidence, then update the blocked card economy docs with the new baseline dependency.
- [x] 6. Run typecheck, lint, unit tests, build, e2e, balance smoke, AI playtest, and Logics validation.
- [x] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [x] Keep commit creation under operator control; do not force one commit per micro-step.
- [x] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_183_make_circuit_traits_force_distinct_setup_tradeoffs`
- `item_184_make_bot_pit_strategy_react_to_circuit_identity`

# Definition of Done (DoD)
- [x] Generated request, product, backlog, and task docs are present.
- [x] Context-pack handoff is available when requested.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof: `simulateRace` numeric trait fit now makes Grip, Attack, and Endurance pressures materially affect segment scoring.
- request-AC2 -> This task. Proof: `packages/shared/src/simulation/simulateRace.test.ts` covers heavy_pack/reliability, mini_pack/aggression, and grip/weather winners under deterministic seeds.
- request-AC3 -> This task. Proof: `apps/api/src/features/leagues/store.ts` derives default bot pit strategy from current circuit identity, wet risk, and archetype; `apps/api/src/app.test.ts` proves all three pit strategies appear across a GP rotation.
- request-AC4 -> This task. Proof: bot choices use persisted league/GP/circuit state with no random input, and the API rotation test is deterministic.
- request-AC5 -> This task. Proof: Plan trait hints still use the existing `raceFlow` pressure model; no misleading copy change was introduced by the server-side scoring update.
- request-AC6 -> This task. Proof: no card price or card effect values changed; reward fixture updates only follow changed deterministic finishing order.
- request-AC7 -> This task. Proof: `docs/audits/playtest-ai.md`, `docs/audits/playtest-ai.json`, and `docs/audits/balance-latest.json` were refreshed as baseline evidence.
- request-AC8 -> This task. Proof: `npm test`, `npm run test:e2e`, `npm run typecheck`, `npm run build`, `npm run lint`, `npm run logics:validate`, and `git diff --check` passed.

# Validation
- `npm test`
- `npm run test:e2e`
- `npm run typecheck`
- `npm run build`
- `npm run lint`
- `npm run logics:validate`
- `git diff --check`
- Focused simulation and API tests passed; AI playtest report refreshed with pit strategy mix; balance smoke refreshed with 300 runs x 4 circuits; npm test, npm run test:e2e, npm run typecheck, npm run build, npm run lint, npm run logics:validate, and git diff --check passed.
- Finish workflow executed on 2026-07-21.
- Linked backlog/request close verification passed.

# Report
- 2026-07-21 baseline: focused simulation check showed Endurance and Grip scenarios could already win, while high Attack/aggressive/mini lost narrowly to heavy_pack because the numeric trait fit was too flat.
- 2026-07-21 wave: increased the central numeric trait-fit weight in `simulateRace` and added a deterministic test proving three distinct winners: heavy/reliability on high-wear endurance, aggressive/mini on attack, and weather/standard on heavy-rain grip.
- 2026-07-21 wave: default bot pit strategy now derives from the current circuit identity, weather risk, and bot fallback archetype; `apps/api/src/app.test.ts` proves all three pit strategies appear across a real GP rotation and opponent signatures change by circuit. A heavy-rain guard keeps bots from choosing mini packs into obviously wet races.
- 2026-07-21 evidence: `docs/audits/playtest-ai.md` now includes a Pit Strategy Mix table (heavy, standard, mini all present). `docs/audits/balance-latest.json` was refreshed with `balance:sim --runs 300 --circuits 4`; it still flags card/profile balance outliers, especially hard tires dominance and a weak aggressive/rival-hunter lane, so card economy remains a follow-up rather than silently unblocked.
- Remaining: run full gates, close task/request traceability, then hand the refreshed evidence to the blocked card economy chain.
- Finished on 2026-07-21.
- Linked backlog item(s): `item_183_make_circuit_traits_force_distinct_setup_tradeoffs`, `item_184_make_bot_pit_strategy_react_to_circuit_identity`
- Related request(s): `req_084_differentiate_circuit_stats_and_make_bot_configurations_react_to_circuit_identity`

# AI Context
- Summary: Orchestrate circuit stat differentiation and bot strategy
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_084_differentiate_circuit_stats_and_make_bot_configurations_react_to_circuit_identity`
- Product brief(s): `prod_048_circuit_stat_differentiation_and_bot_strategy_product_brief`
- Architecture decision(s): (none yet)
