# CHANGELOGS 0.4.0

Race-track replay realism and chrono parity release.

Covers work shipped after `0.3.28`.

## Highlights

- Moved race replay motion onto the canonical simulation trace so map position, tower order, timeline, and replay facts stay aligned.
- Added race-track replay realism layers: launch phase, corner-speed motion, weather-visible handling, late-race pace fade, chrono-gap visual spacing, and traffic/defense annotations.
- Separated canonical generated replay traces from legacy fallback reconstruction to avoid double-applying visual behavior.
- Added replay trace inspection output for Prague, Monaco, Montreal, and chrono runs.
- Brought chrono replays closer to race-track behavior with circuit speed profiles, solo replay phases, and weather-visible trace speed.
- Persisted the shared replay speed preference across race and chrono maps and kept the speed menu above the map layers.

## Engineering

- Updated package versions to `0.4.0` across root, web, API, and shared workspaces.
- Kept internal workspace dependency versions aligned with `0.4.0`.
- Closed the Logics corpora for canonical race-track replay traces, replay realism layers, and chrono replay parity.

## Validation

- `npm audit --audit-level=high`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run audit:circuits`
- `npm run replay:inspect`
- `npm run logics:validate`
