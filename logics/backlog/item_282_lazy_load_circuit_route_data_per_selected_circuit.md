## item_282_lazy_load_circuit_route_data_per_selected_circuit - Lazy-load circuit route data per selected circuit
> From version: 0.4.5
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Frontend performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Non-semantic edit: traceability repair only.

# Problem
- circuitRoutes/index.ts statically imports all 25 route files and circuits.ts consumes that barrel at module-eval on the critical path.
- dist/assets/circuit-routes-*.js is ~217 KB raw (~47 KB gzip, 7445 lines) loaded on first paint.
- Only one circuit renders per round (circuitForRound, circuits.ts:46).

# Scope
- In:
  - Convert the CIRCUIT_ROUTES lookup to dynamic import()s keyed by layoutKey so a track loads only when selected/rendered.
  - Introduce the async boundary at the CircuitMap circuitScene useMemo (CircuitMap.tsx:339) or an equivalent load point.
  - Ensure the correct circuit renders for every round, including a loading state that does not flash or break layout.
- Out:
  - Changing circuit geometry, the map renderer, or the animation loop.
  - Reworking vite manualChunks beyond what the dynamic import requires.
  - Preloading strategies beyond the selected circuit (optional follow-up).

# Acceptance criteria
- AC1: Circuit route data loads on demand; the eager circuit-routes chunk is off the first-paint critical path.
- AC2: The correct circuit renders for every round with no layout flash or regression.
- AC3: Typecheck, lint, and the unit suite stay green.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: Circuit route data loads on demand; the eager circuit-routes chunk is off the first-paint critical path.
- request-AC9 -> This backlog slice. Proof: AC2: The correct circuit renders for every round with no layout flash or regression.
- request-AC3 -> This backlog slice. Evidence needed: The auth KDF no longer blocks the event loop — scryptSync is replaced by async crypto.scrypt on the request path — with auth behavior (hash format, verify results, legacy path) unchanged.
- request-AC5 -> This backlog slice. Evidence needed: The GameApp shell is memoized so unrelated state changes no longer rebuild the admin view, overlays, and menus; adminView is not constructed for non-admins; rendered output and behavior are unchanged.
- request-AC6 -> This backlog slice. Evidence needed: getLeagueState is built at most once per mutation and its history query no longer fetches decisions/qualifyingRuns/forecast for past grand prixes; API responses are byte-identical to today.
- request-AC7 -> This backlog slice. Evidence needed: Per-team write loops in resolve, season rollover, and bot purchases are batched, reducing in-transaction round-trips, with identical resulting points/credits/state.
- request-AC8 -> This backlog slice. Evidence needed: simulateRace is computed before the write transaction opens; the transaction performs only validation and writes; race-integrity guarantees and simulation outputs are preserved verbatim.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_068_performance_pass_front_and_api_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_116_performance_pass_front_and_api`
- Primary task(s): `task_117_orchestrate_the_performance_pass`

# AI Context
- Summary: Lazy-load circuit route data per selected circuit
- Keywords: scaffolded-backlog, lazy-load circuit route data per selected circuit, implementation-ready
- Use when: Implementing the scaffolded slice for Lazy-load circuit route data per selected circuit.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Deferred. Route data is core-loop data (the race desk shows the circuit map immediately on entering a league); lazy-loading ripples async through useRaceDerivations and every race/replay/championship view on a render path the audit found already well-optimized, to defer ~47KB gz that loads seconds later anyway. Revisit only as a dedicated, carefully-tested change.
- Task `task_117_orchestrate_the_performance_pass` was finished via `logics-manager flow finish task` on 2026-07-24.
