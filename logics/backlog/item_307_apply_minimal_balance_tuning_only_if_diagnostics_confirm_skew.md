## item_307_apply_minimal_balance_tuning_only_if_diagnostics_confirm_skew - Apply minimal balance tuning only if diagnostics confirm skew
> From version: 0.4.6
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 60%
> Complexity: Medium
> Theme: Balance tuning
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Aggressive mini-pack may be too strong, but the current evidence does not justify a blind nerf.
- Any tuning can easily reduce comeback rate or close finishes if it overcorrects the exciting strategy lane.
- The repo already has balance gates and focused simulation tests that should be reused for proof.

# Scope
- In:
  - If diagnostics confirm skew, adjust the smallest existing balance constant or decision delta needed.
  - Add or update focused tests or balance gate evidence that proves strategy variety improved without major fun regression.
  - Record before/after metrics in the closeout report.
- Out:
  - Rewriting personas, adding new card mechanics, or changing circuit data wholesale.
  - Tuning if the grouped diagnostics show the finding is sample-driven or acceptable.

# Acceptance criteria
- AC1: Any tuning has explicit before/after metrics from deterministic runs.
- AC2: Existing balance and replayability gates pass after tuning.
- AC3: If no tuning is applied, the task records the diagnostic reason and leaves no speculative balance change.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: Any tuning has explicit before/after metrics from deterministic runs.
- request-AC3 -> This backlog slice. Proof: AC2: Existing balance and replayability gates pass after tuning.
- request-AC4 -> This backlog slice. Proof: AC3: If no tuning is applied, the task records the diagnostic reason and leaves no speculative balance change.
- request-AC5 -> This backlog slice. Proof: AC3: If no tuning is applied, the task records the diagnostic reason and leaves no speculative balance change.
- request-AC6 -> This backlog slice. Proof: AC3: If no tuning is applied, the task records the diagnostic reason and leaves no speculative balance change.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_075_aggressive_mini_pack_balance_diagnostic_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_123_aggressive_mini_pack_balance_diagnostic_verify_and_correct_win_concentration_without_blind_nerfs`
- Primary task(s): `task_124_orchestrate_aggressive_mini_pack_balance_diagnostic`

# AI Context
- Summary: Apply minimal balance tuning only if diagnostics confirm skew
- Keywords: scaffolded-backlog, apply minimal balance tuning only if diagnostics confirm skew, implementation-ready
- Use when: Implementing the scaffolded slice for Apply minimal balance tuning only if diagnostics confirm skew.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
