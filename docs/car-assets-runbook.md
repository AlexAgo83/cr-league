# Car Assets Runbook

## Sources

- Raw generations live outside the app in `logics/external/CRL Cars V2`.
- Prepared exports live in `logics/external/CRL Cars V2 processed`.
- The prepared folder must contain:
  - `manifest.json`
  - `top/car-XXX-top.png`
  - `side/car-XXX-side.png`

## Prepared Export Contract

Each manifest car entry needs:

- `id`: `car-001`, `car-002`, etc.
- `assets.top.file` and `assets.side.file`
- `assets.*.source_box`: original detected vehicle bounds
- `assets.*.placed_at`: vehicle position inside the transparent canvas
- optional anchors, wheel contacts, light points, and heading data

The processed PNGs may still be on large transparent canvases. The app import crops them before shipping.

## Final App Import

Run from the repo root after updating `logics/external/CRL Cars V2 processed`:

```sh
python3 - <<'PY'
from __future__ import annotations
import json
from pathlib import Path
from PIL import Image

root = Path('logics/external/CRL Cars V2 processed')
out_root = Path('apps/web/public/assets/cars/crl-v2')
manifest = json.loads((root / 'manifest.json').read_text())

def shift_value(key, value, dx, dy):
    if not isinstance(value, (int, float)):
        return value
    if key in {'x', 'center_x'}:
        return value - dx
    if key in {'y', 'center_y', 'ground_y'}:
        return value - dy
    return value

def shift(obj, dx, dy):
    if isinstance(obj, dict):
        return {k: shift(shift_value(k, v, dx, dy), dx, dy) for k, v in obj.items()}
    if isinstance(obj, list):
        return [shift(v, dx, dy) for v in obj]
    return obj

for car in manifest['cars']:
    car_dir = out_root / car['id']
    car_dir.mkdir(parents=True, exist_ok=True)
    next_car = {k: v for k, v in car.items() if k != 'assets'}
    next_car['assets'] = {}
    for view in ('top', 'side'):
        asset = car['assets'][view]
        src = root / asset['file']
        x, y = asset['placed_at']['x'], asset['placed_at']['y']
        w = asset['source_box'][2] - asset['source_box'][0]
        h = asset['source_box'][3] - asset['source_box'][1]
        Image.open(src).crop((x, y, x + w, y + h)).save(car_dir / f'{view}.png')
        next_asset = shift(asset, x, y)
        next_asset['file'] = f'{view}/{car["id"]}-{view}.png'
        next_asset['canvas'] = {'width': w, 'height': h}
        next_asset['placed_at'] = {'x': 0, 'y': 0}
        next_car['assets'][view] = next_asset
    (car_dir / 'metadata.json').write_text(json.dumps(next_car, indent=2) + '\n')
    print(car['id'])
PY
```

Then update `apps/web/src/features/carAssets.ts` so `CAR_ASSETS` exposes every imported `car-XXX`.

## Runtime Map Geometry

`CircuitMap` uses a compact copy of each top-view canvas size, wheel contacts, and
front/rear light points from `metadata.json`. Keep `RAW_CAR_GEOMETRY` and
`RAW_REAR_LIGHTS` in
`apps/web/src/features/carAssets.ts` synchronized when assets are regenerated.

The runtime geometry follows these rules:

- the midpoint of the front wheel contacts is the local origin and drift pivot;
- the front-to-rear axle vector is normalized toward positive X, including source
  assets such as `car-014` that face the opposite direction;
- the original canvas ratio is preserved;
- the rendered wheelbase is derived from the detected wheelbase and bounded to
  18-22 map units because source pixels do not provide a certified physical scale;
- rear-wheel contacts feed two ground-fixed SVG paths while the drift angle exceeds
  3 degrees; samples expire after 1.1 seconds;
- front-light points feed blurred SVG light cones rendered below the body;
- rear-light points feed shorter red cones, with a stronger glow while the car is
  inside a circuit `braking` speed-profile span.

This stays in the existing SVG scene. A shader is not needed for short-lived tire
marks and would require a second rendering stack without improving their ground
contact.

## Final Corrections Applied

- Crop the transparent canvas to the vehicle bounds using `placed_at` plus `source_box` size.
- Rewrite `metadata.json` after crop:
  - `canvas.width` and `canvas.height` become the cropped PNG size.
  - `placed_at` becomes `{ "x": 0, "y": 0 }`.
  - all `x`, `center_x`, `y`, `center_y`, and `ground_y` coordinates are shifted by the crop offset.
- Keep `top.png`, `side.png`, and `metadata.json` together under `apps/web/public/assets/cars/crl-v2/car-XXX/`.

## Raw Green-Screen Imports (automated)

Files added to `logics/external/CRL Cars V2` are processed by
`scripts/generate-car-assets.py` — a reproducible pipeline that replaces the old
manual split/chroma-key/point-marking. It needs Pillow and numpy (dev-only tools):

```sh
python3 scripts/generate-car-assets.py --check           # self-test on car-001
python3 scripts/generate-car-assets.py                   # dry-run: report light-count changes
python3 scripts/generate-car-assets.py --preview tmp/car-assets-preview   # visual QA sheet
python3 scripts/generate-car-assets.py --write           # overwrite top.png/side.png/metadata.json
```

The source→car assignment is read from each car's existing `metadata.json` `source`
field, so the pipeline preserves which image is which car and regenerates only the
mechanical parts. Per source image it detects the two stacked views (top = upper band,
side = lower band), keys out the green background, crops to the car, and writes metadata.

What it derives:

- **Cutout** — green keyed *relative to each pixel's brightness*, not an absolute floor,
  so the darkened green of the drop shadow is removed instead of surviving as a dark blob.
- **Orientation** — the red end is the rear; `front_point`/`rear_point` and
  `heading_angle_degrees` follow from the silhouette.
- **Light points** — hybrid corner geometry + color refinement. Lamps are anchored to the
  silhouette corners (the only signal that holds when most cars are white/silver and plain
  brightness lands on bodywork), then pulled onto a real red (rear) or bright (front)
  cluster when one sits at that corner. On the side profile, placement and refinement are
  constrained to the upper band (above the wheel line) where optics actually live, so the
  point no longer drops onto the bumper or wheel. Geometric points carry `"geometric": true`
  and the method is tagged `+partial-geometry`.
- **Wheel contacts** — side view: the two widest column-clusters touching the lowest alpha
  row (ground contacts), each also carrying the hub centre (`center_x`/`center_y`). The hub is
  directly above the contact at a height equal to the wheel radius, fitted from the tyre's
  outer edges at low heights (below the arch) via the tangent-circle relation
  `r = (halfwidth² + h²) / 2h` (with a ~0.87 factor for contact-patch flattening), then refined
  by averaging with a rim-interior flood-fill centroid when that flood has strong support
  (silver rims); a plain centroid drifts high because the dark arch and cladding above the tyre
  pull it up. Accurate to a few px on normal cars; open-wheel (F1) hubs are approximate.
  Top view: the side wheel positions (fraction front→rear)
  mapped onto the top and placed at the lateral silhouette extremes, where the tyres stick out.

Preview overlays colour detected front lamps cyan, detected rear lamps red, geometric
corners orange, and the nose marker yellow — open `index.html` in the preview dir to scan
all 16 at once before `--write`.

Calibration knobs (green ratio, white/red thresholds, light band fraction) live as
constants at the top of the script; re-tune them if a future batch uses a different backdrop.

After adding more cars:

- increase the `CAR_ASSETS` length in `apps/web/src/features/carAssets.ts`;
- update the bot skin modulo in `apps/api/src/features/leagues/utils.ts`;
- keep `car-008` as `DEFAULT_CAR_ASSET` unless the default changes again.

## Quick Check

```sh
npm test -- apps/web/src/features/CircuitMap.test.ts apps/web/src/features/CircuitMap.render.test.tsx
npm run typecheck
```
