# CHANGELOGS 0.3.5

Playtest cockpit polish release for CR League.

## Highlights

- Moved the race plan into a dedicated screen opened from the race map.
- Added read-only plan review before launching the Grand Prix.
- Kept race, replay, and report inside the Course flow instead of splitting result navigation.
- Moved race actions onto the map and removed the old bottom command bar.
- Replaced the race workflow banner with a compact full-width map status bar.
- Added inline chrono replay on the circuit map with explicit close controls.
- Made GP replay close back to the finished race map and report close back to Course.
- Show final classification on the finished race map.
- Improved qualifying flow labels: New lap time, Review lap time, View plan.
- Run bot qualifying before plan lock so the grid is ready before GP launch.

## Engineering

- Updated package versions to `0.3.5` across root, web, API, and shared workspaces.
- Kept internal workspace dependency versions aligned with `0.3.5`.
- Covered the cockpit flow changes in the main app test.

## Validation

- `npm run typecheck`
- `npm run build`
- `npm test`
- `npm run lint`
- `npm run logics:validate`
