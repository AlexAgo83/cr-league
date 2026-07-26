## item_302_one_shared_definition_of_replay_order_classification_gaps_with_a_golden_test - One shared definition of replay order/classification/gaps with a golden test
> From version: 0.4.6
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 90%
> Complexity: Medium
> Theme: Replay fidelity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- replayMath.ts (447 lines, 40+ exports) re-derives order/live-classification/gaps from the sparse replayTrace and is coupled to the emitter's internal trace format.
- It has zero test coverage — the single highest-value test gap; a bug silently corrupts every replay.
- The animated order can diverge from the authoritative classification with no guard.

# Scope
- In:
  - Move the interpolation/order/gap helpers (replayOrderAtProgress, liveClassificationByCarProgress, carProgressAtTrace, isCanonicalReplayTrace, shouldSmoothReplayTrace) into shared beside replayTrace.ts as the single definition (or have the sim emit a per-frame stream).
  - Add a golden test snapshotting a fixed-seed trace through them and asserting stable interpolated positions.
  - Update ReplayView/CircuitMap/useReplayClock to consume the shared version.
- Out:
  - Changing replay visuals or choreography.
  - The DTO/helper items above.

# Acceptance criteria
- AC1: Replay order/classification/gap derivation has one shared definition.
- AC2: A golden/determinism test pins a fixed-seed trace's interpolated positions.
- AC3: Replays render identically to before.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: Replay order/classification/gap derivation has one shared definition.
- request-AC6 -> This backlog slice. Proof: AC2: A golden/determinism test pins a fixed-seed trace's interpolated positions.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_074_cross_package_source_of_truth_remediation_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_122_review_remediation_one_source_of_truth_for_cross_package_contracts_and_helpers_decompose_god_modules_close_test_gaps`
- Primary task(s): `task_123_orchestrate_the_source_of_truth_remediation`

# AI Context
- Summary: One shared definition of replay order/classification/gaps with a golden test
- Keywords: scaffolded-backlog, one shared definition of replay order/classification/gaps with a golden test, implementation-ready
- Use when: Implementing the scaffolded slice for One shared definition of replay order/classification/gaps with a golden test.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
