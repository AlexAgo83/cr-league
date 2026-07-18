## item_116_add_overtake_and_position_change_highlights - Add overtake and position-change highlights
> From version: 0.3.6
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 70%
> Complexity: Medium
> Theme: Replay action feedback
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Overtakes may happen in the replay plan, but they are easy to miss unless the viewer watches the right car at the right second.
- The tower, timeline, and car markers should briefly reinforce important position changes.
- Small highlights can create excitement without adding a heavy animation system.

# Scope
- In:
  - Map replay overtake/director beats to visual highlights near cars, tower rows, and timeline markers.
  - Use concise labels such as `P5 -> P4`, `Attack`, `Defense`, or `+1 pos` when backed by replay facts/events.
  - Pulse or accent changed tower rows during the beat window.
  - Add timeline cues for overtake and player-relevant beats.
  - Keep highlight timing deterministic and tied to replay progress, including seeking.
  - Ensure highlights do not obscure the car cluster or map controls on desktop/mobile.
- Out:
  - Adding particle systems or complex animation libraries.
  - Highlighting every minor gap change.
  - Changing how tower order is computed.
  - Adding sound effects.

# Acceptance criteria
- AC1: At least one overtake beat creates a visible car/tower/timeline highlight.
- AC2: Seeking into and out of the beat window deterministically shows/hides the highlight.
- AC3: Player-relevant position changes are visually distinguishable from neutral field changes.
- AC4: Highlight labels are localized and concise.
- AC5: Tests cover highlight mapping and seek behavior.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: At least one overtake beat creates a visible car/tower/timeline highlight.
- request-AC6 -> This backlog slice. Proof: AC2: Seeking into and out of the beat window deterministically shows/hides the highlight.
- request-AC7 -> This backlog slice. Proof: AC3: Player-relevant position changes are visually distinguishable from neutral field changes.
- request-AC8 -> This backlog slice. Proof: AC4: Highlight labels are localized and concise.
- request-AC9 -> This backlog slice. Proof: AC5: Tests cover highlight mapping and seek behavior.
- request-AC10 -> This backlog slice. Proof: AC5: Tests cover highlight mapping and seek behavior.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_019_replay_spectacle_fun_pass_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_048_make_race_replay_feel_like_a_fun_race_spectacle`
- Primary task(s): `task_049_orchestrate_replay_spectacle_fun_pass`

# AI Context
- Summary: Add overtake and position-change highlights
- Keywords: scaffolded-backlog, add overtake and position-change highlights, implementation-ready
- Use when: Implementing the scaffolded slice for Add overtake and position-change highlights.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
