# 2화·19~22화 시퀀스 — 회수 후 검토 재개

- 재개 요청: 2026-10-20, 어제 회수한 소설 작업을 중단 지점부터 진행.
- 작업 위치: 독립 회수 복제본, `codex/recover-antigravity-20261019`.
- 보존 기준: `fb60df718af82a63097140750a40736ae25eb7c6`.
- 현재 상태: 중단됐던 집중 재검토 및 2화·19~22화·단일 HTML 기능 검사 통과.

## 중단 지점과 범위

Antigravity 원기록은 2화 모바일 문서/대사 겹침과 20-1화 카드 잘림을 수정하고 캡처를 새로 찍은 뒤, 같은 변경의 재검토를 요청하기 직전에 끝난다. 종료 원인이나 실패는 기록돼 있지 않다. 마지막 원기록은 `transcript_full.jsonl` 840~844행이며, 회수된 캡처 4장을 현재 독립 검토자가 다시 확인했다. 그 화면 상태에서는 두 결함이 보이지 않았다.

2화는 286개 원문 단위와 기존 저장 좌표를 유지하는 전용 연출판이다. 별도 시퀀스는 19 → 20 → 20-1 → 21 → 21-1 → 22 순서다. 19-1·19-2·22-1을 이 재생 목록에 추가하지 않는다. 새 원고·선택 분기·강제 대기·새 그림/음원은 만들지 않았다.

## 이번 수정

1. 기존 두 브라우저 검증 스크립트가 원래 저장소/brain을 가리키던 경로를 회수 복제본 기준으로 바꿨다. 캡처는 Git에서 제외한 `loop/.runtime/vn-verification/`에 쓴다. 브라우저는 별도 임시 프로필로 실행한다. 기존 `playwright-core` 설치를 `NODE_PATH`로 읽으며 패키지를 설치하지 않았다.
2. **단일 HTML 인물 이미지 누락을 재현하고 수정했다.** 수정 전 시퀀스의 윤세라 이미지가 `assets/yoonsera.webp`를 참조해 내장 검사에 실패했다. 윤세라·최은경·문해린을 기존 `EP1_ASSETS`에 등록하고 시퀀스가 같은 목록을 참조하게 했다. 빌더를 확장하거나 이미지 파일을 바꾸지 않고 단일 HTML을 다시 만들었다.
3. 제작 기록을 실제 런타임 파일과 맞췄다. 2화 인물 3종은896×1200, 배경/CG5종은1376×768이다. 아버지 그림의 자산 키3개와 잘못 적힌 음향 경로를 정정하고 그림11종의 크기·SHA256을 기록했다. 기존 생성/음향 기록은 출처로 남겼으며 새 생성이나 사람의 청취 검수를 주장하지 않는다.

## 확인한 결과

- `vn/` 기존12개 테스트 파일:73개 통과, 실패·취소·건너뜀0. 수정 전/후 모두 통과했다.
- 2화 브라우저:400×844에서134개 읽기 화면으로286개 원문을 빠짐없이 순차 조작. 중간 저장 복원, 백로그 중복 방지,1→2→3화 이동, 대표 PC장면, 단일 HTML의 아버지 CG 확인. 종료 코드0, 오류0.
- 단일 HTML 빌드:37,689,200바이트, 이미지·음원84종 내장, 인라인 스크립트2개 구문 검사 통과.
- `file://` 직접 열기:400×844/1440×900 각각 윤세라·최은경·문해린을 확인.6개 경우 모두 내장 데이터 이미지 디코딩1024×1536 성공, 추가 자산 요청0·페이지 오류0. 브라우저 정책을 변경하지 않았다.
- 원고·설정·`vn/story-data.js`는 회수 기준과 같음을 `git diff --quiet` 종료 코드0으로 확인했다.
- 19~22화:400×844에서6편을 정해진 순서로 끝까지638회 진행. 역방향 이동과 완주 종막, 대표 PC화면 확인. 콘솔·페이지 오류0, 종료 코드0.
- 단일 HTML:HTTP와file:// 각각2개 화면폭×3명, 총12개 경우에서 해당 인물 원본 WebP와 내장 데이터가 바이트 단위로 같고 실제 디코딩되는지 확인했다. 독립 검토에서 인물 동일성 검사 보강을 제안받아 추가했고 전체 시퀀스를 다시 통과했다.
- 현재 독립 reviewer의 코드 diff·새 모바일4장 재검토 PASS. 원래 중단 세션의 reviewer를 재호출했다고 주장하지 않는다.

## 근거와 재현

작업 로그는 `loop/.runtime/resume-20261020/`의 `node-tests-initial.txt`, `node-tests-final.txt`, `sequence-before-fix.txt`, `offline-build.txt`, `ep2-browser-final.txt`, `sequence-browser-final.txt`, `file-offline-verification.json`에 있다. 원래 brain의 로그와 캡처는 변경하지 않는다.

Node 검사는 `vn/`에서 `npm test`. 기존 브라우저 검사는 `playwright-core`가 설치된 `node_modules`를 `NODE_PATH`에 지정한 뒤 저장소 루트에서 아래 두 파일을 순서대로 실행한다.

```powershell
node recovery/antigravity/scratch/verify_ep2_playwright.mjs
node recovery/antigravity/scratch/verify_seq19_22_playwright.mjs
```

빌드 재현:

```powershell
node tools/build-vn-offline.mjs "$PWD/vn" "$PWD/vn/play-offline.html"
```

원래 저장소의 미반영 파일·현재 브랜치·인덱스는 건드리지 않는다. `fb60df7`은 회수 당시 원본으로 남긴다. 브라우저 검사는 문장 바로 표시와 자동 조작을 사용한 기능 검사이며 독자 감상 시간·음악 청취 품질·전체 작품 완성도를 인증하지 않는다. 원격 push·PR·병합·배포는 이 재개 작업에서 수행하지 않았다.

## 보존한 화면과 판정 근거

[QA 요약·화면 SHA256](../vn/notes/ep2-sequence-qa.json)

- [아버지 문서와 대사 간격](../vn/notes/ep2-sequence-proof/father-port-mobile.png) · [다음 읽기 화면](../vn/notes/ep2-sequence-proof/father-port-continuation-mobile.png)
- [은경 카드](../vn/notes/ep2-sequence-proof/eunkyung-card-mobile.png) · [해린 카드](../vn/notes/ep2-sequence-proof/haerin-card-mobile.png)
- [PC 시퀀스 메뉴](../vn/notes/ep2-sequence-proof/sequence-menu-desktop.png) · [단일 HTML 윤세라](../vn/notes/ep2-sequence-proof/offline-yoonsera-desktop.png)

원본215개 파일의 SHA256, 기존 HEAD·현재 브랜치·인덱스·dirty 상태가 회수 당시와 같음을 이번 작업 후 다시 측정했다. 회수 브랜치의 새 커밋 등록은 원본의 작업 파일을 바꾸지 않는 로컬 ref 갱신으로 수행한다. 원래 회수 커밋은 이력에 남긴다.
