# CR League 0.6.0
Release date: 2026-07-28

## Added
- Added the private beta season lifecycle: `Quick beta` (3 GP) and `Standard season` (6 GP, default) presets, manual commissioner resolve, resolve-with-defaults for absent players, and an explicit next-season action.
- Added a creator-only `Direction de course` commissioner screen: player readiness at a glance, invite/share controls, and a manual one-reminder-per-season email action with sent/skipped feedback.
- Added a deterministic Next action card on race reports, using race result, played-card trigger/miss, rival context, and next circuit/weather to suggest what to do next.
- Added a non-mandatory rival thread across standings, pre-race planning, and race reports, shown only when a standings neighbor is meaningful.
- Added contextual card guidance (`Utile ici`, `Situationnel`, `Impact faible`) in Plan and Garage, replacing the old affinity labels with deterministic, context-aware reasons.
- Added in-league team profiles opened from standings: livery identity, rank, points, credits, GP count, podiums, palmares, recent form, current rival, and derived play style.
- Added league rename controls for the commissioner.
- Added an optional `Boutique variable à chaque GP` shop mode at league creation: a deterministic 6-card shop that rotates every GP and is frozen for historical rounds, off by default so existing/standard leagues keep the fixed shop.

## Changed
- Changed season rollover to preserve credits and garage cards across seasons; only championship points reset at the next season.
- Changed Garage and shop card ordering to sort by availability first, then a deterministic utility score.
- Polished championship, garage, and card modal controls and contrast (championship record panels, garage profile controls, card modal detail panels, garage card cells).
- Clarified copy for shop affordability, race recap impact, locked garage card sales, and empty-inventory/empty-card shop prompts.
- Restored the sticky mobile header and shared expanded team name suggestions across the setup flow.

## Fixed
- Closed the beta accessibility gate: fixed contrast on the chrono modal risk indicator, secondary buttons on paper panels, and circuit preview map controls.
- Fixed a mobile header overlap and a mobile changelog overflow issue.
- Clarified the error shown when a local profile has expired on the current server.

## Notes
- Evaluated and intentionally deferred for this release, with documented reopen triggers: capped credit season-to-season carry-over, and a deterministic race-engineer assistant (superseded for now by the new contextual card guidance). See `logics/roadmap/road_002_cr_league_roadmap_v2.md`.
