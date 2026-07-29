# CR League 0.8.3
Release date: 2026-07-29

## Changed
- The campaign map now keeps long chrono and qualifying lists compact on phones, with clearer pagination, tighter readouts and map actions that fit the available space.
- The profile menu now gives players a clear way back to solo saves and manages wide-screen navigation more consistently.

## Fixed
- Fixed the qualifying and Grand Prix replay plan panel on phones so it follows the circuit information panel instead of being positioned independently or overlapping it.
- Fixed several mobile map overlays, controls and phase panels so they no longer reserve unnecessary width or collide with command controls.
- Fixed admin, setup and profile layouts that could lose their common left edge or overflow at narrow widths.

## Validation
- `npm run lint`
- `npm run test`
- `npm run build`
