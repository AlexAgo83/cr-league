# ADR 0001: Result Replay Layout Contract

## Status

Accepted

## Context

Replay layout changes were ambiguous because panel names did not describe ownership of the map, controls, and key moments.

## Decision

The Replay view has three named zones:

- `replay-map-panel` owns the circuit heading, map, cars, weather timeline, and lap markers.
- `replay-copy-panel` owns the "Race replay" title, description, and playback controls.
- `replay-moments-panel` owns key moments.

Desktop layout: `replay-map-panel` is left, `replay-moments-panel` is right, and `replay-copy-panel` sits below `replay-map-panel`.

Mobile layout: the zones stack as map, copy/controls, moments.

## Verification

`tests/e2e/private-league.spec.ts` includes a layout contract test that checks DOM ownership, desktop positioning, mobile stacking, and writes desktop/mobile screenshots to Playwright test output.
