## item_172_measure_and_decide_on_circuit_route_lazy_loading - Measure and decide on circuit route lazy loading
> From version: 0.3.26
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Measured performance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Detailed circuit route modules are visibly large in source lines, but line count does not prove a runtime payload problem.
- Dynamic route loading could add async state to map and replay flows, so it should only be added if the measured bundle gain is meaningful.
- As more circuits are added, route data may become a clearer optimization target.

# Scope
- In:
  - Measure the current compiled contribution of circuit route modules using build output, source inspection, or a temporary analyzer.
  - Define a threshold for implementing lazy loading now, such as a meaningful initial chunk reduction or expected near-term circuit growth.
  - If above threshold, implement circuit-id dynamic imports and loading states in the smallest number of modules.
  - If below threshold, leave code unchanged and document the measurement.
  - Add tests or assertions that route lookup failures are handled cleanly if lazy loading is implemented.
- Out:
  - Optimizing unrelated app code.
  - Reworking the circuit data model without measured need.
  - Changing map visuals or replay choreography.

# Acceptance criteria
- AC1: The implementation agent can point to measured circuit route byte cost.
- AC2: Either route lazy loading is shipped with green gates, or the decision to defer is backed by measurement.
- AC3: Existing circuit map, chrono, GP, and replay flows remain stable.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: `docs/audits/circuit-route-loading-audit-2026-07-21.md` records route source size, esbuild bytes-in-output, gzip chunk size, and Vite sourcemap source share.
- request-AC2 -> This backlog slice. Proof: the report sets a lazy-loading threshold of 75 KB gzip, 30% sourcemap source share, or 40 route modules, and current measurements are below it.
- request-AC3 -> This backlog slice. Proof: no route-loading code changed, so existing synchronous CircuitMap, replay, chrono, and GP view behavior is preserved.
- request-AC4 -> This backlog slice. Proof: deferral rationale is recorded in the report and task closeout: current gain is meaningful but below threshold versus async race-view complexity.
- request-AC5 -> This backlog slice. Proof: typecheck, lint, tests, build, e2e, and Logics validation passed.

# Notes
- Decision: defer dynamic circuit route loading until route geometry exceeds 75 KB gzip in initial JS measurement, 30% of production main chunk source share, or 40 detailed route modules.
- Task `task_075_orchestrate_circuit_route_loading_audit` owns closeout validation.
- Task `task_075_orchestrate_circuit_route_loading_audit` was finished via `logics-manager flow finish task` on 2026-07-21.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_038_circuit_route_loading_audit_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_074_audit_circuit_data_impact_before_optimizing_route_loading`
- Primary task(s): `task_075_orchestrate_circuit_route_loading_audit`

# AI Context
- Summary: Measure and decide on circuit route lazy loading
- Keywords: scaffolded-backlog, measure and decide on circuit route lazy loading, implementation-ready
- Use when: Implementing the scaffolded slice for Measure and decide on circuit route lazy loading.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Set by scaffold input or defaulted for grooming.
