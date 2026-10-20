# 19~22화 혼합 개고 — 2026-10-20

상태: 원고4편 혼합 개고·사실/독립 편집 재검수 PASS,본문6항목과 모바일연출을 합한7항목 평균9.0. VN8편동기화·Node81개·브라우저1,317단위완주/저장복원/HTTP·file인물12경우/모바일웹4편 오류0·exit0. 원격PR제출용검토판이며 main병합·배포금지.

브랜치: codex/scene-mix-19-22-20261020,기준84d2445. 회수54e5834·회수보존PR#97및원본은그대로. 최신main의1/2화·타이틀·티저·갤러리·지우AVIF보존. 새그림·음원생성없음.

재현: npm test --prefix vn →81pass/0fail/0skip. npm install --prefix tools/verification/scene-mix --package-lock=false 후 node tools/verification/scene-mix/verify_scene_mix_playwright.mjs →PASS,1317steps,12offlinePortraitCases,14screenshots,errors0. Windows기본경로Chrome과Node20이상필요.

로컬미리보기: VN_PORT=4174로 vn/localserver.mjs 실행중, http://127.0.0.1:4174/?chapter=19&beat=0. 기존4173회수본과별도저장공간. PID·상태는loop/.runtime/scene-mix-20261020/preview-server.json/로그를다시확인할것. UI탭열기는queued응답으로즉시표시완료라고단정하지않음.

단일HTML54,108,293B/90assets/17modules/3scripts,SHA 6c8acd1b0515b1f8235ea5d2e697350614f59a0c361cea0a265b644622c2c6f9. sourcehash불일치0. 본문과VN제목·모든문단·573화자표시·순서일치.14그림/SHA/수치는 vn/notes/scene-mix-19-22-qa.json,장면선택은planning/ep019-022-scene-mix-20261020.md.

다음: 작가가혼합판을읽고통합을결정한다. 원고는이번작가지정혼합트랙2차수정까지이며이전트랙3회보류기록을덮지않음. 현재추가필수결함없음. 회수19-1뇌노동설명과21의14→8의료해결구조를복원하지말것.18/191/192/201/211/221/23본문불변;19/20/21/22만개고.

함정: main의19/191 VN원문이최신원고와달라8편을모두대조해고침. 대사표초안에서20-1에21-1대사가섞이고191 p37/p65·192 p118화자오류가발견되어원문문맥으로교정했다. 최종자료만사용할것. 새castID는state허용목록도갱신해야실제로표시된다. story-data전체pretty-print를공개하지말고기존compact형식유지(6,830,823B);의미동일확인후HTML도재빌드했다. PC캡처는타이핑완료를기다려야한다. 기준main의Windows타이틀6실패는URL.pathname경로문제로fileURLToPath2줄교정후전체81개통과. 원본215파일/HEAD/branch/index/dirty불변재검증. Node모듈·개인경로·brain·캐시공개금지.
