#!/usr/bin/env python3
"""Regenerate car cutouts (top.png / side.png) and metadata from the green-screen
source images, with automated light-point detection.

The human assignment "which source image is which car" is read from each car's
existing metadata.json `source` field. Everything mechanical — chroma-key cutout,
crop, orientation, and headlight/taillight placement — is derived here so it is
reproducible instead of manual-review.

Light placement is hybrid (corner geometry + color refinement): lamps are anchored to
the silhouette corners — the only signal that holds across the fleet, since most cars
are white/silver and plain brightness lands on bodywork, not the optic — then pulled
onto a real red (rear) or bright (front) cluster when one sits at that corner. Points
placed geometrically carry {"geometric": true}; the method tag gets +partial-geometry.
The chroma key removes the drop shadow too, by keying green relative to each pixel's
own brightness rather than an absolute floor.

Usage:
    python3 scripts/generate-car-assets.py --check      # self-test on car-001
    python3 scripts/generate-car-assets.py              # dry-run: report light diff vs current metadata
    python3 scripts/generate-car-assets.py --write      # overwrite top.png/side.png/metadata.json

Needs: Pillow, numpy (dev-only tools, not shipped in the app).
"""
import argparse, glob, json, os, sys
import numpy as np
from PIL import Image, ImageDraw

ASSETS_DIR = "apps/web/public/assets/cars/crl-v2"
SRC_DIR = "logics/external/CRL Cars V2"

# ponytail: chroma-key thresholds tuned to the ChatGPT green background (~RGB 74,213,60).
# These are real-world calibration knobs — re-tune if a future batch uses a different backdrop.
# Keyed on green *dominance relative to the pixel's own brightness* (not an absolute floor) so
# the darkened green of the drop shadow is also removed instead of surviving as a dark blob.
GREEN_RATIO = 0.28    # G must beat R and B by this fraction of G ...
GREEN_BIAS = 8        # ... plus this bias, to avoid keying near-black noise
# Headlight = bright, near-neutral cluster; taillight = red-dominant cluster.
WHITE_MIN = 190       # min of RGB for "bright"
WHITE_SAT_MAX = 40    # max(RGB)-min(RGB) for "near-neutral"
RED_MIN = 120         # red floor
RED_MARGIN = 55       # how much R must beat G and B
TIRE_DARK_MAX = 70    # max(RGB) ceiling for "near-black tyre" (side wheel hub centres)
LIGHT_BAND_FRAC = 0.16  # fraction of car length at each end searched for lights
BAND_GAP = 15         # min transparent rows separating the top view from the side view


def car_mask(rgb):
    R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    mx = np.maximum(np.maximum(R, G), B)
    green = (G == mx) & (G - R > GREEN_RATIO * G + GREEN_BIAS) & (G - B > GREEN_RATIO * G + GREEN_BIAS)
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


def end_lights(m, color, end_x, length, n, vband=None):
    """Light point(s) at one end of the car: anchored to the silhouette corners, then
    refined toward a nearby colored cluster when one is actually there.

    Corners are the reliable signal across the whole fleet — most cars are white/silver,
    so plain brightness lands on bodywork, not the lamp. We place lights at the extreme
    corners (never mid-body) and only pull a point onto a real red/bright cluster if it
    sits inside the corner window. Geometric (unrefined) points carry {"geometric": true}.

    n=2 -> top view left/right pair (spread over the mask width).
    n=1 -> side profile single light. `vband=(lo,hi)` restricts placement and refinement to
    a vertical fraction of the crop height — for the side view lamps live in the upper band,
    above the wheel line, so this keeps the point off the bumper/wheel it used to fall onto.
    """
    H, W = m.shape
    ex = min(max(end_x, 0), W - 1)
    lo, hi = max(0, ex - int(LIGHT_BAND_FRAC * length)), min(W - 1, ex + int(LIGHT_BAND_FRAC * length))
    ypresent = m[:, lo:hi + 1].any(axis=1)
    ys = np.where(ypresent)[0]
    if len(ys) == 0:
        return []
    y0, y1 = int(ys[0]), int(ys[-1])
    span = max(1, y1 - y0)
    vlo, vhi = (0, H) if vband is None else (int(y0 + vband[0] * span), int(y0 + vband[1] * span))
    if n == 2:
        inset = int(0.15 * span)
        anchors = [(ex, y0 + inset), (ex, y1 - inset)]
    else:
        anchors = [(ex, (vlo + vhi) // 2)]  # upper band centre for the side profile
    cy, cx = np.where(color)
    out = []
    for ax, ay in anchors:
        if len(cx):
            near = (np.abs(cx - ax) <= 0.10 * length) & (np.abs(cy - ay) <= 0.25 * span) & (cy >= vlo) & (cy <= vhi)
            if near.sum() >= 8:  # a real colored lamp sits in this window
                out.append({"x": int(cx[near].mean()), "y": int(cy[near].mean())})
                continue
        out.append({"x": int(ax), "y": int(ay), "geometric": True})
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
    dark = m & (mx < TIRE_DARK_MAX)  # near-black tyres, for side wheel hub centres

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

    # Side profile (max_lights==1): lamps sit in the upper band, above the wheel line.
    vband = (0.12, 0.55) if max_lights == 1 else None
    xfront, xback = (xmin, xmax) if front_low else (xmax, xmin)
    front_lights = end_lights(m, white, xfront, length, max_lights, vband)
    rear_lights = end_lights(m, red, xback, length, max_lights, vband)

    # front/rear points at the vertical centre of the mask on each end (xfront/xback are local).
    def edge_point(xl):
        col = np.where(m[:, min(max(xl, 0), m.shape[1] - 1)])[0]
        y = int(col.mean()) if len(col) else m.shape[0] // 2
        return {"x": int(xl), "y": y}

    fp, rp = edge_point(xfront), edge_point(xback)
    heading = float(np.degrees(np.arctan2(-(fp["y"] - rp["y"]), fp["x"] - rp["x"])))

    # Method tag: corner geometry with color refinement; +partial-geometry when any lamp
    # was placed geometrically because no red/bright cluster confirmed it.
    method = "auto-corner-geometry+color-refine"
    if any(p.get("geometric") for p in front_lights + rear_lights):
        method += "+partial-geometry"

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
            "method": method,
        },
    }
    return crop, view, m, front_low, dark


def detect_side_wheels(m, front_low, dark):
    """Ground contacts from the bottom alpha edge: the two widest column-clusters touching
    the lowest row are the front and rear wheels. Each point also carries the hub centre
    (`center_x`/`center_y`). The hub sits directly above the ground contact at a height equal
    to the wheel radius, so we fit the radius to the tyre's outer edges at low heights (pure
    tyre, below the wheel arch) via the tangent-circle relation r = (halfwidth² + h²) / 2h.
    Returns (points, {axle: frac-from-front})."""
    H, W = m.shape
    bottom = np.where(m.any(axis=0), (m * np.arange(H)[:, None]).max(axis=0), -1)
    ground = int(bottom.max())
    touch = np.where(bottom >= ground - 4)[0]
    if len(touch) == 0:
        return [], {}
    groups = [g for g in np.split(touch, np.where(np.diff(touch) > 15)[0] + 1) if len(g) > 10]
    groups = sorted(sorted(groups, key=len, reverse=True)[:2], key=lambda g: g.mean())
    if not groups:
        return [], {}
    xs_all = np.argwhere(m)[:, 1]
    xmin, xmax = float(xs_all.min()), float(xs_all.max())
    length = max(1.0, xmax - xmin)
    xfront = xmin if front_low else xmax
    labels = ["front", "rear"] if front_low else ["rear", "front"]
    gx = [int(g.mean()) for g in groups]
    wheelbase = abs(gx[1] - gx[0]) if len(gx) == 2 else int(0.5 * W)
    win = max(12, int(0.28 * wheelbase))  # tyre never wider than ~half the wheelbase
    pts, fracs = [], {}
    for lab, x in zip(labels, gx):
        radii = []
        for h in range(4, 22, 2):  # low band only: pure tyre, below the arch
            y = ground - h
            if y < 0:
                break
            idx = np.where(dark[y, max(0, x - win):min(W, x + win)])[0]
            if len(idx) < 3:
                continue
            half = (idx.max() - idx.min()) / 2.0
            radii.append((half * half + h * h) / (2 * h))
        r = float(np.median(radii)) if radii else 0.15 * wheelbase
        r = max(0.08 * wheelbase, min(r, 0.20 * wheelbase))  # keep the hub on-canvas when the fit is fooled (open-wheel floors, wide arches)
        pts.append({"wheel": lab, "x": x, "y": ground, "center_x": x, "center_y": int(round(ground - r))})
        fracs[lab] = abs(x - xfront) / length
    return pts, fracs


def detect_top_wheels(m, fracs, front_low):
    """Map the side view's wheel positions (fraction along the car, front->rear) onto the top
    view and place each axle's pair at the lateral silhouette extremes (wheels stick out)."""
    H, W = m.shape
    xs_all = np.argwhere(m)[:, 1]
    xmin, xmax = int(xs_all.min()), int(xs_all.max())
    length = max(1, xmax - xmin)
    xfront = xmin if front_low else xmax
    direction = 1 if front_low else -1
    out = []
    for axle in ("front", "rear"):
        if axle not in fracs:
            continue
        x = min(max(int(xfront + direction * fracs[axle] * length), 0), W - 1)
        col = np.where(m[:, x])[0]
        if len(col) == 0:
            continue
        ytop, ybot = int(col[0]), int(col[-1])
        inset = int(0.06 * (ybot - ytop))
        out.append({"wheel": f"{axle}_left", "x": x, "y": ytop + inset})
        out.append({"wheel": f"{axle}_right", "x": x, "y": ybot - inset})
    return out


def process_source(src_path):
    rgb = np.asarray(Image.open(src_path).convert("RGBA")).astype(np.int16)[..., :3]
    mask = car_mask(rgb)
    bands = vertical_bands(mask)
    if len(bands) != 2:
        raise ValueError(f"{os.path.basename(src_path)}: expected 2 views (top/side), found {len(bands)}")
    max_lights = {"top": 2, "side": 1}
    raw = {}
    for name, (yb0, yb1) in zip(("top", "side"), bands):  # top view is the upper band
        cols = np.where(mask[yb0:yb1 + 1].sum(axis=0) > 5)[0]
        raw[name] = analyze_view(rgb, mask, (int(cols[0]), yb0, int(cols[-1]), yb1), max_lights[name])
    # Wheels: side from bottom-alpha clusters (+ hub centre), top mapped from the side fractions.
    side_wheels, fracs = detect_side_wheels(raw["side"][2], raw["side"][3], raw["side"][4])
    top_wheels = detect_top_wheels(raw["top"][2], fracs, raw["top"][3])
    wheels = {"side": (side_wheels, "auto-bottom-alpha-clusters"),
              "top": (top_wheels, "auto-side-frac-mapped-to-top-lateral")}
    views = {}
    for name in ("top", "side"):
        crop, view = raw[name][0], raw[name][1]
        pts, method = wheels[name]
        views[name] = (crop, {**view, "wheel_contacts": pts, "wheel_contact_method": method})
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
            view = {"file": f"{name}/{cid}-{name}.png", **view}
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


def overlay(crop, view):
    """Return a copy of the cutout with detected points drawn on it for visual QA."""
    img = crop.convert("RGBA").copy()
    dr = ImageDraw.Draw(img)
    def dot(p, color, r=6):
        dr.ellipse([p["x"] - r, p["y"] - r, p["x"] + r, p["y"] + r], outline=color, width=3)
    lp = view["light_points_detected"]
    for p in lp["front_lights"]:
        dot(p, (255, 150, 0, 255) if p.get("geometric") else (0, 220, 255, 255))   # orange = geometric, cyan = detected
    for p in lp["rear_lights"]:
        dot(p, (255, 150, 0, 255) if p.get("geometric") else (255, 40, 40, 255))   # orange = geometric, red = detected
    dot(view["front_point"], (255, 220, 0, 255), r=9)   # yellow = nose
    dot(view["rear_point"], (180, 120, 255, 255), r=9)  # purple = tail
    for wc in view.get("wheel_contacts", []):
        x, y = wc["x"], wc["y"]
        dr.rectangle([x - 6, y - 6, x + 6, y + 6], outline=(50, 230, 80, 255), width=3)  # green = ground contact
        if "center_x" in wc:
            cx, cy = wc["center_x"], wc["center_y"]
            dr.line([cx - 7, cy, cx + 7, cy], fill=(120, 255, 140, 255), width=3)          # light-green cross = hub centre
            dr.line([cx, cy - 7, cx, cy + 7], fill=(120, 255, 140, 255), width=3)
    return img


def preview(out_dir):
    os.makedirs(out_dir, exist_ok=True)
    rows = []
    for d in sorted(glob.glob(f"{ASSETS_DIR}/car-*")):
        cid = os.path.basename(d)
        cur = json.load(open(os.path.join(d, "metadata.json")))
        views = process_source(os.path.join(SRC_DIR, cur["source"]))
        cdir = os.path.join(out_dir, cid)
        os.makedirs(cdir, exist_ok=True)
        meta = {"id": cid, "source": cur["source"], "assets": {}}
        cells = []
        for name in ("top", "side"):
            crop, view = views[name]
            crop.save(os.path.join(cdir, f"{name}.png"))
            overlay(crop, view).save(os.path.join(cdir, f"{name}.overlay.png"))
            meta["assets"][name] = {"file": f"{name}/{cid}-{name}.png", **view}
            lp = view["light_points_detected"]
            geo = sum(1 for p in lp["front_lights"] + lp["rear_lights"] if p.get("geometric"))
            note = f' <span style="color:#f90">({geo} geo)</span>' if geo else ""
            cells.append(
                f'<figure><img src="{cid}/{name}.overlay.png" alt=""><figcaption>{name}: '
                f'{len(lp["front_lights"])} front / {len(lp["rear_lights"])} rear{note}</figcaption></figure>')
        json.dump(meta, open(os.path.join(cdir, "metadata.json"), "w"), indent=2)
        rows.append(f'<section><h2>{cid} <small>{cur["source"]}</small></h2><div class="pair">{"".join(cells)}</div></section>')
    html = (
        '<!doctype html><meta charset="utf-8"><title>Car asset preview</title>'
        '<style>body{background:#111;color:#eee;font:14px system-ui;margin:0;padding:24px}'
        'h2{margin:24px 0 8px;font-size:15px}small{color:#888;font-weight:400}'
        '.pair{display:flex;gap:16px;flex-wrap:wrap}figure{margin:0;background:#1c1c1c;padding:8px;border-radius:8px}'
        'img{max-height:200px;display:block;background:'
        'repeating-conic-gradient(#2a2a2a 0 25%,#222 0 50%) 0 0/20px 20px}'
        'figcaption{margin-top:6px;color:#aaa;font-size:12px}'
        '.legend{position:sticky;top:0;background:#111;padding:8px 0}'
        '.legend b{color:#0dc;} .legend i{color:#f44;font-style:normal} .legend u{color:#fc0;text-decoration:none}</style>'
        '<div class="legend"><b>● front (detected)</b> &nbsp; <i>● rear (detected)</i> &nbsp; '
        '<span style="color:#f90">● geometric corner</span> &nbsp; <u>● nose</u> &nbsp; '
        '<span style="color:#3e6">▢ wheel contact</span></div>'
        + "".join(rows))
    with open(os.path.join(out_dir, "index.html"), "w") as f:
        f.write(html)
    print(f"preview written to {out_dir}/index.html ({len(rows)} cars)")


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
    side_wheels = views["side"][1]["wheel_contacts"]
    assert len(side_wheels) == 2, f"expected 2 side wheels, got {side_wheels}"
    swx = sorted(p["x"] for p in side_wheels)
    assert swx[0] < 250 and swx[1] > 500, f"side wheels should be front/rear split: {swx}"
    assert len(views["top"][1]["wheel_contacts"]) == 4, "expected 4 top wheel contacts"
    for wc in side_wheels:  # hub sits above the ground contact by a plausible radius
        r = wc["y"] - wc["center_y"]
        assert 40 < r < wc["y"], f"wheel radius out of range for {wc}"
    print("check OK: lights", top["front_lights"], top["rear_lights"], "| side wheels", swx,
          "| radii", [w["y"] - w["center_y"] for w in side_wheels])


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--write", action="store_true", help="overwrite top.png/side.png/metadata.json")
    ap.add_argument("--check", action="store_true", help="run the self-check and exit")
    ap.add_argument("--preview", metavar="DIR", help="write cutouts + overlays + index.html to DIR (no project files touched)")
    args = ap.parse_args()
    if args.check:
        check()
    elif args.preview:
        preview(args.preview)
    else:
        run(write=args.write)
