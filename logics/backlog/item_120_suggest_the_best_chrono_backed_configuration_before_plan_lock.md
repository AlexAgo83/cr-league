## item_120_suggest_the_best_chrono_backed_configuration_before_plan_lock - Suggest the best chrono-backed configuration before plan lock
> From version: 0.3.7
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Plan validation
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The player can lock a final plan that ignores their best chrono evidence, and the app does not help them connect chrono learning to the final directive.

# Scope
- In:
  - Compute the player's best chrono run for the current GP and compare its decision to the current form.
  - In the Send Plan confirmation modal, show an evidence card when the best chrono config differs from the current plan.
  - Explain what would change: approach, preparation, card, or no-card choice.
  - Provide a small action to apply the best chrono config if local state can be safely updated before submit; otherwise show guidance only.
  - Add tests for matching config (no warning), differing config (suggestion shown), and optional apply action if implemented.
- Out:
  - Automatic plan replacement without user action.
  - Optimization beyond observed chrono runs.
  - New API endpoint.

# Acceptance criteria
- AC1: The plan confirmation modal surfaces the best chrono setup when it differs from the current plan.
- AC2: If the current plan already matches the best chrono setup, the modal confirms that the plan matches observed evidence.
- AC3: The player can still submit their chosen plan.
- AC4: Tests cover the modal states.

# AC Traceability
- request-AC3 -> This backlog slice. Proof: AC1: The plan confirmation modal surfaces the best chrono setup when it differs from the current plan.
- request-AC9 -> This backlog slice. Proof: AC2: If the current plan already matches the best chrono setup, the modal confirms that the plan matches observed evidence.
- request-AC10 -> This backlog slice. Proof: AC3: The player can still submit their chosen plan.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_020_race_learning_and_feedback_systems_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_049_race_learning_and_feedback_systems`
- Primary task(s): `task_050_orchestrate_race_learning_and_feedback_systems`

# AI Context
- Summary: Suggest the best chrono-backed configuration before plan lock
- Keywords: scaffolded-backlog, suggest the best chrono-backed configuration before plan lock, implementation-ready
- Use when: Implementing the scaffolded slice for Suggest the best chrono-backed configuration before plan lock.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
