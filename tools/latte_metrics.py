#!/usr/bin/env python3
"""Latte-art metrics on a top-down latte surface image (KIT_ADOPTION Q3).

    .venv/bin/python tools/latte_metrics.py <image.png> [--target assets/patterns/rosetta_target.png] [--json out.json]

The image is the cup's liquid surface, square, the cup disk inscribed (the game's 72 px grab, or a target
made by tools/make_target.py). Numbers (all from pixels, no judgement):
  coverage   share of the disk that is milk-white
  width      milk extent left-right / cup diameter (2nd-98th percentile, ignores stray dots)
  height     milk extent far-near / cup diameter
  symmetry   IoU of the milk mask and its mirror about the milk's own centre line (1 = perfectly symmetric)
  offset     distance of the milk centroid from the cup centre, in cup radii
  leaves     white runs along two vertical scan lines left and right of the centre line (leaf count per side)
  match      IoU of this milk mask with the target's (shape agreement, both in cup coordinates)
"""
import argparse
import json
import sys

import numpy as np
from PIL import Image

MILK_LUMA = 0.62  # luminance above this (0..1) counts as milk


def load(path, size=72):
    im = Image.open(path).convert("RGB").resize((size, size), Image.NEAREST)
    a = np.asarray(im, dtype=np.float32) / 255.0
    luma = 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]
    yy, xx = np.mgrid[0:size, 0:size]
    c = (size - 1) / 2
    r = np.hypot(xx - c, yy - c) / (size / 2)
    disk = r < 0.95
    milk = (luma > MILK_LUMA) & disk
    return milk, disk


def runs(col):
    n, prev = 0, False
    for v in col:
        if v and not prev:
            n += 1
        prev = v
    return n


def metrics(milk, disk):
    size = milk.shape[0]
    out = {"coverage": float(milk.sum() / max(1, disk.sum()))}
    ys, xs = np.nonzero(milk)
    if len(xs) < 5:
        out.update(width=0.0, height=0.0, symmetry=0.0, offset=None, leaves=0.0)
        return out
    out["width"] = float((np.percentile(xs, 98) - np.percentile(xs, 2) + 1) / size)
    out["height"] = float((np.percentile(ys, 98) - np.percentile(ys, 2) + 1) / size)
    cx, cy = xs.mean(), ys.mean()
    c = (size - 1) / 2
    out["offset"] = float(np.hypot(cx - c, cy - c) / (size / 2))
    # mirror about the milk's vertical centre line
    shift = int(round(2 * cx - (size - 1)))
    mir = np.fliplr(milk)
    mir = np.roll(mir, shift, axis=1)
    inter, union = (milk & mir).sum(), (milk | mir).sum()
    out["symmetry"] = float(inter / max(1, union))
    # leaf count: white runs on vertical lines at +-35% of the half width from the centre line
    half = (np.percentile(xs, 98) - np.percentile(xs, 2)) / 2
    counts = []
    for side in (-1, 1):
        x = int(round(cx + side * 0.35 * half))
        x = min(max(x, 0), size - 1)
        counts.append(runs(milk[:, x]))
    out["leaves"] = float(np.mean(counts))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("image")
    ap.add_argument("--target")
    ap.add_argument("--json")
    a = ap.parse_args()
    milk, disk = load(a.image)
    m = metrics(milk, disk)
    res = {"image": a.image, "metrics": m}
    if a.target:
        tm, td = load(a.target)
        res["target"] = metrics(tm, td)
        res["metrics"]["match"] = float((milk & tm).sum() / max(1, (milk | tm).sum()))
    if a.json:
        json.dump(res, open(a.json, "w"), indent=1)
    m = res["metrics"]
    t = res.get("target", {})
    def f(k):
        v = m.get(k)
        s = "-" if v is None else f"{v:.2f}"
        if k in t and t[k] is not None:
            s += f" (target {t[k]:.2f})"
        return f"{k} {s}"
    print(" · ".join(f(k) for k in ("match", "coverage", "width", "height", "symmetry", "offset", "leaves") if k in m))


if __name__ == "__main__":
    sys.exit(main())
