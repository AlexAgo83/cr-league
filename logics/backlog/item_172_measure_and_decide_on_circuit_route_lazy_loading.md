## item_172_measure_and_decide_on_circuit_route_lazy_loading - Measure and decide on circuit route lazy loading
> From version: 0.3.26
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
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
- request-AC1 -> This backlog slice. Proof: AC1: The implementation agent can point to measured circuit route byte cost.
- request-AC2 -> This backlog slice. Proof: AC2: Either route lazy loading is shipped with green gates, or the decision to defer is backed by measurement.
- request-AC3 -> This backlog slice. Proof: AC3: Existing circuit map, chrono, GP, and replay flows remain stable.
- request-AC4 -> This backlog slice. Proof: AC3: Existing circuit map, chrono, GP, and replay flows remain stable.
- request-AC5 -> This backlog slice. Proof: AC3: Existing circuit map, chrono, GP, and replay flows remain stable.

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
