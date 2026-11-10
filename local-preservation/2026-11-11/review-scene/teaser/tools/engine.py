"""2.5D compositing engine: float32 RGB images, 1280x720 output, 2x sources."""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import os

W, H = 1280, 720
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(ROOT, "fonts")

YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)


def load(path):
    return np.asarray(Image.open(path).convert("RGB"), np.float32) / 255.0


def to8(a):
    return Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8))


def up2(a):
    """Lanczos 2x upscale of a float image (3ch) or mask (2d)."""
    if a.ndim == 2:
        im = Image.fromarray(a.astype(np.float32), "F").resize((a.shape[1] * 2, a.shape[0] * 2), Image.BICUBIC)
        return np.asarray(im, np.float32)
    out = [np.asarray(Image.fromarray(a[..., c].astype(np.float32), "F").resize((a.shape[1] * 2, a.shape[0] * 2), Image.LANCZOS), np.float32) for c in range(3)]
    return np.clip(np.stack(out, -1), 0, 1)


def sample(img, u, v):
    """Bilinear sample img (h,w[,c]) at float coords u (x), v (y). Edge-clamped."""
    h, w = img.shape[:2]
    u = np.clip(u, 0, w - 1.001)
    v = np.clip(v, 0, h - 1.001)
    x0 = u.astype(np.int32)
    y0 = v.astype(np.int32)
    fx = u - x0
    fy = v - y0
    if img.ndim == 3:
        fx = fx[..., None]
        fy = fy[..., None]
    a = img[y0, x0]
    b = img[y0, x0 + 1]
    c = img[y0 + 1, x0]
    d = img[y0 + 1, x0 + 1]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


def _box1(a, r, axis):
    if r < 1:
        return a
    n = a.shape[axis]
    pad = [(0, 0)] * a.ndim
    pad[axis] = (r + 1, r)
    p = np.pad(a, pad, mode="edge")
    c = np.cumsum(p, axis=axis, dtype=np.float32)
    hi = np.take(c, np.arange(2 * r + 1, 2 * r + 1 + n), axis=axis)
    lo = np.take(c, np.arange(0, n), axis=axis)
    return (hi - lo) / (2 * r + 1)


def blur(a, r):
    """Approximate gaussian (sigma ~ r) with 3 box passes."""
    if r <= 0:
        return a
    a = a.astype(np.float32)
    b = max(1, int(round(r * 0.9)))
    for _ in range(3):
        a = _box1(_box1(a, b, 0), b, 1)
    return a


def lum(a):
    return a[..., 0] * 0.299 + a[..., 1] * 0.587 + a[..., 2] * 0.114


def sat(a):
    mx = a.max(-1)
    mn = a.min(-1)
    return (mx - mn) / (mx + 1e-4)


def smooth(x, a=0.0, b=1.0):
    t = np.clip((x - a) / (b - a + 1e-9), 0, 1)
    return t * t * (3 - 2 * t)


def ease(t):
    t = min(max(t, 0.0), 1.0)
    return 0.5 - 0.5 * np.cos(np.pi * t)


def poly_mask(polys, feather=2.0, size=(W, H)):
    im = Image.new("L", size, 0)
    d = ImageDraw.Draw(im)
    for p in polys:
        d.polygon([tuple(map(float, q)) for q in p], fill=255)
    m = np.asarray(im, np.float32) / 255.0
    return blur(m, feather) if feather else m


def rect_mask(x0, y0, x1, y1, feather=2.0, radius=0):
    im = Image.new("L", (W, H), 0)
    ImageDraw.Draw(im).rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=255)
    m = np.asarray(im, np.float32) / 255.0
    return blur(m, feather) if feather else m


def dilate(m, r):
    im = Image.fromarray((m * 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.MaxFilter(2 * r + 1)), np.float32) / 255.0


def inpaint(img, mask):
    """Pyramid diffusion fill of img where mask>0.5."""
    known = (mask < 0.5).astype(np.float32)
    levels = []
    cur_i, cur_k = img * known[..., None], known
    while min(cur_k.shape) > 4:
        levels.append((cur_i, cur_k))
        h, w = cur_k.shape
        h2, w2 = (h + 1) // 2, (w + 1) // 2
        pi = np.zeros((h2 * 2, w2 * 2, 3), np.float32); pi[:h, :w] = cur_i
        pk = np.zeros((h2 * 2, w2 * 2), np.float32); pk[:h, :w] = cur_k
        si = pi.reshape(h2, 2, w2, 2, 3).sum((1, 3))
        sk = pk.reshape(h2, 2, w2, 2).sum((1, 3))
        cur_i = np.where(sk[..., None] > 0, si / np.maximum(sk, 1e-6)[..., None], 0) * (sk > 0)[..., None]
        cur_k = (sk > 0).astype(np.float32)
    fill = cur_i
    for li, lk in reversed(levels):
        h, w = lk.shape
        upf = np.repeat(np.repeat(fill, 2, 0), 2, 1)[:h, :w]
        upf = blur(upf, 1.0)
        fill = li * lk[..., None] + upf * (1 - lk[..., None])
    m = mask[..., None]
    return img * (1 - m) + fill * m


_NK = {}


def _nkey(seed, i, cells):
    key = (seed, i, cells)
    if key not in _NK:
        if len(_NK) > 64:
            _NK.clear()
        g = np.random.default_rng(seed * 100003 + i + 17).standard_normal((cells[1] + 2, cells[0] + 2)).astype(np.float32)
        big = Image.fromarray(g, "F").resize(((cells[0] + 2) * W // cells[0], (cells[1] + 2) * H // cells[1]), Image.BICUBIC)
        a = np.asarray(big, np.float32)
        ox, oy = W // cells[0], H // cells[1]
        _NK[key] = np.ascontiguousarray(a[oy:oy + H, ox:ox + W])
    return _NK[key]


def noise_field(seed, t, cells=(8, 5), period=2.0):
    """Deterministic smooth noise in [-~2, ~2] at time t (stateless)."""
    x = t / period
    k = int(np.floor(x))
    f = x - k
    f = f * f * (3 - 2 * f)

    return _nkey(seed, k, cells) * (1 - f) + _nkey(seed, k + 1, cells) * f


def scalar_noise(seed, t, period=1.0):
    x = t / period
    k = int(np.floor(x))
    f = x - k
    f = f * f * (3 - 2 * f)
    a = np.random.default_rng(seed * 7 + k).standard_normal()
    b = np.random.default_rng(seed * 7 + k + 1).standard_normal()
    return float(a * (1 - f) + b * f)


class Layer:
    """A source plate (1x float) + optional alpha mask, rendered through a camera."""

    def __init__(self, img, mask=None):
        self.img1 = img
        self.img2 = up2(img)
        self.mask = mask

    def render(self, cam, disp=None, light=None, mult=None):
        """cam: (scale, px, py, ox, oy). Output pixel x samples u = p + (x - p)/s - o.
        disp: (dx, dy) in source px (1x arrays). light: additive 1x (h,w,3). mult: 1x (h,w[,3])."""
        s, px, py, ox, oy = cam
        u = px + (XX - px) / s - ox
        v = py + (YY - py) / s - oy
        if disp is not None:
            dx = sample(disp[0], u, v)
            dy = sample(disp[1], u, v)
            u2, v2 = u + dx, v + dy
        else:
            u2, v2 = u, v
        col = sample(self.img2, u2 * 2 + 0.5, v2 * 2 + 0.5)
        if mult is not None:
            m = sample(mult, u, v)
            col = col * (m[..., None] if m.ndim == 2 else m)
        if light is not None:
            col = col + sample(light, u, v)
        a = sample(self.mask, u2, v2) if self.mask is not None else None
        return col, a


def over(bg, fg, a):
    return bg * (1 - a[..., None]) + fg * a[..., None]


def screen(a, b):
    return 1 - (1 - a) * (1 - b)


_font_cache = {}


def font(name, size):
    key = (name, size)
    if key not in _font_cache:
        f = {"sans-b": "f1.ttf", "sans-m": "f2.ttf", "serif-l": "f3.ttf", "serif-r": "f4.ttf"}[name]
        _font_cache[key] = ImageFont.truetype(os.path.join(FONTS, f), size)
    return _font_cache[key]


def text_layer(lines, fnt, center_y, line_gap, color=(245, 245, 245), shadow=0.55, glow=None, align_x=None):
    """Render lines centered at W/2 (or explicit list of x positions). Returns (rgb, alpha) float arrays."""
    alpha = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(alpha)
    n = len(lines)
    y0 = center_y - (n - 1) * line_gap / 2
    for i, ln in enumerate(lines):
        if ln is None:
            continue
        y = y0 + i * line_gap
        if align_x is None:
            d.text((W / 2, y), ln, font=fnt, fill=255, anchor="mm")
        else:
            d.text((align_x[i], y), ln, font=fnt, fill=255, anchor="lm")
    a = np.asarray(alpha, np.float32) / 255.0
    rgb = np.ones((H, W, 3), np.float32) * (np.array(color, np.float32) / 255.0)
    sh = blur(a, 2.2) * shadow
    return rgb, a, sh


def put_text(frame, tl, opacity=1.0):
    rgb, a, sh = tl
    frame = frame * (1 - sh[..., None] * opacity)
    return over(frame, rgb, a * opacity)


def subtitle_box(frame, rect, opacity=1.0, radius=16, dark=0.55, tint=(0.03, 0.035, 0.05)):
    x0, y0, x1, y1 = rect
    m = rect_mask(x0, y0, x1, y1, feather=0.8, radius=radius) * opacity
    region = frame[max(0, y0 - 20):min(H, y1 + 20), max(0, x0 - 20):min(W, x1 + 20)]
    bl = frame.copy()
    bl[max(0, y0 - 20):min(H, y1 + 20), max(0, x0 - 20):min(W, x1 + 20)] = blur(region, 3.0)
    boxed = bl * (1 - dark) + np.array(tint, np.float32) * dark
    return over(frame, boxed, m)


def grain(frame, seed, amt=0.010):
    g = np.random.default_rng(seed).standard_normal((H // 2, W // 2)).astype(np.float32)
    g = np.repeat(np.repeat(g, 2, 0), 2, 1)
    l = lum(frame)[..., None]
    return frame + g[..., None] * amt * (0.4 + 0.6 * (1 - np.abs(l - 0.5) * 2))
