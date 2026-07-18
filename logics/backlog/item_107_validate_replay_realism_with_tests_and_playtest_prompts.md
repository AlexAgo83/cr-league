## item_107_validate_replay_realism_with_tests_and_playtest_prompts - Validate replay realism with tests and playtest prompts
> From version: 0.3.6
> Schema version: 1.0
> Status: Ready
> Understanding: 91
> Confidence: 86
> Progress: 0
> Complexity: Medium
> Theme: Validation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Replay realism is partly qualitative, so unit tests alone will not prove the experience feels better.
- The implementation also needs deterministic guardrails so future changes do not reintroduce circuit-specific pacing artifacts.
- Another AI needs explicit validation commands and observation prompts to close the work confidently.

# Scope
- In:
  - Add unit tests for circuit distance normalization, replay staging determinism, final-order preservation, and multi-overtake behavior.
  - Add at least one test for legacy persisted results: a `RaceResult` without `replayTrace` or enrichment still produces a valid deterministic replay plan.
  - Cover heading continuity: a unit test proves car heading changes stay bounded through a sharp-turn route, and playtest prompts ask whether cornering and drift feel natural instead of snapping.
  - Update e2e replay checks to cover at least one representative resolved Grand Prix with staged movement and marker seeking.
  - Capture desktop and mobile screenshots for shortest, longest, and wet circuits, or document why automated coverage uses deterministic fixtures instead.
  - Update playtest notes or docs with prompts that ask whether the replay now feels coherent across circuits and whether overtakes read clearly.
  - Run the full local validation gate and record proof in Logics closeout.
- Out:
  - Formal visual-regression infrastructure.
  - Large manual playtest execution.
  - Analytics instrumentation.
  - Balancing player card strength or economy outcomes.

# Acceptance criteria
- AC1: Tests cover replay script determinism from the same result and circuit.
- AC2: Tests cover that final replay order equals final classification after one or more staged overtakes.
- AC3: Tests or screenshots cover representative circuit extremes.
- AC4: Documentation includes qualitative playtest prompts for replay coherence and arcade-plausible overtakes.
- AC5: Validation proof lists the exact commands run and any residual risk.

# AC Traceability
- request-AC6 -> This backlog slice. Proof: AC1: Tests cover replay script determinism from the same result and circuit.
- request-AC7 -> This backlog slice. Proof: AC3: Tests or screenshots cover representative circuit extremes.
- request-AC8 -> This backlog slice. Proof: AC1 and AC2: tests cover replay script determinism and that final replay order equals final classification after one or more staged overtakes.
- request-AC9 -> This backlog slice. Proof: AC5: Validation proof lists the exact commands run and any residual risk.
- request-AC10 -> This backlog slice. Proof: AC4: playtest prompts cover whether cornering and drift feel natural, alongside the heading-continuity unit test added in scope.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_017_coherent_race_replay_and_simulation_realism_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_046_make_race_simulation_and_replay_feel_coherent_across_circuits`
- Primary task(s): `task_047_orchestrate_coherent_replay_realism_and_circuit_normalization`

# AI Context
- Summary: Validate replay realism with tests and playtest prompts
- Keywords: scaffolded-backlog, validate replay realism with tests and playtest prompts, implementation-ready
- Use when: Implementing the scaffolded slice for Validate replay realism with tests and playtest prompts.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
