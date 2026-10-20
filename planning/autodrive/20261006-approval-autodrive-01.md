# 승인형 자율주행 계획 · 20261006-approval-autodrive-01

- 실행 ID: 20261006-approval-autodrive-01
- 기준: origin/main `6441b17` (현재 checkout은 detached + 로컬 2커밋 선행이므로 기준 아님)
- 상태: 준비만 완료, 집필 미시작. 이 문서 승인 전까지 원고·설정·웹을 고치지 않음.

## 1. 읽은 문서

- `AGENTS.md` 전체
- `docs/chat-loop.md`, `docs/codex-loop.md`, `docs/MODEL-ROUTING.md`
- `loop/LOOP.md`, `loop/config.md`, `loop/SCENE-VISIBILITY-GATE.md`
- `loop/BUMPER-CONTINUITY.md`, `loop/forward-ep050-report.md`, `loop/handoff-20261006.md`
- 역할 시작 프롬프트: `loop/forward-prompt.md`, `loop/reader-audit-prompt.md`,
  `loop/bumper-prompt.md` (이상 3개 + `loop/AGENT-WORKFLOW.md`는 origin/main에만 존재,
  현재 detached checkout에서 삭제됨 — 아래 §2 참조)
- `loop/chat-prompt.md`, `loop/codex-prompt.md`, `loop/CLAUDE-PROMPT.md`
- 요청된 `loop/AUTODRIVE.md`는 origin/main·현재 checkout 어디에도 없음.
- 요청된 `loop/AGENT-WORKFLOW.md`는 origin/main에는 있으나 현재 checkout에는 없음.

## 2. 현재 위치 실측 (근거)

- 최신 main: origin/main `6441b17`. 최신 공개 본편: 제49화 (origin/main `manuscript/` 최대 `ep049.md`).
- 현재 checkout: detached HEAD `bc6908b`, clean. origin/main보다 2커밋 선행:
  `40485f9` (웹 연출·LOOP/GATE 편집), `bc6908b` (ep050 초안 + FORWARD 보고서).
  이 선행분에는 역할 프롬프트 3개와 `AGENT-WORKFLOW.md` 삭제가 포함됨.
  따라서 실행 작업은 이 checkout 위가 아니라 origin/main에서 새 브랜치·worktree로 시작.
- 미검수 초안: `manuscript/ep050.md`는 origin/main에 없음. 로컬 `bc6908b`에만 있는
  품질 보류본 (아래 §3). `loop/held/ep050-draft-20261007.md`는 파손 초안 보존본으로 손대지 않음.
- 보류: `loop/held/`에 ep022-1·ep029-1 (생성 게이트 기각, 재시도 금지),
  ep042·ep043 (공개본 옛 사본, 손대지 않음). 현행 품질 보류는 제50화 1건.
- 감사 위치: `planning/reader-audit/` 없음 (origin/main·로컬 모두). 첫 실행은 1화부터.
- 범퍼 보고서: `planning/bumper/` 없음. 범퍼 후보: 없음 (아래 §4).
- `planning/autodrive/` 없음 → 이 문서가 첫 기록.

## 3. 제50화 보류 상태 (FORWARD 시작점)

`loop/forward-ep050-report.md` §8 판정: 품질 보류. 사유 3건.

1. 분량 공백 제외 3143자, 3500 미달 357자 (형식 불합격).
2. 원고 수정 초안 1 + 보강 4회로 상한 3회 초과를 자인.
3. 사실·편집 독립 검수 BLOCKED, 연출 브라우저 검증 미실행. 공개용 통과 선언 없음.

다음 한 단계 (보고서 §8): (a) `노인정 번호` 1행 정리, (b) 400자 내외 실사건 보강,
(c) 독립 검수 2종. 수정 3회 한도는 회차·재개 때 초기화하지 않음 — (a)(b)는 남은
한도가 아니라 새 실행의 별도 보류 수정으로扱지 않고, 기존 초과 기록을 유지한 채
작가 승인 하에 최소 수정으로 진행. 독립 검수 없이 공개용 통과 선언 금지.

## 4. 본편 전진을 막는 설정·인과 충돌 점검

- 47→49화와 `story-so-far.md` 대조 결과, 다음 화를 쓰기 위해 임의로 정답을 골라야 하는
  충돌은 발견되지 않음: 2항 `철회·원안 말소`(49화), 서북3번 "전에도 없었어요",
  704호 이름표 주인 미확정 유지, 430 공동 선결제·컵 미새김 유지, K-7 69,
  09초 미열람 유지가 모두 일치.
- 주의 1건 (보고서 §5): `노인정 번호로 왔더라고` — 노인정 전화번호가 기존 원고에 없어
  윤 여사 개인 번호 의미로 읽히나 문장 모호. 보류 수정 (a)에서 정리. 전진을 막는 충돌 아님.
- 필요한 작가 결정: 충돌 해소를 위한 결정이 아니라, 이 계획 자체의 승인 +
  아래 §6의 반영 권한 선택. 승인 전 집필·반영 없음.

## 5. 실제 권한 실측

- 에이전트: 현재 세션 네이티브 서브에이전트 사용 가능 (`explore` 읽기 전용,
  `general` 작업용). 중첩 Codex/Claude CLI 실행 없음, 예약 작업 생성 없음.
- 검수: repo 지정 `continuity_reviewer(Luna/high)`·`editorial_reviewer(Sol/high)`와
  gpt-6 모델 라우팅은 이 세션에서 확인 불가. 실행 시 별도 네이티브 reviewer 호출로
  독립 검수를 수행하고, 실제 호출·점수만 기록. 검수 없이 통과 선언하지 않음.
- 편집: 파일 편집·shell 실행 확인됨. 쓰기 직렬화 (동시 편집 worker 1개).
- GitHub: `gh auth status` = jbseo-commits, scopes `repo` + `workflow`. 대상
  `jbseo-commits/lost-dreams-novel` 일치. 단, push·병합·배포는 §6 승인 범위 안에서만.

## 6. 역할 분리 + 실제 작업 공간

세 역할은 목표·맥락·쓰기 범위를 분리하고, 같은 worktree에서 동시 편집하지 않음.

| 역할 | 범위 | 작업 브랜치 (origin/main `6441b17`에서 생성) |
| --- | --- | --- |
| FORWARD | 제50화 보류 수정 1화 | `work/forward-ep050-holdfix` |
| READER AUDIT | 제1~5화 + 사이 공개 범퍼 (읽기 전용, 보고서만) | `work/reader-audit-r1-ep001-005` |
| BUMPER | 감사 확정 후보 1개 (현재 후보 없음 → 생성 없음) | 후보 발생 때만 `work/bumper-<문제-id>` 생성 |

## 7. 회당 목표 (config 실측 기반, 더 좁게 제안)

- config 실측: 상태 실행, 목표 100, 한 번에 1화, 분량 3500~5500자,
  재검수 고친 부분만, 배포 바로 공개. 작가 메모 비어 있음.
- FORWARD: 시작 제50화(보류 수정), 목표 제50화 검수 완료·공개 대기까지. 새 제51화 착수 없음.
- READER AUDIT: **실행 준비 중 발견 (2026-10-06): 별도 worktree의
  `audit/reader-ep001-005` 브랜치에 1회 감사(제1~5화 + 2-1·3-1, 커밋 `ce483de`,
  미push)가 이미 완료돼 있음. 진행 기록상 다음 시작 제6화·범퍼 후보 0건·미해결
  `audit-ep003-01`(본편 수정 대상, 제50화 무관). 따라서 중복 감사하지 않고
  이번 회는 2회 감사(제6~10화 + 사이 공개 범퍼)로 이어감.**
  `planning/reader-audit/`에 화별 보고서 + 진행 기록 갱신.
- BUMPER: 후보 범위 = 감사 확정 후보에 한정. 1회 감사 후보 0건 → 만들지 않음.
  감사의 본편 오류를 범퍼로 돌리지 않음.
- 작업 공간: FORWARD worktree `.../010406/forward-ep050` (브랜치
  `work/forward-ep050-holdfix`), AUDIT worktree `.../010406/audit-r2`
  (브랜치 `work/reader-audit-r2-ep006-010`). 2회 감사 진행 기록은 1회 기록
  (`git show ce483de:planning/reader-audit/progress.md`로 읽기 전용 참조)을
  이어 `progress.md`에 갱신. 병합 시 충돌은 통합 담당이 순차 해결.
- 원고는 별도 사실·편집 검수를 받고 결함을 높은 점수로 덮지 않음. 수정 3회 한도 유지.

## 8. 종료 조건

- FORWARD 제50화: 검수 완료·공개 대기 또는 품질 보류 확정 + 보고서 기록 후 해당 회 종료.
- READER AUDIT: 제1~5화 + 공개 범퍼 보고서·진행 기록 완료 후 종료.
- BUMPER: 후보 없음 확인 기록 후 종료 (후보 발생 시 해당 1건 판정·보고 후 종료).
- 공통: config 정지·목표 도달·종료 시각, 작가 결정 필요·품질 보류·충돌·도구 불가 발생 시
  해당 작업만 막고 근거 기록. 중단 요청 시 전체 실행을 멈추고 재개 위치 보존.
- 승인된 회차 진행·개별 반영에 재승인을 요구하지 않음. 승인 범위 밖의 공개 본편·확정
  설정·config 수정 금지.

## 9. 반영 권한 (승인 때 선택)

- 기본 제안: 작업 브랜치 준비까지. 원격 push·main 병합·웹 배포 없음.
  검수 통과 변경도 `검수 완료·공개 대기`에서 멈춤.
- 공개 권한 없는 본편(제50화)은 한화 준비 후 공개 대기에서 멈춤 (지시 준수).
- main 반영이 승인될 경우: 통합 담당(메인)이 최신 main과 달라진 인접 화·설정을 확인하고
  영향받는 부분만 재검수한 뒤, 검수 통과 변경만 순차 반영. 자동 덮어쓰기·전체 브랜치
  병합 금지. 배포 성공은 실제 확인 때만 기록.
- 선택지: (A) 브랜치 준비만 [권장·기본], (B) 작업 브랜치 push 허용,
  (C) 검수 통과분의 main 순차 반영 + Pages 배포 확인까지. 승인자가 명시.

## 10. 회차 기록·보고

- `loop/log.md`·`loop/story-so-far.md`·`settings/05-open-questions.md`·`CHANGELOG.md`는
  결과 확정 뒤에만, 허용된 반영 때 갱신. 작업 브랜치 보고서는 각 브랜치에 보관.
- 끝 보고: 각 역할의 진행 위치·실제 검수(호출·점수·수정 횟수)·공개/보류·배포·남은 결정.
- 실제 세션 종료 뒤 백그라운드 실행을 주장하지 않음. 재개 요청 시 기존 승인 범위와
  대화 근거를 확인해 잔여 작업부터 이어감.

## 11. 실행 기록 (메인 갱신)

- 승인: 계획 승인 + 반영 권한 C (검수 통과분의 main 순차 반영 + Pages 배포 확인).
  대화 승인 근거로 실행. 승인 범위 밖 확대 없음.
- 본편 마지막 목표 번호: 100 (config 실측값. 작가 지시 "포워드는 100화까지 달려"로 확정).
- 기준 main: `80e4288` (PR #22 병합 후). 통합 커밋: PR #21 `76ea3df`, PR #22 `80e4288`.
- 1회차 결과:
  - FORWARD 제50화: 품질 보류 유지. 분량 3289자(211자 미달), 누적 수정 7회(상한 3회 초과),
    독립 검수 미실시. 브랜치 `work/forward-ep050-holdfix` push, main 미반영.
    AUTODRIVE §4에 따라 추가 재처리 없이 보류. 다음 전진은 작가 결정 대기(차단).
  - READER AUDIT 1회(제1~5화, 별도 세션): PR #21로 main 반영. 후보 0건.
  - READER AUDIT 2회(제6~10화 + 공개 범퍼 6-1·6-2·7-2·9-1): PR #22로 main 반영.
    신규 문제 24건 중 본편 수정 대상 0건, 정상 미스터리 3건, 문제 없음 21건.
    범퍼 검토 후보 0건. 미해결 `audit-ep003-01` 계승. 다음 시작 제11화.
  - BUMPER: 1·2회 감사 후보 0건 → 생성 없음 (정상 완료).
- 상태: FORWARD 차단/결정 대기 (제50화 보류), AUDIT·BUMPER 승인 범위 내 계속 가능.
- 다음 한 단계: (1) 제50화 재처리 작가 결정, (2) AUDIT 3회(제11~15화),
  (3) 본 기록 + log 반영(PR #23 예정).

## 12. 실행 기록 2 (메인 갱신)

- 작가 지시 "포워드는 100화까지 집필하라"를 제50화 재처리 승인으로 기록하고 전진 재개.
- 2회차 결과:
  - FORWARD 제50화: 최종 보강 후 분량 3546자(하한 통과). 사실 검수 통과.
    편집 검수 불합격(가시성 CHANGES 157행, 7항목 평균 7.7, 역검수 FAIL).
    지적 3건 최소 수정 후 동일 검수자 재검수: 결함 해소, 재점수 평균 8.1로
    전 항목 8 이상 충족하나 평균 9 미달 → 불합격 확정. 분량 3506자.
    누적 수정 10회(상한 초과 + 작가 재처리 지시 기록). 브랜치
    `work/forward-ep050-holdfix` 커밋·push, main 미반영. 품질 보류 유지.
    100화 전진은 제50화 미공개 상태이므로 차단(다음 번호를 만들지 않음).
  - READER AUDIT 3회(제11~15화 + 공개 범퍼 11-1·13-1·15-1): PR #24로 main 반영.
    신규 22건 중 본편 수정 대상 0건, 범퍼 후보 0건, 정상 미스터리 2건.
    미해결 `audit-ep003-01` 계승. 다음 시작 제16화.
  - BUMPER: 3회 감사 후보 0건 → 생성 없음 (정상 완료).
- 원격 인증: `gh` 저장 인증 jbseo-commits(`repo`+`workflow`)로 non-interactive 수행.
  계정 선택·승인 프롬프트를 띄우지 않음(커밋 `bac45aa` 지침 준수).
- 상태: FORWARD 차단 (제50화 보류, 추가 반복 수정 없음), AUDIT 승인 범위 내 계속.
- 다음 한 단계: (1) AUDIT 4회(제16~20화), (2) 본 기록 + log 반영(PR #25 예정).
