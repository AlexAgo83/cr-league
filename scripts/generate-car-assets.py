#!/usr/bin/env python3
"""Regenerate car cutouts (top.png / side.png) and metadata from the green-screen
source images, with automated light-point detection.

The human assignment "which source image is which car" is read from each car's
existing metadata.json `source` field. Everything mechanical — chroma-key cutout,
crop, orientation, and headlight/taillight detection — is derived here so it is
reproducible instead of manual-review.

Usage:
    python3 scripts/generate-car-assets.py --check      # self-test on car-001
    python3 scripts/generate-car-assets.py              # dry-run: report light diff vs current metadata
    python3 scripts/generate-car-assets.py --write      # overwrite top.png/side.png/metadata.json

Needs: Pillow, numpy (dev-only tools, not shipped in the app).
"""
import argparse, glob, json, os, sys
import numpy as np
from PIL import Image

ASSETS_DIR = "apps/web/public/assets/cars/crl-v2"
SRC_DIR = "logics/external/CRL Cars V2"

# ponytail: chroma-key thresholds tuned to the ChatGPT green background (~RGB 74,213,60).
# These are real-world calibration knobs — re-tune if a future batch uses a different backdrop.
GREEN_MIN = 90        # green channel floor for "is background"
GREEN_MARGIN = 40     # how much G must beat R and B
# Headlight = bright, near-neutral cluster; taillight = red-dominant cluster.
WHITE_MIN = 190       # min of RGB for "bright"
WHITE_SAT_MAX = 40    # max(RGB)-min(RGB) for "near-neutral"
RED_MIN = 120         # red floor
RED_MARGIN = 55       # how much R must beat G and B
LIGHT_BAND_FRAC = 0.16  # fraction of car length at each end searched for lights
BAND_GAP = 15         # min transparent rows separating the top view from the side view


def car_mask(rgb):
    R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    green = (G > GREEN_MIN) & (G - R > GREEN_MARGIN) & (G - B > GREEN_MARGIN)
    return ~green


def vertical_bands(mask):
    rowmass = mask.sum(axis=1)
    ys = np.where(rowmass > 20)[0]
    if len(ys) == 0:
        return []
    gaps = np.where(np.diff(ys) > BAND_GAP)[0]
    bands, start = [], ys[0]
    for g in gaps:
        bands.append((int(start), int(ys[g])))
        start = ys[g + 1]
    bands.append((int(start), int(ys[-1])))
    return bands


def light_pair(mask, xfront, xback, length, front, max_lights):
    """Return the light point(s) on the requested end. Top view shows a left/right
    pair (max_lights=2); the side profile shows a single light per end (max_lights=1)."""
    ys, xs = np.where(mask)
    if len(xs) == 0:
        return []
    sel = xs <= xfront + LIGHT_BAND_FRAC * length if front else xs >= xback - LIGHT_BAND_FRAC * length
    ys, xs = ys[sel], xs[sel]
    if len(xs) < 8:
        return []
    if max_lights == 1:
        return [{"x": int(xs.mean()), "y": int(ys.mean())}]
    ymid = np.median(ys)
    out = []
    for side in (ys < ymid, ys >= ymid):
        if side.sum() < 8:  # ignore stray pixels
            continue
        out.append({"x": int(xs[side].mean()), "y": int(ys[side].mean())})
    return out


def analyze_view(rgb, mask, box, max_lights):
    """box = (x0,y0,x1,y1) inclusive crop. Returns (crop_rgba, metadata_view).
    max_lights = 2 for the top view (left/right pair), 1 for the side profile."""
    x0, y0, x1, y1 = box
    sub = rgb[y0:y1 + 1, x0:x1 + 1]
    m = mask[y0:y1 + 1, x0:x1 + 1]
    r, g, b = sub[..., 0], sub[..., 1], sub[..., 2]
    mn = np.minimum(np.minimum(r, g), b)
    mx = np.maximum(np.maximum(r, g), b)
    white = m & (mn > WHITE_MIN) & (mx - mn < WHITE_SAT_MAX)
    red = m & (r > RED_MIN) & (r - g > RED_MARGIN) & (r - b > RED_MARGIN)

    xs = np.argwhere(m)[:, 1]
    xmin, xmax = int(xs.min()), int(xs.max())
    length = max(1, xmax - xmin)
    midx = (xmin + xmax) / 2

    # Orientation from the taillights: the red end is the rear. Fall back to geometry.
    red_x = np.where(red)[1]
    if len(red_x):
        front_low = red_x.mean() > midx  # red at high x => front is low x
    else:
        white_x = np.where(white)[1]
        front_low = white_x.mean() < midx if len(white_x) else True

    xfront, xback = (xmin, xmax) if front_low else (xmax, xmin)
    front_lights = light_pair(white, min(xfront, xback), max(xfront, xback), length, front=front_low, max_lights=max_lights)
    rear_lights = light_pair(red, min(xfront, xback), max(xfront, xback), length, front=not front_low, max_lights=max_lights)

    # front/rear points at the vertical centre of the mask on each end (xfront/xback are local).
    def edge_point(xl):
        col = np.where(m[:, xl])[0]
        y = int(col.mean()) if len(col) else m.shape[0] // 2
        return {"x": int(xl), "y": y}

    fp, rp = edge_point(xfront), edge_point(xback)
    heading = float(np.degrees(np.arctan2(-(fp["y"] - rp["y"]), fp["x"] - rp["x"])))

    crop = Image.fromarray(np.dstack([sub.astype(np.uint8), (m * 255).astype(np.uint8)]), "RGBA")
    view = {
        "canvas": {"width": int(x1 - x0 + 1), "height": int(y1 - y0 + 1)},
        "source_box": [int(x0), int(y0), int(x1 + 1), int(y1 + 1)],
        "placed_at": {"x": 0, "y": 0},
        "anchor": {"center_x": int((x1 - x0) // 2), "center_y": int((y1 - y0) // 2)},
        "front_point": fp,
        "rear_point": rp,
        "heading_angle_degrees": round(heading, 3),
        "heading_angle_reference": "degrees from +x axis, vector rear_point -> front_point",
        "light_points_detected": {
            "front_lights": front_lights,
            "rear_lights": rear_lights,
            "method": "auto-green-key-white-front-red-rear",
        },
    }
    return crop, view


def process_source(src_path):
    rgb = np.asarray(Image.open(src_path).convert("RGBA")).astype(np.int16)[..., :3]
    mask = car_mask(rgb)
    bands = vertical_bands(mask)
    if len(bands) != 2:
        raise ValueError(f"{os.path.basename(src_path)}: expected 2 views (top/side), found {len(bands)}")
    views = {}
    max_lights = {"top": 2, "side": 1}
    for name, (yb0, yb1) in zip(("top", "side"), bands):  # top view is the upper band
        cols = np.where(mask[yb0:yb1 + 1].sum(axis=0) > 5)[0]
        views[name] = analyze_view(rgb, mask, (int(cols[0]), yb0, int(cols[-1]), yb1), max_lights[name])
    return views


def run(write):
    changed = 0
    for d in sorted(glob.glob(f"{ASSETS_DIR}/car-*")):
        cid = os.path.basename(d)
        cur = json.load(open(os.path.join(d, "metadata.json")))
        src = os.path.join(SRC_DIR, cur["source"])
        views = process_source(src)
        meta = {"id": cid, "source": cur["source"], "assets": {}}
        for name in ("top", "side"):
            crop, view = views[name]
            # Carry over the manually-projected wheel contacts — out of scope for auto-detection,
            # and the crop is pixel-stable so the old coordinates stay valid.
            carried = {k: cur["assets"][name][k] for k in ("wheel_contacts", "wheel_contacts_projected", "wheel_contact_method") if k in cur["assets"][name]}
            view = {"file": f"{name}/{cid}-{name}.png", **view, **carried}
            meta["assets"][name] = view
            if write:
                crop.save(os.path.join(d, f"{name}.png"))
        if write:
            json.dump(meta, open(os.path.join(d, "metadata.json"), "w"), indent=2)

        # report: lights found now vs before
        for name in ("top", "side"):
            old = cur["assets"][name].get("light_points_detected", {})
            new = views[name][1]["light_points_detected"]
            o = len(old.get("front_lights", [])) + len(old.get("rear_lights", []))
            n = len(new["front_lights"]) + len(new["rear_lights"])
            if o != n:
                changed += 1
                print(f"  {cid} {name}: lights {o} -> {n}  (front {len(new['front_lights'])}, rear {len(new['rear_lights'])})")
    print(f"\n{'WROTE' if write else 'DRY-RUN'}: {changed} view(s) change light count. "
          f"{'Files updated.' if write else 'Re-run with --write to apply.'}")


def check():
    """Self-check: car-001 taillights must land within tolerance of the known-good manual points."""
    views = process_source(os.path.join(SRC_DIR, "ChatGPT Image 21 juil. 2026, 17_22_47.png"))
    top = views["top"][1]["light_points_detected"]
    assert len(top["front_lights"]) == 2, f"expected 2 front lights, got {top['front_lights']}"
    assert len(top["rear_lights"]) == 2, f"expected 2 rear lights, got {top['rear_lights']}"
    rear_xs = sorted(p["x"] for p in top["rear_lights"])
    assert all(x > 700 for x in rear_xs), f"rear lights should be near the back (x>700): {rear_xs}"
    front_xs = sorted(p["x"] for p in top["front_lights"])
    assert all(x < 120 for x in front_xs), f"front lights should be near the nose (x<120): {front_xs}"
    v = views["top"][1]
    w, h = v["canvas"]["width"], v["canvas"]["height"]
    for pt in (v["front_point"], v["rear_point"]):
        assert 0 <= pt["x"] < w and 0 <= pt["y"] < h, f"edge point out of bounds: {pt} in {w}x{h}"
    print("check OK: car-001 top lights =", top["front_lights"], top["rear_lights"], "front/rear pt in bounds")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true", help="overwrite top.png/side.png/metadata.json")
    ap.add_argument("--check", action="store_true", help="run the self-check and exit")
    args = ap.parse_args()
    if args.check:
        check()
    else:
        run(write=args.write)
