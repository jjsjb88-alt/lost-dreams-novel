# 《꿈을 잃은 세계》 티저 V5 — 영상화 제작 계획

- 기준: `lost_dreams_teaser_v4.mp4` (1280×720, 24fps, H.264, 47.17s, **오디오 트랙 없음**)
- 계약: `CLAUDE_VIDEO_BRIEF.md` 절대 규칙
- 출력 목표: 1280×720 / 24fps / H.264 MP4, 예상 길이 약 48.2s (모노/네/꺼 연장분 +1.0s)
- 분석 방법: V4 전 프레임(1,132장)을 64×36 그레이로 줄여 `stills/` 22장과 매칭(자막 띠 제외). 시간은 프레임 단위(1/24s)로 측정.

## 0. V4 분석에서 나온 사실

1. **편집 문법**: 거의 모든 컷 사이에 약 0.25s의 **검정 딥**(페이드아웃 3f → 블랙 1f → 페이드인 2f)이 있다. 예외는 S05→S06→S07 구간(하드컷 연속)과 S07→S08(1f 디졸브). 이 하드컷 구간이 "사회 구조 → 상층 진입" 가속 장치이므로 V5에서도 유지한다.
2. **V4 자체가 계약 위반**: 모노/네/꺼(S16)가 **3.54s**로 4초 미만. V5에서 4.5s로 연장한다.
3. **숫자 구간 반복**: 1.2M~9.4M과 "추론 출처 미확인", "과부하"(S10~S15)는 모두 **같은 원화 1장**(f11/f12/f14/f15)에 자막만 바꾼 것. 프레임 f12↔f15가 0.25s 주기로 교대해 자막이 깜빡인다. → "복붙 금지" 규칙에 따라 V5에서는 같은 원화를 쓰더라도 컷마다 **카메라 거리·레이어 강도·연출 축**을 다르게 설계(§3).
4. **원화 중복**: f02/f03(방/TV)은 같은 원화, f08/f09/f10(회의실)은 같은 원화. f13은 과부하 원화의 페이드 중간 프레임, f18은 질문 카드.
5. **브리프와 원본의 차이**: 브리프 6.8 TOKEN 컷에 "아이/보호자 호흡"이 있으나, 원화(image-gen-1)의 UI는 「어머니의 추가 상담」이고 배경 침대의 인물은 **어머니 한 명**이다(설정 `settings/04` 어머니와 일치). 아이는 원본에 없으므로 **추가하지 않는다**. 배경 어머니의 호흡만 사용.

## 1. Shot 표 (V4 실측 → V5 계획)

| # | 내용 | V4 시간 | 길이 | source still | V5 시간(안) | V5 길이 |
|---|---|---|---|---|---|---|
| S01 | 바다 | 0.13–3.08 | 2.96 | f01 | 0.00–3.08 | 3.08 |
| S02 | 방/TV | 3.33–6.38 | 3.04 | f02 | 3.33–6.38 | 3.04 |
| S03 | "나 바다 좋아해?" | 6.63–9.79 | 3.17 | f03(=f02 원화) | 6.63–9.79 | 3.17 |
| S04 | 지하철 TOKEN | 10.04–13.29 | 3.25 | f04 | 10.04–13.29 | 3.25 |
| S05 | 6.8 TOKEN 망설임 | 13.50–16.00 | 2.50 | **image-gen-1** | 13.50–16.00 | 2.50 |
| S06 | 상층 출입 승인 | 16.00–18.50 | 2.50 | **image-gen-2** | 16.00–18.50 | 2.50 |
| S07 | 상층 입장 | 18.50–21.00 | 2.50 | **image-gen-3** | 18.50–21.04 | 2.54 |
| S08 | "누가 계산했습니까?" | 21.04–23.21 | 2.17 | f08 | 21.04–23.21 | 2.17 |
| S09 | "제가요." | 23.46–25.42 | 1.96 | f09/f10(=f08 원화) | 23.46–25.42 | 1.96 |
| S10 | 1.2M | 25.67–26.42 | 0.75 | f15 (자막 없는 과부하 원화) | 25.67–26.42 | 0.75 |
| S11 | 3.8M | 26.67–27.42 | 0.75 | f15 | 26.67–27.38 | 0.71 |
| S12 | 6.4M | 27.67–28.42 | 0.75 | f15 | 27.58–28.25 | 0.67 |
| S13 | 9.4M | 28.67–29.83 | 1.17 | f15 | 28.42–29.83 | 1.42 |
| S14 | 추론 출처: 미확인 | 30.08–31.83 | 1.75 | f15 + 후반 UI | 30.08–31.83 | 1.75 |
| S15 | 신경 과부하 | 32.08–33.83 | 1.75 | f15 | 32.08–33.83 | 1.75 |
| S16 | 모노 / 네 / 꺼 | 34.08–37.63 | **3.54 ✗** | f16 | 34.08–38.58 | **4.50** |
| S17 | 정적 도시 | 37.88–39.83 | 1.96 | f17 | 38.58–40.79 | 2.21 |
| S18 | 질문 | 39.96–43.42 | 3.46 | f18 | 40.92–44.42 | 3.50 |
| S19 | 타이틀 | 43.50–47.04 | 3.54 | f19 | 44.50–48.17 | 3.67 |

- 컷 사이 검정 딥 0.25s는 V4 그대로(V5 시간은 딥 포함 위치).
- S10→S13 사이 딥을 0.25→0.21→0.17s로 짧게 줄여 **편집 간격 자체가 압박을 만든다**. S13만 1.42s로 버텨 "임계"를 만든다.
- **S16→S17은 딥 없이 하드컷**("꺼" 직후 갑작스러운 정적). S16 끝 0.8s는 대사 후 정적.

## 2. 컷별 프롬프트 — 원본 이미지 고정형

원칙(모든 컷 공통):
- **원본 프레임이 곧 결과 프레임.** 구도·인물 위치·포즈·표정·조명·색은 바꾸지 않는다. 마지막 프레임도 원본과 거의 같아야 한다.
- 움직이는 것은 **원본에 이미 보이는 요소**뿐. 새 사건(걷기, 일어서기, 고개 돌리기, 표정 변화, 군중 정지, 조명 소등)을 영상 모델에 시키지 않는다.
- 카메라는 최대 **104%** 스케일 변화 또는 2% 이내 평행 이동. 재프레이밍·크롭 연출 금지.
- 압박 상승·소등·스캔 같은 **연출 변화는 후반 합성 레이어**(빛·HUD·밝기)로만 만든다.
- 모든 컷 공통 negative: `new characters, extra people, face change, expression change, morphing, extra fingers, warped architecture, camera shake, zoom beyond frame, text, letters, numbers, subtitles, logo distortion, style change, color shift`

표기: **고정** = 바꾸면 실패, **움직임** = 영상 모델 프롬프트, **후반** = 합성으로 처리.

### S01 바다 — f01 clean plate
- 고정: 오른쪽 어깨 너머로 바다를 보는 서인 뒷모습(흰 반팔 셔츠, 곱슬 검은 머리), 왼쪽 야자수·하단 흰 꽃 덤불, 오른쪽 언덕 위 하얀 성채 도시, 돛단배 3척, 바위 해안.
- 움직임(EN): `Static shot, very slow push-in. Gentle waves rolling onto the rocks, sparkling sunlight on the water, palm leaves and white flowers swaying slightly in the breeze, clouds drifting very slowly. The boy stays still, only a few strands of hair move in the wind.`
- 카메라: 100→103%.
- 후반: 자막.

### S02 방/TV — f02 clean plate
- 고정: 침대에 엎드린 듯 상체를 든 서인 옆모습(오른쪽 TV를 봄), 체크무늬 이불, 왼쪽 창밖 야경 빌딩, 책상 램프·옷걸이·벽 포스터, 오른쪽 대형 TV 속 바다.
- 움직임(EN): `Locked-off camera. Only the ocean waves on the TV screen move. Soft blue light from the TV flickers subtly on the boy's face and shirt. The boy breathes slowly, shoulders rising once. Everything else in the room is still.`
- 카메라: 고정.
- 후반: 자막.

### S03 "나 바다 좋아해?" — f02 clean plate (같은 원화)
- 고정: S02와 동일.
- 움직임(EN): `Locked-off camera. TV waves continue. The boy blinks once, very subtle. No head turn, no mouth movement.`
- 카메라: 100→102% 아주 느린 push(S02 고정과 구분하는 유일한 차이).
- 후반: 서인/모노 대사 자막 순차 표시.

### S04 지하철 TOKEN — f04 clean plate
- 고정: 백팩 멘 서인이 위쪽 광고 패널을 올려다보는 옆얼굴, 주변 승객들(대부분 눈 감고 졸거나 고개 숙임, 이어폰 낀 여성, 안경 쓴 남성), 손잡이·은색 기둥, 천장에 매달린 보라·청색 광고 패널들, 오른쪽 창의 NEUROLINK 패널.
- 움직임(EN): `Inside a moving subway car at night. Very subtle train vibration, hanging straps swaying slightly, the glowing ad panels shimmer softly. Passengers keep their eyes closed and stay in place, only slight breathing. The boy keeps looking up, still.`
- 카메라: 2% 수평 이동(열차 진행감).
- 후반: 자막. 광고 패널 문자(「당신의 꿈이, 오늘의 TOKEN이 됩니다」 「+3.2 TOKEN」 「+2.4 TOKEN」 「+1.8 TOKEN」 등)와 NEUROLINK 패널은 원본 픽셀을 그대로 위에 고정 합성.

### S05 6.8 TOKEN — image-gen-1
- 고정: 턱을 괸 왼손, 오른손 검지가 「결제」 버튼 앞, 안경 쓴 옆얼굴, 오른쪽 홀로그램 결제 패널(「어머니의 추가 상담」), 뒤쪽 침대에 누운 어머니, 따뜻한 방 조명과 왼쪽 창밖 야경.
- 움직임(EN): `Locked-off camera. The index finger hovers just before the button and pauses, moving back very slightly. The hologram panel glows softly. In the background, the woman lying in bed breathes slowly. No other movement.`
- 카메라: 고정 또는 100→102%.
- 후반: 결제 패널 전체를 원본 픽셀 레이어로 위에 고정(모델이 그린 패널은 덮음).
- 금지: 버튼 누름, 아이 추가, 어머니 얼굴 생성·자세 변화.

### S06 상층 출입 승인 — image-gen-2
- 고정: 백팩 멘 서인 클로즈업(놀란 듯 살짝 벌린 입, 파란 눈), 두 손으로 든 투명 카드, 「상층 출입 승인」 패널, 뒤쪽 금빛 NEUROLINK 건물 입구와 정장 인파.
- 움직임(EN): `Slow dolly-in. The boy blinks once, keeping the same surprised expression. Golden lights of the building entrance twinkle softly, people in the background move very slightly.`
- 카메라: 100→104%.
- 후반: 패널 원본 픽셀 고정 + 청백색 스캔 라인이 위→아래로 1회 통과(합성).

### S07 상층 입장 — image-gen-3
- 고정: 백팩 멘 서인 뒷모습(화면 왼쪽 하단, 정지 자세), NEUROLINK UPPER CLASS 금빛 정문, 양옆 배너, 오른쪽 흰 장갑 경비원과 게이트 스크린, 입구로 향하는 정장 인파.
- 움직임(EN): `Very slow forward dolly. Warm lights of the grand entrance glow and shimmer, reflections on the wet floor ripple softly, crowd in the distance moves slowly toward the entrance. The boy and the guard stay still.`
- 카메라: 100→104% + 아주 약한 깊이 parallax.
- 후반: 간판·배너·게이트 스크린 문자 원본 픽셀 고정.
- 금지: 서인 걷기, 경비원 동작.

### S08 "누가 계산했습니까?" — f08 clean plate
- 고정: 왼쪽 앞 검은 정장 서인 뒷모습, 테이블 중앙 은발 남성(턱에 손), 오른쪽 여성·안경 남성 등 착석 인원 그대로, 뒤쪽 뇌 홀로그램 대형 스크린, 창밖 야경 타워.
- 움직임(EN): `Locked-off, silent boardroom. The holographic brain on the screen pulses softly, city lights outside twinkle. Seated people remain still with only slight breathing.`
- 카메라: 100→102% 아주 느린 push.
- 후반: 자막, 스크린 수치(+217% / 94.8% / 91.2%) 원본 픽셀 고정.

### S09 "제가요." — f08 clean plate (같은 원화)
- 고정: S08과 동일.
- 움직임(EN): `Locked-off. Same boardroom, brain hologram pulse continues. Seated people stay still. No head turns.`
- 카메라: 고정(S08 push와 구분).
- 후반: 자막. 긴장 상승은 스크린 밝기 미세 하강으로 합성.

### S10–S15 1.2M → 9.4M / 미확인 / 과부하 — f15
- 고정: 머리를 움켜쥔 서인(흰 셔츠, 풀린 넥타이, 입가 피, 땀), 왼쪽 「뇌 활동 과부하」 HUD, 오른쪽 위 뇌 홀로그램, 오른쪽 「경고」 박스, 뒤쪽 정장 인물 3~4명, 아래 유리 테이블.
- 움직임(EN, 1회 생성 후 컷별로 다른 구간 사용): `Locked-off camera. The boy breathes heavily, shoulders rising and falling, fingers tightening slightly in his hair. The brain hologram pulses red. Background people stay still.`
- 카메라·연출: 크롭 금지. 단계 차이는 **후반 레이어**로만 만든다.

| 컷 | 카메라 | 후반 레이어(단계 증가) |
|---|---|---|
| S10 1.2M | 100% 고정 | 적색 경고광 약, HUD 원본 |
| S11 3.8M | 100→101% | 적색광 펄스 1회/초, 화면 가장자리 비네트 시작 |
| S12 6.4M | 101→102% | 펄스 2회/초, 비네트 강화, 뇌 홀로그램 밝기 상승 |
| S13 9.4M | 102→103% | 펄스 최대 + 숫자 카운터 9,400,000 정지, 1px 미세 흔들림 |
| S14 미확인 | 103→101% 되돌림 | 펄스 정지, 자막만 고정 표시 |
| S15 과부하 | 100%, 흔들림 0→2px | 적·청 반사 교차, 초점 흐림 미세 왕복 |

- 후반: 하단 자막, 숫자 카운터.
- 금지: 피 증가, 표정 변화, 뒤쪽 인물 움직임.

### S16 모노 / 네 / 꺼 — f16 clean plate, 풀프레임 4.5s
- 고정: 머리를 쥔 서인(더 가까운 각도, 입가 피), 왼쪽 「신경 부하 312%」·「TOKEN SYNTHESIS 9,400,000」 HUD, 오른쪽 대화 박스 3개(서인 「모노.」 / MONO 「네.」 / 서인 「꺼.」), 뒤쪽 금빛 문장과 인물들.
- 움직임(EN): `Locked-off camera, full frame. The boy breathes slowly and weakly, shoulders dropping slightly. His eyes stay half-open. Nothing else moves.`
- 카메라: 완전 고정, 크롭·줌 금지.
- 후반: 대화 박스 3개 순차 점등(0.0 / 1.0 / 2.2s), HUD 숫자 「꺼.」 이후 정지, 2.2~4.5s 정적.

### S17 정적 도시 — f17
- 고정: 왼쪽 대형 전광판(눈 감은 여성 얼굴, 지구 이미지), 고층 빌딩 숲, 노을 하늘, 하단 걷는 군중 실루엣.
- 움직임(EN): `Locked-off camera. Clouds drift very slowly, faint mist moves between buildings. The crowd walks slowly. Billboards stay as they are.`
- 카메라: 고정.
- 후반: 전광판·창 불빛을 오른쪽→왼쪽 순으로 밝기만 낮춤(합성). 군중 정지·소등을 모델에 시키지 않음.

### S18 질문 — 배경 새로 제작(어두운 성운 + 파편 입자)
- 영상 모델 사용 안 함. 입자 극저속 드리프트를 합성으로 제작, 문장 2행 순차 표시.

### S19 타이틀 — f19 clean plate
- 고정: 화면 중앙 하단 롱코트 실루엣 인물(정지), 젖은 바닥 반사, 왼쪽 전광판, 노을 도시 스카이라인.
- 움직임(EN): `Locked-off camera with very slow horizontal drift. Clouds move slowly, reflections on the wet ground shimmer, faint mist. The standing figure does not move.`
- 카메라: 0.5% 수평 drift.
- 후반: 「꿈을 잃은 세계 / LOST DREAMS」 로고, 마지막 0.5s 페이드 아웃.

## 3. 반복 금지 검증표

같은 원화를 쓰는 컷(S02/S03, S08/S09, S10–S15)은 카메라 차이를 2% 이내로 묶었으므로 **차이는 후반 레이어**에서 낸다.

| 컷 | 카메라 | 컷을 구분하는 요소 |
|---|---|---|
| S01 | push 103% | 파도·바람 |
| S02 | 고정 | TV 반사광 + 호흡 |
| S03 | push 102% | 눈 깜빡임 + 대사 순차 |
| S04 | 수평 2% | 열차 진동·손잡이 흔들림 |
| S05 | 고정 | 손가락 멈춤, 어머니 호흡 |
| S06 | dolly 104% | 스캔 라인(합성) |
| S07 | forward 104% + parallax | 바닥 반사·인파 흐름 |
| S08 | push 102% | 뇌 홀로그램 펄스 |
| S09 | 고정 | 스크린 밝기 하강(합성) |
| S10–S15 | 100~103% | 적색 펄스·비네트·카운터 단계(합성) |
| S16 | 완전 고정 | 대화 박스 순차 점등 |
| S17 | 고정 | 순차 감광(합성) |
| S18 | 고정 | 입자 |
| S19 | drift 0.5% | 구름·반사 |

## 4. Clean plate 목록

### A. 기존 자료로 해결 가능
| 컷 | 자료 | 비고 |
|---|---|---|
| S05 | image-gen-1 | 자막 없음. UI 패널은 원본 레이어 분리로 해결 |
| S06 | image-gen-2 | 자막 없음 |
| S07 | image-gen-3 | 자막 없음 |
| S17 | f17 | 자막·문자 없음 |
| S18 | f18 배경 | 텍스트는 후반 합성. 배경은 입자·성운으로 새로 만들어도 됨 |
| S15 | f15 | 하단 자막 없음. 단, 원화에 HUD 한글/수치가 박혀 있음(아래 B-2 참고) |

### B-1. 새 clean plate 반드시 필요 (하단 자막 띠가 원화에 박혀 있음)
| 컷 | 필요한 것 | 이유 |
|---|---|---|
| S01 | f01 자막 없는 원화 | 자막 띠 아래 바위·꽃이 가려짐. 인페인팅으로 메우면 영상 모델이 띠 흔적을 움직임 |
| S02/S03 | f02 자막 없는 원화(1장으로 두 컷) | 동일 |
| S04 | f04 자막 없는 원화, 가능하면 광고판 문자 없는 버전 | 자막 + 한글 광고판·「3.2 TOKEN」이 원화에 박힘 |
| S08/S09 | f08 자막 없는 원화(1장으로 두 컷), 가능하면 스크린 수치 없는 버전 | 자막 + 「+217%」 등 스크린 수치 |
| S16 | f16의 대화 박스·HUD 수치 없는 원화 | 「모노./네./꺼.」 박스, 「312%」 「9,400,000」이 원화에 박힘. 순차 점등 연출이 불가 |
| S19 | f19 타이틀 없는 도시 원화 | 「꿈을 잃은 세계」 로고가 원화에 박힘 |

### B-2. 있으면 품질이 크게 올라가는 것(권장)
| 컷 | 필요한 것 | 없을 때 대안 |
|---|---|---|
| S10–S15 | f15의 HUD 없는(또는 HUD 텍스트 없는) 원화 | 원본 HUD를 고정 픽셀로 두고 그 위에 추가 레이어만 얹어 단계 증가. 원본 HUD 자체는 강도 조절 불가 |

**질문**: 위 B-1 원화(자막 넣기 전 원본 이미지 생성본)를 갖고 계신가요? 이미지 생성 원본이 있으면 그대로 올려 주시면 되고, 없으면 같은 프롬프트·seed로 재생성 필요합니다.

## 5. 제작 방식과 이 환경의 한계

- 현재 Claude 실행 환경: **GPU 없음, 이미지→영상 생성 모델 없음**. ffmpeg·Python(numpy, PIL)만 있음. 한글 폰트는 WenQuanYi만 있음(명조체 필요 시 Noto Serif KR 등 무료 폰트 파일 제공 또는 내려받기 필요).
- 따라서 브리프의 "인물 호흡·눈동자·손가락 멈춤·시선 이동"은 **이 환경에서 생성 불가**. 얼굴을 픽셀 워프로 흉내내면 브리프 실패 조건(morphing·얼굴 변형)에 걸림.

권장 분업:
1. **외부 image-to-video 모델(Kling / Runway / Veo 등)**: clean plate + 이 문서의 컷별 Act/Env를 프롬프트로 써서 인물 미세 동작 컷 생성. 컷별 프롬프트는 이 계획 승인 후 제가 작성.
2. **이 환경(Claude)**: 생성된 컷의 품질 게이트 판정(프레임 추출·flicker 측정·얼굴 영역 차이), 모든 텍스트/UI/숫자 카운터 후반 합성, 스캔 라인·소등·HUD 단계 증가 같은 그래픽 레이어, 딥/하드컷 편집, 최종 1280×720/24fps/H.264 인코딩.
3. 외부 생성 없이 진행할 경우: 인물은 정지 유지 + 환경(파도·TV 반사·광원·HUD·스캔·소등)과 다층 parallax만으로 만든 **2.5D 모션 그래픽 버전**. 브리프의 "정지 이미지를 흔든 것이 아닌" 기준에는 못 미침을 명시하고 만듦.
