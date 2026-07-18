## item_109_make_mobile_race_guidance_readable_without_shrinking_the_circuit - Make mobile race guidance readable without shrinking the circuit
> From version: 0.3.6
> Schema version: 1.0
> Status: In progress
> Understanding: 90%
> Confidence: 85%
> Progress: 80%
> Complexity: Medium
> Theme: Mobile race UX
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- On mobile, the Race map is visually strong but the active instruction truncates to text like `Check the tra...`.
- The current bottom workflow strip competes with the map, command buttons, and timeline-style controls.
- Players need to know what to do next without losing the spectacle of the circuit.

# Scope
- In:
  - Replace the mobile-only truncated instruction strip with a compact active-step control that can expand into the full instruction.
  - Keep the active step title visible at all times and make the full instruction one tap or keyboard action away.
  - Use existing CSS/React patterns in `App.tsx` and `layout.css`; no new disclosure component dependency.
  - Ensure the expanded state does not cover the primary CTA without a clear close/collapse action.
  - Keep desktop workflow panel behavior unchanged unless a small shared simplification is cleaner.
  - Update i18n copy if a new button label such as `Details` or `Hide` is needed.
- Out:
  - Redesigning the entire Race screen.
  - Reducing the circuit to a small static card.
  - Adding gesture-only interactions that are inaccessible to keyboard users.
  - Changing race-day phase semantics.

# Acceptance criteria
- AC1: At 390px mobile width, the active step title and a readable path to the full instruction are visible without ellipsis on essential copy.
- AC2: Expanded guidance can be opened and closed by mouse/touch and keyboard.
- AC3: Race primary commands remain reachable while guidance is collapsed, and no notification overlaps the collapsed guidance after the notification fix.
- AC4: E2E or component tests assert mobile guidance text is not clipped or inaccessible.
- AC5: Desktop Race remains visually unchanged or has only intentional minor spacing improvements.

# AC Traceability
- request-AC2 -> This backlog slice. Proof: AC1: At 390px mobile width, the active step title and a readable path to the full instruction are visible without ellipsis on essential copy.
- request-AC3 -> This backlog slice. Proof: AC2: Expanded guidance can be opened and closed by mouse/touch and keyboard.
- request-AC7 -> This backlog slice. Proof: AC3: Race primary commands remain reachable while guidance is collapsed, and no notification overlaps the collapsed guidance after the notification fix.
- request-AC8 -> This backlog slice. Proof: AC4: E2E or component tests assert mobile guidance text is not clipped or inaccessible.
- request-AC9 -> This backlog slice. Proof: AC5: Desktop Race remains visually unchanged or has only intentional minor spacing improvements.
- request-AC10 -> This backlog slice. Proof: AC5: Desktop Race remains visually unchanged or has only intentional minor spacing improvements.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_018_first_session_ux_polish_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_047_polish_first_session_ux_after_playtest_findings`
- Primary task(s): `task_048_orchestrate_first_session_ux_polish_from_playtest_findings`

# AI Context
- Summary: Make mobile race guidance readable without shrinking the circuit
- Keywords: scaffolded-backlog, make mobile race guidance readable without shrinking the circuit, implementation-ready
- Use when: Implementing the scaffolded slice for Make mobile race guidance readable without shrinking the circuit.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: High
- Rationale: Set by scaffold input or defaulted for grooming.
