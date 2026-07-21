## task_085_orchestrate_circuit_stat_differentiation_and_bot_strategy - Orchestrate circuit stat differentiation and bot strategy
> From version: 0.3.26
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 70%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- Orchestrate the scaffolded request chain and keep sibling implementation slices linked.

# Plan
- [ ] 1. Baseline current trait and bot pit-strategy behavior using focused tests, balance smoke, and AI playtest output.
- [ ] 2. Adjust simulation trait weighting with the smallest deterministic change that makes Grip, Attack, and Endurance favor different setups.
- [ ] 3. Derive bot pit strategy from circuit traits, weather, archetype, and deterministic seed without adding a planning engine.
- [ ] 4. Update Plan risk/readability copy or tests only where the new model makes old hints inaccurate.
- [ ] 5. Record balance and AI-playtest evidence, then update the blocked card economy docs with the new baseline dependency.
- [ ] 6. Run typecheck, lint, unit tests, build, e2e, balance smoke, AI playtest, and Logics validation.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_183_make_circuit_traits_force_distinct_setup_tradeoffs`
- `item_184_make_bot_pit_strategy_react_to_circuit_identity`

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
- 2026-07-21 baseline: focused simulation check showed Endurance and Grip scenarios could already win, while high Attack/aggressive/mini lost narrowly to heavy_pack because the numeric trait fit was too flat.
- 2026-07-21 wave: increased the central numeric trait-fit weight in `simulateRace` and added a deterministic test proving three distinct winners: heavy/reliability on high-wear endurance, aggressive/mini on attack, and weather/standard on heavy-rain grip.
- 2026-07-21 wave: default bot pit strategy now derives from the current circuit identity, weather risk, and bot fallback archetype; `apps/api/src/app.test.ts` proves all three pit strategies appear across a real GP rotation and opponent signatures change by circuit.
- Remaining: record balance/AI-playtest evidence, run full gates, then close the dependency chain for card economy.

# AI Context
- Summary: Orchestrate circuit stat differentiation and bot strategy
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_084_differentiate_circuit_stats_and_make_bot_configurations_react_to_circuit_identity`
- Product brief(s): `prod_048_circuit_stat_differentiation_and_bot_strategy_product_brief`
- Architecture decision(s): (none yet)
