# CR League 0.3.10
Release date: 2026-07-19

## Added
- Added battery pack pit strategy choices with replayed pit stops and timeline moments.
- Added replay URLs using short Grand Prix identifiers.
- Added animated asset placeholders, fade-in image loading, and API pending feedback across key flows.
- Persisted the unlocked race-plan draft between Grand Prix rounds.
- Added route cleanup when moving to the next Grand Prix.

## Changed
- Moved race replay behavior to generated trace data for car positions, overtakes, pit phases, and staggered starts.
- Updated package versions to `0.3.10` across root, web, API, and shared workspaces.
- Removed client-side replay position fallbacks that masked stale race traces.

## Fixed
- Added dynamic circuit start-line and pit-stop placement from circuit geometry.
- Moved modal imagery into header heroes and aligned Garage headers with Championship styling.
- Fixed the GitHub security alert around email normalization.
- Kept internal workspace dependency versions aligned with `0.3.10`.
- Added `pitStrategy` persistence in Prisma race decisions.
- Added trace validation for realistic replay movement, pit phases, and event anchoring.
