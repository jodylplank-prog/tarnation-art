#!/usr/bin/env python3
"""Resize renamed/ artwork into web-safe, non-print-resolution JPEGs.

Produces two sizes per source image:
  - thumb: for the gallery grid       (max edge 640px)
  - full:  for the tap/detail view    (max edge 1200px)

Both are well below print resolution (a 1200px image printed at 300dpi
is only 4 inches on its long edge), strips all metadata (EXIF/GPS/etc,
since Pillow re-encodes from raw pixels), and re-saves as JPEG.
"""
import glob
import os
from PIL import Image, ImageOps

SRC_DIR = "renamed"
OUT_THUMB = "docs/assets/img/thumb"
OUT_FULL = "docs/assets/img/full"

THUMB_MAX = 640
FULL_MAX = 1200
THUMB_QUALITY = 78
FULL_QUALITY = 82


def resize_to(im, max_edge):
    w, h = im.size
    scale = max_edge / max(w, h)
    if scale >= 1:
        return im.copy()
    new_size = (max(1, round(w * scale)), max(1, round(h * scale)))
    return im.resize(new_size, Image.LANCZOS)


def process(path):
    name = os.path.splitext(os.path.basename(path))[0]
    im = Image.open(path)
    # Bake in the camera's EXIF rotation before resizing/re-saving, since
    # re-encoding below drops the EXIF tag that would otherwise tell a
    # browser how to display it (this is why phone photos were sideways).
    im = ImageOps.exif_transpose(im)
    if im.mode != "RGB":
        im = im.convert("RGB")

    thumb = resize_to(im, THUMB_MAX)
    thumb_path = os.path.join(OUT_THUMB, name + ".jpg")
    thumb.save(thumb_path, "JPEG", quality=THUMB_QUALITY, optimize=True)

    full = resize_to(im, FULL_MAX)
    full_path = os.path.join(OUT_FULL, name + ".jpg")
    full.save(full_path, "JPEG", quality=FULL_QUALITY, optimize=True)

    orig_kb = os.path.getsize(path) / 1024
    thumb_kb = os.path.getsize(thumb_path) / 1024
    full_kb = os.path.getsize(full_path) / 1024
    return name, im.size, orig_kb, thumb_kb, full_kb


def main():
    files = sorted(glob.glob(os.path.join(SRC_DIR, "*")))
    files = [f for f in files if os.path.splitext(f)[1].lower() in (".jpg", ".jpeg", ".png")]
    total_orig = total_thumb = total_full = 0
    print(f"{'file':45} {'orig size':>12} {'orig KB':>9} {'thumb KB':>9} {'full KB':>8}")
    for f in files:
        name, size, orig_kb, thumb_kb, full_kb = process(f)
        total_orig += orig_kb
        total_thumb += thumb_kb
        total_full += full_kb
        print(f"{name:45} {str(size):>12} {orig_kb:9.0f} {thumb_kb:9.0f} {full_kb:8.0f}")
    print(f"\n{len(files)} images processed")
    print(f"total original: {total_orig/1024:.1f} MB")
    print(f"total thumb:    {total_thumb/1024:.1f} MB")
    print(f"total full:     {total_full/1024:.1f} MB")


if __name__ == "__main__":
    main()
