"""Procedural sound design for teaser V8 (55.0s). Writes a 48k stereo float WAV. Usage: sound.py OUT.wav"""
import sys, wave, os
import numpy as np
NO_MUSIC = os.environ.get("NO_MUSIC") == "1"  # BGM supplies the music: skip pads/notes

SR = 48000
DUR = 55.01
N = int(DUR * SR)
rng = np.random.default_rng(7)
L = np.zeros(N, np.float32)
R = np.zeros(N, np.float32)


def idx(t):
    return int(round(t * SR))


def band_noise(dur, lo, hi, tilt=0.0, seed=None):
    n = int(dur * SR)
    g = np.random.default_rng(seed).standard_normal(n) if seed is not None else rng.standard_normal(n)
    F = np.fft.rfft(g)
    f = np.fft.rfftfreq(n, 1 / SR)
    m = ((f >= lo) & (f <= hi)).astype(float)
    m = np.convolve(m, np.ones(64) / 64, "same")  # soft edges
    if tilt:
        m *= (np.maximum(f, 20) / 1000.0) ** tilt
    y = np.fft.irfft(F * m, n)
    return (y / (np.abs(y).max() + 1e-9)).astype(np.float32)


def env_ar(n, a, r, sr=SR):
    t = np.arange(n) / sr
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(t - a, 0) / max(r, 1e-4))
    return e.astype(np.float32)


def fade(x, fi, fo):
    n = len(x)
    e = np.ones(n, np.float32)
    a, b = int(fi * SR), int(fo * SR)
    if a:
        e[:a] = np.linspace(0, 1, a) ** 1.5
    if b:
        e[-b:] = np.minimum(e[-b:], np.linspace(1, 0, b) ** 1.5)
    return x * e


def add(t0, x, gain=1.0, pan=0.0, t_end=None):
    i = idx(t0)
    if i >= N:
        return
    x = x[: N - i]
    if t_end is not None:
        x = x[: max(0, idx(t_end) - i)]
    lg = np.cos((pan + 1) * np.pi / 4) * 1.4142
    rg = np.sin((pan + 1) * np.pi / 4) * 1.4142
    L[i:i + len(x)] += x * gain * lg
    R[i:i + len(x)] += x * gain * rg


def tone(freq, dur, harm=(1.0,), decay=1.0, attack=0.005, detune=0.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = np.zeros(n)
    for k, a in enumerate(harm, 1):
        y += a * np.sin(2 * np.pi * freq * k * (1 + detune * k) * t) * np.exp(-t * k * 0.6 / max(decay, 1e-3))
    y *= np.minimum(1, t / attack) * np.exp(-t / decay)
    return (y / (np.abs(y).max() + 1e-9)).astype(np.float32)


def sweep(f0, f1, dur, lo_mix=0.0):
    n = int(dur * SR)
    f = np.geomspace(f0, f1, n)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph).astype(np.float32)


def reverb(x, secs=2.0, wet=0.35, seed=3):
    n = int(secs * SR)
    ir = np.random.default_rng(seed).standard_normal(n) * np.exp(-np.arange(n) / SR * (6.0 / secs))
    ir[0] = 0
    m = len(x) + n
    y = np.fft.irfft(np.fft.rfft(x, m) * np.fft.rfft(ir, m), m)[: len(x) + n]
    y = y / (np.abs(y).max() + 1e-9) * np.abs(x).max()
    out = np.zeros(len(y), np.float32)
    out[: len(x)] += x * (1 - wet)
    out += (y * wet).astype(np.float32)
    return out


def amp_lfo(n, rate, depth, phase=0.0):
    t = np.arange(n) / SR
    return (1 - depth + depth * (0.5 + 0.5 * np.sin(2 * np.pi * rate * t + phase))).astype(np.float32)


def heartbeat(t0, t1, bpm0, bpm1, gain):
    t = t0
    while t < t1:
        p = (t - t0) / max(t1 - t0, 1e-6)
        bpm = bpm0 + (bpm1 - bpm0) * p
        for off, g in ((0.0, 1.0), (0.16, 0.6)):
            th = tone(48, 0.35, (1.0, 0.3), decay=0.12, attack=0.004)
            add(t + off, th, gain * g)
        t += 60.0 / bpm


def impact(t0, gain, size=1.0):
    sub = tone(38, 2.5 * size, (1.0, 0.4), decay=0.9 * size, attack=0.002)
    body = band_noise(1.5 * size, 40, 900, seed=int(t0 * 100)) * env_ar(int(1.5 * size * SR), 0.003, 0.35 * size)
    crack = band_noise(0.25, 1500, 9000, seed=int(t0 * 100) + 1) * env_ar(int(0.25 * SR), 0.001, 0.05)
    add(t0, sub, gain)
    add(t0, reverb(body, 2.5, 0.4), gain * 0.7)
    add(t0, crack, gain * 0.35)


def blip(t0, f, gain, pan=0.0, dur=0.35):
    add(t0, reverb(tone(f, dur, (1.0, 0.25, 0.1), decay=dur / 3), 1.2, 0.3), gain, pan)


# ------------------------------------------------------------------ timeline (V8)
# S01 sea 0-3.08 (+dip)
waves = band_noise(3.6, 80, 5000, tilt=-0.4, seed=11) * amp_lfo(int(3.6 * SR), 0.33, 0.6)
add(0.0, fade(waves, 0.6, 0.35), 0.30, -0.2)
add(0.0, fade(band_noise(3.6, 300, 3000, tilt=-0.8, seed=12), 1.0, 0.35) * amp_lfo(int(3.6 * SR), 0.21, 0.5, 1.0), 0.10, 0.3)

# S02/S03 room with TV sea (3.33-9.79): small speaker band, room tone, city hum
tvsea = band_noise(6.5, 350, 3800, tilt=-0.3, seed=13) * amp_lfo(int(6.5 * SR), 0.42, 0.55)
add(3.30, fade(tvsea, 0.15, 0.3), 0.13, 0.55)
add(3.30, fade(band_noise(6.5, 40, 200, seed=14), 0.2, 0.3), 0.08)
add(3.30, fade(band_noise(6.5, 100, 600, tilt=-1, seed=15), 0.4, 0.3), 0.04, -0.6)
blip(6.63 + 1.25, 1318.5, 0.10, 0.2, 0.5)  # Mono answers

# S04 subway (10.04-13.29)
n = int(3.6 * SR)
rumble = band_noise(3.6, 25, 260, seed=16) * amp_lfo(n, 6.3, 0.25)
add(10.0, fade(rumble, 0.2, 0.25), 0.30)
for k in range(5):  # wheel joints, pairs
    for off in (0.0, 0.12):
        add(10.2 + k * 0.75 + off, band_noise(0.09, 200, 2500, seed=100 + k) * env_ar(int(0.09 * SR), 0.002, 0.03), 0.18, -0.3 + 0.15 * k)
for k in range(3):  # tunnel light whoosh
    w = band_noise(0.9, 300, 4000, seed=120 + k) * np.hanning(int(0.9 * SR)).astype(np.float32)
    add(10.3 + k * 1.2, w, 0.07, 0.8 - 0.8 * k)

# S05 6.8 TOKEN (13.29-16.79): quiet room, UI hum, hesitation
add(13.20, fade(band_noise(3.6, 60, 250, seed=17), 0.33, 0.05), 0.06)
hum = tone(220, 3.4, (1.0, 0.2), decay=50) * 0.5
add(13.29, fade(hum, 0.4, 0.8) * np.r_[np.ones(int(2.4 * SR)), np.linspace(1, 0.2, int(1.0 * SR))][: len(hum)].astype(np.float32), 0.025, 0.6)
blip(13.29 + 0.7, 987.8, 0.09, 0.5)           # price row lights
blip(13.29 + 1.3, 659.3, 0.08, 0.55, 0.45)    # "after payment 0.3 TOKEN" (lower, uneasy)
heartbeat(13.6, 16.7, 62, 66, 0.10)

# S06 approval (16.79-19.29): scan sweep + confirm chime
sw = sweep(300, 2400, 1.4) * np.hanning(int(1.4 * SR)).astype(np.float32) * 0.4 + band_noise(1.4, 2000, 9000, seed=18) * np.hanning(int(1.4 * SR)).astype(np.float32) * 0.6
add(16.79 + 0.35, sw, 0.07, -0.1)
for f, d in ((1318.5, 0.0), (1975.5, 0.09)):
    blip(16.79 + 1.218 + d, f, 0.10, 0.1, 0.6)
add(16.79, fade(band_noise(2.6, 150, 1200, seed=19), 0.02, 0.2), 0.05)  # lobby air

# S07 upper entrance (19.29-21.83): scale hit + hall + crowd murmur
impact(19.29, 0.22, 0.8)
hall = reverb(band_noise(2.6, 200, 2000, tilt=-0.5, seed=20) * amp_lfo(int(2.6 * SR), 0.8, 0.3), 2.5, 0.6)
add(19.29, fade(hall, 0.05, 0.3), 0.10)
add(19.29, fade(tone(73.4, 2.6, (1.0, 0.5, 0.25), decay=3.0), 0.02, 0.3), 0.10)

# S08/S09 boardroom (21.83-26.21): near silence, low drone, small hit on "제가요"
add(21.83, fade(tone(55, 4.4, (1.0, 0.3), decay=20) * amp_lfo(int(4.4 * SR), 0.15, 0.3), 0.3, 0.3), 0.08)
add(21.83, fade(band_noise(4.4, 60, 400, seed=21), 0.2, 0.3), 0.03)
add(24.25, tone(41, 1.6, (1.0, 0.4), decay=0.6, attack=0.003), 0.20)

# SB analysis take (26.46-31.66)
T0 = 26.46
for k, f in enumerate((880, 1046.5, 1244.5, 1480)):  # counter steps
    t = T0 + k * 0.42
    for j in range(6):
        add(t + j * 0.025, tone(f * (1 + 0.02 * j), 0.03, (1.0,), decay=0.01), 0.05, 0.2)
    blip(t, f, 0.06, 0.0, 0.2)
rise = sweep(45, 90, 1.40) * np.linspace(0.3, 1, int(1.40 * SR)).astype(np.float32)
add(T0, rise, 0.14)
heartbeat(T0, T0 + 1.40, 80, 130, 0.16)
# freeze at 9.4M: hard silence + tinnitus
add(T0 + 1.40, fade(tone(5200, 0.95, (1.0,), decay=30), 0.01, 0.3), 0.025)
# unknown: sparse, glitch once
add(T0 + 2.35, fade(band_noise(1.4, 50, 300, seed=22), 0.2, 0.1), 0.04)
add(T0 + 2.35 + 0.45, band_noise(0.06, 500, 8000, seed=23) * env_ar(int(0.06 * SR), 0.001, 0.02), 0.20, 0.4)
heartbeat(T0 + 2.5, T0 + 3.75, 70, 90, 0.10)
# burst
impact(T0 + 3.75, 0.45, 1.0)
roar = band_noise(1.45, 40, 3000, tilt=-0.6, seed=24) * np.linspace(0.6, 1, int(1.45 * SR)).astype(np.float32)
roar = np.tanh(roar * 2.5).astype(np.float32)
add(T0 + 3.75, fade(roar, 0.01, 0.05), 0.20)
heartbeat(T0 + 3.75, T0 + 5.2, 150, 170, 0.20)

# S16 mono / ne / kkeo (31.91-36.41)
S16 = 31.91
heartbeat(S16 + 0.1, S16 + 2.38, 58, 52, 0.12)
add(S16, fade(band_noise(2.4, 60, 300, seed=25), 0.15, 0.05), 0.04)
for k, (tb, f) in enumerate(((0.18, 784.0), (1.18, 1046.5), (2.38, 587.3))):
    blip(S16 + tb, f, 0.08, 0.4, 0.5)
# after "꺼." -> silence (2s), only a faint breath of room
add(S16 + 2.6, fade(band_noise(1.8, 100, 800, seed=26), 0.5, 0.8), 0.006)

# Revolution montage (36.81-40.31)
impact(36.81, 0.55, 1.2)
fire = band_noise(0.8, 200, 8000, tilt=-0.3, seed=27) * (rng.random(int(0.8 * SR)) > 0.985).astype(np.float32) * 3 + band_noise(0.8, 60, 1500, seed=28)
add(36.81, fade(fire.astype(np.float32), 0.005, 0.02), 0.20)
# R2 interface torn: electric snap + crowd cry
snap = band_noise(0.12, 2000, 12000, seed=29) * env_ar(int(0.12 * SR), 0.001, 0.03) + sweep(3000, 200, 0.12) * env_ar(int(0.12 * SR), 0.001, 0.04)
add(37.61, snap, 0.35)
cry = band_noise(0.8, 500, 2500, seed=30) * amp_lfo(int(0.8 * SR), 7, 0.4)
add(37.61, fade(reverb(cry, 1.0, 0.4), 0.02, 0.1), 0.12, -0.2)
add(37.61, tone(46, 0.8, (1.0, 0.3), decay=0.4), 0.18)
# R3 riot line: stomps + beacon two-tone
for k in range(4):
    add(38.41 + k * 0.22, tone(55, 0.3, (1.0, 0.6), decay=0.08, attack=0.002), 0.25)
    add(38.41 + k * 0.22, band_noise(0.08, 100, 2000, seed=40 + k) * env_ar(int(0.08 * SR), 0.001, 0.03), 0.12)
for k in range(6):
    add(38.41 + k * 0.156, tone(740 if k % 2 == 0 else 587, 0.15, (1.0, 0.3), decay=0.2), 0.035, 0.5)
add(38.41, fade(band_noise(0.9, 80, 1500, seed=31), 0.01, 0.05), 0.10)
# R4 watching: wind + distant fire, low swell, then cut
add(39.31, fade(band_noise(1.0, 150, 2500, tilt=-0.8, seed=32), 0.05, 0.03), 0.10, 0.3)
add(39.31, fade(tone(36.7, 1.0, (1.0, 0.5, 0.25), decay=5), 0.15, 0.03), 0.20)

# S17 quiet city (40.61-42.61): lights power down, then nothing
for k, f in enumerate((220, 196, 164.8)):
    pd = sweep(f, f * 0.55, 0.7) * env_ar(int(0.7 * SR), 0.01, 0.35)
    add(40.61 + 0.2 + k * 0.32, pd, 0.04, 0.6 - 0.6 * k)
add(40.61, fade(band_noise(2.0, 100, 1200, tilt=-1, seed=33), 0.35, 0.6), 0.03)

# S18 question (43.41-49.41): low pad
def pad(t0, dur, freqs, gain):
    if NO_MUSIC:
        return
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = np.zeros(n)
    for i, f in enumerate(freqs):
        for d in (-0.003, 0.003):
            y += np.sin(2 * np.pi * f * (1 + d) * t + i)
    y = y / np.abs(y).max()
    add(t0, fade(reverb(y.astype(np.float32), 3.0, 0.5)[:n], 1.5, 1.5), gain)


pad(43.41, 6.0, (110.0, 164.8, 220.0, 261.6), 0.06)  # A minor-ish, sparse
if not NO_MUSIC:
    blip(43.41 + 0.5, 440.0, 0.025, -0.2, 2.0)
    blip(43.41 + 2.4, 392.0, 0.025, 0.2, 2.0)

# S19 title (50.01-55.01): one resonant low note at the light sweep, pad under
if not NO_MUSIC:
  note = tone(55.0, 4.5, (1.0, 0.5, 0.35, 0.2, 0.12), decay=2.2, attack=0.01)
  add(50.01 + 1.0, reverb(note, 3.5, 0.45)[: int(4.0 * SR)], 0.22)
  note2 = tone(220.0, 4.0, (1.0, 0.3, 0.1), decay=1.6, attack=0.01)
  add(50.01 + 1.0, reverb(note2, 3.5, 0.5)[: int(4.0 * SR)], 0.07)
pad(50.01, 5.0, (55.0, 82.4, 110.0), 0.05)

# ------------------------------------------------------------------ master
mix = np.stack([L, R], 1)
end_fade = np.ones(N, np.float32)
k = idx(1.0)
end_fade[-k:] = np.linspace(1, 0, k) ** 1.5
mix *= end_fade[:, None]
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
mix /= np.abs(mix).max() / 0.89
pcm = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", sys.argv[1], pcm.shape[0] / SR, "s")
