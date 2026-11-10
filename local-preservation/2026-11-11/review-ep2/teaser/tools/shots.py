"""Shot definitions. Each shot: setup() -> state, render(state, t, dur) -> float frame (no subtitles/grain)."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from engine import *

P = os.path.join(ROOT, "plates")
TAU = 2 * np.pi


def plate(name):
    for ext in (".png", ".jpg"):
        p = f"{P}/{name}{ext}"
        if os.path.exists(p):
            return load(p)
    raise FileNotFoundError(name)


def twinkle_map(seed, t, cells=(96, 54), period=0.6):
    return noise_field(seed, t, cells, period)


def depth_w(fg_poly, r=16):
    """Smooth foreground weight for seam-free 2.5D warp."""
    return blur(poly_mask(fg_poly, feather=0), r)


def parallax_disp(w, cb, cf):
    """Extra source-space displacement so weight-1 pixels follow camera cf while the rest follows cb."""
    sb, px, py, obx, oby = cb
    sf, _, _, ofx, ofy = cf
    k = sb / sf - 1.0
    return (w * ((XX - px) * k - (ofx - obx)), w * ((YY - py) * k - (ofy - oby)))


def vignette(strength, cx=W / 2, cy=H / 2):
    r = np.sqrt(((XX - cx) / (W * 0.62)) ** 2 + ((YY - cy) / (H * 0.62)) ** 2)
    return 1 - strength * smooth(r, 0.45, 1.25)


VIG = None


def vig(strength):
    global VIG
    if VIG is None:
        VIG = vignette(1.0)
    return 1 - (1 - VIG) * strength


# ---------------------------------------------------------------- S01 sea
def s01_setup():
    img = plate("p01-clean")
    boy = [(238, 175), (262, 150), (300, 138), (345, 135), (400, 150), (432, 180), (442, 215), (425, 250), (410, 280), (415, 300), (445, 320), (470, 360),
           (485, 420), (492, 480), (480, 520), (470, 560), (470, 720), (120, 720), (110, 560), (95, 520), (85, 470), (100, 430), (150, 370), (185, 330),
           (225, 305), (255, 295), (250, 270), (235, 240), (232, 205)]
    flowers = [(0, 380), (60, 390), (110, 440), (120, 560), (160, 640), (300, 720), (0, 720)]
    L = lum(img); S = sat(img)
    b_minus_r = img[..., 2] - img[..., 0]
    water = (((b_minus_r > 0.10) | ((L > 0.72) & (S < 0.3))) & (YY > 300)).astype(np.float32)
    city = poly_mask([[(840, 300), (860, 240), (1050, 200), (1100, 80), (1280, 70), (1280, 420), (1200, 415), (900, 362), (840, 335)]], feather=0)
    water = blur(water * (1 - city) * (1 - poly_mask([boy, flowers], 0)), 1.2)
    palm = poly_mask([[(0, 0), (610, 0), (590, 70), (480, 130), (390, 125), (300, 135), (240, 170), (170, 290), (110, 340), (0, 385)]], feather=18)
    palm *= 1 - blur(poly_mask([boy], 0), 6)
    sky = ((YY < 298).astype(np.float32)) * (1 - city) * (1 - poly_mask([[(0, 0), (610, 0), (590, 70), (480, 130), (390, 125), (300, 135), (240, 170), (170, 290), (110, 340), (0, 385)]], 0))
    sky = blur(sky, 3)
    spec = smooth(L, 0.62, 0.95) * water
    hair = blur(poly_mask([[(236, 170), (262, 145), (300, 132), (348, 130), (402, 147), (436, 178), (446, 215), (430, 245), (400, 210), (330, 185), (260, 205)]], 0), 4)
    rng = np.random.default_rng(11)
    ph = rng.uniform(0, TAU, (H, W)).astype(np.float32)
    om = rng.uniform(3.0, 7.0, (H, W)).astype(np.float32)
    flowers_m = blur(poly_mask([flowers], 0), 8)
    return dict(L=Layer(img), dw=depth_w([boy, flowers]), water=water, palm=palm, sky=sky, spec=spec, ph=ph, om=om, hair=hair, flowers=flowers_m)


def s01_render(s, t, dur):
    p = ease(t / dur) if dur else 0
    yamp = 0.35 + 1.4 * np.clip((YY - 300) / 420, 0, 1)
    wave_dy = yamp * np.sin(0.085 * YY - TAU * 0.42 * t + 0.013 * XX) * s["water"]
    wave_dx = 0.6 * noise_field(3, t, (24, 14), 1.4) * s["water"]
    sway = noise_field(5, t, (6, 4), 1.6)
    palm_dx = (1.3 * np.sin(TAU * 0.33 * t + YY * 0.012) + 0.5 * sway) * s["palm"]
    palm_dy = 0.5 * np.sin(TAU * 0.27 * t + XX * 0.01) * s["palm"]
    cloud_dx = (1.1 * t) * s["sky"]
    hair_dx = 0.6 * noise_field(7, t, (40, 24), 0.9) * s["hair"]
    fl = 0.8 * np.sin(TAU * 0.4 * t + XX * 0.02) * s["flowers"]
    dx = wave_dx + palm_dx + cloud_dx + hair_dx + fl
    dy = wave_dy + palm_dy
    tw = np.maximum(np.sin(s["om"] * t + s["ph"]), 0) ** 6
    light = (s["spec"] * tw * 0.32)[..., None] * np.array([1.0, 1.0, 0.95], np.float32)
    cb = (1.0 + 0.025 * p, 700, 300, 0, 0)
    cf = (1.0 + 0.035 * p, 700, 300, 0, 0)
    px_, py_ = parallax_disp(s["dw"], cb, cf)
    f, _ = s["L"].render(cb, (dx + px_, dy + py_), light)
    return f


# ---------------------------------------------------------------- S02/S03 room
def room_setup():
    img = plate("p02-clean")
    tv_sea = blur(rect_mask(897, 268, 1195, 408, 0), 2.5)
    tv_sky = blur(rect_mask(897, 168, 1085, 266, 0), 2.5)
    L = lum(img)
    spec = smooth(L, 0.6, 0.95) * tv_sea
    # light from the TV spreading to the left
    grad = np.clip(1 - np.abs(XX - 1000) / 1050, 0, 1) ** 1.6 * (1 - rect_mask(890, 150, 1280, 430, 6))
    boy = blur(poly_mask([[(290, 140), (330, 95), (400, 80), (470, 95), (530, 130), (550, 180), (530, 230), (500, 255), (490, 285), (470, 305), (485, 340),
                            (480, 410), (450, 470), (380, 470), (250, 430), (100, 420), (0, 400), (0, 260), (120, 245), (250, 245), (300, 220)]], 0), 10)
    breath_w = boy * smooth(YY, 480, 200)
    window = rect_mask(60, 30, 330, 262, 3) * smooth(L, 0.35, 0.7)
    lamp = np.exp(-(((XX - 752) / 70) ** 2 + ((YY - 255) / 55) ** 2))
    rng = np.random.default_rng(21)
    return dict(L=Layer(img), tv_sea=tv_sea, tv_sky=tv_sky, spec=spec, grad=grad, boy=boy, breath=breath_w, window=window, lamp=lamp,
                ph=rng.uniform(0, TAU, (H, W)).astype(np.float32), om=rng.uniform(3, 7, (H, W)).astype(np.float32))


def room_render(s, t, dur, cam):
    dy = 0.9 * np.sin(0.09 * YY - TAU * 0.45 * t + 0.012 * XX) * s["tv_sea"]
    dx = 0.5 * noise_field(31, t, (20, 12), 1.2) * s["tv_sea"] + 0.9 * t * s["tv_sky"]
    br = np.sin(TAU * t / 3.4 - 0.6)
    dy = dy - 0.75 * br * s["breath"]
    flick = 0.55 + 0.3 * np.sin(TAU * 0.42 * t) + 0.15 * scalar_noise(4, t, 0.35)
    tvlight = (s["grad"] * (0.05 + 0.06 * flick) * (0.5 + 0.8 * s["boy"]))
    mult = 1 + tvlight[..., None] * np.array([-0.15, 0.25, 0.9], np.float32)
    win = 1 + 0.18 * twinkle_map(22, t, (110, 62), 0.55) * s["window"]
    lampf = 1 + 0.025 * scalar_noise(9, t, 0.2) * s["lamp"]
    mult = mult * (win * lampf)[..., None]
    tw = np.maximum(np.sin(s["om"] * t + s["ph"]), 0) ** 6
    light = (s["spec"] * tw * 0.25)[..., None] * np.ones(3, np.float32)
    f, _ = s["L"].render(cam, (dx, dy), light, mult)
    return f


def s02_render(s, t, dur):
    jx = 0.6 * scalar_noise(41, t, 1.3)
    jy = 0.4 * scalar_noise(42, t, 1.5)
    return room_render(s, t, dur, (1.004, 640, 360, jx, jy))


def s03_render(s, t, dur):
    p = ease(t / dur)
    return room_render(s, t + 3.3, dur, (1.0 + 0.02 * p, 470, 240, 0, 0))


# ---------------------------------------------------------------- S04 subway
def s04_setup():
    img = plate("p04-clean")
    boy = [(230, 190), (300, 168), (380, 168), (450, 190), (495, 235), (502, 280), (482, 300), (472, 340), (478, 372), (462, 386), (440, 396), (402, 402),
           (432, 432), (462, 472), (492, 522), (500, 720), (80, 720), (80, 560), (100, 470), (150, 432), (220, 410), (250, 400), (240, 350), (225, 300), (218, 250)]
    panels = [(25, 150, 190, 322), (400, 12, 768, 160), (490, 298, 592, 416), (580, 212, 690, 346), (735, 95, 942, 318), (962, 0, 1262, 206), (1062, 236, 1256, 452)]
    pm = [rect_mask(*r, feather=3, radius=10) for r in panels]
    L = lum(img)
    return dict(Lr=Layer(img), dw=depth_w([boy]), pm=pm, L=L)


def s04_render(s, t, dur):
    p = ease(t / dur)
    vib = 0.45 * np.sin(TAU * 6.3 * t) * (0.6 + 0.4 * np.sin(TAU * 0.9 * t)) + 0.5 * scalar_noise(51, t, 0.4)
    mult = np.ones((H, W), np.float32)
    for i, m in enumerate(s["pm"]):
        f = 0.05 * np.sin(TAU * (0.35 + 0.11 * i) * t + i * 1.7)
        if i == 3:  # one panel stutters once
            f += -0.18 * np.exp(-((t - 1.9) / 0.05) ** 2)
        mult += m * f
    # tunnel lights passing (soft band right -> left)
    band = np.zeros((H, W), np.float32)
    for k in range(3):
        cx = 1500 - ((t * 1150 + k * 1400) % 4200)
        band += np.exp(-((XX - cx - (YY - 360) * 0.35) / 160) ** 2)
    mult = mult * (1 + 0.07 * band)
    cb = (1.0, 640, 360, -6 * p, vib * 0.8)
    cf = (1.0, 640, 360, -11 * p, vib)
    f, _ = s["Lr"].render(cb, parallax_disp(s["dw"], cb, cf), None, mult)
    return f


# ---------------------------------------------------------------- S05 6.8 TOKEN
def s05_setup():
    img = plate("p05")
    panel = poly_mask([[(932, 25), (1228, 22), (1240, 640), (915, 612)]], feather=3)
    button = rect_mask(945, 508, 1067, 578, feather=2, radius=12)
    finger = blur(poly_mask([[(812, 468), (962, 488), (962, 512), (832, 518), (800, 500)]], 0), 6)
    mother = blur(poly_mask([[(650, 345), (860, 345), (875, 470), (640, 470)]], 0), 14)
    boy = blur(poly_mask([[(0, 240), (280, 230), (420, 330), (640, 560), (640, 720), (0, 720)]], 0), 20)
    window = rect_mask(55, 0, 300, 240, 3) * smooth(lum(img), 0.35, 0.7)
    return dict(L=Layer(img), panel=panel, button=button, button_glow=blur(button, 10), finger=finger, mother=mother, boy=boy, window=window)


def s05_render(s, t, dur):
    p = ease(t / dur)
    retreat = smooth(t, 0.9, 1.6)
    dx = 1.4 * retreat * s["finger"]
    dy = -0.6 * np.sin(TAU * t / 3.6) * s["mother"] - 0.35 * np.sin(TAU * t / 3.0 + 1) * s["boy"]
    ys = 20 + (t / 2.4 % 1.0) * 640
    scan = np.exp(-((YY - ys) / 2.5) ** 2) * 0.10 + np.exp(-((YY - ys) / 30) ** 2) * 0.025
    pulse = 0.5 + 0.5 * np.sin(TAU * 0.75 * t)
    light = (s["panel"] * scan + s["button_glow"] * 0.07 * pulse)[..., None] * np.array([0.45, 0.75, 1.0], np.float32)
    mult = 1 + s["button"] * 0.10 * pulse + s["panel"] * 0.03 * np.sin(TAU * 0.5 * t) + 0.16 * twinkle_map(55, t, (100, 56), 0.5) * s["window"]
    f, _ = s["L"].render((1.0 + 0.02 * p, 900, 500, 0, 0), (dx, dy), light, mult)
    return f


# ---------------------------------------------------------------- S06 approval scan
def s06_setup():
    img = plate("p06")
    L = lum(img)
    warm = (img[..., 0] > img[..., 2] + 0.08).astype(np.float32) * smooth(L, 0.5, 0.85) * smooth(XX, 700, 760)
    subj = blur(poly_mask([[(0, 0), (720, 0), (720, 280), (600, 295), (1030, 375), (1000, 670), (600, 650), (640, 720), (0, 720)]], 0), 10)
    card = poly_mask([[(582, 296), (1030, 380), (998, 668), (530, 600)]], feather=3)
    check = np.exp(-(((XX - 617) / 34) ** 2 + ((YY - 452) / 34) ** 2))
    return dict(L=Layer(img), warm=warm, subj=subj, card=card, check=check)


def s06_render(s, t, dur):
    p = ease(t / dur)
    ys = -60 + smooth(t, 0.35, 1.75) * 860
    sweep = (np.exp(-((YY - ys) / 2.2) ** 2) * 0.32 + np.exp(-((YY - ys) / 45) ** 2) * 0.07) * (0.35 + 0.65 * s["subj"])
    sweep *= float(0 < smooth(t, 0.35, 1.75) < 1)
    flash = 0.45 * np.exp(-((t - (0.35 + 1.4 * 0.62)) / 0.18) ** 2)
    light = (sweep + s["check"] * flash + s["card"] * 0.03 * (0.5 + 0.5 * np.sin(TAU * 0.6 * t)))[..., None] * np.array([0.55, 0.85, 1.0], np.float32)
    mult = 1 + 0.16 * twinkle_map(61, t, (120, 68), 0.45) * s["warm"]
    f, _ = s["L"].render((1.0 + 0.04 * p, 470, 260, 0, 0), None, light, mult)
    return f


# ---------------------------------------------------------------- S07 upper entrance
def s07_setup():
    img = plate("p07")
    boy = [(330, 215), (370, 188), (430, 178), (482, 188), (532, 213), (556, 250), (552, 290), (522, 312), (512, 332), (497, 347), (512, 382), (527, 442),
           (538, 522), (522, 622), (505, 720), (60, 720), (70, 640), (95, 520), (130, 440), (200, 380), (260, 355), (330, 342), (346, 300), (336, 262)]
    L = lum(img)
    chand = rect_mask(790, 225, 905, 345, 6) * smooth(L, 0.55, 0.9)
    floor = blur(((YY > 640).astype(np.float32)) * (1 - poly_mask([boy], 0)), 4)
    entrance = rect_mask(690, 180, 1000, 470, 25) * smooth(L, 0.4, 0.8)
    banner = poly_mask([[(110, 0), (360, 0), (350, 420), (100, 425)]], feather=4)
    gate = rect_mask(893, 492, 993, 632, 2, 8)
    return dict(Lr=Layer(img), dw=depth_w([boy]), chand=chand, floor=floor, entrance=entrance, banner=banner, gate=gate)


def s07_render(s, t, dur):
    p = ease(t / dur)
    fdx = (0.9 * np.sin(0.13 * YY - TAU * 0.6 * t) + 0.5 * noise_field(71, t, (30, 6), 0.8)) * s["floor"]
    mult = 1 + 0.22 * twinkle_map(72, t, (130, 72), 0.4) * s["chand"] + 0.035 * np.sin(TAU * 0.4 * t) * s["entrance"] + 0.05 * np.sin(TAU * 1.1 * t) * s["gate"]
    yb = -120 + ((t * 260) % 800)
    sheen = np.exp(-((YY + (XX - 200) * 0.6 - yb) / 40) ** 2) * s["banner"] * 0.06
    light = sheen[..., None] * np.array([0.6, 0.8, 1.0], np.float32)
    cb = (1.0 + 0.035 * p, 840, 330, 0, 0)
    cf = (1.0 + 0.045 * p, 840, 330, 0, 0)
    pxd, pyd = parallax_disp(s["dw"], cb, cf)
    f, _ = s["Lr"].render(cb, (fdx * (1 - s["dw"]) + pxd, pyd), light, mult * (1 - s["dw"]) + s["dw"])
    return f


# ---------------------------------------------------------------- S08/S09 boardroom
def board_setup():
    img = plate("p08-clean")
    L = lum(img)
    screen_m = poly_mask([[(628, 30), (1268, 25), (1268, 488), (628, 478)]], feather=4)
    brain = rect_mask(780, 100, 1045, 410, 20) * smooth(L, 0.3, 0.8)
    bars = (rect_mask(650, 205, 765, 292, 1) + rect_mask(1120, 85, 1245, 365, 1)) * smooth(L, 0.35, 0.8)
    city = rect_mask(400, 95, 628, 470, 3) * smooth(L, 0.35, 0.75)
    return dict(L=Layer(img), screen=screen_m, brain=brain, bars=bars, city=city)


def board_render(s, t, dur, cam, dim=0.0):
    pulse = 0.5 + 0.5 * np.sin(TAU * 0.55 * t)
    light = (s["brain"] * 0.07 * pulse)[..., None] * np.array([0.5, 0.8, 1.0], np.float32)
    mult = 1 + 0.12 * twinkle_map(81, t, (90, 50), 0.35) * s["bars"] + 0.15 * twinkle_map(82, t, (110, 62), 0.6) * s["city"] - dim * s["screen"]
    f, _ = s["L"].render(cam, None, light, mult)
    return f


def s08_render(s, t, dur):
    p = ease(t / dur)
    return board_render(s, t, dur, (1.0 + 0.02 * p, 850, 440, 0, 0))


def s09_render(s, t, dur):
    p = t / dur
    f = board_render(s, t + 2.4, dur, (1.02, 850, 440, 0, 0), dim=0.10 * smooth(p, 0.1, 0.9))
    return f * vig(0.10 * smooth(p, 0.0, 1.0))[..., None]


# ---------------------------------------------------------------- S10-S15 overload
def over_setup():
    img = plate("p15")
    L = lum(img)
    brain = rect_mask(925, 35, 1185, 300, 15) * smooth(L, 0.25, 0.8)
    warn = rect_mask(995, 318, 1272, 482, 4, 10)
    redhud = ((img[..., 0] > img[..., 1] + 0.18).astype(np.float32)) * rect_mask(0, 80, 360, 600, 2)
    face = np.exp(-(((XX - 720) / 260) ** 2 + ((YY - 330) / 220) ** 2)) * smooth(L, 0.15, 0.7)
    body = blur(poly_mask([[(420, 60), (1000, 40), (1060, 650), (380, 650)]], 0), 30)
    breath_w = body * smooth(YY, 650, 220)
    rng = np.random.default_rng(5)
    streaks = [(rng.uniform(0, H), rng.uniform(400, 1100), rng.uniform(40, 180), rng.integers(0, 2), rng.uniform(0, 1)) for _ in range(26)]
    return dict(L=Layer(img), brain=brain, warn=warn, redhud=redhud, face=face, breath=breath_w, streaks=streaks, blur=Layer(blur(img, 1.6)))


def streak_light(s, t, amount):
    out = np.zeros((H, W), np.float32)
    if amount <= 0:
        return out
    for (y, sp, ln, side, ph) in s["streaks"]:
        x = ((t * sp + ph * 2000) % 900)
        x = x if side == 0 else W - x
        yi = int(y)
        y0, y1 = max(0, yi - 1), min(H, yi + 2)
        xs = np.arange(W, dtype=np.float32)
        prof = np.exp(-(((xs - x) / ln) ** 2)) * (np.abs(xs - W / 2) > 380)
        out[y0:y1] += prof * 0.5
    return out * amount


def over_render(s, t, stage, cam, shake=0.0, focus=0.0, streaks=0.0, freeze=False):
    """stage 0..1 pressure level."""
    rate = 0.8 + 2.2 * stage
    pulse = 0.5 + 0.5 * np.sin(TAU * rate * t) if not freeze else 0.5
    br_rate = 0.35 + 0.6 * stage
    dy = -(0.5 + 0.9 * stage) * np.sin(TAU * br_rate * t) * s["breath"]
    red = (s["warn"] * 0.10 + s["redhud"] * 0.12 + s["face"] * 0.05 * stage) * (0.3 + 0.7 * pulse) * (0.4 + 0.6 * stage)
    blue = s["brain"] * (0.04 + 0.06 * stage) * (0.5 + 0.5 * np.sin(TAU * 0.7 * t + 1))
    light = red[..., None] * np.array([1.0, 0.12, 0.10], np.float32) + blue[..., None] * np.array([0.45, 0.65, 1.0], np.float32)
    light = light + streak_light(s, t, streaks)[..., None] * np.array([0.4, 0.75, 1.0], np.float32)
    sc, px, py, ox, oy = cam
    if shake:
        ox += shake * scalar_noise(91, t, 0.09)
        oy += shake * scalar_noise(92, t, 0.08)
    cam = (sc, px, py, ox, oy)
    f, _ = s["L"].render(cam, (dy * 0, dy), light)
    if focus > 0:
        b, _ = s["blur"].render(cam, (dy * 0, dy), light)
        k = focus * (0.5 + 0.5 * np.sin(TAU * 0.9 * t))
        f = f * (1 - k) + b * k
    return f * vig(0.10 + 0.30 * stage)[..., None]


C = (720, 330)


def s10_render(s, t, dur):
    return over_render(s, t, 0.15, (1.0, *C, 0, 0))


def s11_render(s, t, dur):
    return over_render(s, t + 1, 0.4, (1.0 + 0.01 * ease(t / dur), *C, 0, 0))


def s12_render(s, t, dur):
    return over_render(s, t + 2, 0.65, (1.01 + 0.01 * ease(t / dur), *C, 0, 0), streaks=0.6)


def s13_render(s, t, dur):
    return over_render(s, t + 3, 1.0, (1.02 + 0.01 * ease(t / dur), *C, 0, 0), shake=1.0, streaks=1.0)


def s14_render(s, t, dur):
    sc = 1.03 - 0.02 * ease(t / dur)
    f = over_render(s, 4.6, 0.55, (sc, *C, 0, 0), freeze=True)
    # one single data drop
    if abs(t - 0.62) < 0.021:
        f = f * 0.82
        f[300:306] = f[300:306] * 0.4
    return f


def s15_render(s, t, dur):
    sh = 2.0 * smooth(t, 0, dur)
    return over_render(s, t + 6, 1.0, (1.0, *C, 0, 0), shake=sh, focus=0.35 * smooth(t, 0.2, dur), streaks=0.8)


# ---------------------------------------------------------------- S16 mono / ne / kkeo
BOXES = [(958, 222, 1252, 334), (960, 342, 1260, 474), (965, 484, 1268, 609)]
BOX_T = [0.18, 1.18, 2.38]


def s16_setup():
    img = plate("p16")
    unlit = plate("p16-unlit")
    bm = [rect_mask(*b, feather=2, radius=8) for b in BOXES]
    unlit = unlit * (1 - 0.35 * sum(bm))[..., None]
    redhud = ((img[..., 0] > img[..., 1] + 0.18).astype(np.float32)) * rect_mask(0, 0, 400, 700, 2)
    body = blur(poly_mask([[(330, 0), (950, 0), (1000, 700), (330, 700)]], 0), 40)
    breath_w = body * smooth(YY, 700, 250)
    return dict(lit=Layer(img), unlit=Layer(unlit), bm=bm, glow=[blur(m, 12) for m in bm], redhud=redhud, breath=breath_w)


def s16_render(s, t, dur):
    br = np.sin(TAU * t / 4.2)
    sink = 0.6 * smooth(t, 2.38, 3.4)
    dy = (-0.55 * br + sink) * s["breath"]
    alive = 1 - smooth(t, BOX_T[2], BOX_T[2] + 0.25)
    pulse = 0.5 + 0.5 * np.sin(TAU * 1.4 * t)
    mult = 1 + s["redhud"] * 0.14 * pulse * alive
    cam = (1.0, 640, 360, 0, 0)
    lit, _ = s["lit"].render(cam, (dy * 0, dy), None, mult)
    un, _ = s["unlit"].render(cam, (dy * 0, dy), None, mult)
    a = np.zeros((H, W), np.float32)
    fl = np.zeros((H, W), np.float32)
    for m, g, tb in zip(s["bm"], s["glow"], BOX_T):
        a = np.maximum(a, m * smooth(t, tb, tb + 0.14))
        fl += g * 0.16 * np.exp(-max(t - tb, -1e9) / 0.28) * (t >= tb)
    f = over(un, lit, a)
    return f + fl[..., None] * np.array([0.45, 0.75, 1.0], np.float32)


# ---------------------------------------------------------------- S17 still city
def s17_setup():
    img = plate("p17")
    L = lum(img)
    lights = smooth(L, 0.30, 0.6) * (1 - poly_mask([[(700, 0), (1280, 0), (1280, 330), (700, 330)]], 0) * (img[..., 0] > img[..., 2]).astype(np.float32))
    lights = np.maximum(lights, rect_mask(60, 10, 340, 330, 6) * 0.9)  # big face billboard
    lights = np.maximum(lights, rect_mask(390, 250, 530, 450, 6) * 0.9)
    return dict(L=Layer(img), lights=blur(lights, 1.5))


def s17_render(s, t, dur):
    # lights die right -> left, no explosion
    front = 1280 - smooth(t, 0.30, 1.45) * 1500
    local = smooth(XX - front, -60, 60)
    dimk = 0.62 * local * s["lights"] + 0.10 * smooth(t, 0.3, 1.6)
    mult = 1 - dimk
    mist = noise_field(171, t, (5, 3), 3.0)
    mist = (0.5 + 0.25 * mist) * np.exp(-((YY - 470) / 110) ** 2) * 0.05
    f, _ = s["L"].render((1.0, 640, 360, 0, 0), None, None, mult)
    return f + mist[..., None] * np.array([0.55, 0.62, 0.8], np.float32)


# ---------------------------------------------------------------- S18 question
def s18_setup():
    img = plate("p18-clean")
    rng = np.random.default_rng(181)
    motes = [(rng.uniform(0, W), rng.uniform(0, H), rng.uniform(0.6, 1.8), rng.uniform(0.15, 0.55), rng.uniform(3, 9), rng.uniform(-3, 3)) for _ in range(46)]
    return dict(L=Layer(img), motes=motes)


def s18_render(s, t, dur):
    f, _ = s["L"].render((1.0 + 0.004 * t / max(dur, 1e-3), 640, 360, 0, 0))
    acc = np.zeros((H, W), np.float32)
    for (x, y, r, a, vx, vy) in s["motes"]:
        cx, cy = (x + vx * t) % W, (y - vy * t) % H
        x0, x1 = int(max(0, cx - 8)), int(min(W, cx + 9))
        y0, y1 = int(max(0, cy - 8)), int(min(H, cy + 9))
        acc[y0:y1, x0:x1] += a * np.exp(-(((XX[y0:y1, x0:x1] - cx) ** 2 + (YY[y0:y1, x0:x1] - cy) ** 2) / (2 * r * r)))
    return f + acc[..., None] * np.array([0.6, 0.75, 1.0], np.float32) * 0.6


# ---------------------------------------------------------------- S19 title
def s19_setup():
    img = plate("p19")
    L = lum(img)
    title = rect_mask(318, 215, 955, 365, 0) * smooth(L, 0.55, 0.85) * (sat(img) < 0.35)
    floor = blur((YY > 625).astype(np.float32) * (1 - poly_mask([[(590, 600), (680, 600), (690, 720), (580, 720)]], 0)), 3)
    city = rect_mask(0, 380, 1280, 610, 10) * smooth(L, 0.4, 0.75)
    return dict(L=Layer(img), title=blur(title, 0.8), floor=floor, city=city)


def s19_render(s, t, dur):
    p = t / dur
    ox = 3 - 6 * p
    fdx = (1.0 * np.sin(0.11 * YY - TAU * 0.5 * t) + 0.6 * noise_field(191, t, (36, 6), 0.9)) * s["floor"]
    xs = 250 + smooth(t, 0.7, 2.5) * 820
    sweep = np.exp(-((XX - xs + (YY - 290) * 0.4) / 70) ** 2) * s["title"] * 0.35 * float(0.7 < t < 2.6)
    breath = s["title"] * 0.04 * (0.5 + 0.5 * np.sin(TAU * 0.3 * t))
    light = (sweep + breath)[..., None] * np.array([0.85, 0.92, 1.0], np.float32)
    mult = 1 + 0.12 * twinkle_map(192, t, (120, 66), 0.7) * s["city"]
    f, _ = s["L"].render((1.008, 640, 360, ox, 0), (fdx, fdx * 0), light, mult)
    return f


SHOTS = {
    "S01": (s01_setup, s01_render), "S02": (room_setup, s02_render), "S03": (room_setup, s03_render), "S04": (s04_setup, s04_render),
    "S05": (s05_setup, s05_render), "S06": (s06_setup, s06_render), "S07": (s07_setup, s07_render), "S08": (board_setup, s08_render),
    "S09": (board_setup, s09_render), "S10": (over_setup, s10_render), "S11": (over_setup, s11_render), "S12": (over_setup, s12_render),
    "S13": (over_setup, s13_render), "S14": (over_setup, s14_render), "S15": (over_setup, s15_render), "S16": (s16_setup, s16_render),
    "S17": (s17_setup, s17_render), "S18": (s18_setup, s18_render), "S19": (s19_setup, s19_render),
}


# ================================================================ V6: merged analysis take (S10-S15)
A_T = [0.0, 0.80, 1.55, 2.25, 3.40, 4.80, 5.70]  # A1..A6 boundaries
A_STAGE = [0.15, 0.40, 0.65, 1.00]


def sa_setup():
    s = over_setup()
    s["hud"] = np.maximum(blur(poly_mask([[(0, 90), (100, 78), (280, 150), (240, 600), (0, 600)]], 0), 45), rect_mask(995, 318, 1272, 482, 22, 10))
    return s


def _step(t, a, b, w=0.25):
    return smooth(t, b - w / 2, b + w / 2) if b is not None else 0.0


def sa_render(s, t, dur):
    a1, a2, a3, a4, a5, a6, end = A_T
    # pressure stage: steps up at each number change, eased over 0.25s
    stage = A_STAGE[0]
    for i, b in enumerate([a2, a3, a4]):
        stage += (A_STAGE[i + 1] - A_STAGE[i]) * smooth(t, b - 0.05, b + 0.2)
    # camera: 100 -> 101 -> 102 -> 103, then back to 102 during "unknown"
    sc = 1.0
    for b in (a2, a3, a4):
        sc += 0.01 * smooth(t, b - 0.05, b + 0.45)
    sc -= 0.01 * smooth(t, a5, a5 + 1.2)
    cam = (sc, *C, 0, 0)
    if t < a5:
        f = over_render(s, t, stage, cam, shake=1.0 * smooth(t, a4, a4 + 0.3), streaks=smooth(t, a3, a3 + 0.3))
        hud = 0.60
    elif t < a6:
        f = over_render(s, a5, 0.55, cam, freeze=True)
        hud = 0.60 - 0.25 * smooth(t, a5 + 0.05, a5 + 1.0)
        if abs(t - (a5 + 0.35)) < 0.021:  # single data drop
            hud = 0.15
            f = f * 0.85
            f[300:306] *= 0.4
    else:
        k = smooth(t, a6, end)
        f = over_render(s, t, 0.6 + 0.4 * k, cam, shake=2.0 * k, focus=0.35 * k, streaks=0.0)
        hud = 0.35
    # HUD pushed back: dim + soften
    b, _ = s["blur"].render(cam)
    m = s["hud"][..., None]
    f = f * (1 - m * 0.45) + b * (m * 0.45)
    f = f * (1 - m * (1 - hud))
    # red flash replaces black dips at number changes (2 frames)
    for b_ in (a2, a3, a4):
        if 0 <= t - b_ < 2 / 24:
            k = 1.0 - (t - b_) * 12
            f = f * (1 - 0.10 * k) + (1 - vig(1.0))[..., None] * np.array([0.30, 0.02, 0.02], np.float32) * k + np.array([0.10, 0.01, 0.01], np.float32) * k
    return f


# ================================================================ V6: S16 with HUD pushed back
def s16v6_setup():
    s = s16_setup()
    s["hud"] = rect_mask(0, 0, 395, 700, 18)
    s["blurL"] = Layer(blur(plate("p16"), 1.6))
    return s


def s16v6_render(s, t, dur):
    f = s16_render(s, t, dur)
    level = 0.55 - 0.30 * smooth(t, BOX_T[2], BOX_T[2] + 0.5)
    b, _ = s["blurL"].render((1.0, 640, 360, 0, 0))
    m = s["hud"][..., None]
    f = f * (1 - m * 0.5) + b * (m * 0.5)
    return f * (1 - m * (1 - level))


def s17v6_render(s, t, dur):
    front = 1280 - smooth(t, 0.50, 2.20) * 1500
    local = smooth(XX - front, -60, 60)
    dimk = 0.62 * local * s["lights"] + 0.10 * smooth(t, 0.5, 2.3)
    mist = noise_field(171, t * 0.6, (5, 3), 3.0)
    mist = (0.5 + 0.25 * mist) * np.exp(-((YY - 470) / 110) ** 2) * 0.05
    f, _ = s["L"].render((1.0, 640, 360, 0, 0), None, None, 1 - dimk)
    return f + mist[..., None] * np.array([0.55, 0.62, 0.8], np.float32)


def s19v6_render(s, t, dur):
    p = t / dur
    ox = 3 - 6 * p
    fdx = (1.0 * np.sin(0.11 * YY - TAU * 0.5 * t) + 0.6 * noise_field(191, t, (36, 6), 0.9)) * s["floor"]
    xs = 250 + smooth(t, 1.0, 2.8) * 820
    sweep = np.exp(-((XX - xs + (YY - 290) * 0.4) / 70) ** 2) * s["title"] * 0.35 * float(1.0 < t < 2.9)
    breath = s["title"] * 0.04 * (0.5 + 0.5 * np.sin(TAU * 0.3 * t))
    light = (sweep + breath)[..., None] * np.array([0.85, 0.92, 1.0], np.float32)
    mult = 1 + 0.12 * twinkle_map(192, t, (120, 66), 0.7) * s["city"]
    f, _ = s["L"].render((1.008, 640, 360, ox, 0), (fdx, fdx * 0), light, mult)
    return f


SHOTS.update({"SA": (sa_setup, sa_render), "S16": (s16v6_setup, s16v6_render), "S17": (s17_setup, s17v6_render), "S19": (s19_setup, s19v6_render)})


# ================================================================ V7: S05 6.8 TOKEN revived
def s05v7_setup():
    s = s05_setup()
    img = plate("p05")
    # floating chip under the panel: what is left after paying
    chip = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(chip)
    d.rounded_rectangle([960, 598, 1230, 640], radius=10, fill=(8, 14, 30, 200), outline=(255, 176, 92, 230), width=1)
    d.text((1095, 619), "결제 후 잔액   0.3 TOKEN", font=font("sans-b", 20), fill=(255, 196, 120, 255), anchor="mm")
    c = np.asarray(chip, np.float32) / 255.0
    with_chip = img * (1 - c[..., 3:]) + c[..., :3] * c[..., 3:]
    s["chipL"] = Layer(with_chip)
    s["chipglow"] = blur(c[..., 3], 8)
    s["row68"] = rect_mask(958, 322, 1232, 422, 2, 12)
    s["row68g"] = blur(s["row68"], 9) - s["row68"] * 0.6
    s["bal"] = rect_mask(1110, 452, 1215, 486, 3, 4)
    return s


def s05v7_render(s, t, dur):
    # beats: 0-0.7 settle | 0.7 price row lights | 1.3 "after payment 0.3" chip | 1.9-2.6 finger hovers, pulls back | 2.6-end button glow fades (does not pay)
    p = ease(t / dur)
    cam = (1.0 + 0.035 * p, 1040, 430, 0, 0)
    retreat = smooth(t, 2.0, 2.7)
    dx = 1.6 * retreat * s["finger"]
    dy = -0.6 * np.sin(TAU * t / 3.6) * s["mother"] - 0.35 * np.sin(TAU * t / 3.0 + 1) * s["boy"]
    ys = 20 + (t / 2.4 % 1.0) * 640
    scan = np.exp(-((YY - ys) / 2.5) ** 2) * 0.08 + np.exp(-((YY - ys) / 30) ** 2) * 0.02
    want = 1 - 0.75 * smooth(t, 2.4, 3.2)
    pulse = (0.5 + 0.5 * np.sin(TAU * 0.75 * t)) * want
    row = s["row68g"] * 0.10 * smooth(t, 0.6, 0.9) * (0.75 + 0.25 * np.sin(TAU * 1.1 * t))
    light = (s["panel"] * scan + s["button_glow"] * 0.07 * pulse + row)[..., None] * np.array([0.45, 0.75, 1.0], np.float32)
    chip_a = smooth(t, 1.25, 1.6)
    light = light + (s["chipglow"] * 0.05 * chip_a)[..., None] * np.array([1.0, 0.65, 0.3], np.float32)
    mult = 1 + s["button"] * 0.10 * pulse + 0.16 * twinkle_map(55, t, (100, 56), 0.5) * s["window"] - s["bal"] * 0.25 * chip_a
    base, _ = s["L"].render(cam, (dx, dy), light, mult)
    if chip_a <= 0:
        return base
    ch, _ = s["chipL"].render(cam, (dx, dy), light, mult)
    return base * (1 - chip_a) + ch * chip_a


# ================================================================ V7: analysis take, rise fast -> freeze -> unknown -> overload burst
B_T = dict(r1=0.0, r2=0.42, r3=0.84, r4=1.26, freeze=1.40, unk=2.35, burst=3.75, end=5.20)


def sb_setup():
    s = sa_setup()
    s["hud"] = np.maximum(s["hud"], rect_mask(920, 30, 1190, 305, 30, 10) * 0.55)  # brain hologram also steps back
    return s


def sb_render(s, t, dur):
    T = B_T
    if t < T["freeze"]:
        stage = 0.2 + 0.8 * smooth(t, 0.0, T["r4"] + 0.1)
        sc = 1.0 + 0.03 * smooth(t, 0.0, T["freeze"])
        f = over_render(s, t, stage, (sc, *C, 0, 0), shake=0.6 * smooth(t, T["r3"], T["r4"]))
        hud = 0.45
    elif t < T["unk"]:
        # 9.4M: everything stops for a beat
        f = over_render(s, T["freeze"], 1.0, (1.03, *C, 0, 0), freeze=True)
        g = lum(f)[..., None]
        k = 0.35 * smooth(t, T["freeze"], T["freeze"] + 0.12)
        f = f * (1 - k) + g * k
        hud = 0.45
    elif t < T["burst"]:
        sc = 1.03 - 0.01 * smooth(t, T["unk"], T["burst"])
        f = over_render(s, T["freeze"], 0.5, (sc, *C, 0, 0), freeze=True)
        hud = 0.45 - 0.15 * smooth(t, T["unk"], T["unk"] + 0.8)
        if abs(t - (T["unk"] + 0.45)) < 0.021:
            f = f * 0.85
            f[300:306] *= 0.4
    else:
        k = smooth(t, T["burst"], T["burst"] + 0.9)
        hit = np.exp(-((t - T["burst"]) / 0.12) ** 2)
        f = over_render(s, t * 1.4, 0.7 + 0.3 * k, (1.02 + 0.012 * k, *C, 0, 0), shake=3.0 * k, focus=0.4 * k)
        f = f + (1 - vig(1.0))[..., None] * np.array([0.35, 0.03, 0.03], np.float32) * (0.5 * k + hit)
        f = f * (1 + 0.25 * hit)
        hud = 0.30
    b, _ = s["blur"].render((1.02, *C, 0, 0))
    m = s["hud"][..., None]
    f = f * (1 - m * 0.5) + b * (m * 0.5)
    f = f * (1 - m * (1 - hud))
    return f * vig(0.25)[..., None]


SHOTS.update({"S05": (s05v7_setup, s05v7_render), "SB": (sb_setup, sb_render)})


# ================================================================ V8: revolution montage (4 independent hard cuts, no subtitles)
def _embers(seed, n):
    rng = np.random.default_rng(seed)
    return [(rng.uniform(0, W), rng.uniform(200, H + 100), rng.uniform(0.7, 2.0), rng.uniform(0.3, 0.9), rng.uniform(-40, 40), rng.uniform(60, 220)) for _ in range(n)]


def _draw_embers(em, t, color, gain=1.0):
    acc = np.zeros((H, W), np.float32)
    for (x, y, r, a, vx, vy) in em:
        cx, cy = x + vx * t, y - vy * t
        if not (-10 < cx < W + 10 and -10 < cy < H + 10):
            continue
        x0, x1 = int(max(0, cx - 7)), int(min(W, cx + 8))
        y0, y1 = int(max(0, cy - 9)), int(min(H, cy + 9))
        if x1 <= x0 or y1 <= y0:
            continue
        flick = 0.6 + 0.4 * np.sin(t * 23 + x)
        acc[y0:y1, x0:x1] += a * flick * np.exp(-(((XX[y0:y1, x0:x1] - cx) ** 2) / (2 * r * r) + ((YY[y0:y1, x0:x1] - cy) ** 2) / (2 * (r * 2.2) ** 2)))
    return acc[..., None] * np.array(color, np.float32) * gain


def rev_setup(name, seed):
    img = plate(name)
    L = lum(img)
    fire = ((img[..., 0] > img[..., 2] + 0.15) & (L > 0.45)).astype(np.float32)
    red = ((img[..., 0] > img[..., 1] + 0.35) & (img[..., 0] > 0.6)).astype(np.float32)
    cyan = ((img[..., 2] > img[..., 0] + 0.15) & (L > 0.55)).astype(np.float32)
    return dict(L=Layer(img), fire=blur(fire, 2), red=blur(red, 3), cyan=blur(cyan, 2), em=_embers(seed, 70), smoke_seed=seed)


def _shake(seed, t, amp):
    return amp * scalar_noise(seed, t, 0.06), amp * scalar_noise(seed + 1, t, 0.055)


def r1_setup():
    return rev_setup("r1", 801)


def r1_render(s, t, dur):
    # the dream billboard breaks apart: fast push, fire flicker, embers, impact shake
    p = 1 - (1 - min(t / dur, 1)) ** 2
    hit = np.exp(-(t / 0.10) ** 2)
    ox, oy = _shake(811, t, 3.0 * (0.4 + hit))
    fl = twinkle_map(812, t, (60, 34), 0.12)
    mult = 1 + (0.25 * fl + 0.15) * s["fire"]
    f, _ = s["L"].render((1.0 + 0.06 * p, 470, 200, ox, oy), None, None, mult)
    f = f + _draw_embers(s["em"], t + 0.3, (1.0, 0.55, 0.2), 0.9)
    return f * (1 + 0.35 * hit)


def r2_setup():
    return rev_setup("r2", 802)


def r2_render(s, t, dur):
    # people tear the interface off: white severing flash, cyan cable glints, small push
    p = ease(t / dur)
    flash = np.exp(-(t / 0.09) ** 2) * 0.55
    gl = (0.5 + 0.5 * twinkle_map(822, t, (90, 50), 0.08)) * s["cyan"] * 0.35
    ox, oy = _shake(821, t, 1.2)
    f, _ = s["L"].render((1.0 + 0.04 * p, 640, 260, ox, oy), None, gl[..., None] * np.array([0.6, 0.9, 1.0], np.float32))
    return f + flash


def r3_setup():
    return rev_setup("r3", 803)


def r3_render(s, t, dur):
    # riot line vs crowd: lateral slide, red beacons pulsing, smoke drifting
    p = ease(t / dur)
    beacon = 0.5 + 0.5 * np.sign(np.sin(TAU * 3.2 * t))
    mult = 1 + 0.45 * beacon * s["red"]
    ox, oy = _shake(831, t, 1.0)
    f, _ = s["L"].render((1.03, 640, 420, 14 - 28 * p + ox, oy), None, None, mult)
    smoke = (0.5 + 0.35 * noise_field(832, t * 2.0, (6, 4), 1.0)) * np.exp(-((YY - 520) / 140) ** 2) * 0.10
    return f * (1 - smoke[..., None] * 0.4) + smoke[..., None] * np.array([0.75, 0.72, 0.8], np.float32)


def r4_setup():
    return rev_setup("r4", 804)


def r4_render(s, t, dur):
    # Seoin watches from a distance: slow push, distant fires breathing, embers drifting across
    p = ease(t / dur)
    fl = twinkle_map(842, t, (60, 34), 0.3)
    mult = 1 + (0.18 * fl + 0.08) * s["fire"]
    f, _ = s["L"].render((1.0 + 0.025 * p, 900, 360, 0, 0), None, None, mult)
    return f + _draw_embers(s["em"], t + 1.2, (1.0, 0.6, 0.25), 0.55)


def s17v8_render(s, t, dur):
    # after the montage: the city simply goes quiet (short)
    front = 1280 - smooth(t, 0.15, 1.15) * 1500
    local = smooth(XX - front, -60, 60)
    dimk = 0.62 * local * s["lights"] + 0.10 * smooth(t, 0.15, 1.2)
    mist = noise_field(171, t * 0.6, (5, 3), 3.0)
    mist = (0.5 + 0.25 * mist) * np.exp(-((YY - 470) / 110) ** 2) * 0.05
    f, _ = s["L"].render((1.0, 640, 360, 0, 0), None, None, 1 - dimk)
    return f + mist[..., None] * np.array([0.55, 0.62, 0.8], np.float32)


SHOTS.update({"R1": (r1_setup, r1_render), "R2": (r2_setup, r2_render), "R3": (r3_setup, r3_render), "R4": (r4_setup, r4_render),
              "S17": (s17_setup, s17v8_render)})


# ================================================================ V10: blackout comes right after "꺼." (before the revolution)
def s17v10_render(s, t, dur):
    front = 1280 - smooth(t, 0.20, 1.60) * 1500
    local = smooth(XX - front, -60, 60)
    dimk = 0.66 * local * s["lights"] + 0.12 * smooth(t, 0.2, 1.7)
    mist = noise_field(171, t * 0.6, (5, 3), 3.0)
    mist = (0.5 + 0.25 * mist) * np.exp(-((YY - 470) / 110) ** 2) * 0.05
    f, _ = s["L"].render((1.0, 640, 360, 0, 0), None, None, 1 - dimk)
    return f + mist[..., None] * np.array([0.55, 0.62, 0.8], np.float32)


SHOTS.update({"S17": (s17_setup, s17v10_render)})


# ================================================================ V12: new opening (dream -> wake -> TV replays the dream -> "나 바다 좋아해?")
def o1_setup():
    img = plate("o1")
    L = lum(img)
    boy = poly_mask([[(560, 230), (700, 200), (820, 230), (900, 330), (960, 470), (980, 640), (560, 650), (540, 500)]], feather=0)
    sea = rect_mask(0, 345, 1280, 570, 10) * (1 - blur(boy, 8)) * (1 - rect_mask(960, 0, 1280, 420, 20))
    spec = smooth(L, 0.62, 0.95) * sea
    rng = np.random.default_rng(91)
    return dict(L=Layer(img), sea=sea, spec=spec, ph=rng.uniform(0, TAU, (H, W)).astype(np.float32), om=rng.uniform(3, 7, (H, W)).astype(np.float32))


def o1_render(s, t, dur):
    p = ease(t / dur)
    yamp = 0.4 + 1.2 * np.clip((YY - 345) / 225, 0, 1)
    dy = yamp * np.sin(0.09 * YY - TAU * 0.42 * t + 0.012 * XX) * s["sea"]
    dx = 0.5 * noise_field(911, t, (24, 14), 1.4) * s["sea"]
    tw = np.maximum(np.sin(s["om"] * t + s["ph"]), 0) ** 6
    light = (s["spec"] * tw * 0.30)[..., None] * np.ones(3, np.float32)
    f, _ = s["L"].render((1.0 + 0.03 * p, 640, 300, 0, 0), (dx, dy), light)
    g = smooth(t, dur - 0.32, dur - 0.02)  # the dream breaks at the end
    if g > 0:
        rng = np.random.default_rng(int(t * 240))
        out = f.copy()
        for _ in range(int(4 + 14 * g)):
            y0 = int(rng.integers(0, H - 8)); h = int(rng.integers(3, 18 + int(40 * g)))
            sh = int(rng.integers(-60, 60) * g)
            out[y0:y0 + h] = np.roll(f[y0:y0 + h], sh, axis=1)
        k = int(3 + 10 * g)
        out[..., 0] = np.roll(out[..., 0], k, axis=1)
        out[..., 2] = np.roll(out[..., 2], -k, axis=1)
        f = out * (1 - 0.35 * g * (rng.random() > 0.5)) + 0.08 * g
    return f


def o2_setup():
    img = plate("o2-fixed")
    check = np.exp(-(((XX - 904) / 40) ** 2 + ((YY - 150) / 40) ** 2))
    hud = rect_mask(564, 74, 986, 552, 3, 24)
    return dict(L=Layer(img), check=check, hud=hud)


def o2_render(s, t, dur):
    p = ease(t / dur)
    flash = np.exp(-((t - 0.25) / 0.18) ** 2)
    light = (s["check"] * 0.25 * flash + s["hud"] * 0.03 * (0.5 + 0.5 * np.sin(TAU * 0.8 * t)))[..., None] * np.array([0.6, 0.85, 1.0], np.float32)
    f, _ = s["L"].render((1.0 + 0.02 * p, 300, 300, 0, 0), None, light)
    return f


def o3_setup():
    img = plate("o3")
    L = lum(img)
    tvsea = rect_mask(356, 290, 640, 430, 6)
    spec = smooth(L, 0.6, 0.95) * rect_mask(356, 240, 845, 450, 6)
    screen = rect_mask(352, 50, 1280, 560, 8)
    viewer = blur(rect_mask(0, 80, 330, 720, 0), 40)
    rng = np.random.default_rng(93)
    return dict(L=Layer(img), tvsea=tvsea, spec=spec, screen=screen, viewer=viewer, ph=rng.uniform(0, TAU, (H, W)).astype(np.float32), om=rng.uniform(3, 7, (H, W)).astype(np.float32))


def o3_render(s, t, dur):
    p = ease(t / dur)
    dy = 0.9 * np.sin(0.1 * YY - TAU * 0.42 * t + 0.012 * XX) * s["tvsea"]
    tw = np.maximum(np.sin(s["om"] * t + s["ph"]), 0) ** 6
    flick = 0.5 + 0.5 * np.sin(TAU * 0.42 * t)
    light = (s["spec"] * tw * 0.22)[..., None] * np.ones(3, np.float32) + (s["viewer"] * (0.03 + 0.03 * flick))[..., None] * np.array([1.0, 0.6, 0.45], np.float32)
    f, _ = s["L"].render((1.0 + 0.04 * p, 640, 300, 0, 0), (dy * 0, dy), light)
    return f


def o4_setup():
    return dict(full=Layer(plate("o4")), one=Layer(plate("o4-one")), none=Layer(plate("o4-none")),
                g1=blur(rect_mask(676, 118, 1120, 316, 0, 18), 14), g2=blur(rect_mask(624, 344, 1264, 688, 0, 18), 16))


O4_T = (0.15, 1.30)


def o4_render(s, t, dur):
    cam = (1.0 + 0.015 * ease(t / dur), 420, 360, 0, 0)
    a, _ = s["none"].render(cam)
    b, _ = s["one"].render(cam)
    c, _ = s["full"].render(cam)
    k1 = smooth(t, O4_T[0], O4_T[0] + 0.18)
    k2 = smooth(t, O4_T[1], O4_T[1] + 0.22)
    f = a * (1 - k1) + b * k1
    f = f * (1 - k2) + c * k2
    glow = s["g2"] * 0.12 * np.exp(-max(t - O4_T[1], 0) / 0.3) * (t >= O4_T[1])
    return f + glow[..., None] * np.array([0.4, 0.7, 1.0], np.float32)


SHOTS.update({"O1": (o1_setup, o1_render), "O2": (o2_setup, o2_render), "O3": (o3_setup, o3_render), "O4": (o4_setup, o4_render)})
