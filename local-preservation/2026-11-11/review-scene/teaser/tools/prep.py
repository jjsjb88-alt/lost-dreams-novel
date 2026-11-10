"""Build clean plates: remove baked subtitle boxes (p01,p02,p04,p08), text in p18, unlit boxes in p16."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from engine import *

P = os.path.join(ROOT, "plates")
BOX = {"p01": (80, 551, 1208, 650), "p02": (71, 515, 1215, 666), "p04": (69, 507, 1217, 660), "p08": (69, 531, 1217, 635)}


def unbox(name, rect):
    img = load(f"{P}/{name}.jpg")
    x0, y0, x1, y1 = rect
    xs = slice(x0 + 30, x1 - 30)
    outs, ins = [], []
    for yo, yi in [(y0 - 4, y0 + 4), (y0 - 5, y0 + 5), (y1 + 4, y1 - 4), (y1 + 5, y1 - 5)]:
        outs.append(img[yo, xs]); ins.append(img[yi, xs])
    xo, xi = np.concatenate(outs), np.concatenate(ins)
    c = np.zeros(3)
    ok = xo.mean(1) > 0.08
    k = np.median(xi[ok] / np.maximum(xo[ok], 1e-3), axis=0)
    print(name, "k", k.round(3), "c", c.round(3))
    m = rect_mask(x0, y0, x1, y1, feather=0.9, radius=16)
    rec = (img - c) / np.maximum(k, 0.2)
    rec = np.clip(rec, 0, 1)
    out = img * (1 - m[..., None]) + rec * m[..., None]
    # text pixels: bright, low saturation inside the box
    inner = rect_mask(x0 + 4, y0 + 4, x1 - 4, y1 - 4, feather=0, radius=12)
    t = ((lum(img) > 0.55) & (sat(img) < 0.35)).astype(np.float32) * inner
    tm = dilate(t, 4)
    out = inpaint(out, tm)
    # soften seam ring at the box edge
    ring = np.clip(rect_mask(x0 - 2, y0 - 2, x1 + 2, y1 + 2, 0, 18) - rect_mask(x0 + 2, y0 + 2, x1 - 2, y1 - 2, 0, 14), 0, 1)
    out = inpaint(out, dilate(ring, 1))
    to8(out).save(f"{P}/{name}-clean.png")


def p18():
    img = load(f"{P}/p18.jpg")
    region = rect_mask(330, 260, 970, 460, feather=0)
    t = (lum(img) > 0.18).astype(np.float32) * region
    tm = dilate(t, 5)
    out = inpaint(img, tm)
    # the blue glow streak under each line
    out = inpaint(out, dilate(((lum(out) > 0.10).astype(np.float32) * region), 3))
    to8(out).save(f"{P}/p18-clean.png")


def p16():
    img = load(f"{P}/p16.jpg")
    out = img.copy()
    # remove bright text + icon inside each dialog box (keep the box frame + labels)
    for (x0, y0, x1, y1) in [(985, 270, 1235, 325), (980, 385, 1240, 455), (985, 515, 1240, 590)]:
        reg = rect_mask(x0, y0, x1, y1, feather=0)
        t = (lum(img) > 0.42).astype(np.float32) * reg
        out = inpaint(out, dilate(t, 3))
    to8(out).save(f"{P}/p16-unlit.png")


if __name__ == "__main__":
    for n, r in BOX.items():
        unbox(n, r)
    p18()
    p16()
