## req_029_improve_race_desk_immersion_ui - Improve race desk immersion UI
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: After the first playtest, the main race desk still feels too administrative. Add a light pit-wall layout with state-driven guidance, one obvious primary command, and desktop/mobile visual validation without adding a UI framework or new gameplay mechanics.
> Confidence: high
> Complexity: Medium
> Theme: General
> Reminder: Update status/understanding/confidence and linked backlog/task references when you edit this doc.

# Needs
- Make the main race desk feel less like an admin form and more like a team-principal pit wall.
- Reduce guessing by showing the current race-weekend state and the next command clearly.
- Keep the pass bounded to hierarchy, copy, responsive layout, and validation; do not add new gameplay mechanics.

# Context
- The 2026-07-14 technical playtest showed that the loop works but players still infer what to do.
- Prior slices improved briefing, replay flavor, garage guidance, and race recap readability.
- The remaining immediate UX issue is the main desk where directive, launch, settings, and next-GP commands compete visually.

# Acceptance criteria
- AC1: The race desk shows an explicit state for preparing, ready to launch, and resolved race.
- AC2: Each state has one visually dominant command matching the next expected action.
- AC3: The desk includes light pit-wall/race telemetry treatment without adding a UI framework or new gameplay rules.
- AC4: English and French catalogs include the new user-facing race desk copy.
- AC5: Desktop and mobile views are visually checked and automated tests cover the state labels.

# Definition of Ready (DoR)
- [x] Problem statement is explicit and user impact is clear.
- [x] Scope boundaries (in/out) are explicit.
- [x] Acceptance criteria are testable.
- [x] Dependencies and known risks are listed.

# Companion docs
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# References
- `docs/playtest/results/2026-07-14-private-league-technical-playtest.md`
- `apps/web/src/app/App.tsx`
- `apps/web/src/styles/layout.css`
- `tests/e2e/private-league.spec.ts`

# AI Context
- Summary: Bounded UI/UX pass for state-driven race desk immersion and next-action clarity.
- Keywords: race-desk, pit-wall, UX-guidance, visual-validation, private-league
- Use when: You need context for the first race desk immersion pass after the technical playtest.
- Skip when: The work is about deeper economy, scheduler, auth, or full visual replay.

# Backlog
- none
- `item_035_improve_race_desk_immersion_ui`
