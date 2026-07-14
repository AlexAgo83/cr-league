## item_035_improve_race_desk_immersion_ui - Improve race desk immersion UI
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Race desk UX guidance
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
The private-league race desk still makes players infer the next action. Submit directive, launch GP, settings, and next GP are close together, so the screen feels like a generic form instead of a race-weekend command desk.

# Scope
- In:
  - state badge for prepare, ready to launch, and resolved race;
  - pit-wall hierarchy and telemetry treatment around the race briefing;
  - one visually dominant command per state;
  - EN/FR copy and automated coverage;
  - desktop/mobile visual check of the changed states.
- Out:
  - new game mechanics;
  - full visual track replay;
  - card economy depth;
  - scheduler/auth/deployment work.

# Acceptance criteria
- AC1: The race desk shows an explicit state for preparing, ready to launch, and resolved race.
- AC2: Each state has one visually dominant command matching the next expected action.
- AC3: The desk includes light pit-wall/race telemetry treatment without adding a UI framework or new gameplay rules.
- AC4: English and French catalogs include the new user-facing race desk copy.
- AC5: Desktop and mobile views are visually checked and automated tests cover the state labels.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: AC1 keeps explicit desk states.
- request-AC2 -> This backlog slice. Proof: AC2 keeps a single dominant command per state.
- request-AC3 -> This backlog slice. Proof: AC3 bounds the treatment to pit-wall hierarchy and telemetry.
- request-AC4 -> This backlog slice. Proof: AC4 requires EN/FR copy.
- request-AC5 -> This backlog slice. Proof: AC5 requires visual and automated validation.

# Decision framing
- Product framing: Not needed
- Product signals: (none detected)
- Product follow-up: No product brief follow-up is expected based on current signals.
- Architecture framing: Not needed
- Architecture signals: (none detected)
- Architecture follow-up: No architecture decision follow-up is expected based on current signals.

# Links
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
- Request: `req_029_improve_race_desk_immersion_ui`
- Primary task(s): `task_030_improve_race_desk_immersion_ui`

# AI Context
- Summary: Improve race desk immersion and next-action clarity without expanding mechanics.
- Keywords: backlog-groom, race-desk, pit-wall, UX-guidance, visual-validation
- Use when: Implementing or reviewing the delivery slice for race desk state hierarchy.
- Skip when: The change is unrelated to the main race desk or adds gameplay depth.

# Priority
- Priority: Medium
- Rationale: Addresses the top playtest weakness, but stays below engine correctness and multiplayer blockers.

# Notes
- Hybrid rationale: Derived from request `req_029_improve_race_desk_immersion_ui` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_029_improve_race_desk_immersion_ui.md`.
- Generated locally by logics-manager.
- Task `task_030_improve_race_desk_immersion_ui` was finished via `logics-manager flow finish task` on 2026-07-14.

# Tasks
- `task_030_improve_race_desk_immersion_ui`
