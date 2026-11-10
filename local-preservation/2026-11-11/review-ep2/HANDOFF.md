# 회수 VN 비교 브랜치 — 2026-10-20

상태: 회수2화·19~22화의 공개용 코드·그림·음향·오프라인HTML·검증 자료를 준비하고 실제 게시할 LF 소스에서 검증 완료. 비교 Draft PR 검토용 스냅샷이다.
브랜치: `codex/vn-ep2-sequence-review-20261020`, 기준 `22fb6bd4ad2e7392b2d098355a933b7474466eca`. 비교한 최신 main은 `84d2445ef07c1175d7d59f1fb70c864098eed1ad`. 최신 원고·타이틀·원화 통합판이 아니다.

재현: `npm test --prefix vn` → 실측73 pass/0fail/0skip. `npm install --prefix tools/verification/antigravity --package-lock=false` 후 `node tools/verification/antigravity/verify_ep2_playwright.mjs` → PASS/134화면/286단위/오류0. `node tools/verification/antigravity/verify_seq19_22_playwright.mjs` →19,20,20-1,21,21-1,22/638회 진행/오류0. Windows 기본 경로 Chrome과Node20이상 필요.

단일 HTML37,681,896B·자산84개·모듈16개, source SHA16개 불일치0. PC·모바일 HTTP/file:// 인물 검증12경우 통과. 이미지·음향은 회수본 바이트와 같다. 전체 검증 수치와 SHA·그림6장은 [검증 기록](planning/vn-ep2-sequence-20261020.md), [QA](vn/notes/ep2-sequence-qa.json) 참조.

다음: 이 브랜치의 Draft PR에서 작가가 버전·통합 방향을 결정한다. 병합·배포 금지. 본편 인과는 최신19→19-1→19-2→20을 우선하는 방향을 추천하되 이 브랜치는 회수판6편 목록을 보존한다.

위험: 최신19-1·19-2의 환불 지연/재고/28TOKEN이20화의 필수 원인이므로6편 목록에 최신 원고만 덮어쓰지 말 것. 회수21화의14%→8%와 의료 예약 직접 연결은 최신본에서 삭제한 구조다. 원래 회수본·미반영 원본·실행중 미리보기는 별도 보존. 원본215개 및HEAD·branch·index·dirty 불변을 재측정했고 회수54e5834도clean이다.

확인한 함정: CRLF를그대로복사하면전행diff가생김. index만정규화하면source-manifest SHA가달라져공개working소스를LF로맞추고HTML·manifest도함께재생성했다. 기존HTML덮어쓰기1회UNKNOWN open으로실패해ignored별도출력에빌드하고검증후복사했다. 이전37,689,200B SHA는정규화전회수본수치다. 개인정보·brain원자료·캐시는공개하지않는다.
