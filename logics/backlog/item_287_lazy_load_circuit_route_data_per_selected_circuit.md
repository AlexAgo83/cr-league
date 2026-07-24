## item_287_lazy_load_circuit_route_data_per_selected_circuit - Lazy-load circuit route data per selected circuit
> From version: 0.4.5
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100
> Complexity: Medium
> Theme: Frontend performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Non-semantic edit: traceability repair only.

# Problem
- circuitRoutes/index.ts statically imports all 25 route files; circuits.ts attaches route to CityCircuit at module-eval on the critical path (~47 KB gzip).
- Only one circuit renders per round (circuitForRound, circuits.ts:46).
- circuit.route is consumed by CircuitMap.tsx:121/128, ChampionshipView.tsx:388, and replayMath.ts:226.

# Scope
- In:
  - Replace the eager CIRCUIT_ROUTES barrel with dynamic import()s keyed by layoutKey.
  - Hydrate the route asynchronously at a single upstream boundary (e.g. useRaceDerivations) and gate the race/replay/championship views on it with a clean loading state.
  - Keep replayMath and the map renderer receiving a fully-formed circuit; verify with web + e2e suites.
- Out:
  - Changing circuit geometry, the map renderer, or the per-frame animation loop.
  - Preloading strategies beyond the selected circuit.

# Acceptance criteria
- AC1: Route data loads on demand; the eager chunk is off the first-paint critical path.
- AC2: Every round renders its correct circuit with no layout flash.
- AC3: Web, e2e, typecheck, and lint stay green.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Route data loads on demand; the eager chunk is off the first-paint critical path.
- request-AC4 -> This backlog slice. Proof: AC2: Every round renders its correct circuit with no layout flash.
- request-AC3 -> This backlog slice. Evidence needed: Race-integrity guarantees (single resolve wins, lock semantics) and simulation outputs are preserved verbatim, proven by the resolution tests and balance:gate.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_069_performance_pass_deferred_follow_up_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_117_performance_pass_deferred_follow_up`
- Primary task(s): `task_118_orchestrate_the_deferred_performance_follow_up`

# AI Context
- Summary: Lazy-load circuit route data per selected circuit
- Keywords: scaffolded-backlog, lazy-load circuit route data per selected circuit, implementation-ready
- Use when: Implementing the scaffolded slice for Lazy-load circuit route data per selected circuit.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.

# Notes
- Delivered (commit fa80928): the 25-track route barrel moved to circuitRoutes/data.ts and loads via a single dynamic import; circuits.ts reads routes from a lazy cache (withRoute) so consumers get a fresh reference once loaded; a CircuitMap wrapper renders a placeholder until the route arrives (prevents the empty-route car-positioning crash the e2e caught); vite manualChunks keeps the lazy facade out of the data chunk. Verified: circuit-routes (47 KB gz) is off the first-paint critical path (gone from index.html), 315 unit + 174 web + 4 e2e + balance:gate all green.
- Task `task_118_orchestrate_the_deferred_performance_follow_up` was finished via `logics-manager flow finish task` on 2026-07-24.
