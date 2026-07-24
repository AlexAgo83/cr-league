## item_278_centralize_web_lap_time_and_gap_second_formatting_in_one_helper - Centralize web lap-time and gap second formatting in one helper
> From version: 0.4.5
> Schema version: 1.0
> Status: Ready
> Understanding: 90%
> Confidence: 85%
> Progress: 0%
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
