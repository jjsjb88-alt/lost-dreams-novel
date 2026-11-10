import hashlib
import json
import math
import pathlib
import subprocess
import wave
import numpy as np

FFMPEG = r"C:\Users\jbseo\AppData\Roaming\vrew\ffmpeg_gpl_vgx_v3\ffmpeg.exe"
OUT_DIR = pathlib.Path(r"C:\Users\jbseo\Desktop\lost-dreams-novel\vn\assets\ep2")
TMP_DIR = pathlib.Path(r"C:\Users\jbseo\.gemini\antigravity-cli\brain\e2d8e107-51da-4d48-ac0c-d7e6ea1487ac\scratch\ep2_wav")
OUT_DIR.mkdir(parents=True, exist_ok=True)
TMP_DIR.mkdir(parents=True, exist_ok=True)

SR = 44100


def write_stereo_wav(path: pathlib.Path, left: np.ndarray, right: np.ndarray):
    stereo = np.stack([left, right], axis=-1)
    peak = np.max(np.abs(stereo))
    if peak > 0.98:
        stereo = stereo * (0.95 / peak)
    pcm = np.clip(stereo * 32767.0, -32768, 32767).astype(np.int16)
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm.tobytes())


def encode_mp3(wav_path: pathlib.Path, mp3_path: pathlib.Path, bitrate="96k"):
    cmd = [
        FFMPEG, "-y", "-hide_banner", "-loglevel", "error",
        "-i", str(wav_path),
        "-codec:a", "libmp3lame", "-b:a", bitrate, "-ar", str(SR), "-ac", "2",
        str(mp3_path),
    ]
    subprocess.run(cmd, check=True)


def loop_crossfade(sig: np.ndarray, fade_sec: float = 0.6) -> np.ndarray:
    n_fade = int(SR * fade_sec)
    if n_fade <= 0 or len(sig) <= 2 * n_fade:
        return sig
    body = sig[:-n_fade].copy()
    tail = sig[-n_fade:]
    alpha = np.linspace(0.0, 1.0, n_fade, endpoint=False)
    body[:n_fade] = body[:n_fade] * alpha + tail * (1.0 - alpha)
    return body


def one_pole_lp(x: np.ndarray, cutoff_hz: float) -> np.ndarray:
    rc = 1.0 / (2.0 * math.pi * cutoff_hz)
    dt = 1.0 / SR
    a = dt / (rc + dt)
    out = np.zeros_like(x)
    prev = 0.0
    for idx in range(len(x)):
        prev = prev + a * (float(x[idx]) - prev)
        out[idx] = prev
    return out


def synth_livingroom_air():
    # 12.6s raw -> 12.0s seamless loop: faint clinical air purifier hum + quiet wall clock tick
    dur = 12.6
    t = np.arange(int(SR * dur)) / SR
    rng = np.random.default_rng(20260201)
    air_l = one_pole_lp(rng.standard_normal(len(t)), 240.0) * 0.045
    air_r = one_pole_lp(rng.standard_normal(len(t)), 240.0) * 0.045
    hum = (
        0.022 * np.sin(2 * math.pi * 110.0 * t)
        + 0.011 * np.sin(2 * math.pi * 165.0 * t + 0.4)
        + 0.007 * np.sin(2 * math.pi * 220.0 * t + 1.1)
    )
    breath = 0.85 + 0.15 * np.sin(2 * math.pi * (1.0 / 6.0) * t)
    ticks_l = np.zeros_like(t)
    ticks_r = np.zeros_like(t)
    for sec in range(12):
        idx0 = int((sec + 0.25) * SR)
        span = int(0.035 * SR)
        if idx0 + span < len(t):
            local_t = np.arange(span) / SR
            freq = 920.0 if sec % 2 == 0 else 780.0
            tick = np.sin(2 * math.pi * freq * local_t) * np.exp(-local_t * 140.0) * 0.028
            ticks_l[idx0:idx0 + span] += tick * 0.85
            ticks_r[idx0:idx0 + span] += tick * 1.05
    left = loop_crossfade((air_l + hum * breath) + ticks_l, 0.6)
    right = loop_crossfade((air_r + hum * breath * 0.96) + ticks_r, 0.6)
    return left, right


def synth_tablet_slide():
    # 0.78s fx: wooden table slide friction + soft glass tap
    dur = 0.78
    t = np.arange(int(SR * dur)) / SR
    rng = np.random.default_rng(20260202)
    noise = one_pole_lp(rng.standard_normal(len(t)), 620.0)
    slide_env = np.exp(-((t - 0.24) / 0.14) ** 2) * (t < 0.52)
    slide = noise * slide_env * 0.22
    tap_t = np.maximum(0.0, t - 0.50)
    tap_mask = (t >= 0.50).astype(float)
    tap = (
        np.sin(2 * math.pi * 540.0 * tap_t) * np.exp(-tap_t * 55.0) * 0.16
        + np.sin(2 * math.pi * 1080.0 * tap_t) * np.exp(-tap_t * 95.0) * 0.08
    ) * tap_mask
    left = slide * 1.05 + tap * 0.92
    right = slide * 0.92 + tap * 1.06
    return left, right


def synth_tablet_off():
    # 0.62s fx: crisp power button click + downward screen-off decay
    dur = 0.62
    t = np.arange(int(SR * dur)) / SR
    click = np.sin(2 * math.pi * 1350.0 * t) * np.exp(-t * 180.0) * 0.24
    thud = np.sin(2 * math.pi * 180.0 * t) * np.exp(-t * 48.0) * 0.20
    sweep_t = np.maximum(0.0, t - 0.04)
    sweep_mask = (t >= 0.04).astype(float)
    phase = 2 * math.pi * (380.0 * sweep_t - 240.0 * (sweep_t ** 2))
    sweep = np.sin(phase) * np.exp(-sweep_t * 14.0) * 0.14 * sweep_mask
    sig = click + thud + sweep
    return sig * 0.98, sig * 1.02


def synth_street_walk():
    # 12.6s raw -> 12.0s seamless loop: quiet afternoon residential breeze + two-person footsteps
    dur = 12.6
    t = np.arange(int(SR * dur)) / SR
    rng = np.random.default_rng(20260204)
    breeze_l = one_pole_lp(rng.standard_normal(len(t)), 380.0) * (0.055 + 0.02 * np.sin(2 * math.pi * 0.16 * t))
    breeze_r = one_pole_lp(rng.standard_normal(len(t)), 380.0) * (0.055 + 0.02 * np.cos(2 * math.pi * 0.16 * t))
    steps_l = np.zeros_like(t)
    steps_r = np.zeros_like(t)
    step_times = np.arange(0.45, 11.8, 0.72)
    for idx, st in enumerate(step_times):
        i0 = int(st * SR)
        span = int(0.09 * SR)
        if i0 + span < len(t):
            lt = np.arange(span) / SR
            step_noise = one_pole_lp(rng.standard_normal(span), 520.0)
            step_body = (step_noise * 0.12 + np.sin(2 * math.pi * 135.0 * lt) * 0.07) * np.exp(-lt * 42.0)
            if idx % 2 == 0:
                steps_l[i0:i0 + span] += step_body * 1.05
                steps_r[i0:i0 + span] += step_body * 0.75
            else:
                steps_l[i0:i0 + span] += step_body * 0.75
                steps_r[i0:i0 + span] += step_body * 1.05
    left = loop_crossfade(breeze_l + steps_l, 0.6)
    right = loop_crossfade(breeze_r + steps_r, 0.6)
    return left, right


def synth_serene_dream():
    # 16.8s raw -> 16.0s loop: overly serene, weightless resort dream chord pad (Fmaj9 -> Cadd9/E -> Dm9 -> Bbmaj9)
    dur = 16.8
    t = np.arange(int(SR * dur)) / SR
    chords = [
        (0.0, 4.2, [174.61, 220.00, 261.63, 329.63, 392.00]),   # Fmaj9
        (4.2, 8.4, [164.81, 261.63, 293.66, 392.00, 523.25]),   # Cadd9/E
        (8.4, 12.6, [146.83, 220.00, 261.63, 329.63, 440.00]),  # Dm9
        (12.6, 16.8, [116.54, 220.00, 261.63, 293.66, 392.00]), # Bbmaj9
    ]
    left = np.zeros_like(t)
    right = np.zeros_like(t)
    for start, end, freqs in chords:
        center = 0.5 * (start + end)
        half = 0.5 * (end - start) + 0.65
        env = np.clip(1.0 - np.abs(t - center) / half, 0.0, 1.0)
        env = 0.5 - 0.5 * np.cos(math.pi * env)
        for f_idx, f in enumerate(freqs):
            detune = 0.35 * (f_idx - 2)
            lfo = 0.0012 * np.sin(2 * math.pi * (0.22 + 0.03 * f_idx) * t + f_idx)
            v_l = np.sin(2 * math.pi * (f * (1.0 + lfo) - detune) * t) + 0.25 * np.sin(2 * math.pi * 2.0 * f * t)
            v_r = np.sin(2 * math.pi * (f * (1.0 - lfo) + detune) * t + 0.3) + 0.25 * np.sin(2 * math.pi * 2.0 * f * t + 0.5)
            weight = 0.048 / (1.0 + 0.22 * f_idx)
            left += v_l * env * weight
            right += v_r * env * weight
    # Add gentle high chime shimmer (too calm, commercial resort perfection)
    bell_times = [1.0, 3.0, 5.2, 7.2, 9.4, 11.4, 13.6, 15.4]
    bell_freqs = [523.25, 659.25, 587.33, 783.99, 659.25, 523.25, 587.33, 659.25]
    for bt, bf in zip(bell_times, bell_freqs):
        i0 = int(bt * SR)
        span = int(1.6 * SR)
        if i0 + span < len(t):
            lt = np.arange(span) / SR
            bell = np.sin(2 * math.pi * bf * lt) * np.exp(-lt * 3.2) * (1.0 - np.exp(-lt * 45.0)) * 0.032
            left[i0:i0 + span] += bell * 0.95
            right[i0:i0 + span] += bell * 1.05
    return loop_crossfade(left, 0.8), loop_crossfade(right, 0.8)


def synth_ad_cutoff():
    # 0.92s fx: termination button confirmation click -> abrupt dream carrier drop -> waking thud
    dur = 0.92
    t = np.arange(int(SR * dur)) / SR
    click = np.sin(2 * math.pi * 1680.0 * t) * np.exp(-t * 160.0) * 0.22
    drop_t = np.maximum(0.0, t - 0.05)
    drop_mask = ((t >= 0.05) & (t <= 0.42)).astype(float)
    inst_freq = 760.0 * np.exp(-drop_t * 5.2) + 85.0
    phase = np.cumsum(2 * math.pi * inst_freq / SR)
    drop = np.sin(phase) * np.exp(-drop_t * 6.5) * 0.26 * drop_mask
    wake_t = np.maximum(0.0, t - 0.36)
    wake_mask = (t >= 0.36).astype(float)
    heartbeat = (
        np.sin(2 * math.pi * 68.0 * wake_t) * np.exp(-wake_t * 9.5) * 0.34
        + np.sin(2 * math.pi * 136.0 * wake_t) * np.exp(-wake_t * 16.0) * 0.14
    ) * wake_mask
    left = click + drop * 1.04 + heartbeat
    right = click + drop * 0.96 + heartbeat
    return left, right


SPECS = [
    ("livingroom-air.mp3", "ambience", "지우의 집 거실 — 희미한 약 냄새와 정적의 실내 공기·시계 초침 루프", synth_livingroom_air),
    ("tablet-slide.mp3", "fx", "식탁 위 태블릿을 서인 쪽으로 미는 마찰음과 탭 소리", synth_tablet_slide),
    ("tablet-off.mp3", "fx", "아버지가 가계 시뮬레이션 화면을 끄는 전원 차단음", synth_tablet_off),
    ("street-walk.mp3", "ambience", "지우의 집을 나선 뒤 말없이 걷는 오후 골목 바람과 발걸음 루프", synth_street_walk),
    ("serene-dream.mp3", "music", "소중한 사람과 떠나는 휴양지 — 지나치게 평온하고 매끈한 광고꿈 패드 루프", synth_serene_dream),
    ("ad-cutoff.mp3", "fx", "광고 중도 종료 버튼 클릭 및 수면 링크 강제 차단·각성 충격음", synth_ad_cutoff),
]

provenance = {
    "episode": 2,
    "title": "AI가 모르는 것",
    "generatedAt": "2026-10-19",
    "generator": "Python 3 + NumPy 2.4.6 procedural synthesis + FFmpeg libmp3lame (44.1kHz stereo)",
    "verificationNote": "Synthesized deterministically via mathematical waveforms and filtered noise; container/decode/duration/hash verified programmatically (not human-listened).",
    "assets": [],
}

for filename, category, purpose, fn in SPECS:
    wav_path = TMP_DIR / filename.replace(".mp3", ".wav")
    mp3_path = OUT_DIR / filename
    left, right = fn()
    write_stereo_wav(wav_path, left, right)
    encode_mp3(wav_path, mp3_path)
    data = mp3_path.read_bytes()
    sha256 = hashlib.sha256(data).hexdigest()
    duration_sec = round(len(left) / SR, 2)
    provenance["assets"].append({
        "file": f"assets/ep2/{filename}",
        "category": category,
        "purpose": purpose,
        "sampleRateHz": SR,
        "channels": 2,
        "durationSec": duration_sec,
        "bytes": len(data),
        "sha256": sha256,
    })
    print(f"{filename}: {len(data)} bytes, {duration_sec}s, sha256={sha256[:12]}")

prov_path = OUT_DIR / "audio-provenance.json"
prov_path.write_text(json.dumps(provenance, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Wrote", prov_path)
