## req_117_performance_pass_deferred_follow_up - Performance pass deferred follow-up
> From version: 0.4.5
> Schema version: 1.0
> Status: Draft
> Understanding: 90%
> Confidence: 85%
> Complexity: High
> Theme: Performance
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Lazy-load circuit route polylines per selected circuit so the eager 25-track chunk leaves the first-paint critical path, without breaking the race/replay/championship render path or its loading behavior.
- Move the CPU-heavy simulateRace off the locked write transaction (or onto a worker thread) so a resolve stops blocking the single-node event loop and holding the grand-prix row lock, while preserving race-integrity guarantees and byte-identical simulation output.

# Context
- These are the two items deferred from req_116 because they touch a well-optimized render path (#282) and the most integrity-sensitive backend function (#286); each needs a dedicated, carefully-tested change rather than a sweep.
- No new runtime dependencies unless a worker-thread approach for the simulation proves necessary.
- The per-frame replay loop (imperative refs + WeakMap geometry cache) must not be touched.
- Behavior must stay observably identical: same rendered circuit, same simulation results, same lock/double-resolve protection.

# Acceptance criteria
- AC1: Circuit route data loads on demand for the selected circuit; the eager circuit-routes chunk is off the first-paint critical path; every round still renders its correct circuit with no layout flash, verified by the web + e2e suites.
- AC2: simulateRace no longer runs while holding the grand-prix row lock (computed before the write transaction, or on a worker thread); the transaction performs only validation and writes.
- AC3: Race-integrity guarantees (single resolve wins, lock semantics) and simulation outputs are preserved verbatim, proven by the resolution tests and balance:gate.
- AC4: Typecheck, lint, the full unit suite, balance:gate, e2e, and logics:validate all stay green with no weakened assertions.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): `prod_069_performance_pass_deferred_follow_up_product_brief`
- Architecture decision(s): (none yet)

# References
- AGENTS.md
- LOGICS.md
- logics/instructions.md
- logics/request/req_116_performance_pass_front_and_api.md
- apps/web/src/app/circuits.ts
- apps/web/src/app/circuitRoutes/index.ts
- apps/web/src/features/CircuitMap.tsx
- apps/api/src/features/leagues/storeCore.ts
- Context: req_116 delivered the safe, high-value performance wins (assets to WebP 32MB->5MB, async scrypt, getLeagueState history over-fetch split, resolve consumed-card batching, adminView gating). This request carries the two items that were deliberately deferred there as high-risk / low-benefit changes to sensitive paths.
- Deferred #282: apps/web/src/app/circuitRoutes/index.ts statically imports all 25 route files; circuits.ts builds route into CityCircuit at module-eval on the critical path (~47 KB gzip). circuit.route is read by CircuitMap.tsx:121/128, ChampionshipView.tsx:388, and replayMath.ts:226 — all core-loop screens shown immediately on entering a league.
- Deferred #286: resolveCurrentGrandPrix (storeCore.ts ~767-828) runs the synchronous simulateRace inside runWrite while holding lockGrandPrixRow, computed from state re-read under the lock for consistency; it blocks the single-node event loop and holds the lock for the sim duration.

# AI Context
- Summary: Performance pass deferred follow-up
- Keywords: request-chain-scaffold, performance pass deferred follow-up, development-ready
- Use when: You need to implement or review the scaffolded workflow for Performance pass deferred follow-up.
- Skip when: The change is unrelated to this scaffolded request chain.

# Backlog
- `item_287_lazy_load_circuit_route_data_per_selected_circuit`
- `item_288_take_simulaterace_off_the_locked_write_transaction`
