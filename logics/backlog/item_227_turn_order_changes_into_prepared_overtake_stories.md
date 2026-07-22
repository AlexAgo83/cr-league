## item_227_turn_order_changes_into_prepared_overtake_stories - Turn order changes into prepared overtake stories
> From version: 0.3.28
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 35%
> Complexity: Medium
> Theme: Replay storytelling
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Order changes can read as sudden swaps if the replay does not show a setup before the pass.
- The simulation already decides order changes, so the replay should stage them rather than inventing them.
- Overtake staging needs to respect canonical zones and live order.

# Scope
- In:
  - Enrich canonical overtake/order-change replay facts with deterministic phases such as `closing`, `attempt`, and `settled`.
  - Place the attempt inside a canonical overtake zone when possible, otherwise attach the best available sector/zone context.
  - Keep the staged story aligned with existing order-change progress and final classification.
  - Update replay/director consumers to render the phases from facts rather than reconstructing them independently.
  - Add tests for successful overtake staging, non-overtake races, and zone fallback behavior.
- Out:
  - Creating new overtakes for spectacle.
  - Adding failed overtake incidents unless simulation already emits a fact for them.
  - New camera choreography.

# Acceptance criteria
- AC1: Canonical order changes expose closing, attempt, and settled phases.
- AC2: Replay consumers use those phases without creating extra overtakes.
- AC3: Tests prove staged overtakes preserve live order and final classification.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: Canonical order changes expose closing, attempt, and settled phases.
- request-AC5 -> This backlog slice. Proof: AC2: Replay consumers use those phases without creating extra overtakes.
- request-AC8 -> This backlog slice. Proof: AC3: Tests prove staged overtakes preserve live order and final classification.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_060_race_replay_realism_layers_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_097_race_replay_realism_layers_after_canonical_trace`
- Primary task(s): `task_098_orchestrate_race_replay_realism_layers_after_canonical_trace`

# AI Context
- Summary: Turn order changes into prepared overtake stories
- Keywords: scaffolded-backlog, turn order changes into prepared overtake stories, implementation-ready
- Use when: Implementing the scaffolded slice for Turn order changes into prepared overtake stories.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Medium
- Rationale: Set by scaffold input or defaulted for grooming.
