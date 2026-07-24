# CHANGELOGS 0.4.5

Replay map polish and circuit preview cleanup release.

## Circuit Preview

- Aligned preview car effects with the live circuit map, including tire marks, drift pose, lights, and speed feel.
- Tuned the championship circuit card layout and added localized stat copy for clearer scanning.

## Replay and Map

- Fixed map light layering and reduced GP replay trail rendering cost.
- Sanitized generated SVG car IDs so map renders stay valid across car names.
- Disabled tire trails in GP replays to remove visual clutter and avoid replay-map stutter.

## Validation

- `npm run lint`
- `npm run test`
- `npm run build`
