## item_162_render_plan_risk_summary_before_commitment - Render plan risk summary before commitment
> From version: 0.3.11
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Plan UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The risk read only helps if it appears while the player is choosing and again before the commitment click.
- The UI must stay compact so it does not compete with directive controls.

# Scope
- In:
  - Render the risk/readability summary in PlanView near the directive controls.
  - Repeat the summary inside the send-plan confirmation modal.
  - Add EN/FR copy and targeted render/e2e assertions.
- Out:
  - A new modal flow or wizard.
  - New visual dependencies.
  - Changing the send-plan action semantics.

# Acceptance criteria
- AC1: Plan screen shows the compact risk/readability panel.
- AC2: Send-plan confirmation repeats the same summary.
- AC5: EN/FR copy is present.
- AC6: Existing plan flow tests still pass.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Plan screen shows the compact risk/readability panel.
- request-AC2 -> This backlog slice. Proof: AC2: Send-plan confirmation repeats the same summary.
- request-AC5 -> This backlog slice. Proof: AC5: EN/FR copy is present.
- request-AC6 -> This backlog slice. Proof: AC6: Existing plan flow tests still pass.
- request-AC7 -> This backlog slice. Proof: AC6: Existing plan flow tests still pass.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_031_plan_risk_readability_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_067_plan_risk_readability_layer`
- Primary task(s): `task_068_orchestrate_plan_risk_readability_layer`

# AI Context
- Summary: Render plan risk summary before commitment
- Keywords: scaffolded-backlog, render plan risk summary before commitment, implementation-ready
- Use when: Implementing the scaffolded slice for Render plan risk summary before commitment.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
