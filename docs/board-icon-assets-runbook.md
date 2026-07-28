# Board Icon Assets Runbook

This runbook covers CRL board icon sheets generated as 4x4 PNG grids and imported as
individual transparent icons under `apps/web/public/assets/crl/icons`.

The committed icons are **128x128 WebP**. The extraction script below writes 256x256 PNG
cells, so finish with a conversion pass before committing:

```bash
cd apps/web/public/assets/crl/icons
for f in *.png; do magick "$f" -resize 128x128 -quality 88 "${f%.png}.webp"; done
rm -f *.png
```

The icons render at 40px at most (`.plan-choice-board-icon`), so 128px covers retina with
room to spare. The set went from 5.4 MB as 256px PNG to 688 KB this way. `VisualIcon.test.tsx`
asserts every declared icon exists and carries a RIFF/WEBP header.

## Source Contract

Put raw generated sheets in `logics/external/` with a stable name such as:

- `board_icones_1.png`
- `board_icones_2.png`
- `board_icones_3.png`
- `board_icones_4.png`
- `board_icones_5.png`
- `board_icones_6.png`

These source sheets are ignored by Git. Commit only the final app WebP icons.

The ideal source sheet is:

- `1024x1024` PNG.
- 4 columns x 4 rows.
- One icon per `256x256` cell.
- Transparent background, or a simple background that can be removed.
- No labels, numbers, or grid lines.
- Generous padding inside each cell.

Generated sheets often violate the last two points. Always audit before wiring an
asset into UI.

## Prompt Rules

Ask for a `4 columns x 4 rows` sheet, not "16x16". The latter can be confused with
pixel size or grid density.

Important prompt constraints:

- transparent PNG sprite sheet;
- 16 icons total;
- each icon centered in its own square cell;
- generous transparent padding;
- no cropping;
- no text, no letters, no numbers;
- readable at 24px, 32px, and 48px;
- varied colors, not one repeated palette.

Ask for icon order explicitly, left-to-right then top-to-bottom. Use the same order
as the extraction name list.

## Extraction Names

Use kebab-case file names because `BoardIcon` resolves directly to
`/assets/crl/icons/${name}.webp`.

Example name list:

```py
names = [
    "new-chrono", "review-chrono", "send-plan", "launch-gp",
    "next-gp", "open-replay", "card-info", "edit-plan",
    "adjustable-wing", "defensive-order", "urban-draft", "rain-mapping",
    "soft-tires", "hard-tires", "fleet-maintenance", "pit-relay",
]
```

## Current App Coverage

The app currently imports six 4x4 board sheets. The committed PNGs cover:

- core actions: `new-chrono`, `review-chrono`, `send-plan`, `launch-gp`,
  `next-gp`, `open-replay`, `edit-plan`, `race-report`, `review-race`;
- Plan choices: approach, preparation, pit pack, card info, lock/empty-card states,
  and Plan risk markers;
- Garage: inventory/shop/team tabs, card names, buy/sell, car skin selection,
  save name/colors, unlock/selected states;
- Championship: Circuits, Standings, Palmares, Grand Prix history, mobile 2x2 tab
  layout;
- shell/support actions: Stand navigation, admin, changelog, copy-error, danger,
  settings/profile/logout/reset/back/next candidates.

Before requesting another generated sheet, inspect existing mappings in:

- `apps/web/src/features/VisualIcon.tsx`;
- `apps/web/src/features/DirectivePanel.tsx`;
- `apps/web/src/features/GarageView.tsx`;
- `apps/web/src/app/AppChrome.tsx`;
- `apps/web/src/app/AppModals.tsx`.

Only generate more assets when a UI command still falls back to an unrelated icon
or a current asset is unreadable at `24px`.

## Tools

Install local image tooling when needed:

```sh
brew install imagemagick
python3 -m pip install --user rembg onnxruntime
```

`rembg` gives the best first-pass cutout for AI-generated icon sheets with gradient
backgrounds. ImageMagick is useful for quick inspection, trimming, and ad hoc
debugging, but do not rely on color thresholding alone when the sheet has dark icon
shadows on a dark background.

## First-Pass Extraction

Run from repo root. This assumes a clean 4x4 grid:

```py
from pathlib import Path
from PIL import Image
from rembg import remove, new_session

source = "logics/external/board_icones_2.png"
out_dir = Path("apps/web/public/assets/crl/icons")
names = [
    "new-chrono", "review-chrono", "send-plan", "launch-gp",
    "next-gp", "open-replay", "card-info", "edit-plan",
    "adjustable-wing", "defensive-order", "urban-draft", "rain-mapping",
    "soft-tires", "hard-tires", "fleet-maintenance", "pit-relay",
]

session = new_session("u2netp")

def recenter(icon, max_size=226):
    icon = icon.convert("RGBA")
    alpha = icon.getchannel("A").point(lambda a: 0 if a < 12 else a)
    icon.putalpha(alpha)
    bbox = icon.getchannel("A").getbbox()
    if not bbox:
        return Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    subject = icon.crop(bbox)
    sw, sh = subject.size
    scale = min(1.0, max_size / max(sw, sh))
    if scale < 1.0:
        subject = subject.resize((round(sw * scale), round(sh * scale)), Image.Resampling.LANCZOS)
        sw, sh = subject.size
    canvas = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    canvas.alpha_composite(subject, ((256 - sw) // 2, (256 - sh) // 2))
    return canvas

sheet = Image.open(source).convert("RGBA")
for index, name in enumerate(names):
    x = (index % 4) * 256
    y = (index // 4) * 256
    cell = sheet.crop((x, y, x + 256, y + 256))
    cut = remove(
        cell,
        session=session,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=12,
        alpha_matting_erode_size=8,
    )
    recenter(cut).save(out_dir / f"{name}.png")
```

## Manual Recrop

If the generated sheet ignores cell boundaries, do not keep trying to tune the
whole-grid script. Crop the actual object bounds from the source sheet manually.

Example:

```py
manual = {
    "rain-mapping": ("logics/external/board_icones_2.png", (768, 500, 1024, 700)),
    "soft-tires": ("logics/external/board_icones_2.png", (0, 680, 256, 960)),
    "pit-relay": ("logics/external/board_icones_2.png", (768, 680, 1024, 960)),
    "race-report": ("logics/external/board_icones_5.png", (515, 248, 735, 445)),
    "rain-grip": ("logics/external/board_icones_5.png", (15, 460, 242, 662)),
    "mini-pack": ("logics/external/board_icones_5.png", (0, 690, 250, 928)),
}
```

Use the same `remove(...)` and `recenter(...)` functions on each manual crop.

Typical signs that manual recrop is required:

- a piece of the icon below appears in the PNG;
- the icon is chopped at the top/bottom of the `256x256` cell;
- a dark shadow from another cell survives as alpha;
- the bbox center is far from `(128, 128)`;
- the 24px preview reads as a random fragment.

## Audit Sheet

Always inspect icons at full size and at UI sizes:

```py
from PIL import Image, ImageDraw
from pathlib import Path

names = ["new-chrono", "review-chrono", "send-plan", "launch-gp"]
icon_dir = Path("apps/web/public/assets/crl/icons")
sheet = Image.new("RGBA", (320 * 4, 320), (20, 20, 22, 255))
draw = ImageDraw.Draw(sheet)

for index, name in enumerate(names):
    icon = Image.open(icon_dir / f"{name}.png").convert("RGBA")
    x = index * 320
    sheet.alpha_composite(icon, (x + 32, 10))
    draw.text((x + 12, 270), name, fill=(240, 240, 240))
    for preview_index, size in enumerate([48, 32, 24]):
        preview = icon.resize((size, size), Image.Resampling.LANCZOS)
        sheet.alpha_composite(preview, (x + 14 + preview_index * 62, 292))

sheet.save("/tmp/board-icon-audit.png")
```

Reject or recrop icons that are unclear at `24px`. For CRL command buttons and
card names, a technically transparent PNG is not enough; the miniature must read.

## App Integration

1. Add new names to `BoardIconName` in
   `apps/web/src/features/VisualIcon.tsx`.
2. Confirm each PNG is covered by
   `apps/web/src/features/VisualIcon.test.tsx`.
3. Wire UI mappings conservatively:
   - card names: `CARD_NAME_ICONS` in `GarageView.tsx`;
   - Plan choices: `APPROACH_ICONS`, `PREPARATION_ICONS`, `PIT_ICONS` in
     `DirectivePanel.tsx`;
   - command buttons: `BoardIcon name=...` in `PlanView.tsx` and
     `DirectivePanel.tsx`;
   - map circular actions: `MapActionIcon` in `DriveView.tsx`;
   - top nav or tabs only if the added icon improves scanning.
4. Do not replace a clean existing icon with a noisy generated one just for variety.

## UI Placement Rules

- Use `BoardIcon`; it renders decorative `img` with `aria-hidden`.
- Keep labels unchanged so accessible button names stay stable.
- Center icon + label with flex, not `vertical-align` tweaks.
- For Plan choice cards, marker dots belong between the icon and label:

```tsx
<BoardIcon className="plan-choice-board-icon" name={icon} />
<PlanChoiceMarker value={value} />
<strong>{label}</strong>
```

## Validation

Run at least:

```sh
rtk npm run test -- apps/web/src/features/VisualIcon.test.tsx
rtk npm run test -- apps/web/src/features/DirectivePanel.test.tsx
rtk npm run typecheck
rtk npm run lint
rtk logics-manager lint --require-status
```

If a full UI scenario fails on an unrelated known issue, record that explicitly in
the final note and keep the asset validation focused.
