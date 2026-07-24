## item_278_centralize_web_lap_time_and_gap_second_formatting_in_one_helper - Centralize web lap-time and gap second formatting in one helper
> From version: 0.4.5
> Schema version: 1.0
> Status: Done
> Understanding: 90%
> Confidence: 85%
> Progress: 100
> Complexity: Low
> Theme: Frontend maintainability
> Reminder: Update status/understanding/confidence/progress and linked request/task references when you edit this doc.

# Problem
- The same second-formatting is inlined across several web views: lap/best times as `` `${t.toFixed(2)}s` `` (PlanView.tsx, DriveView.tsx) and gaps/deltas as `` `+${d.toFixed(1)}s` `` (DriveView.tsx).
- apps/web/src/app/helpers.ts currently exposes no formatting helper, so each site re-implements the same `toFixed` + unit concatenation.
- Divergent decimals or sign handling between sites is easy to introduce and hard to spot.

# Scope
- In:
  - Add one helper in apps/web/src/app/helpers.ts (e.g. `formatSeconds(value, decimals = 2)`) that returns the current `` `${value.toFixed(decimals)}s` `` output.
  - Replace the inlined lap/best-time formatting in PlanView.tsx and DriveView.tsx with the helper.
  - Keep gap formatting output identical (sign prefix and 1-decimal), routing it through the helper where it does not change rendered text.
- Out:
  - Changing displayed precision, rounding, or the `s` unit for any value.
  - Touching SVG path coordinate `toFixed` calls (geometry, not user-facing formatting).
  - Adding an i18n/number-format dependency.

# Acceptance criteria
- AC1: A single `formatSeconds` helper in helpers.ts replaces the inlined lap/best-time formatting in the affected views.
- AC2: Rendered text is byte-identical to today for every migrated site, verified by the existing web test suites.
- AC3: Typecheck, lint, and the full unit suite pass with no weakened assertions.

# AC Traceability
- request-AC7 -> This backlog slice. Proof: AC1: A single formatSeconds helper replaces the inlined lap/best-time formatting.
- request-AC5 -> This backlog slice. Proof: AC3: Typecheck, lint, and the full unit suite pass with no weakened assertions.
- request-AC2 -> This backlog slice. Evidence needed: storeCore.ts is split so no resulting hand-written source file exceeds ~800 lines, the public import surface (symbols imported by routes.ts, admin/store.ts, and tests) is unchanged, and behavior is preserved verbatim.
- request-AC4 -> This backlog slice. Evidence needed: Overall branch coverage rises meaningfully toward line coverage by covering previously-uncovered error and rule-violation branches, with no assertions weakened or tests skipped to inflate the number.
- request-AC6 -> This backlog slice. Evidence needed: The duplicated object-shape preamble in the leagues/routes.ts body guards is extracted into one shared helper used by all 14 guards, with their field checks and accepted/rejected inputs unchanged.

# Decision framing
- Product framing: Not needed
- Architecture framing: Not needed

# Links
- Product brief(s): `prod_067_repo_review_maintainability_follow_up_product_brief`
- Architecture decision(s): (none yet)
- Request: `req_115_repo_review_maintainability_follow_up`
- Primary task(s): `task_116_orchestrate_repo_review_maintainability_follow_up`

# AI Context
- Summary: Centralize web lap-time and gap second formatting in one helper
- Keywords: scaffolded-backlog, formatSeconds helper, deduplicate view formatting, implementation-ready
- Use when: Implementing the shared second-formatting helper for the web views.
- Skip when: The change belongs to another backlog slice.

# Priority
- Priority: Low
- Rationale: Small, safe dedup; centralizes display formatting.

# Notes
- Delivered (commit last): formatSeconds(value, decimals) in helpers.ts replaces inlined `${t.toFixed(2)}s` / gap formatting in PlanView and DriveView; rendered text identical, 174 web tests green.
- Task `task_116_orchestrate_repo_review_maintainability_follow_up` was finished via `logics-manager flow finish task` on 2026-07-24.

# Tasks
- `task_116_orchestrate_repo_review_maintainability_follow_up`
