## task_109_clean_up_race_recap_narrative - Clean up race recap narrative
> From version: 0.4.3
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100%
> Complexity: Medium
> Theme: Implementation delivery
> Reminder: Update status/understanding/confidence/progress and linked request/backlog references when you edit this doc.
> Owner: Codex

# Definition of Done (DoD)
- [x] The backlog scope is implemented.
- [x] Acceptance criteria are covered.
- [x] Validation passes.
- [x] Meaningful waves followed ADR 009: affected docs updated and the repo left commit-ready without automatic commits.

# Backlog
- `item_266_clean_up_race_recap_narrative`

# Acceptance criteria
- AC1: Delete the redundant non-winning feedback path from the report.
- AC2: Render factual result copy and a comparison-only plan block in French and English.
- AC3: Ignore `finish` and `race_note` events when selecting the dominant cause.
- AC4: Add a regression test for a finish marker carrying the final position delta.

# AC Traceability
- request-AC1 -> This task. Proof: `ReportView` now renders one source for each recap section and the non-winning feedback path was deleted.
- request-AC2 -> This task. Proof: `recap_verdict_stance` contains only position and points; directive and comparison remain separate.
- request-AC3 -> This task. Proof: `raceDominantCause` filters `finish` and `race_note` before ranking events.
- request-AC4 -> This task. Proof: French and English keys were updated together and the helper regression test covers the finish marker.

# Validation
- `npm test -- --run apps/web/src/app/helpers.test.ts` passed: 19 tests.
- `npm run typecheck` passed.
- `npm test` passed: 300 tests, 7 skipped.
- `npm run lint` passed.
- `npm run build` passed.
- `logics-manager lint --require-status` passed.
- `logics-manager audit --group-by-doc` passed with 0 findings.
- Finish workflow executed on 2026-07-24.
- Linked backlog/request close verification passed.

# Report
- Removed the duplicated non-winning result paragraph and its unused helper, tests, and translations.
- Reframed the recap as Result, Directive, Comparison with the winner, and Next GP takeaway.
- Prevented technical finish and race-note events from being selected as race causes.
- Finished on 2026-07-24.
- Linked backlog item(s): `item_266_clean_up_race_recap_narrative`
- Related request(s): `req_108_clean_up_race_recap_narrative`

# AI Context
- Summary: Implement clean up race recap narrative.
- Keywords: task, implementation, backlog, runtime, python
- Use when: You need a bounded implementation task for a backlog item.
- Skip when: The work is still at the request or backlog shaping stage.

# Links
- Request: `req_108_clean_up_race_recap_narrative`
- Product brief(s): (none yet)
- Architecture decision(s): (none yet)
