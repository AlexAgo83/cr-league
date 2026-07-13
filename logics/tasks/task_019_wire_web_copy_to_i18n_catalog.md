## task_019_wire_web_copy_to_i18n_catalog - Wire web copy to i18n catalog
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
- `item_024_wire_web_copy_to_i18n_catalog`

# Acceptance criteria
- AC1: Current static web UI copy lives in `en.json`.
- AC2: `App.tsx` consumes that catalog through a typed helper.
- AC3: Validation passes.

# AC Traceability
- request-AC1 -> This task. Proof: `apps/web/src/i18n/en.json` contains source-locale keys.
- request-AC2 -> This task. Proof: `apps/web/src/i18n/index.ts` exports typed `t(key)`.
- request-AC3 -> This task. Proof: `apps/web/src/app/App.tsx` uses `t(...)` for static UI copy.
- request-AC4 -> This task. Proof: `apps/web/src/app/App.test.tsx` still covers the flow labels and rendered state.
- request-AC5 -> This task. Proof: `logics-manager i18n validate` passed.
- request-AC6 -> This task. Proof: validation commands passed on 2026-07-13.
- request-AC7 -> This task. Proof: no runtime locale switcher or extra locale catalog was added.
- backlog-AC1 -> This task. Proof: current static web UI copy is in `en.json`.
- backlog-AC2 -> This task. Proof: `App.tsx` imports and uses `t`.
- backlog-AC3 -> This task. Proof: validation commands passed on 2026-07-13.

# Validation
- 2026-07-13: `logics-manager i18n validate` passed.
- 2026-07-13: `npm run typecheck` passed.
- 2026-07-13: `npm test` passed.
- 2026-07-13: `npm run build` passed.
- 2026-07-13: `npm run lint` passed.
- 2026-07-13: `npm run logics:validate` passed.
- 2026-07-13: `logics-manager flow validate req_018_wire_web_copy_to_i18n_catalog` passed with 0 findings.
- logics-manager i18n validate; npm run typecheck; npm test; npm run build; npm run lint; npm run logics:validate; logics-manager flow validate req_018_wire_web_copy_to_i18n_catalog
- Finish workflow executed on 2026-07-13.
- Linked backlog/request close verification passed.

# Report
- Wired current static web copy to the i18n source catalog.
- Runtime locale switching, extra locales, backend error localization, and simulation report localization remain out of scope.
- Validation passed: `logics-manager i18n validate`, `npm run typecheck`, `npm test`, `npm run build`, `npm run lint`, `npm run logics:validate`, `logics-manager flow validate req_018_wire_web_copy_to_i18n_catalog`.
- Finished on 2026-07-13.
- Linked backlog item(s): `item_024_wire_web_copy_to_i18n_catalog`
- Related request(s): `req_018_wire_web_copy_to_i18n_catalog`

# AI Context
- Summary: Implement wire web copy to i18n catalog.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_018_wire_web_copy_to_i18n_catalog`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
