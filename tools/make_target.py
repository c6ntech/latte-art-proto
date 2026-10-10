#!/usr/bin/env python3
"""Turn a latte photo into a top-down target image for the guided simulation (KIT_ADOPTION Q1).

    .venv/bin/python tools/make_target.py <photo> --ellipse CX CY RX RY --out assets/patterns/rosetta_target.png [--size 72]

The ellipse is the coffee surface in the photo (inside the cup rim). It is unwarped to a disk (far side up),
milk is separated from coffee with an Otsu threshold inside the disk, and the result is saved as a grayscale
PNG: white = milk, black = coffee. A 4x preview with the source crop is saved next to it (_preview.png).
"""
import argparse

import numpy as np
from PIL import Image


def otsu(values):
    hist, edges = np.histogram(values, bins=64, range=(0, 1))
    w = hist.cumsum()
    m = (hist * (edges[:-1] + edges[1:]) / 2).cumsum()
    total_w, total_m = w[-1], m[-1]
    best, thr = -1, 0.5
    for i in range(1, 63):
        w0, w1 = w[i], total_w - w[i]
        if w0 == 0 or w1 == 0:
            continue
        m0, m1 = m[i] / w0, (total_m - m[i]) / w1
        between = w0 * w1 * (m0 - m1) ** 2
        if between > best:
            best, thr = between, edges[i + 1]
    return thr


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("photo")
    ap.add_argument("--ellipse", nargs=4, type=float, required=True, metavar=("CX", "CY", "RX", "RY"))
    ap.add_argument("--out", required=True)
    ap.add_argument("--size", type=int, default=72)
    ap.add_argument("--bias", type=float, default=0.0, help="added to the Otsu threshold (raise to drop the tan halo)")
    ap.add_argument("--center", action="store_true", help="move the milk centroid to the cup centre")
    ap.add_argument("--keep", type=float, default=0.5, help="share of a pixel that must be milk to count as milk (raise to keep thin coffee lines)")
    a = ap.parse_args()
    cx, cy, rx, ry = a.ellipse
    src = np.asarray(Image.open(a.photo).convert("RGB"), dtype=np.float32) / 255.0
    luma = 0.299 * src[..., 0] + 0.587 * src[..., 1] + 0.114 * src[..., 2]
    sat = src.max(axis=2) - src.min(axis=2)
    milkness = luma - 0.6 * sat           # milk is bright and pale; crema is darker and more saturated
    n = a.size * 4                         # sample at 4x, then box-filter down
    ys, xs = np.mgrid[0:n, 0:n]
    x = (xs + 0.5) / n * 2 - 1
    y = 1 - (ys + 0.5) / n * 2              # far side (top of the photo) is up
    px = np.clip(cx + x * rx, 0, src.shape[1] - 1).astype(int)
    py = np.clip(cy - y * ry, 0, src.shape[0] - 1).astype(int)
    samp = milkness[py, px]
    disk = np.hypot(x, y) < 0.88   # stay clear of the rim highlight in photos
    thr = otsu(samp[disk]) + a.bias
    mask = ((samp > thr) & disk).astype(np.float32)
    if a.center:
        my, mx = np.nonzero(mask)
        mask = np.roll(mask, (int(round(n / 2 - my.mean())), int(round(n / 2 - mx.mean()))), axis=(0, 1)) * disk
    small = (mask.reshape(a.size, 4, a.size, 4).mean(axis=(1, 3)) >= a.keep).astype(np.float32)
    Image.fromarray((small * 255).astype(np.uint8), "L").save(a.out)
    rgb = (np.stack([src[..., i][py, px] for i in range(3)], axis=-1) * 255).astype(np.uint8)
    prev = Image.new("RGB", (n * 2, n))
    prev.paste(Image.fromarray(rgb), (0, 0))
    prev.paste(Image.fromarray((small * 255).astype(np.uint8), "L").resize((n, n), Image.NEAREST).convert("RGB"), (n, 0))
    prev.save(a.out.replace(".png", "_preview.png"))
    print(f"threshold {thr:.3f} · milk {small[disk[::4, ::4]].mean():.2f} of disk · {a.out}")


if __name__ == "__main__":
    main()
