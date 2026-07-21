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

## Final Corrections Applied

- Crop the transparent canvas to the vehicle bounds using `placed_at` plus `source_box` size.
- Rewrite `metadata.json` after crop:
  - `canvas.width` and `canvas.height` become the cropped PNG size.
  - `placed_at` becomes `{ "x": 0, "y": 0 }`.
  - all `x`, `center_x`, `y`, `center_y`, and `ground_y` coordinates are shifted by the crop offset.
- Keep `top.png`, `side.png`, and `metadata.json` together under `apps/web/public/assets/cars/crl-v2/car-XXX/`.

## Quick Check

```sh
npm test -- apps/web/src/app/App.test.tsx
```
