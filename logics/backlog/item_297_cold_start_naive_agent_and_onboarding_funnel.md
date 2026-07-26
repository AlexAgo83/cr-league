## item_297_cold_start_naive_agent_and_onboarding_funnel - Cold-start naive agent and onboarding funnel
> From version: 0.4.6
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: UX evaluation tooling
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Every existing playtest agent already knows the game; none measures whether a first-time user could get started using only visible text/affordances.
- Onboarding ease (OnboardingShell) is unmeasured — there is no funnel of where new users get stuck.

# Scope
- In:
  - Add a naive agent variant restricted to visible labels/text/affordances (no internal IDs, no decision-brain strategy) that attempts the first-session goals: reach first decision, run first race, make first purchase.
  - Emit an onboarding funnel: furthest step reached, where it got stuck, and which on-screen copy was missing or ambiguous.
- Out:
  - Redesigning onboarding.
  - Using the full decision brain for this variant (defeats the cold-start purpose).

# Acceptance criteria
- AC1: A cold-start agent restricted to visible affordances attempts the first-session goals.
- AC2: It emits an onboarding funnel with furthest step and stuck points.
- AC3: It flags missing/ambiguous on-screen copy encountered.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: A cold-start agent restricted to visible affordances attempts the first-session goals.
- request-AC5 -> This backlog slice. Proof: AC2: It emits an onboarding funnel with furthest step and stuck points.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_072_ai_ux_evaluation_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_120_ux_evaluation_harness_let_an_ai_judge_ui_ux_friction_and_onboarding_by_capturing_what_it_can_see_and_measure`
- Primary task(s): `task_121_orchestrate_the_ux_evaluation_harness`

# AI Context
- Summary: Cold-start naive agent and onboarding funnel
- Keywords: scaffolded-backlog, cold-start naive agent and onboarding funnel, implementation-ready
- Use when: Implementing the scaffolded slice for Cold-start naive agent and onboarding funnel.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
