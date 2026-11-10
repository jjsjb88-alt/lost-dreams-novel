"""Timeline + subtitles + transitions. Usage: render.py OUT.mp4 [--shots S01,S05] [--still t1,t2 ...]"""
import os, sys, subprocess, argparse
from multiprocessing import Pool
sys.path.insert(0, os.path.dirname(__file__))
import numpy as np
from engine import *
import shots as SH

FPS = 24
# (id, start, end) seconds; transition INTO the shot: 'dip' | 'cut' | 'dissolve'
TL = [
    ("O1", 0.00, 2.80, "fadein"), ("O2", 2.80, 4.60, "cut"), ("O3", 4.60, 6.90, "cut"), ("O4", 6.90, 9.79, "cut"), ("S04", 10.04, 13.29, "dip"),
    ("S05", 13.29, 16.79, "xfade"), ("S06", 16.79, 19.29, "cut"), ("S07", 19.29, 21.83, "cut"), ("S08", 21.83, 24.00, "dissolve"),
    ("S09", 24.25, 26.21, "dip"), ("SB", 26.46, 31.66, "dip"), ("S16", 31.91, 36.41, "dip"),
    ("S17", 36.41, 38.81, "cut"),
    ("R4", 39.41, 40.11, "blackcut"), ("R1", 40.11, 40.91, "cut"), ("R2", 40.91, 41.61, "cut"), ("R3", 41.61, 42.41, "cut"),
    ("S18", 42.81, 48.81, "black"), ("S19", 48.81, 54.81, "xfade"),
]
END = 54.81
XF = {"S18": 0.6, "S19": 0.8}  # dissolve length into the ending
NFR = int(round(END * FPS))

SANS = lambda: font("sans-m", 29)
SANSB = lambda: font("sans-b", 34)

# subtitle box rects (cover the reconstructed old boxes with margin)
R1 = {"S01": (74, 545, 1214, 656), "S02": (65, 509, 1221, 672), "S03": (65, 509, 1221, 672), "S04": (63, 501, 1223, 666),
      "S08": (63, 525, 1223, 641), "S09": (63, 525, 1223, 641)}
RNUM = (69, 545, 1217, 650)
R14 = (69, 514, 1217, 669)


def subs(sid, t, dur):
    """Return list of (rect, [(lines, font, center_y, gap, opacity)])."""
    if sid == "S01":
        return R1[sid], [(["눈을 뜨면, 언제나 같은 바다가 있다."], SANS(), 600, 0, 1)]
    if sid == "S02":
        return R1[sid], [(["그런데 현실의 화면에도,", "똑같은 바다가 흐르고 있었다."], SANS(), 590, 46, 1)]
    if sid == "S03":
        return R1[sid], [(["서인:  모노. 나 바다 좋아해?", None], SANS(), 590, 46, 1),
                         ([None, "모노:  ‘좋아한다’의 기준을 지정해 주세요."], SANS(), 590, 46, smooth(t, 1.25, 1.55))]
    if sid == "S04":
        return R1[sid], [(["사람들은 잠든 동안 꿈을 내놓고,", "아침이면 TOKEN을 받았다."], SANS(), 583, 46, 1)]
    if sid == "S08":
        return R1[sid], [(["“누가 계산했습니까?”"], SANSB(), 583, 0, 1)]
    if sid == "S09":
        return R1[sid], [(["서인:  “제가요.”"], SANSB(), 583, 0, 1)]
    if sid == "S14":
        return R14, [(["추론 출처:  미확인", "인간 단독 가설:  배제 불가"], SANS(), 591, 50, 1)]
    return None


NUMS = {"S10": (0, 1_200_000), "S11": (1_200_000, 3_800_000), "S12": (3_800_000, 6_400_000), "S13": (6_400_000, 9_400_000)}


def counter_layer(val):
    f = font("sans-b", 31)
    label = "추론 출처 추적"
    s = f"{val:,}"
    # fixed layout: label at lx, digits in fixed cells
    lw = f.getlength(label)
    dw = max(f.getlength(d) for d in "0123456789")
    cw = f.getlength(",")
    template = "9,400,000"
    nw = sum(cw if c == "," else dw for c in template)
    tw = f.getlength(" TOKEN")
    total = lw + 34 + nw + tw
    x = (W - total) / 2
    alpha = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(alpha)
    y = 598
    d.text((x, y), label, font=f, fill=255, anchor="lm")
    x += lw + 34
    s = s.rjust(len(template))
    for ch, tc in zip(s, template):
        w = cw if tc == "," else dw
        if ch != " ":
            d.text((x + w / 2, y), ch, font=f, fill=255, anchor="mm")
        x += w
    d.text((x, y), " TOKEN", font=f, fill=255, anchor="lm")
    a = np.asarray(alpha, np.float32) / 255
    return (np.ones((H, W, 3), np.float32), a, blur(a, 2.2) * 0.55), total


def overlay_text(frame, sid, t, dur):
    if sid == "SB":
        T = SH.B_T
        if t >= T["burst"]:
            return frame
        if t < T["unk"]:
            vals = [1_200_000, 3_800_000, 6_400_000, 9_400_000]
            v = vals[0]
            for i, b in enumerate([T["r2"], T["r3"], T["r4"]]):
                v += (vals[i + 1] - vals[i]) * ease((t - b) / 0.16) if t > b else 0
            v = int(round(v / 1000.0)) * 1000
            tl, total = counter_layer(v)
            rect = (int(W / 2 - total / 2 - 48), 545, int(W / 2 + total / 2 + 48), 650)
            op = 1 - smooth(t, T["unk"] - 0.08, T["unk"])
            frame = subtitle_box(frame, rect, opacity=op)
            return put_text(frame, tl, op)
        lines = ["추론 출처:  미확인", "인간 단독 가설:  배제 불가"]
        fnt = SANS()
        tw = max(fnt.getlength(x) for x in lines)
        rect = (int(W / 2 - tw / 2 - 48), 514, int(W / 2 + tw / 2 + 48), 669)
        op = smooth(t, T["unk"], T["unk"] + 0.12) * (1 - smooth(t, T["burst"] - 0.1, T["burst"]))
        frame = subtitle_box(frame, rect, opacity=op)
        return put_text(frame, text_layer(lines, fnt, 591, 50), op)
    if sid == "SA":
        A = SH.A_T
        if t >= A[5]:
            return frame
        if t < A[4]:
            vals = [1_200_000, 3_800_000, 6_400_000, 9_400_000]
            v = vals[0]
            for i, b in enumerate(A[1:4]):
                v += (vals[i + 1] - vals[i]) * ease((t - b) / 0.30) if t > b else 0
            v = int(round(v / 1000.0)) * 1000
            tl, total = counter_layer(v)
            rect = (int(W / 2 - total / 2 - 48), 545, int(W / 2 + total / 2 + 48), 650)
            op = 1 - smooth(t, A[4] - 0.08, A[4])
            frame = subtitle_box(frame, rect, opacity=op)
            return put_text(frame, tl, op)
        lines = ["추론 출처:  미확인", "인간 단독 가설:  배제 불가"]
        fnt = SANS()
        tw = max(fnt.getlength(x) for x in lines)
        rect = (int(W / 2 - tw / 2 - 48), 514, int(W / 2 + tw / 2 + 48), 669)
        op = smooth(t, A[4], A[4] + 0.12) * (1 - smooth(t, A[5] - 0.12, A[5]))
        frame = subtitle_box(frame, rect, opacity=op)
        return put_text(frame, text_layer(lines, fnt, 591, 50), op)
    if sid == "S18":
        f = font("serif-l", 34)
        for i, (ln, y, t0) in enumerate([("사람들은 꿈을 빼앗긴 걸까.", 298, 0.50), ("아니면, 꿈꾸기를 포기한 걸까.", 410, 2.40)]):
            op = smooth(t, t0, t0 + 0.8) * (1 - smooth(t, dur - 1.0, dur - 0.25))
            if op <= 0:
                continue
            rgb, a, sh = text_layer([ln], f, y, 0, color=(232, 237, 247), shadow=0.0)
            gl = blur(a, 7) * 0.55
            tw = f.getlength(ln)
            streak = np.exp(-((YY - y - 22) / 5.0) ** 2) * np.exp(-((XX - W / 2) / (tw * 0.42)) ** 2) * 0.22
            frame = frame + ((gl + streak) * op)[..., None] * np.array([0.35, 0.55, 1.0], np.float32)
            frame = over(frame, rgb, a * op)
        return frame
    sb = subs(sid, t, dur)
    if sb is None:
        return frame
    rect, items = sb
    frame = subtitle_box(frame, rect)
    for lines, fnt, cy, gap, op in items:
        if op <= 0:
            continue
        frame = put_text(frame, text_layer(lines, fnt, cy, gap), op)
    return frame


_STATE = {}


def shot_frame(sid, t, dur):
    setup, rend = SH.SHOTS[sid]
    key = setup.__name__
    if key not in _STATE:
        _STATE.clear() if len(_STATE) > 3 else None
        _STATE[key] = setup()
    f = rend(_STATE[key], t, dur)
    return overlay_text(f, sid, t, dur)


def frame_at(n):
    t = n / FPS
    for i, (sid, a, b, tr) in enumerate(TL):
        nxt = TL[i + 1] if i + 1 < len(TL) else None
        nb = nxt[1] if nxt else END
        if a <= t < nb or (i == 0 and t < a):
            dur = b - a
            if t < b or not nxt:
                f = shot_frame(sid, t - a, dur)
                # fade in from a dip
                if tr in ("dip", "fadein"):
                    k = (t - a) * FPS
                    f = f * min(1.0, (k + 1) / 3.0)
                if tr == "xfade" and t - a < XF.get(sid, 0.33) and i > 0:
                    pid, pa, pb, _ = TL[i - 1]
                    k = smooth(t - a, 0.0, XF.get(sid, 0.33))
                    f = f * k + shot_frame(pid, t - pa, pb - pa) * (1 - k)
                if tr == "black":
                    f = f * smooth(t - a, 0.0, 0.35)
                if sid == "S19":
                    f = f * (1 - smooth(t, END - 1.5, END - 0.04))
                return f
            # gap between shots
            gap = nb - b
            if nxt[3] in ("black", "blackcut"):
                return np.zeros((H, W, 3), np.float32)
            if nxt[3] == "dissolve":
                return shot_frame(sid, t - a, dur)
            # dip: fade previous out over first part, black in middle
            k = (t - b) * FPS
            nfo = max(1, int(round(gap * FPS)) - 1)
            if k < nfo - 0.5:
                f = shot_frame(sid, t - a, dur)
                return f * (1 - (k + 1) / (nfo + 1))
            return np.zeros((H, W, 3), np.float32)
    return np.zeros((H, W, 3), np.float32)


def render_range(args):
    n0, n1, path = args
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-c:v", "ffv1", "-level", "3", path]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for n in range(n0, n1):
        f = frame_at(n)
        f = grain(f, 1000 + n, 0.009)
        p.stdin.write((np.clip(f, 0, 1) * 255 + 0.5).astype(np.uint8).tobytes())
    p.stdin.close()
    p.wait()
    return path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("--still", default="")
    ap.add_argument("--range", default="")
    ap.add_argument("--jobs", type=int, default=4)
    a = ap.parse_args()
    if a.still:
        for tt in a.still.split(","):
            n = int(round(float(tt) * FPS))
            to8(grain(frame_at(n), 1000 + n, 0.009)).save(f"{a.out}_{float(tt):06.2f}.png")
        return
    n0, n1 = 0, NFR
    if a.range:
        s0, s1 = map(float, a.range.split(":"))
        n0, n1 = int(round(s0 * FPS)), int(round(s1 * FPS))
    # split on shot boundaries for setup reuse
    k = a.jobs
    edges = [n0 + (n1 - n0) * i // (k * 3) for i in range(k * 3 + 1)]
    parts = [(edges[i], edges[i + 1], f"{a.out}.part{i:02d}.mkv") for i in range(len(edges) - 1)]
    with Pool(k) as pool:
        files = pool.map(render_range, parts, chunksize=1)
    lst = a.out + ".txt"
    with open(lst, "w") as fh:
        for f in files:
            fh.write(f"file '{os.path.abspath(f)}'\n")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c:v", "libx264", "-preset", "slow", "-crf", "16",
                    "-pix_fmt", "yuv420p", "-r", str(FPS), "-movflags", "+faststart", a.out], check=True)
    for f in files:
        os.remove(f)
    os.remove(lst)


if __name__ == "__main__":
    main()
