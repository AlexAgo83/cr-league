## item_086_asphalt_pass_live_surfaces_cockpit_buttons_circuit_route - Asphalt pass: live surfaces, cockpit, buttons, circuit route
> From version: 0.3.5
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Visual identity
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- Live screens (race cockpit, map, telemetry, plan editor, replay) still carry the rounded-card dashboard look after the token swap.
- The circuit route renders in the old green accent and competes with team liveries for meaning.

# Scope
- In:
  - Retouch layout.css for live surfaces: topbar and tabs (condensed caps, skewed active underline), primary/ghost buttons (signal accent, chamfer cut, chevron cue), plan cards (left spine selection state instead of full border), telemetry stat rows (condensed numerals, thin bars), lap-time chrono display.
  - Recolor `circuit-route-accent` / `circuit-route-glow` / `circuit-start-line` and related classes to the dashed signal-orange treatment over the dark basemap, including ambient background and replay variants.
  - Sweep remaining `border-radius` usages on live panels to the chamfer or square treatment.
  - Keep green only on locked/valid indicators and blue only on weather chips across live screens.
  - Verify focus-visible states and AA contrast on the new asphalt surfaces.
- Out:
  - Document screens (standings, report, garage) — next item.
  - CircuitMap geometry, camera, or car-marker logic.
  - Livery picker behavior (players keep free colors; defaults may stay).

# Acceptance criteria
- AC1: Race cockpit, plan editor, and replay render on asphalt/carbon surfaces with chamfered panels and signal-orange primary actions.
- AC2: The circuit route is dashed signal orange in briefing, replay, and ambient variants; screenshot evidence attached at closeout.
- AC3: No live-screen element uses green or blue outside locked/valid and weather semantics.
- AC4: Keyboard focus is visible on tabs, plan cards, and buttons; body text on asphalt meets WCAG AA.
- AC5: `npm run typecheck`, `npm test`, `npm run build`, and the Playwright suite pass.

# AC Traceability
- request-AC4 -> This backlog slice. Proof: AC1: Race cockpit, plan editor, and replay render on asphalt/carbon surfaces with chamfered panels and signal-orange primary actions.
- request-AC5 -> This backlog slice. Proof: AC2: The circuit route is dashed signal orange in briefing, replay, and ambient variants; screenshot evidence attached at closeout.
- request-AC7 -> This backlog slice. Proof: AC3: No live-screen element uses green or blue outside locked/valid and weather semantics.
- request-AC8 -> This backlog slice. Proof: AC4: Keyboard focus is visible on tabs, plan cards, and buttons; body text on asphalt meets WCAG AA.
- request-AC9 -> This backlog slice. Proof: AC5: `npm run typecheck`, `npm test`, `npm run build`, and the Playwright suite pass.
- request-AC10 -> This backlog slice. Proof: AC5: `npm run typecheck`, `npm test`, `npm run build`, and the Playwright suite pass.
- request-AC6 -> This backlog slice. Evidence needed: Championship standings, race report, and garage sheet surfaces render on the chalk-paper material with ink text while live surfaces stay on asphalt.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_013_pit_wall_visual_identity_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_042_adopt_the_pit_wall_visual_identity_across_the_web_app`
- Primary task(s): `task_043_orchestrate_the_pit_wall_visual_identity_rollout`

# AI Context
- Summary: Asphalt pass: live surfaces, cockpit, buttons, circuit route
- Keywords: scaffolded-backlog, asphalt pass: live surfaces, cockpit, buttons, circuit route, implementation-ready
- Use when: Implementing the scaffolded slice for Asphalt pass: live surfaces, cockpit, buttons, circuit route.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.

# Tasks
- `task_043_orchestrate_the_pit_wall_visual_identity_rollout`

# Notes
- Task `task_043_orchestrate_the_pit_wall_visual_identity_rollout` was finished via `logics-manager flow finish task` on 2026-07-17.
