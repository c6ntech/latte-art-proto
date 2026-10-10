"""One contact sheet from many images (for the style bible and the Reviewer: one image instead of twenty).

    python scripts/contact_sheet.py "Docs/concepts/approved/*.webp" --out Docs/reviews/approved_sheet.jpg
    python scripts/contact_sheet.py "Docs/progress/kaiju-S3/*.jpg" --last 12 --cols 4 --out Docs/reviews/S3_latest.jpg

Long edge of the result <= 2,560 px (the vision limit before downscaling). Captions are the file names.
"""
import argparse
import glob
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def font(size):
    for name in ("arial.ttf", "segoeui.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("pattern")
    ap.add_argument("--out", required=True)
    ap.add_argument("--cols", type=int, default=0)
    ap.add_argument("--last", type=int, default=0, help="only the newest N files (by name)")
    ap.add_argument("--max-edge", type=int, default=2560)
    a = ap.parse_args()
    files = sorted(p for p in glob.glob(a.pattern) if Path(p).suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"})
    if a.last:
        files = files[-a.last:]
    if not files:
        raise SystemExit(f"no images match {a.pattern}")
    cols = a.cols or math.ceil(math.sqrt(len(files) * 16 / 9 / 1.4))
    rows = math.ceil(len(files) / cols)
    cell_w = a.max_edge // cols
    cell_h = int(cell_w * 9 / 16)
    cap = 22
    if rows * (cell_h + cap) > a.max_edge:
        scale = a.max_edge / (rows * (cell_h + cap))
        cell_w, cell_h = int(cell_w * scale), int(cell_h * scale)
    sheet = Image.new("RGB", (cols * cell_w, rows * (cell_h + cap)), (20, 20, 22))
    draw = ImageDraw.Draw(sheet)
    f = font(14)
    for i, path in enumerate(files):
        im = Image.open(path).convert("RGB")
        im.thumbnail((cell_w - 6, cell_h - 6))
        x, y = (i % cols) * cell_w, (i // cols) * (cell_h + cap)
        sheet.paste(im, (x + (cell_w - im.width) // 2, y + (cell_h - im.height) // 2))
        draw.text((x + 4, y + cell_h + 3), Path(path).stem[:int(cell_w / 7.5)], fill=(210, 210, 210), font=f)
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    sheet.save(a.out, quality=88)
    print(f"{a.out}: {len(files)} images, {sheet.width}x{sheet.height}")


if __name__ == "__main__":
    main()
