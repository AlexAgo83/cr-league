## item_264_render_metadata_driven_car_drift_tire_marks_and_lights - Render metadata-driven car drift, tire marks, and lights
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
Replay cars currently share one fixed display box and rotate around their image
center. That hides real model proportions and makes drift look like a flat spin
instead of rear-axle slip.

# Scope
- In:
  - normalize top-view assets from wheel-contact metadata
  - preserve canvas proportions with bounded wheelbase scaling
  - rotate drift around the front axle
  - render rear-wheel SVG tire marks and metadata-positioned headlights
  - focused tests and asset runbook updates
- Out:
  - WebGL or shader infrastructure
  - changes to race simulation physics or replay timing
  - regeneration of source car assets

# Acceptance criteria
- AC1: Render geometry uses front/rear wheel contacts and retains model-specific proportions.
- AC2: Drift pivots on the normalized front axle for both normal and reverse-facing source assets.
- AC3: Tire marks remain in map coordinates and expire after a short bounded lifetime.
- AC4: Two light cones originate from each asset's detected front-light points.
- AC5: Focus zoom, livery selection, and ambient car motion remain functional.

# AC Traceability
- request-AC1 -> AC1. Proof: geometry unit coverage and asset-specific rendered bounds.
- request-AC2 -> AC2. Proof: normal and reversed metadata fixtures normalize rear wheels behind the pivot.
- request-AC3 -> AC3 and AC4. Proof: render coverage plus SVG paths driven by replay frames.
- request-AC4 -> AC5. Proof: focused CircuitMap tests, typecheck, lint, and visual replay validation.

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
- Request: `req_106_render_metadata_driven_car_drift_tire_marks_and_lights`
- Primary task(s): `task_107_render_metadata_driven_car_drift_tire_marks_and_lights`

# AI Context
- Summary: Render metadata-driven car drift, tire marks, and lights
- Keywords: backlog-groom, request, render metadata-driven car drift, tire marks, and lights, bounded slice
- Use when: Use when implementing or reviewing the delivery slice for Render metadata-driven car drift, tire marks, and lights.
- Skip when: Skip when the change is unrelated to this delivery slice or its linked request.

# Priority
- Priority: High
- Rationale: The current center-pivot drift is a visible replay defect and asset metadata already provides the needed geometry.

# Notes
- Hybrid rationale: Derived from request `req_106_render_metadata_driven_car_drift_tire_marks_and_lights` and kept bounded to one coherent delivery slice.
- Source file: `logics/request/req_106_render_metadata_driven_car_drift_tire_marks_and_lights.md`.
- Generated locally by logics-manager.
- Task `task_107_render_metadata_driven_car_drift_tire_marks_and_lights` was finished via `logics-manager flow finish task` on 2026-07-24.

# Tasks
- `task_107_render_metadata_driven_car_drift_tire_marks_and_lights`
