## task_017_add_playable_demo_league_web_flow - Add playable demo league web flow
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
- `item_022_add_playable_demo_league_web_flow`

# Acceptance criteria
- AC1: Player can create a demo league.
- AC2: Player can submit a directive.
- AC3: Player can resolve the Grand Prix.
- AC4: Player can read standings and race result.
- AC5: Validation passes.

# AC Traceability
- request-AC1 -> This task. Proof: `apps/web/src/app/App.tsx` calls `POST /leagues` from `Create league`.
- request-AC2 -> This task. Proof: league panel renders code, round/status, teams, points, and credits.
- request-AC3 -> This task. Proof: directive form exposes approach, preparation, and card controls.
- request-AC4 -> This task. Proof: `Submit directive` posts to `/leagues/:leagueId/decisions`.
- request-AC5 -> This task. Proof: `Launch GP` posts to `/leagues/:leagueId/resolve`.
- request-AC6 -> This task. Proof: result sections render classification, key events, and report blocks.
- request-AC7 -> This task. Proof: status message covers loading and API failure.
- request-AC8 -> This task. Proof: `apps/web/src/app/App.test.tsx` covers create, submit, and resolve.
- request-AC9 -> This task. Proof: validation commands passed on 2026-07-13.
- request-AC10 -> This task. Proof: auth, invite, inventory persistence, scheduling, multi-round UX, and replay animation remain out of scope.
- backlog-AC1 -> This task. Proof: demo league creation UI works in the tested flow.
- backlog-AC2 -> This task. Proof: directive submission is covered by the tested flow.
- backlog-AC3 -> This task. Proof: Grand Prix resolve is covered by the tested flow.
- backlog-AC4 -> This task. Proof: standings and result panels render from API state.
- backlog-AC5 -> This task. Proof: validation commands passed on 2026-07-13.

# Validation
- 2026-07-13: `npm run typecheck` passed.
- 2026-07-13: `npm test` passed.
- 2026-07-13: `npm run build` passed.
- 2026-07-13: `npm run lint` passed.
- 2026-07-13: `npm run logics:validate` passed.
- 2026-07-13: `logics-manager flow validate req_016_add_playable_demo_league_web_flow` passed with 0 findings.
- npm run typecheck; npm test; npm run build; npm run lint; npm run logics:validate; logics-manager flow validate req_016_add_playable_demo_league_web_flow
- Finish workflow executed on 2026-07-13.
- Linked backlog/request close verification passed.

# Report
- Replaced the static race preview with a minimal persisted demo league web flow.
- Kept auth, invite/join, inventory persistence, scheduling, multi-round season UI, and replay animation out of scope.
- Validation passed: `npm run typecheck`, `npm test`, `npm run build`, `npm run lint`, `npm run logics:validate`, `logics-manager flow validate req_016_add_playable_demo_league_web_flow`.
- Finished on 2026-07-13.
- Linked backlog item(s): `item_022_add_playable_demo_league_web_flow`
- Related request(s): `req_016_add_playable_demo_league_web_flow`

# AI Context
- Summary: Implement add playable demo league web flow.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_016_add_playable_demo_league_web_flow`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
