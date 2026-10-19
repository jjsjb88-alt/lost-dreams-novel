# 소설 회수 브랜치 재개 인수인계 — 2026-10-20

상태: 중단됐던 집중 재검토를 마쳤고, 2화·19~22화·단일 HTML 기능 검증과 오프라인 인물 이미지 누락 수정을 완료했다. 최종 로컬 커밋/원본 회수 ref 결과는 작업 폴더 최상위 HANDOFF.md 및 git log에서 확인한다.

작업 브랜치: codex/recover-antigravity-20261019
회수 기준 커밋: fb60df718af82a63097140750a40736ae25eb7c6
작업 복제본: C:/Users/jbseo/Desktop/합격자 로데이터 취합/_recovery/lost-dreams-novel-20261019
원본: C:/Users/jbseo/Desktop/lost-dreams-novel
원본 현재 브랜치/HEAD: feat/vn-ep2-what-ai-does-not-know / 22fb6bd4ad2e7392b2d098355a933b7474466eca

## 실측 완료

- 기존12개 Node 테스트 파일:73 pass,0 fail,0 skip.
- 2화:400×844에서286개 원문 단위를134개 읽기 화면으로 순차 조작, 중간저장·백로그·1→2→3화 연결·PC 대표화면·오프라인CG 검사 PASS, 브라우저 오류0.
- 별도 시퀀스:19→20→20-1→21→21-1→22 순서,638회 진행, 대표 PC장면, 오류0.
- 오프라인 인물3명:400×844/1440×900 및HTTP/file:// 총12경우에서 인물별 원본 WebP와 내장 바이트 동일·1024×1536 디코딩 확인, 추가 자산 요청0.
- 단일 HTML37,689,200바이트,84자산, 인라인스크립트2개. 빌드된16개 모듈/84개 자산의 소스 해시 일치.
- 현재 독립 reviewer의 코드 diff·새 모바일4장 PASS. 검토자가 지적한 인물 동일성 검사도 보강 후 다시 통과.
- 원본215개 해시·원래 HEAD·현재 브랜치·인덱스·dirty 상태 불변 실측. manuscript/settings/vn/story-data.js는 회수 기준과 동일.

## 재현 명령과 근거

아래는 이 복제본 루트에서 실행한다.

```powershell
Push-Location vn
npm test
Pop-Location
$env:NODE_PATH='C:/Users/jbseo/.gemini/antigravity-cli/brain/e2d8e107-51da-4d48-ac0c-d7e6ea1487ac/scratch/node_modules'
node recovery/antigravity/scratch/verify_ep2_playwright.mjs
node recovery/antigravity/scratch/verify_seq19_22_playwright.mjs
```

기대:73개 통과, ep2 status PASS/286beats/134pages/errors0, 시퀀스6편/638steps/errors0 및offlinePortraits6개 matchesExpectedAsset:true. Chrome 경로는 Windows Program Files의 기존 Chrome을 사용한다.

- 문서: planning/vn-ep2-sequence-20261020.md
- 구조화 QA: vn/notes/ep2-sequence-qa.json
- 추적되는 증거6장: vn/notes/ep2-sequence-proof/
- 원자료(ignored): loop/.runtime/resume-20261020/ 및 loop/.runtime/vn-verification/

## 다음 작업과 위험

현재 요청 범위의 구현·검증에 남은 기능 작업은 없다. 원본 회수 브랜치 ref는 현재 작업 파일을 바꾸지 않는 로컬 갱신으로 보존한다. 원격 push·PR·병합·배포는 수행하지 않았다. 원본 checkout/reset/clean/stash/pull 금지; 후속 개발은 이 복제본에서 진행한다. fb60df7은 회수 당시 바이트가 담긴 기준이므로 보존한다.

기존 검증 스크립트2개는 복제본 경로로 수정했으나, recovery/antigravity/scratch/의 이미지 변환·음향 합성 보조 스크립트에는 원본 절대 경로가 남아 있다. 그대로 실행하지 말 것. 최상위 recover-antigravity.mjs verify는 수정 전 회수 바이트를 대조하는 도구이므로 이어서 개발한 현재 복제본에 대한 회귀 검사로 사용하지 않는다.

## 발견·정정한 불일치

원기록은 화면 수정 뒤 재검토 직전에 끝났으며 종료 원인은 기록돼 있지 않다. 오프라인 빌드가3명 초상화를 외부 파일로 읽는 문제를 실제 실패로 재현해 고쳤다. 수동 제작 기록의2화8개 그림 크기와 아버지3개 자산 키, 존재하지 않는 음향 폴더 경로를 실물과 맞췄다. 사람의 음원 청취·독자 감상 시간·전체 소설 편집 검수를 수행했다고 주장하지 않는다.
