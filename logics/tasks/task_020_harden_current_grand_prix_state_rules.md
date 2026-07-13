## task_020_harden_current_grand_prix_state_rules - Harden current Grand Prix state rules
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
- `item_025_harden_current_grand_prix_state_rules`

# Acceptance criteria
- AC1: Resolve requires a human directive.
- AC2: Resolved GP cannot accept more decisions.
- AC3: Resolved GP cannot resolve again.
- AC4: Web reflects invalid states.
- AC5: Validation and smoke pass.

# AC Traceability
- request-AC1 -> This task. Proof: `resolveCurrentGrandPrix` checks `hasHumanDecision`.
- request-AC2 -> This task. Proof: `submitDecision` throws `LeagueRuleError` when status is `resolved`.
- request-AC3 -> This task. Proof: `resolveCurrentGrandPrix` throws `LeagueRuleError` when status is `resolved`.
- request-AC4 -> This task. Proof: league routes map `LeagueRuleError` to 409 Conflict.
- request-AC5 -> This task. Proof: `App.tsx` disables invalid actions and displays API error messages.
- request-AC6 -> This task. Proof: `apps/api/src/app.test.ts` and `apps/web/src/app/App.test.tsx`.
- request-AC7 -> This task. Proof: `npm run smoke:league` passed against temporary PostgreSQL on port 55432.
- request-AC8 -> This task. Proof: validation commands passed on 2026-07-14.
- request-AC9 -> This task. Proof: no league join, inventory, auth, or season feature was added.
- backlog-AC1 -> This task. Proof: resolve before human directive returns 409.
- backlog-AC2 -> This task. Proof: late directive returns 409.
- backlog-AC3 -> This task. Proof: second resolve returns 409.
- backlog-AC4 -> This task. Proof: web submit/resolve buttons are disabled after resolution.
- backlog-AC5 -> This task. Proof: validation and real DB smoke passed.

# Validation
- 2026-07-14: `npm run typecheck` passed.
- 2026-07-14: `npm test` passed.
- 2026-07-14: `npm run build` passed.
- 2026-07-14: `npm run lint` passed.
- 2026-07-14: `logics-manager i18n validate` passed.
- 2026-07-14: `npm run logics:validate` passed.
- 2026-07-14: `logics-manager flow validate req_019_harden_current_grand_prix_state_rules` passed with 0 findings.
- 2026-07-14: temporary Docker PostgreSQL migration and seed passed.
- 2026-07-14: `npm run smoke:league` passed against temporary PostgreSQL and covered post-resolution 409 guards.
- npm run typecheck; npm test; npm run build; npm run lint; logics-manager i18n validate; npm run logics:validate; logics-manager flow validate req_019_harden_current_grand_prix_state_rules; temporary Docker PostgreSQL migrate/seed; npm run smoke:league
- Finish workflow executed on 2026-07-14.
- Linked backlog/request close verification passed.

# Report
- Hardened current Grand Prix state rules in API, web, tests, and real DB smoke.
- League join, inventory, auth, and season progression remain out of scope.
- Validation passed: `npm run typecheck`, `npm test`, `npm run build`, `npm run lint`, `logics-manager i18n validate`, `npm run logics:validate`, `logics-manager flow validate req_019_harden_current_grand_prix_state_rules`, temporary Docker PostgreSQL migrate/seed, `npm run smoke:league`.
- Finished on 2026-07-14.
- Linked backlog item(s): `item_025_harden_current_grand_prix_state_rules`
- Related request(s): `req_019_harden_current_grand_prix_state_rules`

# AI Context
- Summary: Implement harden current grand prix state rules.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_019_harden_current_grand_prix_state_rules`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
