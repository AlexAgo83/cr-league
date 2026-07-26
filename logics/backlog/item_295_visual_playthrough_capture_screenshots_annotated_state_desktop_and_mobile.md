## item_295_visual_playthrough_capture_screenshots_annotated_state_desktop_and_mobile - Visual playthrough capture: screenshots + annotated state, desktop and mobile
> From version: 0.4.6
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 65%
> Complexity: Medium
> Theme: UX evaluation tooling
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Nothing captures screenshots or on-screen state during a play session, so the interface cannot be reviewed after a run.
- Recent mobile-sensitive work shipped with no visual capture on a ~390px viewport.
- The browser agent produces outcomes, not a reviewable visual artifact.

# Scope
- In:
  - Hook the req_119 browser agent to capture a full-page screenshot plus a structured annotation (step, screen name, what was seen/done) at each meaningful step, on a desktop and a ~390px mobile viewport.
  - Assemble the captures into one reviewable playthrough (markdown or self-contained gallery) under reports/.
  - Reuse the agent's existing on-screen reads for the annotations.
- Out:
  - Judging the screenshots (separate reviewing step).
  - Multi-browser matrices beyond one desktop + one mobile viewport.

# Acceptance criteria
- AC1: A run yields per-step screenshots + annotations on desktop and mobile.
- AC2: They are assembled into one reviewable gallery/markdown under reports/.
- AC3: Capture reuses the existing agent navigation, no second driver.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: A run yields per-step screenshots + annotations on desktop and mobile.
- request-AC5 -> This backlog slice. Proof: AC2: They are assembled into one reviewable gallery/markdown under reports/.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_072_ai_ux_evaluation_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_120_ux_evaluation_harness_let_an_ai_judge_ui_ux_friction_and_onboarding_by_capturing_what_it_can_see_and_measure`
- Primary task(s): `task_121_orchestrate_the_ux_evaluation_harness`

# AI Context
- Summary: Visual playthrough capture: screenshots + annotated state, desktop and mobile
- Keywords: scaffolded-backlog, visual playthrough capture: screenshots + annotated state, desktop and mobile, implementation-ready
- Use when: Implementing the scaffolded slice for Visual playthrough capture: screenshots + annotated state, desktop and mobile.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
