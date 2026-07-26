## req_122_review_remediation_one_source_of_truth_for_cross_package_contracts_and_helpers_decompose_god_modules_close_test_gaps - Review remediation: one source of truth for cross-package contracts and helpers, decompose god modules, close test gaps
> From version: 0.4.6
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Medium
> Theme: Architecture remediation
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Give the client/server contract a single source of truth: hoist the LeagueState response DTO and the RaceResult typing into packages/shared, consumed by both web and api, so the two hand-copied definitions stop drifting and the authoritative side stops typing its own result as unknown.
- Consolidate the duplicated-and-diverged simulation/util helpers into shared with one agreed behavior each (lap mapping, speed-profile factor, classification score, forecast, best qualifying runs, clamps, hex), removing the latent off-by-one/min-vs-max bugs the divergence hides.
- Give replay order/classification/gap derivation one shared definition (or a sim-emitted stream) beside replayTrace and pin it with a golden test, so the client stops re-deriving the trace format untested.
- Decompose the two god modules (lifecycle.ts by responsibility, App.tsx orchestration into per-domain hooks) with no behavior change.
- Harden tests/CI: enforce a coverage threshold and add unit tests for the currently HTTP-only critical paths (season rollover/concurrency, standings/credit application, comeback bonus).
- Clean up the source-of-truth gaps and rot: persist season standings/champion server-side, add a circuit identity↔route parity guard, delete the orphaned storeCore barrel and dead exports/types, and move the speed-profile data literal out of the logic file.

# Context
- This is a remediation of a review, not a redesign: the layering and server-authoritative trust model are the strong parts and must be preserved. Every change reduces duplication or moves a re-derivation to a single source of truth; none should alter simulation outcomes except where two diverged copies are deliberately reconciled to ONE agreed rule (and that reconciliation must be covered by a test so the chosen behavior is pinned).
- Contract SoT (need 1): create the response DTO in shared (LeagueState and the nested currentGrandPrix/history result as RaceResult|null, decisions with the RaceDecision unions and rivalTeamId), have apps/api/src/features/leagues/types.ts and apps/web/src/app/types.ts import it, and reconcile the drift (api stops using unknown; web gains rivalTeamId if the server sends it). Watch the opponent-reveal shaping (revealedDecisions) so the DTO models 'possibly-hidden' fields honestly rather than forcing a lie.
- Helper SoT (need 2): pick ONE implementation per helper and export from shared. For the genuinely divergent ones (lapForSegment x3, lapForProgress rounding, speed-profile min vs min-or-max) DECIDE the correct behavior deliberately, document why, and add a test; do not just delete two of three copies silently. Update simulateRace/chronoRaceEngine/replayTrace/qualifying/replayMath to consume the shared version.
- Replay SoT (need 3): the preferred direction is to move the interpolation/order/gap helpers (replayOrderAtProgress, liveClassificationByCarProgress, carProgressAtTrace, isCanonicalReplayTrace, shouldSmoothReplayTrace) into shared beside replayTrace.ts so both the emitter and the consumer share one definition of 'who is where'; a golden test snapshots a fixed-seed trace through them and asserts stable interpolated positions. If a full sim-emitted per-frame stream is cheaper, that is acceptable as long as one definition remains.
- Decomposition (need 4): split lifecycle.ts into leagueAdmin / grandPrixLifecycle / bots / visibility modules keeping the store barrel's public surface intact; extract App.tsx state groups into per-domain hooks (continue the useRaceDerivations/leagueMutations pattern). Pure refactor — outputs and API responses unchanged, tests green throughout.
- Tests/CI (need 5): add coverage.thresholds to vitest.config.ts and gate it in the CI unit lane so the gains cannot silently regress; add unit tests for lifecycle season-rollover + the (leagueId,season,round) concurrency guard (no double-credit), resolution standings/credit increments, and the comeback credit bonus math + cap.
- SoT & hygiene (need 6): compute and persist final season standings/champion server-side on season close so there is a server truth (the client keeps rendering, but the winner is authoritative); assert circuit identity↔route parity at module load or in a test so a shared circuit without a web route fails loudly instead of rendering a blank track; delete storeCore.ts (zero importers), drop the dead exports/types, and move CIRCUIT_SPEED_PROFILES into a .data.ts/JSON module keeping the functions.
- OUT OF SCOPE — do not touch: (a) the opponent-decision reveal is INTENTIONAL — teams reading rivals' submitted directives (and resubmitting) is a deliberate meta-game for tuning one's own setup; do NOT lock decisions or gate the reveal. (b) rotating the exposed SMTP credential is handled by the owner separately. (c) no new gameplay, no engine retuning beyond reconciling a diverged helper, no UI redesign, and the +20-circuits work (req_118) stays its own request.

# Acceptance criteria
- AC1: The LeagueState response DTO and RaceResult typing have a single definition in packages/shared consumed by both apps/api and apps/web; the api no longer types currentGrandPrix.result/history result as unknown and the previously drifted fields (rivalTeamId, approach/preparation unions) are reconciled.
- AC2: The duplicated-and-diverged helpers (lapForSegment, lapForProgress, speed-profile factor, classificationScore, strongestForecast, bestQualifyingRuns, clamps, safeHex) exist once in shared and are consumed everywhere; each formerly-divergent one is reconciled to one documented behavior covered by a test.
- AC3: Replay order/classification/gap derivation has one shared definition (moved beside replayTrace or emitted by the sim), and a golden/determinism test pins a fixed-seed trace's interpolated positions; replayMath is no longer an untested client re-derivation of the trace format.
- AC4: lifecycle.ts is decomposed by responsibility and App.tsx orchestration is extracted into per-domain hooks, with the store's public surface and all API responses unchanged (pure refactor, tests green).
- AC5: vitest enforces a coverage threshold gated in CI, and unit tests exist for season rollover + the (leagueId,season,round) concurrency guard, resolution standings/credit application, and the comeback bonus math + cap.
- AC6: Final season standings/champion are computed and persisted server-side; a circuit identity↔route parity check fails loudly on a missing route; storeCore.ts, the dead exports/types, and the in-logic speed-profile data literal are removed/relocated; and npm run typecheck, npm test, npm run build, npm run lint, npm run test:e2e, and npm run logics:validate all pass with the opponent-reveal behavior unchanged.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_074_cross_package_source_of_truth_remediation_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/scaffold/repo-review-remediation-pass-6.json
- packages/shared/src/domain/circuits.ts
- packages/shared/src/simulation/simulateRace.ts
- packages/shared/src/simulation/chronoRaceEngine.ts
- packages/shared/src/simulation/replayTrace.ts
- apps/api/src/features/leagues/types.ts
- apps/api/src/features/leagues/lifecycle.ts
- apps/api/src/features/leagues/store.ts
- apps/api/src/features/leagues/storeCore.ts
- apps/api/src/features/leagues/resolution.ts
- apps/api/src/features/leagues/qualifying.ts
- apps/web/src/app/types.ts
- apps/web/src/app/App.tsx
- apps/web/src/app/helpers.ts
- apps/web/src/features/replay/replayMath.ts
- vitest.config.ts
- .github/workflows/ci.yml
- A four-lens architecture/quality/test/security review of cr-league (Fastify API + Prisma, React/Vite web, framework-free shared sim) found the trust model and layering are strong (server-authoritative simulation, framework-free shared, thin HTTP, deterministic sim tests, lean deps, full CI) but that every real weakness is CROSS-PACKAGE DUPLICATION THAT HAS DRIFTED. Concrete findings, three lenses corroborating: (1) The LeagueState wire contract is hand-duplicated in apps/web/src/app/types.ts and apps/api/src/features/leagues/types.ts, absent from shared, and has ALREADY drifted: the authoritative api types currentGrandPrix.result / history result as `unknown` (types.ts:67,75) while web types them RaceResult|null; api decisions carry rivalTeamId:string|null which web omits; api approach/preparation are string vs web's RaceDecision unions. The producer types its own result more weakly than the consumer. (2) Simulation helpers are duplicated AND behaviorally divergent: lapForSegment has 3 different implementations (simulateRace.ts:794 hardcoded map, chronoRaceEngine.ts:507 indexOf+1, replayTrace.ts:173 indexOf with guard); lapForProgress has 2 different roundings (Math.round vs Math.floor -> off-by-one between engines); the speed-profile factor math (speedFactorAt/progressInSpan/expandedSpan) exists in web replayMath.ts:428, api qualifying.ts:207, and chronoRaceEngine.ts with web taking min-or-max and api taking min-only. Same-named helpers, diverged behavior = latent bugs. Trivial dup+divergence also in strongestForecast (helpers.ts:33 vs utils.ts:14), classificationScore (simulateRace.ts:680 vs chronoRaceEngine.ts:543), bestQualifyingRuns (raceFlow.ts:128 vs qualifying.ts:22), safeHex (LiveryPlate.tsx:6 vs ReplayTower.tsx:95), and a sprawl of 5 near-identical clamps. (3) The client re-derives what the sim already knows: apps/web/src/features/replay/replayMath.ts (447 lines, 40+ exports) reconstructs order/live-classification/gaps from the sparse replayTrace and is coupled to the emitter's internal trace format, with ZERO test coverage — the single highest-value test gap; and season standings/champion/tie-breaks are computed only client-side (helpers.ts:103) with no server source of truth. (4) God modules: apps/api/src/features/leagues/lifecycle.ts (689 lines) mixes league CRUD, GP lifecycle, bot generation, input normalization and opponent-reveal visibility; apps/web/src/app/App.tsx (796 lines, ~42 hooks) is the UI orchestration bottleneck. (5) Rot: storeCore.ts is an orphaned near-duplicate barrel (zero importers); several exports/types are dead (applyChronoDeltas, motionParametersForParticipant, BotArchetype, WeatherForecast, ReportBlock, ReplayDirectorBeatFact); CIRCUIT_SPEED_PROFILES is ~776 lines of data literal inside a logic file; circuitRouteFor returns [] for an unknown layoutKey (silent blank-track fallback) with no parity guard. (6) Tests: coverage is measured but has NO enforced threshold in vitest.config.ts; lifecycle season-rollover/concurrency, resolution credit/standings application, and the comeback credit bonus are covered only via HTTP round-trips, not unit-asserted. EXPLICITLY OUT OF SCOPE and NOT to be 'fixed': the opponent-decision reveal (a team sees rivals' submitted directives once it has submitted, and can resubmit) is INTENTIONAL game design — a meta-game of reading opponents' setups to tune your own — it must stay; and rotating the exposed SMTP credential is handled separately by the owner.

# AI Context
- Summary: Review remediation: one source of truth for cross-package contracts and helpers, decompose god modules, close test gaps
- Keywords: request-chain-scaffold, review remediation: one source of truth for cross-package contracts and helpers, decompose god modules, close test gaps, development-ready
- Use when: You need to implement or review the scaffolded workflow for Review remediation: one source of truth for cross-package contracts and helpers, decompose god modules, close test gaps.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_300_single_source_of_truth_for_the_leaguestate_raceresult_response_contract`
- `item_301_consolidate_diverged_simulation_util_helpers_into_shared_reconciled_under_test`
- `item_302_one_shared_definition_of_replay_order_classification_gaps_with_a_golden_test`
- `item_303_decompose_the_god_modules_lifecycle_ts_and_app_tsx`
- `item_304_test_and_ci_hardening_coverage_floor_plus_critical_path_unit_tests`
- `item_305_server_authoritative_standings_circuit_parity_guard_and_dead_code_data_hygiene`
