## item_296_friction_accessibility_instrumentation_with_axe_core - Friction + accessibility instrumentation with axe-core
> From version: 0.4.6
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 10%
> Complexity: Medium
> Theme: UX evaluation tooling
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- No signal exists for actions-per-task, dead-ends, hesitation, or thrown console errors during a run.
- On mobile there is no check for sub-minimum tap targets or page-body overflow.
- There is no automated accessibility checker at all (only hand-written aria-* attributes).

# Scope
- In:
  - Instrument the run to record actions-per-task, retries, dead-ends/hesitations, and thrown console errors/warnings.
  - On the mobile viewport, flag tap targets below the accessible minimum and any horizontal page-body overflow.
  - Add axe-core as the automated a11y pass and include its violations in a friction report under reports/.
- Out:
  - Fixing the flagged issues (downstream per finding).
  - Contrast/design retuning.

# Acceptance criteria
- AC1: A friction report captures actions-per-task, dead-ends/hesitations, and console errors.
- AC2: Mobile sub-minimum tap targets and page-body overflow are flagged.
- AC3: An axe-core pass runs and its violations appear in the report.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: A friction report captures actions-per-task, dead-ends/hesitations, and console errors.
- request-AC3 -> This backlog slice. Proof: AC2: Mobile sub-minimum tap targets and page-body overflow are flagged.
- request-AC5 -> This backlog slice. Proof: AC3: An axe-core pass runs and its violations appear in the report.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_072_ai_ux_evaluation_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_120_ux_evaluation_harness_let_an_ai_judge_ui_ux_friction_and_onboarding_by_capturing_what_it_can_see_and_measure`
- Primary task(s): `task_121_orchestrate_the_ux_evaluation_harness`

# AI Context
- Summary: Friction + accessibility instrumentation with axe-core
- Keywords: scaffolded-backlog, friction + accessibility instrumentation with axe-core, implementation-ready
- Use when: Implementing the scaffolded slice for Friction + accessibility instrumentation with axe-core.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
