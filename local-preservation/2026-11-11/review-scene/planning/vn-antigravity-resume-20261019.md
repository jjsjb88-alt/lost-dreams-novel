# 안티그래비티 중단 검수 재개와 비주얼 노벨 이관 범위

작가 요청: “전체 경로를 모르겠어, 이어서 작업할 수 있니? 얘가 100화까지 다 비주얼노벨로 옮긴 거 같은데 아닌가.” 확인 기준은 GitHub main `5d0c100a49a21da121918680b603ff46d3452ca1`이다. 작업 브랜치는 `codex/vn-antigravity-resume`.

## 실제 이관 범위

`vn/story-data.js`를 실행해 장 목록과 모든 beat의 direction 필드를 직접 세었다.

| 범위 | 확인 결과 |
| --- | --- |
| 본편 | 1~105화,105편 수록 |
| 사이 이야기 | 23편 수록 |
| 개별 장면 연출 | 본편1~30화와 사이 이야기21편,합계51장 |
| 이후 수록분 | 31~105화와 후기 사이 이야기2편은 공통 읽기 화면; direction 없음 |
| 1화 체험판 | 전용 인물·사건CG·음악·티저·161개 읽기 화면 적용 |

105화까지 내용이 수록된 사실을105화까지1화 수준의 원화·연기·음향 제작과 사람의 연속 감상 검수가 끝났다는 뜻으로 확대하지 않는다. 86~90화는 기존 안내대로 임시 연속성 연결부다.

## 중단 로그와 현재 버전의 차이

작가가 전달한 로그에는 `verify_seq19_22_playwright.mjs`를 실행해2화와20-1화 모바일 캡처를 갱신하고 네 그림을 연 다음 독립 reviewer 재검토를 예고한 기록이 있다. 최종 재검토 결과는 전달된 로그에 없다. Windows PC의 `.gemini/antigravity-cli/brain` 파일은 이 클라우드에서 접근하지 못했다.

원격main과 관련 이름의 원격 브랜치를 확인했지만 해당 검증 스크립트·캡처·2화/20-1화 최신 수정본은 확보하지 못했다. 현재 main의2화 가계 문서는 원문97번이며, 로그의118/120/121/123번은 현행 버전에서는 그 문서가 아니다. 번호 차이 자체를 버그로 단정하지 않는다. **이번 작업은 현재 GitHub 버전에서 검수를 재개한 것이며, PC 미반영 작업을 복구했다는 뜻이 아니다.**

## 이번 수정

- 2화 모바일의 긴 가계 항목과 금액을 위아래로 배치해 큰 글자에서도 항목 이름이 좁은 열에서 잘게 분절되지 않도록 했다. 원문 네 항목과 숫자는 그대로다. 짧은 화면은 문서 내부에서 스크롤하며 마지막 항목까지 읽을 수 있다.
- 20-1화 은경·해린 장면의 정보 카드를 좌우16px 여백으로 넓히고 제목·설명을 키웠다. 카드 확대·닫기와 본문 진행을 유지한다.
- 현재 화수의 data 속성으로 두 화의 모바일 CSS만 적용한다. PC 배치는 유지하며 원고·story-data·neural-cues·그림을 바꾸지 않는다.
- 단일HTML도 재빌드했다. main 반영·웹 배포는 이번 작업에 포함하지 않았다.

## 검증

- 수정 전후 각각400×844/20px와400×667/28px에서8개 모바일 화면을 실제로 열었다. 본문 가로 넘침0·페이지 오류0. 문서 원문 전체 보존·4개 항목·마지막 항목 도달·스크롤 중 저장 인덱스97 유지와 카드 폭368px·본문 겹침0을 검사했다.
- 카드 확대·닫기·지난 이야기·이전/다음의 실제 클릭·터치를 확인했다.
- 별도PC1440px와 단일HTML400px에서2화·20-1화의4개 경로를 검사했다. 단일HTML은 외부 자산 요청을 차단한 로컬HTTP 환경에서 실행했다.
- `npm test`:10개 검사 파일 통과. 저장소 필수 대시보드 검사10개 통과.
- 전105화 감상·각색 검수를 새로 완료한 결과가 아니다. iOS/Safari와 직접 파일 열기도 새로 검증하지 않았다.

[검증 결과](../vn/notes/antigravity-resume-qa.json) · [2화 문서](../vn/notes/antigravity-resume-proof/2-document.png) · [2화 큰 글자의 마지막 항목](../vn/notes/antigravity-resume-proof/2-document-large.png) · [은경](../vn/notes/antigravity-resume-proof/20-1-eunkyung.png) · [해린](../vn/notes/antigravity-resume-proof/20-1-haerin-large.png).

## PC에 남은 작업 위치를 경로 없이 찾는 방법

정확한 로컬 작업을 회수해야 할 때 그 PC의 PowerShell에서 아래 코드는 사용자 홈 경로를 자동으로 찾아 해당 검증 파일과 캡처 위치만 출력한다. 이 코드를 사용자 PC에서 실행한 것은 아니다.

```powershell
$reviewRoot = Join-Path $env:USERPROFILE '.gemini\antigravity-cli\brain'
Get-ChildItem -LiteralPath $reviewRoot -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -match 'verify_seq19_22_playwright\.mjs|09b-father-port-realization\.png|09c-father-port-part2\.png|04-ep20-1-eunkyung-mobile\.png|05-ep20-1-haerin-mobile\.png' } |
  Sort-Object LastWriteTime -Descending |
  Select-Object FullName, LastWriteTime
```

로컬 변경 소스까지 확보되면 현재 브랜치와 비교해 적용할 부분을 통합한다. 현재 중단 검수 재개에 PC 파일을 선행 조건으로 삼지는 않는다.

독립 reviewer 최종PASS: 항목/금액 대응·4개 수치·큰 글자 마지막 항목·20-1 카드 폭과 본문 비겹침을 전후 화면 및 코드로 확인했다. 필수 수정 없음.
