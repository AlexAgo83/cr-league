## item_269_polish_mobile_replay_overlays_and_shared_map_controls - Polish mobile replay overlays and shared map controls
> From version: 0.4.3
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 66%
> Complexity: Medium
> Theme: Replay mobile ergonomics
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Replay mobile overlays waste space and diverge from the standard map controls.

# Scope
- In:
  - Fix mobile info-panel sizing and button positioning.
  - Merge gap chips into the active race-follow panel without the position badge.
  - Lift and persist the map stats expanded state, then pass it to standard and replay maps.
  - Deliver one commit per visible step.
- Out:
  - Replay simulation, camera, ordering, or timing changes.

# Acceptance criteria
- AC1: Mobile bounds prove the Info button is contained by the status panel.
- AC2: One race-follow panel contains copy and gap chips; no standalone player-focus panel remains.
- AC3: One persisted preference controls traits visibility in DriveView and ReplayView.
- AC4: Each wave is independently committed and validated.

# AC Traceability
- request-AC1 -> This backlog slice. Proof: responsive panel positioning and browser geometry check.
- request-AC2 -> This backlog slice. Proof: ReplayStageOverlay composition and focused rendering assertions.
- request-AC3 -> This backlog slice. Proof: shared App state and replay/drive control tests.
- request-AC4 -> This backlog slice. Proof: staged commits and final validation record.

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
- Request: `logics/request/req_111_polish_mobile_replay_overlays_and_shared_map_controls.md`
- Primary task(s): (none yet)

# AI Context
- Summary: Polish mobile replay overlays and shared map controls
- Keywords: backlog-groom, request, polish mobile replay overlays and shared map controls, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Polish mobile replay overlays and shared map controls.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: Medium
- Rationale: Default until groomed.

# Notes
- Hybrid rationale: Derived from request `req_111_polish_mobile_replay_overlays_and_shared_map_controls` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_111_polish_mobile_replay_overlays_and_shared_map_controls.md`.
- Generated locally by logics-manager.

# Tasks
- `task_112_polish_mobile_replay_overlays_and_shared_map_controls`
