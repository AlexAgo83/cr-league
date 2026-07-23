## req_106_render_metadata_driven_car_drift_tire_marks_and_lights - Render metadata-driven car drift, tire marks, and lights
> From version: 0.4.3
> Schema version: 1.0
> Status: Done
> Understanding: 95
> Confidence: 90
> Complexity: Medium
> Theme: Replay realism
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make replay cars retain their asset-specific proportions and drift by swinging the
  rear around the front axle instead of rotating around the image center.
- Use the existing wheel and light metadata for ground-contact tire marks and subtle
  headlights without introducing another rendering engine.

# Context
- The replay map already renders cars and animation in one SVG scene.
- Every CRL v2 top-view asset exposes canvas size, front/rear wheel contacts, and
  front-light points in its `metadata.json`.
- Source pixels provide relative geometry but no certified physical vehicle length.

# Acceptance criteria
- AC1: Each replay car preserves its source aspect ratio and a bounded size derived
  from its detected wheelbase.
- AC2: Car heading is normalized from metadata and drift rotates around the midpoint
  of the front wheel contacts, including reverse-facing source assets.
- AC3: Rear wheel contacts produce short-lived ground-fixed marks during visible
  drift, and front-light points produce subtle light cones.
- AC4: The implementation stays in the existing SVG renderer and has focused
  geometry/render coverage.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `apps/web/src/features/CircuitMap.tsx`
- `apps/web/src/features/carAssets.ts`
- `docs/car-assets-runbook.md`

# AI Context
- Summary: Render replay cars from asset geometry with front-axle drift, tire marks, and headlights.
- Keywords: replay, SVG, car metadata, drift, wheel contacts, headlights
- Use when: Changing replay car geometry or related ground and light effects.
- Skip when: The work does not affect the circuit replay renderer.

# Backlog
- none
- `item_264_render_metadata_driven_car_drift_tire_marks_and_lights`
