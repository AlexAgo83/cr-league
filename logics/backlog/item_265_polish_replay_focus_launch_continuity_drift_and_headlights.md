## item_265_polish_replay_focus_launch_continuity_drift_and_headlights - Polish replay focus, launch continuity, drift, and headlights
> From version: 0.4.3
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: High
> Theme: Operator workflow and runtime integration
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
Replay focus is fixed to the player, malformed launch samples make leading cars
teleport and freeze, and the new drift/headlight effects need stronger motion but
softer lighting.

# Scope
- In:
  - click-to-focus replay cars with player reset behavior
  - repair persisted launch plateaus during interpolation
  - prevent future-timestamp state reuse in trace generation
  - tune drift angle and SVG front/rear light blending, including braking glow
  - focused tests and live reported-replay validation
- Out:
  - simulation balance or classification changes
  - WebGL, shaders, or asset regeneration
  - rewriting stored replay payloads

# Acceptance criteria
- AC1: Focus mode accepts a clicked car and resets to the player on mode change/restart.
- AC2: Historical and newly generated launch movement remains continuous.
- AC3: Drift is capped at 22 degrees; front headlights blend softly into the map,
  and rear lights strengthen in circuit braking zones.
- AC4: The reported replay has no per-car jump/freeze during the launch window.

# AC Traceability
- request-AC1 -> AC1. Proof: map click callback and replay camera target state.
- request-AC2 -> AC1. Proof: player reset wrappers around focus mode and restart.
- request-AC3 -> AC2 and AC4. Proof: reader plateau repair, generator timestamp guard, tests, and Chrome sampling.
- request-AC4 -> AC3. Proof: bounded drift constant and CSS/SVG headlight tuning.
- request-AC5 -> AC4. Proof: focused tests and exact replay validation.

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
- Request: `req_107_polish_replay_focus_launch_continuity_drift_and_headlights`
- Primary task(s): `task_108_polish_replay_focus_launch_continuity_drift_and_headlights`

# AI Context
- Summary: Polish replay focus, launch continuity, drift, and headlights
- Keywords: backlog-groom, request, polish replay focus, launch continuity, drift, and headlights, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Polish replay focus, launch continuity, drift, and headlights.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: High
- Rationale: The launch discontinuity is a visible replay defect on persisted production-like data.

# Notes
- Hybrid rationale: Derived from request `req_107_polish_replay_focus_launch_continuity_drift_and_headlights` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_107_polish_replay_focus_launch_continuity_drift_and_headlights.md`.
- Generated locally by logics-manager.
- Task `task_108_polish_replay_focus_launch_continuity_drift_and_headlights` was finished via `logics-manager flow finish task` on 2026-07-24.

# Tasks
- `task_108_polish_replay_focus_launch_continuity_drift_and_headlights`
