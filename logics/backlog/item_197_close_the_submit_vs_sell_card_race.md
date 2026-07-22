## item_197_close_the_submit_vs_sell_card_race - Close the submit-vs-sell card race
> From version: 0.3.27
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: API integrity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- submitDecision's card-ownership guard (store.ts:538) reads team.cards from the pre-transaction requireTeamClaim read (store.ts:532) and is not re-checked inside runWrite; submitDecision locks the GP row while sellCard locks the team row, so a concurrent sell-then-submit can attach a just-sold card to the plan.
- sellCard's in-use guards (store.ts:433-438) are the mirror image and only sell-vs-sell is covered by app.postgres.test.ts; sell-vs-submit is uncovered.

# Scope
- In:
  - Move the card-ownership and qualifying-lock checks in submitDecision inside the runWrite block on a fresh team read, and take lockTeamRow so submit and sell serialize on the same row.
  - Re-validate sellCard's in-use guards (current decisions and qualifying lock) against fresh state inside its transaction.
  - Add a sell-vs-submit Postgres integration test alongside the existing sell-vs-sell coverage.
- Out:
  - Changing the claim-code model or the decision API shape.
  - Reworking the GP-lock/resolve path already fixed in req_085.
  - Locking unrelated write paths.

# Acceptance criteria
- AC1: submitDecision and sellCard re-check card validity inside their locked transactions on a fresh read.
- AC2: A concurrent sell-then-submit cannot attach or keep an invalid card, proven by an integration test.
- AC3: The existing concurrency tests stay green.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: submitDecision and sellCard re-check card validity inside their locked transactions on a fresh read.
- request-AC6 -> This backlog slice. Proof: AC2: A concurrent sell-then-submit cannot attach or keep an invalid card, proven by an integration test.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_052_post_remediation_hardening_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_088_post_remediation_hardening_submit_sell_concurrency_client_security_and_privacy_accessibility_data_model_integrity_and_config_validation`
- Primary task(s): `task_089_orchestrate_post_remediation_hardening`

# AI Context
- Summary: Close the submit-vs-sell card race
- Keywords: scaffolded-backlog, close the submit-vs-sell card race, implementation-ready
- Use when: Implementing the scaffolded slice for Close the submit-vs-sell card race.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
