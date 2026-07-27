# CR League 0.4.0
Release date: 2026-07-23

## Added
- Separated canonical generated replay traces from legacy fallback reconstruction to avoid double-applying visual behavior.
- Added replay trace inspection output for Prague, Monaco, Montreal, and chrono runs.
- Persisted the shared replay speed preference across race and chrono maps and kept the speed menu above the map layers.

## Changed
- Updated package versions to `0.4.0` across root, web, API, and shared workspaces.
- Closed the Logics corpora for canonical race-track replay traces, replay realism layers, and chrono replay parity.

## Fixed
- Moved race replay motion onto the canonical simulation trace so map position, tower order, timeline, and replay facts stay aligned.
- Added race-track replay realism layers: launch phase, corner-speed motion, weather-visible handling, late-race pace fade, chrono-gap visual spacing, and traffic/defense annotations.
- Brought chrono replays closer to race-track behavior with circuit speed profiles, solo replay phases, and weather-visible trace speed.
- Kept internal workspace dependency versions aligned with `0.4.0`.
