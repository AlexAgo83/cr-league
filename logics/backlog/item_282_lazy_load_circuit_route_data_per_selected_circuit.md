## item_282_lazy_load_circuit_route_data_per_selected_circuit - Lazy-load circuit route data per selected circuit
> From version: 0.4.5
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Frontend performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

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
