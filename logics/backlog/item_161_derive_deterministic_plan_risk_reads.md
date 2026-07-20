## item_161_derive_deterministic_plan_risk_reads - Derive deterministic plan risk reads
> From version: 0.3.11
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Plan comprehension
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Players can configure a directive but do not get a compact read of whether the plan is safe, risky, or high-upside before committing it.
- A full prediction model would be too heavy for this stage; the product needs explainable heuristics from existing data.

# Scope
- In:
  - Add a deterministic helper that derives risk tier, strength, failure mode, and target finishing band from existing race/plan inputs.
  - Cover safe, risky, and high-upside examples with focused unit tests.
  - Keep the helper pure and independent of API persistence.
- Out:
  - Changing simulateRace or reward math.
  - Adding probability distributions or exact finish predictions.
  - Persisting new directive fields.

# Acceptance criteria
- AC3: Heuristic reacts to directive settings, forecast/circuit/card, and qualifying/grid context.
- AC4: No simulation, API, or persisted directive behavior changes.
- AC6: Unit tests cover safe/risky/high-upside representative cases.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC3: Heuristic reacts to directive settings, forecast/circuit/card, and qualifying/grid context.
- request-AC4 -> This backlog slice. Proof: AC4: No simulation, API, or persisted directive behavior changes.
- request-AC6 -> This backlog slice. Proof: AC6: Unit tests cover safe/risky/high-upside representative cases.
- request-AC7 -> This backlog slice. Proof: AC6: Unit tests cover safe/risky/high-upside representative cases.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_031_plan_risk_readability_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_067_plan_risk_readability_layer`
- Primary task(s): `task_068_orchestrate_plan_risk_readability_layer`

# AI Context
- Summary: Derive deterministic plan risk reads
- Keywords: scaffolded-backlog, derive deterministic plan risk reads, implementation-ready
- Use when: Implementing the scaffolded slice for Derive deterministic plan risk reads.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
