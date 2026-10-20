# 《꿈을 잃은 세계》 티저 V8 — BGM 프롬프트

- 대상: Suno / Udio / Stable Audio 등 음악 생성 도구. **보컬 없음(Instrumental)**.
- 길이: **55초**. 영상 컷에 맞춘 구간 표시 포함.
- 효과음(파도·지하철·UI·심장·폭발·혁명)은 이미 영상에 들어 있으므로 BGM은 **효과음과 부딪히지 않게 비워 둘 구간**이 중요하다.

## 1. 붙여 넣을 프롬프트 (영문, 짧은 버전)

```
Instrumental cinematic trailer score, 55 seconds, no vocals. Dark ambient sci-fi, melancholic and restrained.
Starts with soft felt piano and airy pads (dreamlike sea), turns into cold minimal pulses and low strings (a society that pays with dreams),
a rising tension build with ticking synth arpeggio and heartbeat sub-bass, then a sudden full stop of silence,
a short massive orchestral-hybrid hit with taiko and distorted brass (revolution), cut to silence again,
ending with a lonely solo piano motif over a low drone and one final deep resonant note. Key A minor, 70 bpm, slow and spacious.
```

## 2. 구간별 상세 프롬프트 (V8 컷 시각 기준)

```
[0:00-0:13] Intro – dreamlike sea, then a small room, then a crowded train. Soft felt piano, 3-4 sparse notes, warm wide pad. Quiet. A minor, 70 bpm.
[0:13-0:17] Hesitation – a cheap payment he cannot afford. Piano holds one unresolved note, very sparse.
[0:17-0:22] Lift – entering the upper class. Low brass swell + shimmering high strings, one bar of grandeur, a deep hit at 0:19.3.
[0:22-0:26] Boardroom – cold. Only a low cello drone and a faint synth pulse.
[0:26.5-0:28] Build – rapid ticking arpeggio climbing, heartbeat sub kick accelerating.
[0:28-0:29] STOP – complete silence.
[0:29-0:30] One suspended high note, almost inaudible.
[0:30-0:32] Hit – one distorted low impact and roar, then cut.
[0:32-0:34] Near silence – only a very low drone. Hard cut to silence at 0:34.3.
[0:34-0:37] Silence.
[0:37-0:40] Revolution – 3.5 seconds full orchestral-hybrid: taiko hits exactly at 0:36.8, 0:37.6, 0:38.4, 0:39.3; distorted brass stab, wordless choir "ah", fast string tremolo.
[0:40-0:43] Hard cut to silence at 0:40.3; a barely audible low wind until 0:42.6, then silence.
[0:43-0:49] Question – solo piano motif (the intro motif, slower), very soft pad, lots of space.
[0:49-0:50] Silence.
[0:50-0:55] Title – one deep resonant low A at 0:51.0 with long reverb tail, fades to silence by 0:55.
```

## 3. 꼭 지킬 것
- 보컬·가사·허밍 금지(혁명 구간 3.5초의 wordless choir만 허용).
- **완전 무음 구간: 0:28–0:29, 0:34.3–0:36.8, 0:40.3–0:40.6, 0:42.6–0:43.4, 0:49.4–0:50.0.** 생성물에 소리가 있으면 편집에서 잘라낸다.
- 드롭·EDM 빌드업·밝은 장조 금지.
- 마지막 음은 저음 A 한 번, 리버브 꼬리로 끝.

## 4. 받은 뒤 편집 방법
생성된 곡을 올려 주면: 위 무음 구간에 맞춰 컷 편집 → 효과음과 섞을 때 BGM을 −6dB 아래로 → 대사 구간(모노/네/꺼)은 BGM 덕킹 → 최종 −16 LUFS로 마스터링해 V8에 붙인다.
