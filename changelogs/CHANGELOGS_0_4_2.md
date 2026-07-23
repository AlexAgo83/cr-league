# CHANGELOGS 0.4.2

Replay performance, review-driven hardening, and internal modularization.

## Performance

- Smoothed replay map rendering: route geometry is now memoized on its immutable point set instead of being rebuilt on every frame, and the static map tile and route layers no longer re-render on each playback frame.
- Fixed a focus-camera micro-stutter: when following a car at high zoom the camera now tracks the same continuous position the car sprite is drawn from, so the followed car no longer appears to micro-teleport.

## Security and hardening

- Rate-limited unauthenticated write endpoints (league creation, joins, decisions) and profile creation to prevent database exhaustion.
- Rejected control characters in email normalization to close a mail-header-injection surface.
- Pushed admin profile and league list filtering and pagination down to the database instead of loading whole tables into memory.
- Made league owner-team removal resilient so admin controls can no longer be permanently locked out.

## Fixes

- Restored deterministic weather selection so replays stay identical across environments (weighted picks no longer depend on object key ordering).
- Position-gain cards now actually affect the finishing order — classification reads the card's advertised position delta instead of ignoring it.
- Made browser storage access crash-safe so the app still loads when `localStorage` is disabled or full.
- Fixed the replay scrubber leaking a grey box below the timeline by resetting the inherited input border and padding on the range slider.

## Internal

- Split the oversized leagues store into focused modules (`storeCore`, `lifecycle`, `resolution`, `decisions`, `cards`, `qualifyingStore`, `transactionHelpers`) behind the unchanged `store.ts` barrel, with behavior preserved.
- Extracted replay-trace generation out of the simulation core into `replayTrace.ts`.
- Added replay-trace-validator negative tests and removed dead exports.

## Validation

- `npm run lint`
- `npm run test`
- `npm run build`
