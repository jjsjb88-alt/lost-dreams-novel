# 티저 영상

「꿈을 잃은 세계」 티저 V14의 최종 영상과, 그 영상을 다시 만드는 렌더 코드입니다. 원화에서 자막을 걷어 낸 clean plate 위에 2.5D 애니메이션(변위·광원·HUD 감광)과 자막을 합성하고, BGM 「A Pendulum at Rest」를 컷 편집점에 맞춰 붙입니다.

| 경로 | 내용 |
| --- | --- |
| `output/lost-dreams-teaser-v14.mp4` | 최종본. 1280×720 / 24fps / H.264 + AAC 스테레오 256k / 54.8s / −14 LUFS |
| `bgm-prompt.md` | 외부 음악 생성 도구용 BGM 프롬프트(V8 컷 시각 기준이라 V11과는 시각이 다름. 참고용) |
| `video-production-plan.md` | V4 shot 분석, 원본 고정형 컷별 연출, clean plate 목록 |
| `v6-revision-brief.md` | V5 장면별 판정과 V6 수정 지시서(통과 조건 포함) |
| 버전 | V6: 과부하 병합·HUD 감광·엔딩 연장. V7: 6.8 TOKEN 복구(잔액 칩), 분석 테이크 「빠른 상승→9.4M 정지→미확인→폭발」, 엔딩 호흡. V8: 「꺼.」 뒤 혁명 4컷(자막 없음) 삽입, 합성 사운드. V9~V11: 합성 효과음 제거하고 BGM 중심으로 믹스, 「꺼.」 → 도시 정전 → 암전 0.6s+저음 → 혁명 몽타주 3.0s(서인→광고→인터페이스→군중 vs 진압대) → 정적 0.4s → 질문 → 타이틀. V12: 오프닝을 「꿈의 바다(DREAM SESSION) → 깨짐 → 기상(꿈 기록 완료) → TV가 같은 바다 재생 → 「나 바다 좋아해?」」로 교체(0–9.79s, 이후는 V11과 동일). V13: 「꺼.」(34.29s)부터 도시 정전·암전까지 완전 무음, 혁명 첫 컷(39.41s)에서 음악 시작(영상은 V12와 동일). V14: 혁명 뒤 0.4초 음악 공백을 없애 혁명→질문→타이틀까지 곡이 끊기지 않음 |
| `plates/` | `p01`~`p19.jpg`는 V4 원화 still(`p05`~`p07`은 자막 없는 image-gen 원본). `*-clean.png`, `p16-unlit.png`는 `tools/prep.py`가 만든 clean plate. `r1`~`r4.png`는 `revolution-collage.png`의 네 패널을 자막 띠 없이 16:9로 자른 혁명 컷. `o1`~`o4.png`는 `opening-collage.png`에서 자른 오프닝 컷이고, `o2-fixed.png`(기상 HUD 수치 수정)·`o4-one/none.png`(말풍선 순차 등장용)는 `tools/prep-open.py`가 만든다 |
| `tools/` | 렌더 코드 |

## 다시 렌더하기

Python 3, numpy, Pillow, ffmpeg가 필요합니다. GPU나 영상 생성 모델은 쓰지 않습니다.

```bash
cd teaser
sh tools/fetch-fonts.sh                     # Noto Sans KR / Noto Serif KR 내려받기 (fonts/는 커밋하지 않음)
python3 tools/prep.py                       # clean plate 다시 만들기 (이미 plates/에 있으면 생략 가능)
python3 tools/render.py output/out.mp4      # 영상 렌더 (4코어 약 8분)
# 사운드: 곡 파일(저장소에 없음)을 48k 스테레오 wav로 바꾼 뒤 편집·믹스
ffmpeg -i a_pendulum_at_rest.mp3 -ar 48000 -ac 2 /tmp/bgm.wav
NO_MUSIC=1 python3 tools/sound.py /tmp/sfx.wav           # 효과음 스템(V11은 SFX_GAIN=0이라 실제로는 섞이지 않음)
SFX_GAIN=0 python3 tools/mix.py /tmp/bgm.wav /tmp/sfx.wav /tmp/mix.wav
ffmpeg -i /tmp/mix.wav -af "loudnorm=I=-14:TP=-1.0:LRA=14:linear=true" /tmp/mix-norm.wav   # 이후 -14 LUFS가 되도록 volume 보정
ffmpeg -i output/out.mp4 -i /tmp/mix-norm.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest output/final.mp4
```

- `tools/engine.py`: 2x 소스 샘플링, 변위장, 광원 맵, 자막 박스, 그레인
- `tools/shots.py`: 컷별 연출. 뒤쪽 `V6`·`V7`·`V8` 블록이 각 버전의 수정본(뒤에 정의된 것이 `SHOTS`를 덮어씀)
- `tools/sound.py`: 효과음·환경음·패드를 numpy로 합성(외부 음원 없음). V11 최종본에서는 쓰지 않음
- `tools/prep-open.py`: 기상 HUD의 「사용 TOKEN 6.8 / 잔여 312.4」를 설정(settings/03: 꿈 세션은 TOKEN을 지급)과 6.8 TOKEN 컷의 잔액 7.1에 맞춰 「지급 TOKEN +3.2 / 잔여 TOKEN 7.1」로 바꾸고, 대화 컷의 말풍선을 지운 상태를 만든다
- `tools/mix.py`: 곡을 영상 편집점에 맞춰 자르고(혁명 첫 컷 = 곡 클라이맥스 49.99s) 구간별 음량을 자동화. 「꺼.」부터 혁명 첫 컷까지는 소리를 넣지 않음
- 곡 파일은 사용권 확인 전이라 저장소에 넣지 않았습니다. 최종 영상에는 포함되어 있습니다.
- `tools/render.py`: 타임라인, 전환(딥·하드컷·블랙), 자막·숫자 카운터
- `tools/qa.py`: 프레임 간 튐 검사. `tools/qa6.py V5.mp4 V6.mp4`: V6 통과 조건 측정
- `tools/match.py`, `tools/boxdet2.py`: V4 분석과 자막 박스 위치 측정에 쓴 보조 스크립트
