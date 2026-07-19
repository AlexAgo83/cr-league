# CHANGELOGS 0.3.10

Replay realism, pit strategy, loading feedback, and UI polish for CR League.

Covers work started after `0.3.9`.

## Highlights

- Added battery pack pit strategy choices with replayed pit stops and timeline moments.
- Moved race replay behavior to generated trace data for car positions, overtakes, pit phases, and staggered starts.
- Added replay URLs using short Grand Prix identifiers.
- Added dynamic circuit start-line and pit-stop placement from circuit geometry.
- Added animated asset placeholders, fade-in image loading, and API pending feedback across key flows.
- Moved modal imagery into header heroes and aligned Garage headers with Championship styling.
- Persisted the unlocked race-plan draft between Grand Prix rounds.
- Fixed the GitHub security alert around email normalization.

## Engineering

- Updated package versions to `0.3.10` across root, web, API, and shared workspaces.
- Kept internal workspace dependency versions aligned with `0.3.10`.
- Added `pitStrategy` persistence in Prisma race decisions.
- Added trace validation for realistic replay movement, pit phases, and event anchoring.
- Removed client-side replay position fallbacks that masked stale race traces.
- Added route cleanup when moving to the next Grand Prix.

## Validation

- `npm run lint`
- `npm run test`
- `npm run build`
