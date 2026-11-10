"""V12 opening plates: fix the wake-up HUD numbers (o2) and make bubble-less states of the dialogue cut (o4)."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from engine import *

P = os.path.join(ROOT, "plates")

# o2: "사용 TOKEN 6.8 / 잔여 TOKEN 312.4" contradicts settings/03 (a dream session PAYS TOKEN) and the 7.1 balance in the
# 6.8 TOKEN shot. Replace with "지급 TOKEN +3.2 / 잔여 TOKEN 7.1" (+3.2 = the subway ad "바다를 걷는 꿈").
img = load(f"{P}/o2.png")
reg = rect_mask(606, 376, 940, 484, feather=0)
txt = (lum(img) > 0.30).astype(np.float32) * reg
out = inpaint(img, dilate(txt, 3))
lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(lay)
f = font("sans-m", 29)
for y, label, val in ((404, "지급 TOKEN", "+3.2"), (458, "잔여 TOKEN", "7.1")):
    d.text((619, y), label, font=f, fill=(232, 236, 244, 255), anchor="lm")
    d.text((927, y), val, font=font("sans-m", 33), fill=(120, 190, 245, 255), anchor="rm")
lay = lay.filter(ImageFilter.GaussianBlur(0.8))
c = np.asarray(lay, np.float32) / 255
out = out * (1 - c[..., 3:]) + c[..., :3] * c[..., 3:]
to8(out).save(f"{P}/o2-fixed.png")

# o4: bubble-less versions so the two lines can appear in order
img = load(f"{P}/o4.png")
b1 = rect_mask(670, 110, 1145, 322, feather=0)
b2 = rect_mask(612, 334, 1276, 700, feather=0)


def soft_remove(im, m):
    hard = dilate(m, 12)
    fill = blur(inpaint(im, hard), 6)
    k = blur(dilate(m, 8), 9)[..., None]
    return im * (1 - k) + fill * k


one = soft_remove(img, b2)
to8(one).save(f"{P}/o4-one.png")
to8(soft_remove(one, b1)).save(f"{P}/o4-none.png")
