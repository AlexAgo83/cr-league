# CHANGELOGS 0.3.11

AI playtest balance, race reports, and replay readability polish.

Covers work started after `0.3.10`.

## Highlights

- Added an AI playtest runner for season-level strategy, card, fun, and frustration checks.
- Rebalanced aggressive, balanced, prudent, weather, reliability, defensive, hard-tire, and rival plans from playtest evidence.
- Lowered entry prices for core attack and rival cards so aggressive plans can buy their intended tools sooner.
- Improved race reports with a clearer plan-read recap and more actionable race-director copy.
- Moved the race payoff recap below the replay map and before the replay explainer.
- Reworked player replay gap display into separate nearby-car badges that hide unavailable values.

## Engineering

- Added AI playtest alerts for dominant profiles, weak profiles, dead card triggers, never-played cards, and overplayed cards.
- Reduced AI playtest card-selection bias so coverage is not dominated by a single weather card.
- Tuned balance simulation qualifying deltas to avoid overstating one obvious pure strategy.
- Added tests for replay payoff ordering and optional player gap formatting.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run logics:validate`
