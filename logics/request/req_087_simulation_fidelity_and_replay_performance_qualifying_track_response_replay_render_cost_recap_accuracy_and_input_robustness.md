## req_087_simulation_fidelity_and_replay_performance_qualifying_track_response_replay_render_cost_recap_accuracy_and_input_robustness - Simulation fidelity and replay performance: qualifying track response, replay render cost, recap accuracy, and input robustness
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Complexity: Medium
> Theme: Simulation fidelity and replay performance
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make qualifying respond to the circuit: thread each circuit's numeric traits into every qualifying run so qualifying times differ by track, matching the race and the store.ts comment's stated intent.
- Bound replay render cost: memoize the CircuitMap scene/route analysis so they stop recomputing every animation frame, and stop the replay-clock pop-timer array from growing unbounded.
- Fix recap and replay-overlay accuracy: label the resolved rain weather correctly in the recap, decide and document the podium-vs-loss verdict ordering, stop the onboarding ambient cars from driving backward, and translate the focus-driver aria-label.
- Harden simulation inputs: validate traits on the public /simulation/preview route so a bad body cannot return NaN results, and de-bias the per-season circuit shuffle.

# Context
- Qualifying: the flagship fidelity gap. circuitIdentityForRound(round, circuitSeasonSeed(leagueId, season)) already reconstructs the circuit (store.ts:324), and circuit.traits is the same numeric object fed to the race at store.ts:718. Passing traits: currentCircuit.traits into createQualifyingRuns at store.ts:628/649/908 makes traitBonus vary by track. A test should assert two circuits with different traits yield different qualifying chronos for the same seed/decision. Keep it deterministic (ADR-004): the seed convention is unchanged, only the trait input is added.
- CircuitMap: nothing in circuitScene/analyzeCircuitRoute/routeFitTransform depends on the per-frame cars snapshot; wrap each in useMemo keyed on circuit (and derive the analyses from the memoized scene) so the O(n^2) longest-straight scan runs once per circuit instead of once per rAF tick. This is the highest-value perf fix for mobile replay smoothness. No behavioral change.
- useReplayClock: capture each setTimeout id and splice it out of positionPopTimers.current inside its own callback, keeping the existing bulk-clear on seek/unmount as the safety net.
- Recap: helpers.ts:342 hardcodes light_rain; use the actual resolved rain weather from the result (heavy_rain/light_rain/dry) instead of the hasRain boolean so a wet GP reports the right intensity. The buildRaceVerdict ordering at helpers.ts:185 is a design decision, not obviously a bug: decide whether a podium that lost grid positions should read as podium or loss, then either reorder position<=3 ahead of the loss branch or leave it with a ponytail comment recording the intent so it is not re-flagged.
- Ambient/a11y: CircuitMap.tsx:483 keyPoints run the path backward on the return leg; use forward-only legs (startProgress->1 then 0->startProgress) or start ambient cars at 0 if the stagger is not essential. ReplayStageOverlay.tsx:214 should use a new tt() key for the focus-driver aria-label; the en/fr catalogs are otherwise complete.
- Robustness: add a numeric-traits guard to isRaceInput (or run normalizeRaceTraits before simulateRace) on /simulation/preview so non-numeric trait fields are rejected with 400 rather than returning NaN. For circuits.ts, derive the swap index from the high bits of the LCG state (e.g. Math.floor(state / 65536) % (index + 1)) so per-season orderings are unbiased while staying seed-deterministic; extend the existing seasonCircuitIdentities test to keep reproducibility and assert no position is structurally pinned.
- Out of scope: retuning trait/card magnitudes (balance, not fidelity); reworking the replay animation model; the JSON-column locking and economy/resolve fixes owned by req_085 and req_086.

# Acceptance criteria
- AC1: Qualifying times respond to circuit traits — two circuits with different numeric traits produce different qualifying chronos for the same seed and decision, proven by a test, and the store.ts:636 intent comment is now accurate.
- AC2: CircuitMap's scene, route analysis, and fit transform are memoized on circuit and do not recompute per replay frame, and the useReplayClock pop-timer array does not grow unbounded across a long replay. Proof: implemented in apps/web/src/features/CircuitMap.tsx and apps/web/src/features/replay/useReplayClock.ts, with CircuitMap.render.test.tsx covering forward-only ambient motion.
- AC3: The recap labels the resolved rain intensity correctly (heavy_rain no longer shows as light rain), the podium-vs-loss verdict ordering is intentional and documented, the onboarding ambient cars never move backward, and the focus-driver aria-label is translated. Proof: helpers.test.ts covers heavy rain recap and podium-first verdicts; ReplayStageOverlay.tsx uses action_focus_driver from en/fr catalogs; CircuitMap.render.test.tsx covers forward-only ambient animation.
- AC4: /simulation/preview rejects non-numeric traits with 400 instead of returning NaN results, and the per-season circuit shuffle draws from high bits so orderings are unbiased and still seed-deterministic.
- AC5: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, and npm run logics:validate pass; npm run balance:sim shows no unintended shift from the qualifying-trait change. Proof: npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, npm run balance:sim, and npm run logics:validate were run during task_088 closeout.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_051_simulation_fidelity_and_replay_performance_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/request/req_085_repo_review_remediation_pass_6_json_column_race_locks_simulation_finishing_order_fidelity_destructive_op_guards_and_over_engineering_cleanup.md
- logics/request/req_086_gameplay_and_economy_integrity_comeback_payout_curve_unplayed_card_consumption_resolve_determinism_and_decision_validation.md
- logics/roadmap/road_002_cr_league_roadmap_v2.md
- apps/api/src/features/leagues/store.ts
- apps/api/src/features/leagues/qualifying.ts
- apps/api/src/features/simulation/routes.ts
- packages/shared/src/domain/circuits.ts
- apps/web/src/features/CircuitMap.tsx
- apps/web/src/features/replay/useReplayClock.ts
- apps/web/src/features/replay/ReplayStageOverlay.tsx
- apps/web/src/app/helpers.ts
- Third audit sweep on 2026-07-22 (v0.3.26+), covering surfaces the pass-6 and gameplay-integrity sweeps did not open. (1) Qualifying ignores circuit traits: createQualifyingRuns (qualifying.ts:31-45) accepts an optional numeric traits object but all three call sites in store.ts (628, 649, 908) pass only primaryTrait/secondaryTrait strings, so traits falls back to the flat default {grip:62,overtaking:62,energy:62}, traitBonus is a constant, and no circuit characteristic affects qualifying times — contradicting the store.ts:636 comment that qualifying uses the GP's canonical track traits. The numeric traits exist as circuit.traits (used for the race at store.ts:718) and can be recomputed via circuitIdentityForRound like store.ts:324 does. (2) CircuitMap recomputes the whole scene every frame: circuitScene(circuit) (CircuitMap.tsx:330) and analyzeCircuitRoute (CircuitMap.tsx:352, an O(n^2) longest-straight scan at 224-233) plus routeFitTransform run on every render, and CircuitMap re-renders on every replay rAF tick because ReplayView calls setSnapshot per frame with a fresh cars array, so full projection + tiling + O(n^2) analysis run ~60x/sec though they depend only on circuit. (3) useReplayClock pop-timer leak: setPositionPops timers (useReplayClock.ts:88-92) push setTimeout ids into positionPopTimers.current but fired timers are never spliced, only bulk-cleared on seek/unmount, so the array grows across a long replay with many overtakes. (4) Recap mislabels heavy rain: recapDirective (helpers.ts:342) renders weather as weather_${hasRain ? "light_rain" : "dry"}, hardcoding light_rain, so a heavy_rain GP reads as light rain. (5) buildRaceVerdict outcome ordering (helpers.ts:185) evaluates positionChange<0 -> loss before position<=3 -> podium, so a podium finish that lost grid positions (pole to P3) classifies as loss and never podium; may be intentional. (6) CircuitMap ambient onboarding cars oscillate: animateMotion keyPoints=`${startProgress};1;${startProgress}` (CircuitMap.tsx:483) makes the second leg traverse the path backward, so cars move forward then reverse whenever startProgress>0. (7) ReplayStageOverlay focus-driver toggle uses a hardcoded English aria-label "Focus driver" (ReplayStageOverlay.tsx:214) while siblings use tt(), so it is untranslated for FR screen-reader users; the en/fr catalogs otherwise have no missing keys. (8) /simulation/preview does not validate traits: isRaceInput (simulation/routes.ts:32-48) validates seed/enums/forecast/trackLengthMeters but not the optional traits object, so a body with non-numeric trait fields reaches clampTrait(Math.round(...)) = NaN and poisons the whole returned race result; laps/pitLaneProgress/trackLengthMeters are re-clamped internally so only traits is exposed. (9) Biased circuit shuffle: seasonCircuitIdentities (circuits.ts:50-58) derives its Fisher-Yates swap index from LCG low bits (state % (index+1)), whose lowest bits have very short periods, skewing per-season circuit orderings.

# AI Context
- Summary: Simulation fidelity and replay performance: qualifying track response, replay render cost, recap accuracy, and input robustness
- Keywords: request-chain-scaffold, simulation fidelity and replay performance: qualifying track response, replay render cost, recap accuracy, and input robustness, development-ready
- Use when: You need to implement or review the scaffolded workflow for Simulation fidelity and replay performance: qualifying track response, replay render cost, recap accuracy, and input robustness.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_193_qualifying_responds_to_circuit_traits`
- `item_194_bound_replay_render_cost_and_timer_growth`
- `item_195_recap_accuracy_and_replay_overlay_polish`
- `item_196_simulation_input_robustness_and_unbiased_circuit_shuffle`
