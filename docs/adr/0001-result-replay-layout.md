# ADR 0001: Result Replay Layout Contract

## Status

Accepted

## Context

Replay layout changes were ambiguous because panel names did not describe ownership of the map, controls, and key moments.

## Decision

The Replay view has three named zones:

- `replay-copy-panel` owns the "Race replay" title and description.
- `replay-map-panel` owns the circuit heading, map, cars, playback controls, weather timeline, and lap markers.
- `replay-moments-panel` owns key moments.

Desktop layout: `replay-copy-panel` is left/top, `replay-map-panel` sits below it, and `replay-moments-panel` is right aligned with `replay-copy-panel`.

Mobile layout: the zones stack as copy, map, moments.

## Verification

`tests/e2e/private-league.spec.ts` includes a layout contract test that checks DOM ownership, desktop positioning, mobile stacking, and writes desktop/mobile screenshots to Playwright test output.
