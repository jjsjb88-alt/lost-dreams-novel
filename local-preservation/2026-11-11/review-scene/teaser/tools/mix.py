"""Edit the BGM to the V8 cut points and mix it under the synthesized SFX stem.
Usage: mix.py BGM.wav SFX.wav OUT.wav   (all 48k stereo; SFX made with NO_MUSIC=1 tools/sound.py)"""
import sys, wave
import numpy as np

SR = 48000
DUR = 55.01
N = int(DUR * SR)


def read(p):
    w = wave.open(p)
    a = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, 2).astype(np.float32) / 32767
    return a


def db(x):
    return 10 ** (x / 20)


bgm, sfx = read(sys.argv[1]), read(sys.argv[2])
out_bgm = np.zeros((N, 2), np.float32)


def place(v0, v1, s0, gain_db, fi=0.01, fo=0.01):
    """Copy song[s0 : s0+(v1-v0)] to video time v0..v1 with fades (seconds)."""
    i0, i1 = int(v0 * SR), int(v1 * SR)
    j0 = int(s0 * SR)
    seg = bgm[j0:j0 + (i1 - i0)].copy()
    n = len(seg)
    e = np.ones(n, np.float32)
    a, b = max(1, int(fi * SR)), max(1, int(fo * SR))
    e[:a] = np.linspace(0, 1, a)
    e[-b:] = np.minimum(e[-b:], np.linspace(1, 0, b))
    out_bgm[i0:i0 + n] += seg * e[:, None] * db(gain_db)


def automate(points):
    """Piecewise-linear gain (dB) over video time: [(t, dB), ...]."""
    t = np.arange(N) / SR
    ts, gs = zip(*points)
    return db(np.interp(t, ts, gs)).astype(np.float32)


DUR = 54.81
N = int(DUR * SR)
out_bgm = np.zeros((N, 2), np.float32)
# 1) 0 -> "꺼." (34.29): song straight through.
place(0.00, 34.29, 0.00, 0.0, fi=0.3, fo=0.02)
# 2) "꺼." (34.29) -> blackout -> black bridge: total silence. The sound comes back only with the revolution.
# 3) revolution 39.41 -> end: the climax (onset 49.99) lands on the first cut
place(39.41, DUR, 49.99, 0.0, fi=0.005, fo=1.5)  # no gap: the climax runs on through the 0.4 s black, the question and the title

# level automation (dB): BGM sits under the SFX, ducks under dialogue/beats, opens for revolution and title
import os
SFX_GAIN = float(os.environ.get("SFX_GAIN", "1.0"))
if SFX_GAIN < 0.5:
    # music-led: lift the song's quiet passages so the score carries the whole teaser
    auto = automate([
        (0.0, 8), (12.8, 8), (13.4, 3), (25.9, 3), (26.45, 0), (27.86, 0),
        (28.81, -3), (30.15, -3), (30.25, 4), (31.6, 4), (31.9, -4), (34.3, -4),
        (39.41, 2), (42.41, 2), (42.81, 0), (48.81, 1), (52.4, 3), (54.81, 8),
    ])
else:
    auto = automate([
        (0.0, -9), (13.2, -9), (13.4, -11), (16.7, -11), (16.8, -8), (21.8, -8), (21.9, -12), (26.3, -12), (26.45, -7), (27.86, -6),
        (28.81, -22), (30.15, -22), (30.25, -6), (31.6, -6), (31.9, -24), (34.3, -24),
        (36.8, -3), (40.31, -3), (40.6, -6), (42.6, -6), (43.4, -4), (49.41, -2), (50.0, 0), (55.01, 0),
    ])
out_bgm *= auto[:, None]

mix = out_bgm + sfx[:N] * SFX_GAIN
mix /= np.abs(mix).max() / 0.89
pcm = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[3], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", sys.argv[3])
