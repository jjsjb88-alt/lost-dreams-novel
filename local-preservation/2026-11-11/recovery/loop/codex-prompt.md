# Codex 소설 집필 한 바퀴

AGENTS.md → docs/codex-loop.md → loop/LOOP.md → loop/config.md → loop/AGENT-WORKFLOW.md → loop/forward-prompt.md 순서로 먼저 읽는다. 작가의 최신 브랜치·설정 작업·미검수 원고 지시가 있으면 그것을 우선한다. 정지 상태·목표 화수 도달·종료 시각이면 새 원고를 만들지 않고 보고하고 끝낸다. 이번 FORWARD 범위의 품질 보류만 먼저 처리한다. 기각 범퍼와 공개된 본편의 보류 사본은 자동 재시도하지 않는다.

기존 루프의 settings 전체·직전 3화·요약·최근 기록을 읽고, 메인 Sol가 이번 화 목적·인물 동기·장기 복선·문체를 설계하고 직접 쓴다. 큰 계획 전에 reviewer와 접근법을 확인한다. explorer는 근거 검색, researcher는 설정 자료 확인, worker는 명시된 형식·연출 구현과 동작 검사만 맡는다. 연출 작업 금지 지시가 있으면 그 범위를 지킨다.

continuity_reviewer의 사실 검수와 원고를 쓰지 않은 별도 editorial_reviewer의 장면 가시성·인과(§4), 필수 조건(§5), 7항목 점수(§6), 역검수(§7)를 모두 받는다. 같은 오류/결함이 두 번 반복되면 메인이 reviewer로 방향을 점검한다. 같은 검수자에게 수정분을 이어 보내며 기존 합계 3회 제한·보류·기록 확정 시점을 유지한다. 완료 전 reviewer에 누락을 확인한다.

작가 승인 없이 확정 설정을 바꾸거나 미정 항목을 체크하지 않는다. 현재 Codex 실행은 작업 브랜치 준비·개별 diff와 검수 결과·PR 보고까지다. main에 직접 push·전체 브랜치 병합·공개 배포하지 않는다. 실제 공개가 없는 화를 공개·배포 성공으로 기록하지 않는다. 한 바퀴 후 실제 모델·effort·검수 점수·상담·미검증·다음 한 단계를 보고하고 멈춘다.


현재 custom agents explorer, worker, researcher, reviewer를 필요할 때 명시적으로 호출한다. reviewer는 별도 읽기 전용 검수이며 .codex/agents/reviewer.toml 역할을 사용한다. 주어진 역할 모델을 지원하지 않거나 역할이 로드되지 않으면 BLOCKED로 보고한다. 큰 계획 전, 동일 오류 두 번째, 긴 작업 완료 전 reviewer에게 근거와 diff를 보내 확인한다. 동시에 쓰는 worker는 하나다. 원격 commit/push/merge/배포를 이 실행에서 수행하지 않는다. 변경분과 검증 근거를 작업 브랜치에 남긴 뒤 한 바퀴 후 멈춘다.

진행 상태는 메인이 node scripts/loop-status.mjs --engine codex --role <역할> --status <상태> --stage <단계> --summary "짧은 근거" 형식으로 시작/종료마다 기록한다. runId는 런처가 제공한 값을 사용한다. 검토는 --checkpoint before-plan|repeat-error|before-done을 붙인다. worker의 실제 테스트 종료 코드를 확인한 경우만 --test "테스트 이름" --result passed|failed|blocked로 기록한다. 읽기 전용 에이전트에 로그 쓰기를 맡기지 않는다. 로그에는 raw 출력, 원고, 비밀키를 넣지 않는다. docs/codex-loop.md의 기록 계약을 따른다. 기록 실패를 제품 작업 성공으로 숨기지 않는다.
