# CR League 0.5.0
Release date: 2026-07-27

## Added
- Closed the active Logics balance diagnostic corpus and settled the completed product briefs.
- Added a replayability analytics report covering champion variety, finishing-order variety, comeback rate, title suspense, lead changes, close finishes, and boring-race rate.
- Added browser comprehension scoring and scenario pass-rate reporting.
- Left one known fun watchpoint for 0.5 tuning: `banker` GP2 can still produce a low-fun P8 result in the browser sweep.

## Changed
- Simplified high-friction French first-contact terms around plans, settings, reports, and GP history.
- Added cold-start and visual UX evidence harnesses before the 0.5 bump.
- Closed `task_124_orchestrate_aggressive_mini_pack_balance_diagnostic`.
- Closed the linked request/backlog chain for the aggressive mini-pack diagnostic.

## Fixed
- Confirmed that `aggressive + mini_pack` is not a blind-nerf target: replayability has no dominant strategy cluster and the balance gate puts several aggressive mini-pack variants in the bottom group.
- Added browser-agent fun, frustration, comprehension, and scenario scoring so AI playtests now answer whether a player knows what to do, how to choose a race plan, and why a race succeeded or failed.
- Marked 0.4 ship rails as closed and documented 0.5 as the next evidence-gated phase.
- Added `npm run playtest:browser:fun` for multi-profile browser playtest aggregation.
- Fixed the browser fun score so positive race events and grid-to-finish comebacks are rewarded correctly.
- Latest scenario sweep passes all three comprehension questions across `sprinter`, `rain-reader`, `banker`, and `closer`.
- Added `npm run playtest:replayability`; latest run reports 6 unique champions, 100% unique finishing orders, 98.61% comeback race rate, and 0% boring races.
- Added a static copy comprehension audit for i18n strings.
- Settled completed product briefs for circuit expansion, browser AI playtest surfaces, UX evaluation, and the balance diagnostic.
- Logics status is clean: no open workflow docs and no lint/audit findings.
- Fixed GitHub Actions workflow references by pinning checkout, setup-node, and upload-artifact to supported `v4` actions.
- Kept the CI audit focused on runtime dependencies with `npm audit --omit=dev --audit-level=high`; the remaining advisory is in dev-only lint tooling and is not shipped.
- Split CI unit tests from global coverage: workspace matrix jobs now run scoped tests, and one dedicated coverage job runs the repository-wide threshold gate.
- Raised the long demo-flow UI test timeout so the repository-wide coverage job is stable on GitHub runners.
