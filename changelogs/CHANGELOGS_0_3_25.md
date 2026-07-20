# CHANGELOGS 0.3.25

Plan stat vocabulary and map stat impact polish.

Covers work shipped after `0.3.24`.

## Highlights

- Aligned Plan stat names and descriptions with the Course/Replay stat panels: Adhérence/Grip, Attaque/Attack, and Endurance.
- Moved Attaque/Attack to a blue stat color across map, Plan, badges, and gauges.
- Gave Plan category accents distinct colors: Approche uses magenta, Prépa pneus uses turquoise.
- Replaced Course/Replay stat-panel config counters with signed setup totals (`+X`, `-X`, `±0`), matching the Plan read.

## Engineering

- Updated package versions to `0.3.25` across root, web, API, and shared workspaces.
- Kept internal workspace dependency versions aligned with `0.3.25`.
- Reused the existing Plan effect values for the map stat readout; no gameplay, API, or database changes.

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run logics:validate`
