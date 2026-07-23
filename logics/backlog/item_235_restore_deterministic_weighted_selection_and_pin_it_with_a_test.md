## item_235_restore_deterministic_weighted_selection_and_pin_it_with_a_test - Restore deterministic weighted selection and pin it with a test
> From version: 0.4.1
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Simulation determinism
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.
> Non-semantic edit: 2026-07-23 corpus grooming note added; no status/progress change.
> Semantic edit: 2026-07-23 clarified priority rationale during corpus-wide grooming.

# Problem
- pickWeightedWithNext (prng.ts:20-38) walks Object.entries(weights) in insertion order, so a semantically-equal weather forecast with keys in a different order consumes the draw differently and returns a different key for the same seed.
- This breaks the deterministic, replayable simulation the whole game is built around, and no test currently guards it (simulateRace.test.ts only checks a value equals itself).

# Scope
- In:
  - Sort entries by key before computing the total and walking the cursor in pickWeightedWithNext, and make the total<=0 fallback index the same stable order.
  - Add a determinism regression test: two forecasts with equal weights but different key insertion order yield identical resolved weather for a fixed seed.
- Out:
  - Replacing the LCG with a different PRNG algorithm.
  - Changing weight values or the weather model.
  - Touching non-weighted next() consumers.

# Acceptance criteria
- AC1: Weighted selection is key-order independent for equal weights.
- AC2: A regression test proves reordered-but-equal forecasts produce identical resolved weather for the same seed.
- AC3: Existing simulation tests stay green.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Weighted selection is key-order independent for equal weights.
- request-AC8 -> This backlog slice. Proof: AC2: A regression test proves reordered-but-equal forecasts produce identical resolved weather for the same seed.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_062_review_findings_remediation_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_099_review_findings_remediation_replay_determinism_dead_card_effects_client_storage_safety_api_security_and_scale_admin_config_integrity_and_over_engineering_cleanup`
- Primary task(s): `task_100_orchestrate_review_findings_remediation`

# AI Context
- Summary: Restore deterministic weighted selection and pin it with a test
- Keywords: scaffolded-backlog, restore deterministic weighted selection and pin it with a test, implementation-ready
- Use when: Implementing the scaffolded slice for Restore deterministic weighted selection and pin it with a test.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Replay determinism is a core product invariant and must be fixed before further simulation/replay work.
