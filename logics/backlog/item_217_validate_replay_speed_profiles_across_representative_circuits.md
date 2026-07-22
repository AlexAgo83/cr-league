## item_217_validate_replay_speed_profiles_across_representative_circuits - Validate replay speed profiles across representative circuits
> From version: 0.3.28
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Validation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- A curvature heuristic can look good on one route and bad on another if not checked across route shapes.
- Long circuits, tight technical circuits, mostly straight circuits, and pit-stop races stress different parts of the replay motion model.
- The feature should not ship as a hidden subjective tweak without representative proof.

# Scope
- In:
  - Add focused unit tests for generated profile shape and replay progress mapping.
  - Run or extend `audit:circuits` to summarize profile coverage and flag suspicious circuits.
  - Check representative circuits: mostly straight/main-straight-heavy, tight technical, long route, and pit-stop replay.
  - Record validation proof in the orchestration task closeout.
- Out:
  - Manual visual review for every circuit as a blocking gate.
  - Playwright pixel-perfect animation assertions.
  - Balance simulation or card tuning.

# Acceptance criteria
- AC1: Tests cover at least one straight route, one tight-corner route, one long route, and one pit-stop replay path.
- AC2: Circuit audit reports or validates generated speed-profile health for every current circuit.
- AC3: Validation evidence is recorded before closeout.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: Tests cover at least one straight route, one tight-corner route, one long route, and one pit-stop replay path.
- request-AC4 -> This backlog slice. Proof: AC2: Circuit audit reports or validates generated speed-profile health for every current circuit.
- request-AC6 -> This backlog slice. Proof: AC3: Validation evidence is recorded before closeout.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_058_canonical_corner_speed_profile_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_095_canonical_corner_speed_profile_for_replay_motion`
- Primary task(s): `task_096_orchestrate_canonical_corner_speed_profile_for_replay_motion`

# AI Context
- Summary: Validate replay speed profiles across representative circuits
- Keywords: scaffolded-backlog, validate replay speed profiles across representative circuits, implementation-ready
- Use when: Implementing the scaffolded slice for Validate replay speed profiles across representative circuits.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
