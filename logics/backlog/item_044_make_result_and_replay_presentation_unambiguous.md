## item_044_make_result_and_replay_presentation_unambiguous - Make result and replay presentation unambiguous
> From version: 0.1.0
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
> Complexity: Medium
> Theme: Result comprehension
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The first visual replay pass is technically derived from result data but can still be misunderstood as a live or positional race simulation.
- Players need separate cues for final classification, causal explanation, visual summary, and written report.
- The post-GP moment should feel like the payoff of the player's directive, not a set of disconnected cards.

# Scope
- In:
  - Redesign the post-GP result area into an explicit sequence: headline outcome, player consequence, final classification, replay summary, key moments, report.
  - Rename and label replay elements so users know whether they are looking at final positions, weather phases, events, or narrative report.
  - Keep the visual replay honest if it remains static; do not imply precise lap-by-lap car movement unless implemented.
  - Improve empty and low-event states so the result page still explains the race.
  - Route all result/replay labels through EN/FR catalogs.
- Out:
  - Full animated race replay.
  - New simulation event types.
  - Replay controls or scrubber.
  - Canvas or 3D implementation.

# Acceptance criteria
- AC1: A resolved GP result view clearly labels outcome, classification, replay summary, key moments, and report.
- AC2: The replay panel text explains what the user is looking at without relying on external instructions.
- AC3: The current static replay does not visually imply precision that the data does not support.
- AC4: Unit or e2e assertions cover the key result/replay labels in at least one locale.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1: A resolved GP result view clearly labels outcome, classification, replay summary, key moments, and report.
- request-AC4 -> This backlog slice. Proof: AC2: The replay panel text explains what the user is looking at without relying on external instructions.
- request-AC5 -> This backlog slice. Proof: AC3: The current static replay does not visually imply precision that the data does not support.
- request-AC7 -> This backlog slice. Proof: AC4: Unit or e2e assertions cover the key result/replay labels in at least one locale.
- request-AC8 -> This backlog slice. Proof: AC4: Unit or e2e assertions cover the key result/replay labels in at least one locale.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_003_race_cockpit_redesign_v0_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_032_redesign_the_cr_league_race_cockpit_v0`
- Primary task(s): `task_033_orchestrate_race_cockpit_redesign_v0`

# AI Context
- Summary: Make result and replay presentation unambiguous
- Keywords: scaffolded-backlog, make result and replay presentation unambiguous, implementation-ready
- Use when: Implementing the scaffolded slice for Make result and replay presentation unambiguous.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
