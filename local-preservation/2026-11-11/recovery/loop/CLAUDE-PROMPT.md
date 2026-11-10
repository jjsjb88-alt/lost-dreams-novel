# Claude 소설 집필 한 바퀴

AGENTS.md → docs/MODEL-ROUTING.md → loop/LOOP.md → loop/config.md → loop/AGENT-WORKFLOW.md → loop/forward-prompt.md 순서로 먼저 읽는다. 작가의 최신 브랜치·설정 작업·미검수 원고 지시가 있으면 그것을 우선한다. 정지 상태·목표 화수 도달·종료 시각이면 새 원고를 만들지 않고 보고하고 끝낸다. 이번 FORWARD 범위의 품질 보류만 먼저 처리한다. 기각 범퍼와 공개된 본편의 보류 사본은 자동 재시도하지 않는다.

기존 루프의 settings 전체·직전 3화·요약·최근 기록을 읽고, 메인 Opus가 이번 화 목적·인물 동기·장기 복선·문체를 설계하고 직접 쓴다. 큰 계획 전에 advisor와 접근법을 확인한다. explorer는 근거 검색, researcher는 설정 자료 확인, worker는 명시된 형식·연출 구현과 동작 검사만 맡는다. 연출 작업 금지 지시가 있으면 그 범위를 지킨다.

continuity-reviewer의 사실 검수와 원고를 쓰지 않은 별도 editorial-reviewer의 장면 가시성·인과(§4), 필수 조건(§5), 7항목 점수(§6), 역검수(§7)를 모두 받는다. 같은 오류/결함이 두 번 반복되면 메인이 advisor로 방향을 점검한다. 같은 검수자에게 수정분을 이어 보내며 기존 합계 3회 제한·보류·기록 확정 시점을 유지한다. 완료 전 advisor에 누락을 확인한다.

작가 승인 없이 확정 설정을 바꾸거나 미정 항목을 체크하지 않는다. 현재 Claude 실행은 작업 브랜치 준비·개별 diff와 검수 결과·PR 보고까지다. main에 직접 push·전체 브랜치 병합·공개 배포하지 않는다. 실제 공개가 없는 화를 공개·배포 성공으로 기록하지 않는다. 한 바퀴 후 실제 모델·effort·검수 점수·상담·미검증·다음 한 단계를 보고하고 멈춘다.


진행 화면을 위해 세션별 고유 runId로 첫 상태를 기록한다: node scripts/loop-status.mjs --engine claude --role main --status running --stage plan --run <고유-id> --summary "세션 시작". 이후 메인이 각 역할의 시작/종료, advisor 상담 세 시점, 실제 테스트 결과를 docs/codex-loop.md 형식으로 짧게 기록한다. 읽기 전용 에이전트에 로그 쓰기를 맡기지 않는다. 비용·토큰·실행하지 않은 검증을 추측하지 않는다. 마지막 상태 done은 세션 종료만 뜻하며 실제 배포·품질 통과와 구분한다.
