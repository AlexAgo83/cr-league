## task_047_orchestrate_coherent_replay_realism_and_circuit_normalization - Orchestrate coherent replay realism and circuit normalization
> From version: 0.3.6
> Schema version: 1.0
> Status: Ready
> Understanding: 95
> Confidence: 90
> Progress: 0
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.

# Context
- This task coordinates the implementation of `req_046_make_race_simulation_and_replay_feel_coherent_across_circuits`.
- Start from the current five-segment simulation trace, the React/SVG replay map, and the existing circuit route/lap data.
- The first implementation wave must measure current circuit distance drift before changing laps, scaling, or replay animation behavior.
- Normalization should bias toward larger, more flowing circuits rather than using the shortest or twistiest layouts as the target feel.
- Keep simulation truth separate from replay presentation: final classification, reports, rewards, and consumed cards remain deterministic outcome data.
- Replay tuning must include a readable plan/debug output so the implementation agent can inspect scripted beats directly.

# Plan
- [ ] 1. Read the current simulation, replay, circuit, map, and tests before editing: `simulateRace.ts`, `race.ts`, `circuits.ts`, `ReplayView.tsx`, `CircuitMap.tsx`, and replay/private-league tests.
- [ ] 2. Add the circuit audit command first and capture route length, lap count, total distance, and a simple twistiness/complexity signal so lap or scaling changes are evidence-based.
- [ ] 3. Choose the target perceived total-distance band, bias it toward larger and more flowing circuits, then normalize lap counts or replay scaling while keeping shared and web circuit data aligned.
- [ ] 4. Define the replay staging contract before implementation, separating simulation truth from presentation-only beats and including a readable plan/debug output.
- [ ] 5. Implement deterministic replay staging and integrate it into `ReplayView` with detailed staged overtake movement, tower agreement, marker seeking, and finish-order preservation.
- [ ] 6. Validate shortest, longest, wettest, and high-overtaking circuits with focused tests and visual screenshots on desktop and mobile.
- [ ] 7. Update specs, playtest prompts, and Logics proof, then run typecheck, lint, unit tests, build, e2e, i18n validation if copy changed, and Logics validation.
- [ ] ADR 009 checkpoint: update affected Logics docs during each meaningful wave and leave the repo commit-ready.
- [ ] Keep commit creation under operator control; do not force one commit per micro-step.
- [ ] GATE: do not close until lint, audit, and scaffold validation pass.

# Backlog
- `item_104_audit_and_normalize_circuit_race_distances`
- `item_105_define_the_replay_staging_contract`
- `item_106_implement_arcade_plausible_replay_movement`
- `item_107_validate_replay_realism_with_tests_and_playtest_prompts`

# Definition of Done (DoD)
- [ ] Circuit audit command and output contract are implemented and documented.
- [ ] Circuit lap counts or replay scaling are normalized against the selected target band, with a documented bias toward larger and less twisty routes.
- [ ] Replay staging contract is implemented or documented before presentation integration, including readable debug or fixture output.
- [ ] Replay movement stages overtakes and preserves final classification deterministically.
- [ ] Representative circuit extremes are validated with tests and desktop/mobile visual checks.
- [ ] Affected specs/docs and Logics closeout proof are updated.
- [ ] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# AC Traceability
- request-AC1 -> This task. Proof deferred until the audit command and report are committed.
- request-AC2 -> This task. Proof deferred until the target band and lap/scaling normalization are committed.
- request-AC3 -> This task. Proof deferred until simulation determinism tests pass after replay changes.
- request-AC4 -> This task. Proof deferred until replay staging beats are implemented or documented.
- request-AC5 -> This task. Proof deferred until staged overtake movement is visible and tested.
- request-AC6 -> This task. Proof deferred until representative circuit screenshots or e2e checks are recorded.
- request-AC7 -> This task. Proof deferred until normalization and replay staging tests are committed.
- request-AC8 -> This task. Proof deferred until the full validation gate is recorded.

# Validation
- Run `npm run typecheck`.
- Run `npm run lint`.
- Run `npm test`.
- Run `npm run build`.
- Run focused replay/private-league e2e checks, then `npm run test:e2e` if feasible.
- Run `logics-manager i18n validate` if user-facing copy changes.
- Run `npm run logics:validate` or `logics-manager lint --require-status && logics-manager audit --group-by-doc`.

# Report
- Not started. This task is ready for an implementation agent.

# AI Context
- Summary: Orchestrate coherent replay realism and circuit normalization
- Keywords: scaffolded-task, request-chain-scaffold, orchestration
- Use when: Coordinating implementation of a scaffolded request chain.
- Skip when: Working on one isolated sibling slice.

# Links
- Request: `req_046_make_race_simulation_and_replay_feel_coherent_across_circuits`
- Product brief(s): `prod_017_coherent_race_replay_and_simulation_realism_product_brief`
- Architecture decision(s): (none yet)
