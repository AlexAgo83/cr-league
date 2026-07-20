## item_141_single_recommended_cta_at_grand_prix_start - Single recommended CTA at Grand Prix start
> From version: 0.3.11
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: First-session UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- On a fresh GP, Edit plan and New lap time pulse simultaneously because their highlight conditions are independent, so the recommended first action is ambiguous.
- The playtest that produced roadmap patch 0.3.16 found players hesitating at exactly this fork.

# Scope
- In:
  - Gate the plan CTAs' highlight-command on the existence of at least one qualifying attempt (or a submitted plan), so only the chrono CTA pulses at GP start.
  - Keep the existing highlight-clearing behavior on click and the per-state primary command mapping unchanged.
  - Coordinate with the req_058 command-clicked collapse: implement on whichever structure is in main when this starts.
  - Update App.test.tsx highlight assertions and the e2e highlight lifecycle spec to the single-recommendation behavior.
- Out:
  - Changing the desk phase machine or button order.
  - New animation styles.

# Acceptance criteria
- AC1: With no plan and zero attempts, only the chrono CTA carries highlight-command.
- AC2: After one attempt, the plan path highlights as today.
- AC3: Unit and e2e highlight tests pass with the new rule.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: With no plan and zero attempts, only the chrono CTA carries highlight-command.
- request-AC4 -> This backlog slice. Proof: AC2: After one attempt, the plan path highlights as today.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_023_first_gp_action_clarity_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_059_first_gp_action_clarity_one_recommended_cta_plan_recommendation_and_vocabulary_harmonization`
- Primary task(s): `task_060_orchestrate_first_gp_action_clarity`

# AI Context
- Summary: Single recommended CTA at Grand Prix start
- Keywords: scaffolded-backlog, single recommended cta at grand prix start, implementation-ready
- Use when: Implementing the scaffolded slice for Single recommended CTA at Grand Prix start.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
