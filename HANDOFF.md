# Antigravity 소설 회수

원본: C:/Users/jbseo/Desktop/lost-dreams-novel
기준 HEAD: 22fb6bd4ad2e7392b2d098355a933b7474466eca
원본 브랜치: feat/vn-ep2-what-ai-does-not-know
회수 브랜치: codex/recover-antigravity-20261019
별도 독립 복제본: C:\Users\jbseo\Desktop\합격자 로데이터 취합\_recovery\lost-dreams-novel-20261019

실측: 수정 12개·미추적 26개와 Antigravity 자료 177개(총 215개, 149300727바이트)의 복사 및 SHA256 대조 완료. 시퀀스 캡처 12개, 2화 캡처 35개. 원본 파일·HEAD·현재 브랜치·인덱스·상태 일치 확인. 상세: recovery/source-inventory.json 및 precommit-verification.json.

커밋·원본 ref 등록의 최종 검증은 C:\Users\jbseo\Desktop\합격자 로데이터 취합\_recovery\audit-20261019/final-verification.json과 작업 폴더 HANDOFF.md를 확인한다. 재현: node "C:/Users/jbseo/Desktop/합격자 로데이터 취합/recover-antigravity.mjs" verify. 기대: originalSourcePreserved=true, recoveredFileHashesMatch=true, originalRepositoryRegistered=true, originalRepositoryBlobHashesMatch=true.

위험: 원본 dirty 상태 유지. checkout/reset/clean/stash/pull 금지. 이번 작업은 로컬 보존이며 push·병합·배포 없음. 보존 스크립트는 원본 절대 경로를 참조하므로 그대로 실행하면 원본 파일/캡처를 덮어쓸 수 있다. 브라우저 검증은 재실행하지 않음. 기존 캡처의 존재를 기능 테스트 통과로 해석하지 말 것. .system_generated 세션 로그 및 scratch/node_modules는 원본에 유지하며 회수 제외.

이전 실패: C: 공간 확인 전에 전체 이력을 복제하다 ENOSPC 실패, Git이 실패 복제본 자동 제거. 파일 기록 실패로 회수 스크립트가 0바이트가 되어 공간 확보 후 재작성. 사용자의 공간 확보 뒤 여유 5.6GB와 실물 해시를 다시 확인했다.
