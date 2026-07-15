## item_068_add_a_dynamic_pit_wall_plan_summary - Add a dynamic pit wall plan summary
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Low
> Theme: Decision feedback
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The current panel never reflects the player's full directive back as a coherent strategy.
- A first-time player needs confirmation that the selected controls form one race plan.
- Without a summary, the confirmation modal has to carry too much meaning too late.

# Scope
- In:
  - Add a summary section inside the directive surface that names the selected approach, preparation, and card.
  - Use one short sentence to explain the current plan's intent and risk.
  - Mention whether qualifying attempts remain before the lock action when relevant.
  - Keep the summary deterministic and copy-driven; do not introduce new scoring or prediction math.
- Out:
  - Outcome prediction.
  - Win probability.
  - AI-generated recommendations.
  - Detailed race simulation preview.

# Acceptance criteria
- AC1: The summary updates when approach, preparation, or card changes.
- AC2: The summary is visible before the lock CTA on desktop and mobile.
- AC3: The summary never promises a result; it describes intent and risk only.
- AC4: The summary remains visible in read-only form after the directive is locked.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: The summary updates when approach, preparation, or card changes.
- request-AC5 -> This backlog slice. Proof: AC2: The summary is visible before the lock CTA on desktop and mobile.
- request-AC6 -> This backlog slice. Proof: AC3: The summary never promises a result; it describes intent and risk only.
- request-AC7 -> This backlog slice. Proof: AC4: The summary remains visible in read-only form after the directive is locked.
- request-AC9 -> This backlog slice. Proof: AC4: The summary remains visible in read-only form after the directive is locked.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_009_pit_wall_race_plan_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_038_redesign_the_race_directive_into_a_clear_pit_wall_plan`
- Primary task(s): `task_039_orchestrate_pit_wall_race_plan_clarity`

# AI Context
- Summary: Add a dynamic pit wall plan summary
- Keywords: scaffolded-backlog, add a dynamic pit wall plan summary, implementation-ready
- Use when: Implementing the scaffolded slice for Add a dynamic pit wall plan summary.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
