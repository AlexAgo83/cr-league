## task_030_improve_race_desk_immersion_ui - Improve race desk immersion UI
> From version: 0.1.0
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_035_improve_race_desk_immersion_ui`

# Acceptance criteria
- AC1: The race desk shows an explicit state for preparing, ready to launch, and resolved race.
- AC2: Each state has one visually dominant command matching the next expected action.
- AC3: The desk includes light pit-wall/race telemetry treatment without adding a UI framework or new gameplay rules.
- AC4: English and French catalogs include the new user-facing race desk copy.
- AC5: Desktop and mobile views are visually checked and automated tests cover the state labels.

# Validation
- Run `npm run typecheck`.
- Run `npm test`.
- Run `npm run lint`.
- Run `npm run build`.
- Run `npm run test:e2e`.
- Run `logics-manager i18n validate`.
- Run `npm run logics:validate`.
- Use visual screenshots for desktop Prepare/Ready states and mobile resolved state.
- npm run typecheck passed; npm test passed; npm run lint passed; npm run build passed; npm run test:e2e passed; logics-manager i18n validate passed; npm run logics:validate passed before closeout; visual checks passed for /tmp/cr-league-prepare2.png, /tmp/cr-league-ready2.png, and /tmp/cr-league-resolved2-mobile.png.
- Finish workflow executed on 2026-07-14.
- Linked backlog/request close verification passed.

# Report
- Implementation complete:
  - added Prepare/Ready/Resolved race desk state;
  - added pit-wall header, race console, and telemetry chips;
  - made only the expected command visually dominant per state;
  - added EN/FR copy;
  - updated unit/e2e assertions and playtest/roadmap docs.
- Visual proof generated locally:
  - `/tmp/cr-league-prepare2.png`
  - `/tmp/cr-league-ready2.png`
  - `/tmp/cr-league-resolved2-mobile.png`
- Finished on 2026-07-14.
- Linked backlog item(s): `item_035_improve_race_desk_immersion_ui`
- Related request(s): `req_029_improve_race_desk_immersion_ui`

# AI Context
- Summary: Implement the first state-driven pit-wall race desk pass.
- Keywords: task, race-desk, pit-wall, UX-guidance, visual-validation
- Use when: Reviewing or extending the current race desk guidance implementation.
- Skip when: The work is about economy depth, scheduling, auth, or full replay rendering.

# Links
- Request: `req_029_improve_race_desk_immersion_ui`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)

# AC Traceability
- request-AC1 -> This task. Proof: `apps/web/src/app/App.tsx` derives `deskState` and renders Prepare, Ready to launch, or Race resolved.
- request-AC2 -> This task. Proof: `apps/web/src/app/App.tsx` assigns `primary-command` to Submit directive, Launch GP, or Next GP by state; `apps/web/src/styles/layout.css` neutralizes secondary race actions.
- request-AC3 -> This task. Proof: `apps/web/src/styles/layout.css` adds the pit-wall race panel, race console, telemetry chips, and state badges with no new dependencies.
- request-AC4 -> This task. Proof: `apps/web/src/i18n/en.json` and `apps/web/src/i18n/fr.json` include the new race desk copy; `logics-manager i18n validate` passed.
- request-AC5 -> This task. Proof: `apps/web/src/app/App.test.tsx` and `tests/e2e/private-league.spec.ts` assert state labels; `/tmp/cr-league-prepare2.png`, `/tmp/cr-league-ready2.png`, and `/tmp/cr-league-resolved2-mobile.png` were visually checked.
