## item_034_improve_race_recap_readability - Improve race recap readability
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Playtest UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
The result screen reports classification and events, but it does not clearly connect the player's directive to what happened or what to learn for the next GP. Improve the recap using existing data before investing in a visual replay engine.

# Scope
- In:
  - player-focused race recap panel;
  - key difference, directive, and next-GP takeaway sections;
  - prioritized event timeline;
  - key event vs track note labels;
  - EN/FR copy and tests.
- Out:
  - backend report schema changes;
  - new simulation event generation;
  - visual track replay;
  - analytics or telemetry.

# Acceptance criteria
- AC1: A resolved GP shows a player race recap panel.
- AC2: The recap includes key difference, player directive, and next-GP takeaway.
- AC3: The timeline shows player/major events before ambience notes.
- AC4: Event labels distinguish key events from track notes.
- AC5: Unit/e2e tests cover the recap.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1 covers the recap panel.
- request-AC2 -> This backlog slice. Proof: AC2 covers recap content.
- request-AC3 -> This backlog slice. Proof: AC3 covers timeline priority.
- request-AC4 -> This backlog slice. Proof: AC4 covers event labels.
- request-AC5 -> This backlog slice. Proof: AC5 covers tests.

# Decision framing
- Product framing: Improve learning loop after the player resolves a GP.
- Product signals: Playtest feedback asked for better explanation of why results happened.
- Product follow-up: Visual replay should wait until this text recap proves the right information hierarchy.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `req_028_improve_race_recap_readability`
- Primary task(s): `task_029_improve_race_recap_readability`

# AI Context
- Summary: Improve result readability with a player-focused race recap and prioritized timeline.
- Keywords: backlog, race-recap, replay, UX, playtest, learning-loop
- Use when: Use when implementing or reviewing the delivery slice for Improve race recap readability.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: High
- Rationale: This is the next comprehension gap after pre-GP guidance and garage progression.

# Notes
- Hybrid rationale: Derived from request `req_028_improve_race_recap_readability` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_028_improve_race_recap_readability.md`.
- Generated locally by logics-manager.
- Task `task_029_improve_race_recap_readability` was finished via `logics-manager flow finish task` on 2026-07-14.

# Tasks
- `task_029_improve_race_recap_readability`
