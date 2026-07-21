## req_077_make_qualifying_lap_times_deterministic_from_seed - Make qualifying lap times deterministic from seed
> From version: 0.3.26
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: Low
> Theme: Simulation determinism and beta-readiness
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.
> Non-semantic edit: 2026-07-21 repointed audit/playtest evidence references to tracked docs/audits copies.

# Needs
- Make qualifying lap times fully reproducible from a seed so identical inputs always produce identical qualifying results and grids.
- Replace the Math.random() lap-time variance in createQualifyingRuns with a seeded PRNG draw derived from stable inputs (seed plus team and lap).
- Replace the non-deterministic createdAt timestamp with a value derived from state so run records are reproducible.
- Keep qualifying lap-time behavior statistically similar (same spread and ordering characteristics) so existing balance expectations do not shift, changing only reproducibility.
- Change no API contract, no persisted result shape, and add no new dependency.

# Context
- apps/api is a Fastify TypeScript service; the shared package packages/shared exposes createPrng(seed), an FNV-1a-hashed LCG already used by the deterministic race simulation.
- createQualifyingRuns is called per team when qualifying/chrono runs are generated; input.seed is available and already passed through to createQualifyingResult.
- The only non-deterministic elements on the qualifying path are the Math.random() variance (line 62) and the new Date() createdAt (line 66); everything else (traitBonus, weatherPenalty, approach/prep/card deltas, warmup and tyre deltas) is already deterministic.
- This is a theme-agnostic correctness/hardening fix; it fits as a small 0.4.x beta-readiness patch alongside the active 0.4 performance line and is a prerequisite for later gameplay-legibility work, but it does not belong to the 0.4 performance theme itself.

# Acceptance criteria
- AC1: createQualifyingRuns derives its per-lap variance from a seeded PRNG (reusing createPrng from packages/shared) keyed on stable inputs such as seed, teamId, and lap index; no Math.random() remains on the qualifying path.
- AC2: The createdAt field is derived deterministically from state rather than new Date(); no Date.now()/new Date() remains on the qualifying path.
- AC3: Two invocations of createQualifyingRuns with identical inputs return identical times, laps, and derived result for every run.
- AC4: Qualifying variance keeps a comparable magnitude to the previous +/- 1.2s band so grid spread and expected ordering are not materially shifted; only reproducibility changes.
- AC5: No API contract, request/response shape, or persisted QualifyingRun shape changes.
- AC6: A unit test asserts determinism (identical inputs produce identical output) and that different teams/attempts still differ; existing qualifying/report/replay flows still pass.
- AC7: npm run typecheck, npm test, npm run build, npm run lint, and npm run logics:validate pass after implementation.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_041_simulation_determinism_hardening_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/architecture/adr_004_data_security.md
- docs/audits/AUDIT_CR_LEAGUE.md
- apps/api/src/features/leagues/qualifying.ts
- packages/shared/src/simulation/prng.ts
- packages/shared/src/simulation/simulateRace.ts
- apps/api/src/app.ts
- Current diagnostic: createQualifyingRuns in apps/api/src/features/leagues/qualifying.ts computes per-lap variance with Math.random() at line 62 ((Math.random() - 0.5) * 2.4) and stamps createdAt with new Date().toISOString() at line 66, so identical inputs produce different qualifying times and grids on each call.
- Current diagnostic: the function already receives input.seed and forwards it to createQualifyingResult (line 65), but the seed is never used to drive lap-time variance; the race simulation is fully deterministic via createPrng(seed) in packages/shared/src/simulation/prng.ts.
- Current diagnostic: ADR-004 states race outcomes are deterministic from stored state plus submitted plans; the non-deterministic qualifying path is inconsistent with that contract and with the seeded race engine.
- Product impact (audit TICKET-02): a non-reproducible chrono breaks the intended learning loop where a player runs a chrono to understand how a setup change affects lap time; two identical chronos returning different times obscures cause and effect.

# AI Context
- Summary: Make qualifying lap times deterministic from seed
- Keywords: request-chain-scaffold, make qualifying lap times deterministic from seed, development-ready
- Use when: You need to implement or review the scaffolded workflow for Make qualifying lap times deterministic from seed.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_175_seed_qualifying_lap_time_variance_and_timestamp_deterministically`
