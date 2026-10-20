# 실행 기준

- 저장소: jbseo-commits/lost-dreams-novel
- 원격 브랜치: codex/ep101-105
- 고정 SHA: 7699855f8c31519ceaa9da0120b19430579f7548
- GitHub connector의 git/ref/heads/codex/ep101-105 응답으로 고정. 기존 로컬 브랜치 HEAD를 기준으로 삼지 않음.
- 원문 125개: 본편105 + 범퍼20. 파일별 Git blob SHA-1/크기 대조 완료.
- 본편86~90만 사용자 지시에 따라 loop/held/ep086.md~ep090.md를 사용. held의 다른 사본/노트 제외.
- 순서 근거: 같은 SHA의 scripts/build-manifest.mjs. 숨김6개 제외. ep007-3=8-1, ep008-3=8-2, ep008-4=8-3으로 정렬.
- 제외6개: ep002-1,ep003-1,ep006-2,ep011-1,ep008-1,ep008-2.
- pilot.html의 오래된 BUMP/MAX와 manifest 생성 규칙이 불일치. MAX=70, 숨김 항목2-1/4-2(alias3-1)/11-1 참조,20-1 누락. 요청된105화와 숨김 제외를 만족하는 manifest 생성 규칙을 적용. 웹 수정 없음.
- 메인이 AGENTS.md,docs/chat-loop.md,docs/codex-loop.md,loop/AGENT-WORKFLOW.md,loop/LOOP.md,loop/config.md를 확인. 독자에게 해당 문서/설정/기획/과거 평가를 전달하지 않음.
- 6명은 fork_turns=none으로 새 호출. 순차 세 명씩 두 묶음. 독자별 도구는 현재 파일 vote를 먼저 저장하고 reason을 저장해야 다음 원문 출력. 원문125개의 공용 snapshot은 파일 시스템에 존재하므로 보안상 접근을 차단한 격리는 아님; 다른 파일 및 평가 접근 금지 지시와 새 대화맥락으로 독립성 유지.
- 한 파일 전체를 도구출력으로 제공. 중간 하차 위치는 독자의 자기보고이며 줄 단위로 출력 자체를 차단한 실험 아님.
- B는 잠시 휴식, C는 최초자발하차. 첫C 이후 생존수 복원하지 않음. 이후 반응은 업무독서/재유입가능점. 범퍼도 별도판정.
- 판정 이벤트와 이유/다음읽기 이벤트를 events.jsonl에 분리 저장.
- 기존 원고·설정·웹·기록을 수정하지 않음. 새 보고서 폴더만 생성. commit/push/PR/병합/배포 미실행.
- 6개 AI 역할반응을 실제 독자 이탈률·상업성 검증으로 환산하지 않음.
