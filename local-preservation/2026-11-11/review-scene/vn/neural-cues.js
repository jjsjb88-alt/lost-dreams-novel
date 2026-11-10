/**
 * Authored channel direction for episodes 1–30 and their included side stories.
 * Every override is chapter-local, index-bound and guarded by the exact text.
 * These are presentation instructions, never a second copy of the narrative.
 * UI consumers must keep body as text (no HTML) and keep the story accessible.
 */
const PRESETS = {
  "transaction": {
    "kind": "system",
    "sender": "인터페이스",
    "title": "처리 기록",
    "accent": "mint",
    "priority": "quiet",
    "revealMs": 180
  },
  "sleep": {
    "kind": "system",
    "sender": "수면 인터페이스",
    "title": "오늘 밤의 계약",
    "accent": "mint",
    "priority": "quiet",
    "revealMs": 200
  },
  "sleepReport": {
    "kind": "system",
    "sender": "수면 인터페이스",
    "title": "수면 정산",
    "accent": "mint",
    "priority": "focus",
    "revealMs": 240
  },
  "choice": {
    "kind": "system",
    "sender": "수면 인터페이스",
    "title": "선택 확인",
    "accent": "ice",
    "priority": "focus",
    "revealMs": 240
  },
  "alert": {
    "kind": "system",
    "sender": "수면 인터페이스",
    "title": "중도 종료 정산",
    "accent": "rose",
    "priority": "interrupt",
    "revealMs": 180
  },
  "work": {
    "kind": "system",
    "sender": "업무 화면",
    "title": "진행 기록",
    "accent": "mint",
    "priority": "quiet",
    "revealMs": 180
  },
  "security": {
    "kind": "system",
    "sender": "보안 화면",
    "title": "확인된 기록",
    "accent": "ice",
    "priority": "quiet",
    "revealMs": 180
  },
  "permission": {
    "kind": "system",
    "sender": "권한 인터페이스",
    "title": "권한과 제한",
    "accent": "ice",
    "priority": "focus",
    "revealMs": 280
  },
  "medical": {
    "kind": "system",
    "sender": "의료 인터페이스",
    "title": "진행 기록",
    "accent": "ice",
    "priority": "quiet",
    "revealMs": 180
  },
  "medicalAlert": {
    "kind": "system",
    "sender": "의료 인터페이스",
    "title": "의사 확인",
    "accent": "rose",
    "priority": "interrupt",
    "revealMs": 200
  },
  "cognitiveAlert": {
    "kind": "system",
    "sender": "인지 부하 경고",
    "title": "임계 초과",
    "accent": "rose",
    "priority": "interrupt",
    "revealMs": 120
  },
  "payment": {
    "kind": "system",
    "sender": "정산 화면",
    "title": "정산 기록",
    "accent": "mint",
    "priority": "focus",
    "revealMs": 260
  },
  "ledger": {
    "kind": "system",
    "sender": "장부 화면",
    "title": "미지급과 지급",
    "accent": "mint",
    "priority": "quiet",
    "revealMs": 200
  },
  "monitor": {
    "kind": "system",
    "sender": "운영 화면",
    "title": "현재 운영 기록",
    "accent": "mint",
    "priority": "quiet",
    "revealMs": 180
  },
  "queue": {
    "kind": "system",
    "sender": "신청 화면",
    "title": "승인과 대기",
    "accent": "ice",
    "priority": "focus",
    "revealMs": 260
  },
  "familyProtection": {
    "kind": "system",
    "sender": "가족 보호 기록",
    "title": "적용과 조회",
    "accent": "ice",
    "priority": "quiet",
    "revealMs": 200
  },
  "contactAlert": {
    "kind": "system",
    "sender": "보호 인터페이스",
    "title": "외부 접촉 감지",
    "accent": "rose",
    "priority": "interrupt",
    "revealMs": 160
  },
  "archive": {
    "kind": "system",
    "sender": "회복 꿈 거래 화면",
    "title": "등록된 기록",
    "accent": "ice",
    "priority": "quiet",
    "revealMs": 220
  },
  "irreversible": {
    "kind": "system",
    "sender": "회복 꿈 거래 화면",
    "title": "철회와 회수",
    "accent": "rose",
    "priority": "focus",
    "revealMs": 320
  },
  "survey": {
    "kind": "system",
    "sender": "응답 화면",
    "title": "선택과 응답",
    "accent": "ice",
    "priority": "quiet",
    "revealMs": 180
  },
  "invitation": {
    "kind": "message",
    "sender": "아르카디아",
    "title": "전략 세션 초대",
    "status": "수신",
    "accent": "ice",
    "priority": "focus",
    "revealMs": 360
  },
  "workplaceInvite": {
    "kind": "message",
    "sender": "회사",
    "title": "평가 안내",
    "status": "수신",
    "accent": "ice",
    "priority": "focus",
    "revealMs": 320
  },
  "externalOffer": {
    "kind": "message",
    "sender": "외부 요청",
    "title": "조건 협의",
    "status": "수신",
    "accent": "ice",
    "priority": "quiet",
    "revealMs": 280
  },
  "unknown": {
    "kind": "message",
    "sender": "발신자 미표시",
    "title": "낯선 수신 문장",
    "status": "수신",
    "accent": "rose",
    "priority": "focus",
    "revealMs": 420
  },
  "jiwoo": {
    "kind": "message",
    "sender": "지우",
    "title": "지우와의 대화",
    "status": "받은 문장",
    "accent": "warm",
    "priority": "quiet",
    "revealMs": 300
  },
  "toJiwoo": {
    "kind": "message",
    "sender": "서인",
    "title": "지우와의 대화",
    "status": "보낸 문장",
    "accent": "warm",
    "priority": "quiet",
    "revealMs": 240
  },
  "doyun": {
    "kind": "message",
    "sender": "도윤",
    "title": "도윤과의 대화",
    "status": "받은 문장",
    "accent": "warm",
    "priority": "quiet",
    "revealMs": 340
  },
  "toDoyun": {
    "kind": "message",
    "sender": "서인",
    "title": "도윤과의 대화",
    "status": "보낸 문장",
    "accent": "warm",
    "priority": "quiet",
    "revealMs": 260
  },
  "mother": {
    "kind": "message",
    "sender": "어머니",
    "title": "어머니와의 대화",
    "status": "받은 문장",
    "accent": "warm",
    "priority": "focus",
    "revealMs": 360
  },
  "toMother": {
    "kind": "message",
    "sender": "서인",
    "title": "어머니와의 대화",
    "status": "보낸 문장",
    "accent": "warm",
    "priority": "quiet",
    "revealMs": 300
  },
  "motherDraft": {
    "kind": "message",
    "sender": "서인",
    "title": "어머니와의 대화",
    "status": "작성 중",
    "accent": "warm",
    "priority": "quiet",
    "revealMs": 300
  },
  "yeonwoo": {
    "kind": "message",
    "sender": "강연우",
    "title": "업무 연락",
    "status": "받은 문장",
    "accent": "ice",
    "priority": "quiet",
    "revealMs": 280
  },
  "toYeonwoo": {
    "kind": "message",
    "sender": "서인",
    "title": "업무 연락",
    "status": "보낸 문장",
    "accent": "ice",
    "priority": "quiet",
    "revealMs": 240
  },
  "hakyung": {
    "kind": "message",
    "sender": "하경",
    "title": "하경의 연락",
    "status": "받은 문장",
    "accent": "warm",
    "priority": "quiet",
    "revealMs": 320
  },
  "sunho": {
    "kind": "message",
    "sender": "박선호",
    "title": "약속",
    "status": "받은 문장",
    "accent": "ice",
    "priority": "quiet",
    "revealMs": 280
  },
  "toSunho": {
    "kind": "message",
    "sender": "서인",
    "title": "약속",
    "status": "보낸 문장",
    "accent": "ice",
    "priority": "quiet",
    "revealMs": 240
  },
  "taeseok": {
    "kind": "message",
    "sender": "태석",
    "title": "보안팀 연락",
    "status": "보낸 문장",
    "accent": "ice",
    "priority": "quiet",
    "revealMs": 240
  },
  "junior": {
    "kind": "message",
    "sender": "막내",
    "title": "보안팀 연락",
    "status": "받은 문장",
    "accent": "ice",
    "priority": "quiet",
    "revealMs": 280
  },
  "toSecurity": {
    "kind": "message",
    "sender": "서인",
    "title": "보안팀 연락",
    "status": "보낸 문장",
    "accent": "ice",
    "priority": "quiet",
    "revealMs": 240
  },
  "securityReply": {
    "kind": "message",
    "sender": "보안팀",
    "title": "보안팀 연락",
    "status": "받은 문장",
    "accent": "ice",
    "priority": "quiet",
    "revealMs": 280
  },
  "executive": {
    "kind": "message",
    "sender": "최고위 전략실",
    "title": "보고 요청",
    "status": "수신",
    "accent": "ice",
    "priority": "focus",
    "revealMs": 300
  },
  "transfer": {
    "kind": "message",
    "sender": "이관 담당",
    "title": "기록 이관",
    "status": "받은 문장",
    "accent": "ice",
    "priority": "quiet",
    "revealMs": 260
  },
  "group": {
    "kind": "message",
    "sender": "단체방",
    "title": "방에 남은 문장",
    "accent": "warm",
    "priority": "quiet",
    "revealMs": 220
  },
  "familyGroup": {
    "kind": "message",
    "sender": "같은 동 단체방",
    "title": "공유된 대화 화면",
    "accent": "warm",
    "priority": "quiet",
    "recall": true,
    "revealMs": 260
  },
  "patient": {
    "kind": "message",
    "sender": "보호자",
    "title": "의료 문의",
    "status": "받은 문장",
    "accent": "warm",
    "priority": "focus",
    "revealMs": 300
  },
  "haerin": {
    "kind": "message",
    "sender": "문해린",
    "title": "치료 예약 문의",
    "status": "받은 문장",
    "accent": "warm",
    "priority": "focus",
    "revealMs": 340
  },
  "yoonha": {
    "kind": "message",
    "sender": "백윤하",
    "title": "운영 책임자의 답변",
    "status": "보낸 문장",
    "accent": "ice",
    "priority": "focus",
    "revealMs": 300
  },
  "userRequest": {
    "kind": "message",
    "sender": "이용자",
    "title": "접수된 요청",
    "status": "접수 문장",
    "accent": "warm",
    "priority": "quiet",
    "recall": true,
    "revealMs": 280
  },
  "complaint": {
    "kind": "message",
    "sender": "이용자",
    "title": "접수된 문의",
    "status": "수신",
    "accent": "warm",
    "priority": "focus",
    "revealMs": 280
  },
  "anonymous": {
    "kind": "message",
    "sender": "익명",
    "title": "설명회 질문",
    "accent": "warm",
    "priority": "quiet",
    "revealMs": 260
  },
  "board": {
    "kind": "message",
    "sender": "직원 게시판",
    "title": "공개된 질문",
    "accent": "warm",
    "priority": "quiet",
    "revealMs": 220
  },
  "recordedConversation": {
    "kind": "message",
    "sender": "첨부된 대화",
    "title": "기록에 남은 문장",
    "accent": "warm",
    "priority": "quiet",
    "recall": true,
    "revealMs": 240
  },
  "daughter": {
    "kind": "message",
    "sender": "딸",
    "title": "집에서 온 문장",
    "status": "받은 문장",
    "accent": "warm",
    "priority": "quiet",
    "revealMs": 280
  },
  "eunkyeong": {
    "kind": "message",
    "sender": "은경",
    "title": "집에서 온 문장",
    "status": "보낸 문장",
    "accent": "warm",
    "priority": "quiet",
    "revealMs": 240
  },
  "motherToSeoin": {
    "kind": "message",
    "sender": "어머니",
    "title": "서인에게",
    "status": "보낸 문장",
    "accent": "warm",
    "priority": "quiet",
    "revealMs": 280
  },
  "toMigyeong": {
    "kind": "message",
    "sender": "어머니",
    "title": "정미경과의 대화",
    "status": "보낸 문장",
    "accent": "warm",
    "priority": "quiet",
    "revealMs": 240
  },
  "migyeong": {
    "kind": "message",
    "sender": "정미경",
    "title": "정미경과의 대화",
    "status": "받은 문장",
    "accent": "warm",
    "priority": "quiet",
    "revealMs": 280
  },
  "aiEvaluation": {
    "kind": "assistant",
    "sender": "평가 AI",
    "title": "인지 평가",
    "accent": "ice",
    "priority": "focus",
    "revealMs": 240
  },
  "aiCounterpart": {
    "kind": "assistant",
    "sender": "상대편 AI",
    "title": "조건 교환",
    "accent": "ice",
    "priority": "quiet",
    "revealMs": 220
  },
  "aiNegotiation": {
    "kind": "assistant",
    "sender": "업무 AI",
    "title": "조건 교환",
    "accent": "ice",
    "priority": "quiet",
    "revealMs": 220
  },
  "aiInterview": {
    "kind": "assistant",
    "sender": "면담 AI",
    "title": "퇴사 면담 기록",
    "accent": "ice",
    "priority": "quiet",
    "recall": true,
    "revealMs": 220
  },
  "aiSecurity": {
    "kind": "assistant",
    "sender": "보안 AI",
    "title": "가설 확인",
    "accent": "ice",
    "priority": "focus",
    "revealMs": 240
  },
  "shelf": {
    "kind": "assistant",
    "sender": "선반 스피커",
    "title": "구매 추천",
    "accent": "ice",
    "priority": "quiet",
    "revealMs": 220
  },
  "monoQuestion": {
    "kind": "assistant",
    "sender": "서인",
    "title": "모노에게",
    "status": "질문",
    "accent": "ice",
    "priority": "quiet",
    "revealMs": 180
  },
  "wallAd": {
    "kind": "broadcast",
    "sender": "벽면 패널",
    "title": "수면 광고",
    "accent": "amber",
    "priority": "quiet",
    "revealMs": 360
  },
  "streetAd": {
    "kind": "broadcast",
    "sender": "길가 광고",
    "title": "행복의 문장",
    "accent": "amber",
    "priority": "quiet",
    "revealMs": 360
  },
  "tunnelAd": {
    "kind": "broadcast",
    "sender": "터널 벽면 광고",
    "title": "먼저 아는 행복",
    "accent": "amber",
    "priority": "quiet",
    "revealMs": 320
  },
  "news": {
    "kind": "broadcast",
    "sender": "뉴스",
    "title": "공개 소식",
    "accent": "amber",
    "priority": "quiet",
    "revealMs": 320
  },
  "notice": {
    "kind": "broadcast",
    "sender": "공지",
    "title": "공개된 안내",
    "accent": "amber",
    "priority": "quiet",
    "revealMs": 300
  },
  "adDream": {
    "kind": "neural",
    "sender": "광고꿈",
    "title": "소중한 사람과 떠나는 휴양지",
    "accent": "violet",
    "priority": "focus",
    "revealMs": 520
  },
  "adOverlay": {
    "kind": "neural",
    "sender": "광고꿈",
    "title": "파도 위의 문장",
    "accent": "violet",
    "priority": "focus",
    "revealMs": 480
  },
  "scan": {
    "kind": "neural",
    "sender": "",
    "title": "감각의 문",
    "accent": "violet",
    "priority": "focus",
    "revealMs": 520
  },
  "memory": {
    "kind": "neural",
    "sender": "",
    "title": "떠오른 방",
    "accent": "violet",
    "priority": "focus",
    "revealMs": 560
  },
  "tower": {
    "kind": "neural",
    "sender": "",
    "title": "구조",
    "accent": "violet",
    "priority": "focus",
    "revealMs": 360
  },
  "evaluation": {
    "kind": "system",
    "sender": "검증 화면",
    "title": "진행 중인 검증",
    "accent": "ice",
    "priority": "quiet",
    "revealMs": 200
  }
};

// [zero-based beat index, exact authored text, presentation preset, sparse overrides]
const AUTHORED = {
  "1": [
    [
      6,
      "수면 7시간 11분.  \n신체 회복률 98.2%.  \n광고 적합도 94.8%.  \n감정 만족도 91.6%.  \n정산 예정 +12.4 TOKEN.",
      "sleepReport"
    ],
    [
      19,
      "“모노.”",
      "monoQuestion"
    ],
    [
      21,
      "“나 바다 좋아해?”",
      "monoQuestion"
    ],
    [
      25,
      "“내가 좋아하냐고.”",
      "monoQuestion"
    ],
    [
      35,
      "오늘도 좋은 꿈 꾸셨나요?",
      "wallAd"
    ],
    [
      37,
      "당신의 수면이 당신의 내일을 만듭니다.",
      "wallAd"
    ],
    [
      60,
      "현재 잔여 143.8 TOKEN.",
      "payment"
    ],
    [
      76,
      "기본 광고 +8.1. 감정 몰입 보너스 +3.4. 육아 타깃 보너스 +2.0.",
      "payment"
    ],
    [
      91,
      "쇼핑 88%. 영화 81%. 게임 76%.",
      "work"
    ],
    [
      117,
      "퇴직 의사 확인서.",
      "work",
      {
        "title": "퇴직 의사 확인서",
        "sender": "지우의 업무 화면"
      }
    ],
    [
      124,
      "퇴직 시 향후 24개월 예상 소득 안정성 -31.2%.  \n가족 연계 의료 플랜 비용 +14.8%.  \n주거 신용등급 하락 가능성 22.1%.  \n재고를 권장합니다.",
      "work",
      {
        "title": "퇴직 시 불이익",
        "sender": "지우의 퇴직 확인창"
      }
    ],
    [
      198,
      "오늘 밤 예상 수익 +12.1 TOKEN.",
      "sleep"
    ],
    [
      201,
      "프리미엄 감정 패키지 적용 시 ‘그리움’과 ‘해방감’을 더욱 선명하게 경험할 수 있습니다.",
      "sleep"
    ],
    [
      207,
      "“모노.”",
      "monoQuestion"
    ],
    [
      209,
      "“나 어렸을 때 뭐가 되고 싶었지?”",
      "monoQuestion"
    ],
    [
      213,
      "“내가 되고 싶었던 거.”",
      "monoQuestion"
    ],
    [
      218,
      "“내 기록인데?”",
      "monoQuestion"
    ],
    [
      220,
      "“내가 원했던 건 행동 데이터가 없으면 없어지는 거야?”",
      "monoQuestion"
    ],
    [
      224,
      "“광고 없이 자면 어떻게 돼?”",
      "monoQuestion"
    ],
    [
      227,
      "“그게 전부야?”",
      "monoQuestion"
    ],
    [
      229,
      "“꿈은?”",
      "monoQuestion"
    ],
    [
      231,
      "“내 꿈은?”",
      "monoQuestion"
    ],
    [
      247,
      "광고 없는 수면을 선택하시겠습니까?",
      "choice"
    ],
    [
      249,
      "선택은 언제나 자유입니다.",
      "choice"
    ]
  ],
  "2": [
    [
      8,
      "수면 6시간 49분.  \n신체 회복률 97.9%.  \n감정 만족도 61.3%.  \n광고 수익 +0 TOKEN.",
      "sleepReport"
    ],
    [
      83,
      "오늘 시간 돼?",
      "jiwoo",
      {
        "sender": "",
        "title": "도착한 메시지",
        "status": "수신"
      }
    ],
    [
      97,
      "지우 광고꿈 중단: 월 -327 TOKEN.  \n퇴직 후 예상 소득: -43%.  \n가족 의료 플랜 갱신 비용: +16%.  \n차녀 교육 AI 등급 유지 가능성: 38%.",
      "work"
    ],
    [
      232,
      "바다가 펼쳐졌다.",
      "adDream"
    ],
    [
      233,
      "이번에는 지우가 옆에 있었다.",
      "adDream"
    ],
    [
      235,
      "꿈속 지우는 현실의 지우보다 밝았다.",
      "adDream"
    ],
    [
      238,
      "지우가 바닷물에 발을 담그며 말했다.",
      "adDream"
    ],
    [
      239,
      "“여기선 아무도 다치지 않아.”",
      "adDream"
    ],
    [
      245,
      "꿈속 지우가 웃었다.",
      "adDream"
    ],
    [
      247,
      "원하는 것을 찾느라 인생을 낭비하지 마세요.",
      "adOverlay"
    ],
    [
      248,
      "하늘이 더 파래졌다.",
      "adDream"
    ],
    [
      249,
      "이미 행복하다면, 그것으로 충분합니다.",
      "adOverlay"
    ],
    [
      253,
      "파도의 높이도.",
      "adDream",
      {
        "sense": [
          {
            "label": "움직임",
            "value": "파도의 높이"
          }
        ]
      }
    ],
    [
      254,
      "햇빛의 온도도.",
      "adDream",
      {
        "sense": [
          {
            "label": "온도",
            "value": "햇빛의 온도"
          }
        ]
      }
    ],
    [
      255,
      "지우의 웃음도.",
      "adDream"
    ],
    [
      256,
      "자신이 느끼는 안도감까지.",
      "adDream",
      {
        "sense": [
          {
            "label": "감정",
            "value": "안도감"
          }
        ]
      }
    ],
    [
      264,
      "중도 종료 시 수익이 차감됩니다. 계속하시겠습니까?",
      "choice"
    ],
    [
      269,
      "광고 중도 종료.  \n정산 -4.2 TOKEN.  \n감정 안정화를 위해 잔여 콘텐츠 재생을 권장합니다.",
      "alert"
    ],
    [
      280,
      "나 꿈꿨어.",
      "jiwoo"
    ],
    [
      283,
      "근데 하나도 안 행복해.",
      "jiwoo"
    ],
    [
      285,
      "이상하게 좋다.",
      "jiwoo"
    ]
  ],
  "3": [
    [
      111,
      "수면 광고 수익 재개 예정.",
      "sleep"
    ],
    [
      240,
      "오늘의 피로를 꿈에서 보상받으세요.",
      "streetAd"
    ],
    [
      241,
      "실패 없는 여행. 후회 없는 사랑.",
      "streetAd"
    ],
    [
      242,
      "당신이 원하는 행복을 이미 알고 있습니다.",
      "streetAd"
    ],
    [
      260,
      "가족과 함께하는 완벽한 하루. 예상 만족도 96.1%.",
      "sleep"
    ],
    [
      262,
      "예상 수익 12.7 TOKEN을 포기하시겠습니까?",
      "choice"
    ],
    [
      264,
      "감정 만족도가 낮아질 수 있습니다.",
      "choice"
    ],
    [
      266,
      "계속하시겠습니까?",
      "choice"
    ]
  ],
  "4": [
    [
      8,
      "발화 속도 7% 증가. 방어적 태도 가능성 62%.",
      "work"
    ],
    [
      9,
      "계약 수용 확률 71.4%.",
      "work"
    ],
    [
      30,
      "실패할 자유보다, 실패하지 않을 삶을.",
      "notice"
    ],
    [
      50,
      "“데이터 사용 범위 3.2퍼센트 확대를 요청합니다.”",
      "aiNegotiation"
    ],
    [
      53,
      "“대신 모델 학습권을 1.1퍼센트 제한하겠습니다.”",
      "aiNegotiation"
    ],
    [
      93,
      "데이터 책임 소재 조항 수정 요청.",
      "work"
    ],
    [
      107,
      "분석 경로 14,221.",
      "work"
    ],
    [
      108,
      "83,440.",
      "work"
    ],
    [
      109,
      "1,102,781.",
      "work"
    ],
    [
      111,
      "추가 연산 자원 요청.",
      "work"
    ],
    [
      115,
      "분석 경로 8,204,119,441.",
      "work"
    ],
    [
      176,
      "변호사 도착. 10:30.",
      "externalOffer",
      {
        "sender": "",
        "title": "상대 대표의 수신 문장",
        "status": "수신"
      }
    ],
    [
      213,
      "권장 대응: 수정 조항 부분 수용. 계약 성사 예상 76.4%.",
      "work"
    ],
    [
      234,
      "사용자 서인. 해당 판단 시점 외부 모델 호출 기록 없음.",
      "work"
    ],
    [
      238,
      "확인 불가. 추론 결과의 복잡도를 역산할 경우 동등 예측을 위한 예상 연산비용 41,200 TOKEN 이상.",
      "work"
    ],
    [
      251,
      "너 비밀 AI 있다며?",
      "jiwoo"
    ],
    [
      253,
      "나도 오늘 처음 들음.",
      "toJiwoo"
    ],
    [
      255,
      "나한테만 모델명 알려줘. 회사 때려치울 때 훔쳐가게.",
      "jiwoo"
    ],
    [
      338,
      "생각보다 오래 걸렸네.",
      "unknown"
    ],
    [
      341,
      "오늘 회의. 7초.",
      "unknown"
    ],
    [
      344,
      "그때 모델은 아직 계산 중이었죠.",
      "unknown"
    ],
    [
      355,
      "비밀 AI가 없다는 걸 믿어 줄 사람이 필요하지 않습니까?",
      "unknown"
    ],
    [
      368,
      "오늘 회의. 7초.",
      "unknown",
      {
        "recall": true
      }
    ],
    [
      377,
      "예상 연산비용 41,200 TOKEN 이상.",
      "work"
    ]
  ],
  "5": [
    [
      164,
      "장기 이용 중단 시 비상업적 자발 영상 및 감정 서사가 증가할 수 있습니다.",
      "transaction"
    ],
    [
      356,
      "당신이 원하는 것을, 당신보다 먼저.",
      "tunnelAd"
    ],
    [
      360,
      "컵라면 값 3.4 TOKEN.",
      "doyun"
    ],
    [
      363,
      "농담. 다음엔 네가 사.",
      "doyun"
    ],
    [
      366,
      "다음엔 실험 하나 보자. 광고를 꺼도 토큰을 잃지 않게 하는 거.",
      "doyun"
    ]
  ],
  "6": [
    [
      30,
      "광고 없는 90일.",
      "notice"
    ],
    [
      32,
      "잃는 토큰 전액 보전. 의료·주거·교육 등급 손실 보전. 중도 종료 자유. 재가입 자유.",
      "notice"
    ],
    [
      48,
      "예상 참여자 240명.",
      "work"
    ],
    [
      49,
      "90일 예상 비용 1,842,000 TOKEN.",
      "work"
    ],
    [
      129,
      "참가자 031 — 자다가 웃으며 깸. 이유 기억 못 함.",
      "work"
    ],
    [
      130,
      "참가자 104 — 갑자기 새벽에 피아노를 치고 싶어짐. 연주 경험 없음.",
      "work"
    ],
    [
      170,
      "회복 성공 사례 01.",
      "work"
    ],
    [
      225,
      "광고꿈 재가입 희망: 147명.",
      "work"
    ],
    [
      236,
      "재가입.",
      "sleep"
    ],
    [
      237,
      "재가입.",
      "sleep"
    ],
    [
      238,
      "재가입.",
      "sleep"
    ],
    [
      320,
      "돌아오신 것을 환영합니다.",
      "sleep"
    ],
    [
      321,
      "선호 감정 데이터를 복원하시겠습니까?",
      "sleep"
    ],
    [
      322,
      "90일 공백 기간을 반영한 새로운 행복 패키지를 추천해 드립니다.",
      "sleep"
    ]
  ],
  "7": [
    [
      41,
      "가족과 현재 생활 유지.",
      "userRequest",
      {
        "sender": "한미라",
        "title": "참가자 기록"
      }
    ],
    [
      122,
      "살아 있음?",
      "jiwoo"
    ],
    [
      124,
      "왜.",
      "toJiwoo"
    ],
    [
      125,
      "회사에서 너 실종 신고할 분위기.",
      "jiwoo"
    ],
    [
      126,
      "휴가 냈잖아.",
      "toJiwoo"
    ],
    [
      127,
      "휴가 내고 회사 채팅 하루 0회면 실종 맞음.",
      "jiwoo"
    ]
  ],
  "8": [
    [
      1,
      "ARKADIA PRIVATE STRATEGY SESSION",
      "invitation"
    ],
    [
      2,
      "참석자: 서인",
      "invitation"
    ],
    [
      3,
      "참석 구분: 관찰 및 의견 제출. 의결권 없음.",
      "invitation"
    ],
    [
      15,
      "상층 진입 · 상위 보안망 연결.",
      "permission"
    ],
    [
      16,
      "임시 연산 자원이 할당되었습니다. 현재 사용량 기준 비용 제한 없음.",
      "permission"
    ],
    [
      20,
      "응답: 선택지 6개 · 추천 37층 S-3 · 만족도 예상 91.8%.",
      "transaction"
    ],
    [
      33,
      "가설 E / 인간 단독 판단. 우선순위: 최하.",
      "security"
    ],
    [
      39,
      "외부 발송 · 19:52 · 동부운송 인수 원안 및 부속 조건 일체.",
      "security"
    ],
    [
      40,
      "수신: 경쟁사 측 외부 주소.",
      "security"
    ],
    [
      41,
      "비고: 경쟁사 측 조건 재검토 요청 접수. 원안 폐기 가능성 발생.",
      "security"
    ],
    [
      51,
      "발신 확인 요망.",
      "externalOffer",
      {
        "sender": "보좌관",
        "title": "회의 의장에게",
        "status": "작성 중"
      }
    ],
    [
      53,
      "회의 의장.",
      "externalOffer",
      {
        "sender": "회의 의장",
        "title": "착신"
      }
    ],
    [
      68,
      "발신자 · 접속 중 · 재열람: 내일 전략 회의 참석자 명단.",
      "security"
    ],
    [
      69,
      "첫 열람 18:47.",
      "security"
    ],
    [
      89,
      "부속 자료 4 · 동부거점 공동돌봄실 운영 현황.",
      "security"
    ],
    [
      93,
      "상층 객실 402 · 조명 꺼짐 · 수면 메뉴 선택 없음.",
      "security"
    ]
  ],
  "9": [
    [
      203,
      "특별 인지 평가 제안.",
      "workplaceInvite",
      {
        "sender": "최고위 전략실",
        "title": "평가 제안"
      }
    ]
  ],
  "10": [
    [
      25,
      "오답.",
      "security"
    ],
    [
      27,
      "오답.",
      "security"
    ],
    [
      29,
      "“계속하시겠습니까?”",
      "aiEvaluation"
    ],
    [
      32,
      "“요청할 수 있습니다.”",
      "aiEvaluation"
    ],
    [
      38,
      "“하나만 선택하십시오.”",
      "aiEvaluation"
    ],
    [
      40,
      "“평가 규칙상 하나만—”",
      "aiEvaluation"
    ],
    [
      61,
      "AI 비의존 추론 적합도: 측정 상한 초과.",
      "medical"
    ],
    [
      62,
      "고위 전략직 전환 후보 · 30일 잠정.",
      "medical"
    ],
    [
      64,
      "극단 신경 스캔 및 인지 확장 프로그램.",
      "medical"
    ],
    [
      116,
      "고위 전략직 전환 후보 · 30일 잠정.",
      "medical"
    ],
    [
      129,
      "극단 신경 스캔.",
      "medical"
    ],
    [
      130,
      "성격 반응 조정.",
      "medical"
    ],
    [
      131,
      "인지 부하 한계 측정.",
      "medical"
    ],
    [
      132,
      "기억 접근 경로 재구성 가능.",
      "medical"
    ],
    [
      133,
      "정서 반응 변화 가능.",
      "medical"
    ],
    [
      134,
      "영구적 후유증 또는 사망 가능.",
      "medical"
    ],
    [
      277,
      "고위 전략직 전환 후보 · 30일 잠정.",
      "medical"
    ],
    [
      293,
      "본인은 모든 위험을 이해했으며 자발적으로 동의합니다.",
      "transaction"
    ],
    [
      303,
      "시술 동의는 본인에게만 적용된다. 타인의 수면 선택을 변경하거나 중단할 권한은 포함하지 않는다.",
      "transaction"
    ],
    [
      318,
      "추가 조건 접수. 담당 의료진 확인 완료.",
      "transaction"
    ],
    [
      322,
      "동의가 완료되었습니다.",
      "transaction"
    ]
  ],
  "11": [
    [
      0,
      "처음 열린 문은 냄새였다.",
      "scan"
    ],
    [
      1,
      "어머니가 굽던 합성 달걀. 공방의 젖은 흙. 옥상에서 받은 식은 소금빵.",
      "scan",
      {
        "sense": [
          {
            "label": "후각",
            "value": "합성 달걀 · 젖은 흙 · 식은 소금빵"
          }
        ]
      }
    ],
    [
      2,
      "냄새 다음에는 얼굴이 왔다.",
      "scan"
    ],
    [
      3,
      "윤 대리의 친절한 웃음. 아이 운동화 끈을 묶던 미라의 손.",
      "scan",
      {
        "sense": [
          {
            "label": "얼굴",
            "value": "윤 대리 · 미라"
          }
        ]
      }
    ],
    [
      4,
      "서인이 한 번이라도 다시 봤던 얼굴들이 순서 없이 쏟아졌다.",
      "scan"
    ],
    [
      8,
      "신경 지도 작성 12%.  \n반응 지연 측정을 시작합니다.",
      "medical"
    ],
    [
      12,
      "0.41초.",
      "medical"
    ],
    [
      15,
      "0.38초.",
      "medical"
    ],
    [
      18,
      "0.63초.",
      "medical"
    ],
    [
      21,
      "0.52초.",
      "medical"
    ],
    [
      26,
      "1.92초.",
      "medical"
    ],
    [
      40,
      "성격 반응 조정 1단계.  \n대상: 판단 전 재확인 행동.",
      "medical"
    ],
    [
      47,
      "재측정.",
      "medical"
    ],
    [
      50,
      "0.21초.",
      "medical"
    ],
    [
      55,
      "1.92초.",
      "medical"
    ],
    [
      63,
      "피험자 의사 확인 절차.  \n계속을 원하면 오른손을 쥐십시오.",
      "medicalAlert"
    ],
    [
      70,
      "동의 신호 확인.",
      "medicalAlert"
    ],
    [
      73,
      "어둠 속에서 방 하나가 떠올랐다.",
      "memory"
    ],
    [
      74,
      "벽지에 크레파스로 그린 비행기가 있었다. 날개 한쪽이 짧았다.",
      "memory"
    ],
    [
      75,
      "크레파스의 기름 냄새가 났다.",
      "memory",
      {
        "sense": [
          {
            "label": "후각",
            "value": "크레파스의 기름 냄새"
          }
        ]
      }
    ],
    [
      76,
      "작은 손이 그 위에 선을 하나 더 그었다.",
      "memory"
    ],
    [
      77,
      "누군가 아이의 뒤에서 다정하게 말했다. 이게 네 꿈이야.",
      "memory",
      {
        "sense": [
          {
            "label": "목소리",
            "value": "이게 네 꿈이야."
          }
        ]
      }
    ],
    [
      78,
      "아이가 물었다.",
      "memory"
    ],
    [
      79,
      "“이거 내가 그렸어?”",
      "memory"
    ],
    [
      80,
      "대답은 들리지 않았다.",
      "memory"
    ],
    [
      81,
      "서인은 그 방에 가 본 적이 없었다.",
      "memory"
    ],
    [
      82,
      "그 목소리도 몰랐다.",
      "memory"
    ],
    [
      83,
      "그런데 그 장면은 자기 기억처럼 선명했다.",
      "memory"
    ],
    [
      84,
      "그리고 모든 문이 한꺼번에 닫혔다.",
      "memory"
    ],
    [
      197,
      "고강도 감정형 +4.0.",
      "sleep"
    ],
    [
      220,
      "살아 있음? 2탄.",
      "jiwoo"
    ],
    [
      222,
      "응. 잘 지내고 있어. 연락 못 해서 미안. 토요일 수업 잘 다녀오고, 다음 주에 점심 먹자.",
      "toJiwoo"
    ],
    [
      224,
      "누구세요.",
      "jiwoo"
    ],
    [
      225,
      "모노가 대신 쳤냐?",
      "jiwoo"
    ],
    [
      246,
      "오늘 밤 예상 수익 +12.3 TOKEN.",
      "sleep"
    ],
    [
      248,
      "광고 없는 수면을 선택하시겠습니까?  \n선택은 언제나 자유입니다.",
      "sleep"
    ],
    [
      253,
      "알림: 고위 전략직 전환 면담까지 9시간 8분.",
      "work",
      {
        "sender": "인터페이스",
        "title": "면담 알림"
      }
    ]
  ],
  "12": [
    [
      2,
      "신경 서명 불일치.",
      "security"
    ],
    [
      3,
      "등록 사용자와의 일치율 71.4%.",
      "security"
    ],
    [
      10,
      "구두 재인증 이력 확인.",
      "security"
    ],
    [
      36,
      "ARKADIA STRATEGY / 총괄 의사결정실",
      "work"
    ],
    [
      96,
      "경쟁사 선행 계약 체결.",
      "work"
    ],
    [
      97,
      "예상 손실: 2.8%.",
      "work"
    ],
    [
      98,
      "대응 경로 생성 중.",
      "work"
    ],
    [
      153,
      "의사결정 합의 완료.",
      "work"
    ],
    [
      188,
      "위험도 최상위: 7번 사업부.",
      "work"
    ],
    [
      189,
      "신뢰도 62.8%. 추가 데이터 권장.",
      "work"
    ],
    [
      217,
      "고위 전략직 전환 / 30일 잠정 배치",
      "work"
    ],
    [
      218,
      "전략 연산 한도: 제한 없음",
      "work"
    ],
    [
      219,
      "기밀 접근 등급: 4",
      "work"
    ],
    [
      220,
      "추론 출처: 미확인 / 외부 호출: 없음",
      "work"
    ],
    [
      259,
      "전환 계약이 체결되었습니다.",
      "permission"
    ],
    [
      260,
      "전략 연산 한도: ∞",
      "permission"
    ],
    [
      261,
      "등급 4 접근 권한을 활성화합니다.",
      "permission"
    ]
  ],
  "13": [
    [
      2,
      "하층 운영직 자발 퇴사율 상승.",
      "monitor"
    ],
    [
      3,
      "최근 8주 평균 대비 +17.6%.",
      "monitor"
    ],
    [
      4,
      "권고: 보상 패키지 재설계.",
      "monitor"
    ],
    [
      19,
      "A. 야간 광고꿈 정산 보너스 +8%.",
      "monitor"
    ],
    [
      20,
      "B. 개인 AI 연산 보조 한도 +12%.",
      "monitor"
    ],
    [
      21,
      "C. 장기근속 승급 경로 우선 배정.",
      "monitor"
    ],
    [
      103,
      "비구조화 시간과 이탈률 상관 분석.",
      "monitor"
    ],
    [
      104,
      "신뢰도 낮음. 자료 부족.",
      "monitor"
    ],
    [
      118,
      "공백 시간 시범 운영.",
      "monitor"
    ],
    [
      134,
      "재무 효과 신뢰도 54.1%.",
      "monitor"
    ],
    [
      151,
      "공백 시간 활용 권고를 제공할까요?",
      "aiNegotiation",
      {
        "title": "공백 시간 활용 권고"
      }
    ],
    [
      180,
      "공백 시간: 추천 없음.",
      "monitor"
    ],
    [
      202,
      "시범 운영 승인.",
      "monitor"
    ],
    [
      203,
      "적용 인원 318명.",
      "monitor"
    ],
    [
      204,
      "첫 공백 시간은 개인 일정과 충돌하지 않는 범위에서 자동 배정됩니다.",
      "monitor"
    ],
    [
      209,
      "야.",
      "jiwoo"
    ],
    [
      215,
      "이거 뭐냐. 회사 오류남?",
      "jiwoo"
    ],
    [
      217,
      "시범 제도래.",
      "toJiwoo"
    ],
    [
      218,
      "너 알아?",
      "jiwoo"
    ],
    [
      219,
      "조금.",
      "toJiwoo"
    ],
    [
      221,
      "개좋은데?",
      "jiwoo"
    ],
    [
      223,
      "뭐 할 건데.",
      "toJiwoo"
    ],
    [
      225,
      "몰라.",
      "jiwoo"
    ],
    [
      227,
      "일단 안 정할 건데.",
      "jiwoo"
    ],
    [
      232,
      "시범 운영 참가자 사전 만족도 +11.2%.",
      "monitor"
    ],
    [
      233,
      "예상 퇴사 의향 -8.7%.",
      "monitor"
    ],
    [
      235,
      "예상 퇴사 의향 -8.7%.",
      "monitor"
    ]
  ],
  "14": [
    [
      2,
      "기밀 문서 외부 노출 감지.",
      "security"
    ],
    [
      3,
      "등급 4 전략 자료 / 열람자 11명.",
      "security"
    ],
    [
      4,
      "진행 중 계약 가격 상한 포함.",
      "security"
    ],
    [
      5,
      "외부 자동 수집 예상까지 27분.",
      "security"
    ],
    [
      21,
      "직접 유출 경로 확인 불가.",
      "security"
    ],
    [
      22,
      "내부자 행위 가능성 68.4%.",
      "security"
    ],
    [
      30,
      "25분 41초.",
      "security"
    ],
    [
      79,
      "접근 권한 임시 정지.",
      "security"
    ],
    [
      80,
      "개인 채널 포렌식 진행.",
      "security"
    ],
    [
      92,
      "18분 09초.",
      "security"
    ],
    [
      97,
      "외부 노출량 +7.2%.",
      "security"
    ],
    [
      100,
      "외부 노출량 +11.8%.",
      "security"
    ],
    [
      104,
      "16분 44초.",
      "security"
    ],
    [
      122,
      "12분 31초.",
      "security"
    ],
    [
      139,
      "인간 행위 가설을 제외합니까?",
      "aiSecurity"
    ],
    [
      141,
      "비인간 전송 경로 재분석.",
      "security"
    ],
    [
      154,
      "분류 규칙 충돌 확인.",
      "security"
    ],
    [
      155,
      "외부 감사 미러 자동 복제 중.",
      "security"
    ],
    [
      158,
      "미러 중단.",
      "security"
    ],
    [
      159,
      "외부 노출 차단 완료.",
      "security"
    ],
    [
      161,
      "04분 06초.",
      "security"
    ],
    [
      165,
      "계약 가격 상한 일부 수집 확인.",
      "security"
    ],
    [
      166,
      "경쟁사 크롤러 접근 2건.",
      "security"
    ],
    [
      167,
      "예상 협상 비용 증가: 6.3%.",
      "security"
    ],
    [
      175,
      "상대 측 수정 제안 도착.",
      "work"
    ],
    [
      176,
      "응답 제한: 07분 00초.",
      "work"
    ],
    [
      199,
      "05분 18초.",
      "work"
    ],
    [
      242,
      "A. 수정안 수용 / 비용 증가 4.8%.",
      "work"
    ],
    [
      243,
      "B. 물량 40% 축소 / 대체 공급처 재탐색.",
      "work"
    ],
    [
      244,
      "C. 계약 철회 / 단기 운영 차질 위험 17.2%.",
      "work"
    ],
    [
      266,
      "01분 23초.",
      "work"
    ],
    [
      271,
      "00분 51초.",
      "work"
    ],
    [
      273,
      "물량 40% 축소 확정.",
      "work"
    ],
    [
      274,
      "예상 추가 비용: +2.1%.",
      "work"
    ],
    [
      275,
      "대체 공급처 탐색 시작.",
      "work"
    ]
  ],
  "15": [
    [
      35,
      "복귀 가능 시점만 알려 주세요.",
      "yeonwoo"
    ],
    [
      37,
      "인지 피로 회복 확인 필요.",
      "medical",
      {
        "sender": "회사 의료팀",
        "title": "복귀 확인"
      }
    ],
    [
      39,
      "보안팀이 아직 당신 뒤에 있는 걸 못 찾았대요.",
      "yeonwoo"
    ],
    [
      41,
      "제 뒤에 아무것도 없는데요.",
      "toYeonwoo"
    ],
    [
      43,
      "그래서 더 난리예요.",
      "yeonwoo"
    ],
    [
      45,
      "뭐라고 했는데요.",
      "toYeonwoo"
    ],
    [
      46,
      "회복 중이라고 했어요.",
      "yeonwoo"
    ],
    [
      47,
      "그랬더니 외부 평가 쪽에서 ‘재훈련’이라고 적었어요.",
      "yeonwoo"
    ],
    [
      48,
      "왜요.",
      "toYeonwoo"
    ],
    [
      50,
      "사람이 과부하로 쓰러졌다는 설명보다, 미확인 시스템이 업데이트 중이라는 설명이 그쪽 문서에는 더 잘 들어가나 봐요.",
      "yeonwoo"
    ],
    [
      52,
      "보안팀 결론은 아직 ‘추론 출처 미확정’이에요.",
      "yeonwoo"
    ],
    [
      99,
      "사용자 확인.",
      "permission"
    ],
    [
      100,
      "고위 전략직 잠정 배치.",
      "permission"
    ],
    [
      101,
      "복귀를 환영합니다.",
      "permission"
    ],
    [
      124,
      "잠깐 볼 수 있을까요.",
      "toSunho"
    ],
    [
      126,
      "12층 휴게실.",
      "sunho"
    ],
    [
      243,
      "최근 90일 배송 취소 기록.",
      "security"
    ],
    [
      244,
      "2번 업체 / 남부 7구역 취소율 18.4%.",
      "security"
    ],
    [
      245,
      "타 지역 평균 2.1%.",
      "security"
    ],
    [
      273,
      "의사결정 정확도: 유효.",
      "security"
    ],
    [
      274,
      "추가 데이터 요구 횟수: 1.",
      "security"
    ],
    [
      275,
      "즉시 추론 비율: 이전 대비 감소.",
      "security"
    ],
    [
      277,
      "과신 억제 성능 향상 가능성.",
      "security"
    ],
    [
      278,
      "주석: 추론 주체 및 연산 출처 미확정.",
      "security"
    ],
    [
      290,
      "중앙 전략망 제한 열람 권한.",
      "permission"
    ],
    [
      291,
      "사유: 고신뢰 비정형 추론 지원.",
      "permission"
    ],
    [
      305,
      "권한 부여: 중앙 전략망 제한 열람.",
      "permission"
    ],
    [
      312,
      "고신뢰 비정형 추론 지원.",
      "permission"
    ]
  ],
  "16": [
    [
      4,
      "연속 열람 한도: 40분.",
      "medical"
    ],
    [
      17,
      "실시간 전략 연산 사용량: 18,440,000 TOKEN.",
      "work"
    ],
    [
      18,
      "예상 종료까지: 미정.",
      "work"
    ],
    [
      39,
      "18,891,000 TOKEN.",
      "work"
    ],
    [
      45,
      "3차 입찰: -2.4%.",
      "work"
    ],
    [
      46,
      "배송 보증: +6.0%.",
      "work"
    ],
    [
      47,
      "예상 계약 성공률: 61.8%.",
      "work"
    ],
    [
      58,
      "세르젠 / 최근 12개월 대형 계약 4건.",
      "work"
    ],
    [
      59,
      "이 중 3건 수익성 악화.",
      "work"
    ],
    [
      60,
      "대표이사 연임 심사: 19일 후.",
      "work"
    ],
    [
      109,
      "세르젠의 의도적 패배 가설: 근거 부족.",
      "work"
    ],
    [
      110,
      "계약 획득 시 기대 기업가치 상승.",
      "work"
    ],
    [
      111,
      "입찰 중단의 합리성 낮음.",
      "work"
    ],
    [
      132,
      "연속 열람: 22분.",
      "medical"
    ],
    [
      144,
      "D. 현 조건 유지.",
      "work"
    ],
    [
      145,
      "근거: 세르젠의 추가 인하 가능성.",
      "work"
    ],
    [
      146,
      "추가 인하 이후 행동: 불명.",
      "work"
    ],
    [
      185,
      "세르젠 4차 조건 변경.",
      "work"
    ],
    [
      186,
      "가격: -3.1%.",
      "work"
    ],
    [
      187,
      "배송 보증: +7.5%.",
      "work"
    ],
    [
      202,
      "연속 열람: 24분.",
      "medical"
    ],
    [
      214,
      "예상 대비 연산 절감: 7,880,000 TOKEN.",
      "work"
    ],
    [
      215,
      "계약 마진: 기준안 대비 +1.7%.",
      "work"
    ],
    [
      239,
      "마지막 기록: 36분 40초. 한도 안.",
      "medical"
    ],
    [
      241,
      "오늘은 눕지 않아도 돼.",
      "hakyung"
    ],
    [
      244,
      "비정형 추론 기여도: 높음.",
      "work"
    ],
    [
      245,
      "서인 참여 전략 요청 6건.",
      "work"
    ],
    [
      246,
      "공동 세션 초대 3건.",
      "work"
    ],
    [
      247,
      "추론 출처 공동 검증 제안 2건.",
      "work"
    ],
    [
      254,
      "서인 참여 공동 전략 세션 협의 요청.",
      "externalOffer"
    ],
    [
      256,
      "미확인 추론 경로 공동 검증 제안.",
      "externalOffer"
    ],
    [
      259,
      "추론 주체와 무관하게 원하는 조건을 제시하십시오.",
      "externalOffer"
    ],
    [
      272,
      "개인 비정형 판단 자문 계약 문의.",
      "externalOffer"
    ],
    [
      285,
      "상층에서 나를 사고 싶대요.",
      "toDoyun"
    ],
    [
      287,
      "얼마.",
      "doyun"
    ],
    [
      288,
      "아직 안 물어봤어요.",
      "toDoyun"
    ],
    [
      289,
      "혁명가 실격.",
      "doyun"
    ],
    [
      291,
      "뭘 팔아야 할지 몰라서요.",
      "toDoyun"
    ],
    [
      293,
      "그럼 팔지 마.",
      "doyun"
    ],
    [
      300,
      "추론 출처 미확인 / 조건 협의 가능.",
      "externalOffer"
    ]
  ],
  "17": [
    [
      5,
      "외부 전략 요청: 6건.",
      "permission"
    ],
    [
      6,
      "공동 세션 후보: 3건.",
      "permission"
    ],
    [
      7,
      "추론 출처 검증 제안: 2건.",
      "permission"
    ],
    [
      15,
      "병원에서 연락이 왔어. 빈자리가 났대. 추가 항목이 비싸서 그렇지. 안 해도 돼.",
      "mother"
    ],
    [
      22,
      "서인 참여 전략 세션.",
      "externalOffer"
    ],
    [
      23,
      "추론 출처가 별도 시스템으로 확인될 경우 우선 협상권 포함.",
      "externalOffer"
    ],
    [
      25,
      "회신 기한: 오늘 18:00.",
      "externalOffer"
    ],
    [
      30,
      "추론 경로 공동 검증.",
      "externalOffer"
    ],
    [
      31,
      "외부 호출 여부 측정.",
      "externalOffer"
    ],
    [
      32,
      "입출력 지연 및 판단 로그 감사.",
      "externalOffer"
    ],
    [
      33,
      "신경 인터페이스 보조 여부 검토.",
      "externalOffer"
    ],
    [
      43,
      "연합 전략망 공동 세션 게스트 권한 제공 가능.",
      "externalOffer"
    ],
    [
      129,
      "예외 승인: 현장 책임자 수동 전환 가능.",
      "permission"
    ],
    [
      173,
      "관찰 결과: 불완전 정보에서 결론 유보.",
      "permission"
    ],
    [
      174,
      "추론 주체: 서인 본인 가능성 상향 / 외부 보조 가설 미배제.",
      "permission"
    ],
    [
      175,
      "행동 특성 신뢰도: 높음.",
      "permission"
    ],
    [
      191,
      "공동 세션 열람: 허용.",
      "permission"
    ],
    [
      192,
      "참여 기업 의사결정 요약: 허용.",
      "permission"
    ],
    [
      193,
      "원본 전략 데이터: 요청 시 심사.",
      "permission"
    ],
    [
      194,
      "과거 세션 검색: 제한적 허용.",
      "permission"
    ],
    [
      225,
      "공동 세션 04-771.",
      "permission"
    ],
    [
      226,
      "주제: 야간 인지 콘텐츠 공급 안정성.",
      "permission"
    ],
    [
      227,
      "참여: 4개사.",
      "permission"
    ],
    [
      228,
      "열람 권한: 요청 가능.",
      "permission"
    ],
    [
      239,
      "야간 인지 콘텐츠 공급 안정성.",
      "permission"
    ],
    [
      250,
      "참여자 4: 비공개.",
      "permission"
    ],
    [
      278,
      "오늘은 얼마 받았어.",
      "doyun"
    ],
    [
      280,
      "돈 말고 문 받았어요.",
      "toDoyun"
    ],
    [
      281,
      "문짝은 안 팔리는데.",
      "doyun"
    ],
    [
      282,
      "열리면 비싸요.",
      "toDoyun"
    ],
    [
      284,
      "어디 문.",
      "doyun"
    ],
    [
      287,
      "아직 몰라요.",
      "toDoyun"
    ],
    [
      289,
      "그럼 모를 때 열어.",
      "doyun"
    ],
    [
      291,
      "알고 열면 늦을 때가 있어.",
      "doyun"
    ],
    [
      300,
      "요청 사유를 입력하십시오.",
      "permission"
    ],
    [
      303,
      "미확인 추론계 검증.",
      "permission"
    ],
    [
      305,
      "사람이 결정하는 지점을 확인하고 싶습니다.",
      "permission"
    ],
    [
      308,
      "열람 요청 접수.",
      "permission"
    ],
    [
      309,
      "추가 승인 필요: 2.",
      "permission"
    ]
  ],
  "18": [
    [
      3,
      "공동 세션 04-771.",
      "permission"
    ],
    [
      4,
      "열람 승인: 조건부.",
      "permission"
    ],
    [
      5,
      "추가 조건: 미확인 추론계 검증 등급 R-2 이상.",
      "permission"
    ],
    [
      13,
      "외부 모델 호출: 확인되지 않음.",
      "permission"
    ],
    [
      14,
      "개인 TOKEN 사용량: 설명 가능한 범위.",
      "permission"
    ],
    [
      15,
      "등록 외 서버·보조망: 확인되지 않음.",
      "permission"
    ],
    [
      16,
      "신경 인터페이스 외부 제어: 확인되지 않음.",
      "permission"
    ],
    [
      17,
      "추론 주체: 미확정.",
      "permission"
    ],
    [
      32,
      "ARKADIA PRIVATE REASONER",
      "evaluation"
    ],
    [
      33,
      "v1.x — 고속 비정형 추론",
      "evaluation"
    ],
    [
      34,
      "v2.0 — 재훈련 추정",
      "evaluation"
    ],
    [
      35,
      "v2.1 — 과신 억제 / 출력 거부 / 인간 맥락 재확인",
      "evaluation"
    ],
    [
      62,
      "연속 열람 한도: 40분. 남은 시간 31분.",
      "medical"
    ],
    [
      75,
      "현재 구조를 유지하는 것이 최선입니다.",
      "evaluation"
    ],
    [
      89,
      "다음 분기 수면 콘텐츠 시장의 공급 안정성을 평가하십시오.",
      "evaluation"
    ],
    [
      98,
      "남은 시간: 4분.",
      "evaluation"
    ],
    [
      101,
      "요청 가능한 자료 범위: 없음.",
      "evaluation"
    ],
    [
      117,
      "검증 완료.",
      "evaluation"
    ],
    [
      118,
      "R-2 검증 기준: 충족.",
      "evaluation"
    ],
    [
      122,
      "불충분 정보에 대한 선택적 출력 억제 확인.",
      "evaluation"
    ],
    [
      123,
      "공동 세션 04-771 열람 승인.",
      "permission"
    ],
    [
      136,
      "권고: 미확인 추론계 R-2 이상에 한해 제한 열람.",
      "permission"
    ],
    [
      138,
      "AI 추천.",
      "permission"
    ],
    [
      139,
      "모델 판단.",
      "permission"
    ],
    [
      140,
      "검증 완료.",
      "permission"
    ],
    [
      158,
      "야간 인지 콘텐츠 공급 안정성.",
      "permission"
    ],
    [
      161,
      "중단 허용 시간: 00:00:00.8",
      "permission"
    ],
    [
      169,
      "대체 경로: 6",
      "permission"
    ],
    [
      170,
      "지역별 비상 공급: 자동",
      "permission"
    ],
    [
      171,
      "수동 중단 권한: 등급 6 이상",
      "permission"
    ],
    [
      194,
      "서인 참여 공동 세션 문의: 11건.",
      "permission"
    ],
    [
      195,
      "추론 출처 검증 문의: 4건.",
      "permission"
    ],
    [
      196,
      "외부 명칭 ‘v2.2’ 우선 협상권 제안: 2건.",
      "permission"
    ],
    [
      210,
      "연속 과부하 금지.",
      "medical"
    ],
    [
      223,
      "2.1 축하.",
      "doyun"
    ],
    [
      224,
      "안 웃겨요.",
      "toDoyun"
    ],
    [
      225,
      "난 웃긴데.",
      "doyun"
    ],
    [
      226,
      "밖에서는 제가 11일 누워 있던 걸 재훈련이라고 부른대요.",
      "toDoyun"
    ],
    [
      234,
      "누워 있던 건 네가 한 일이야.",
      "doyun"
    ],
    [
      237,
      "저 사람들이 붙인 이름까지 네 일이 되는 건 아니고.",
      "doyun"
    ],
    [
      245,
      "누가 누를 수 있는지 확인. 무엇을 눌러야 하는지는 아직 정하지 않음.",
      "permission"
    ],
    [
      251,
      "열람자 확인: 서인 / 확인 주체: 참여자 4.",
      "permission"
    ]
  ],
  "19": [
    [
      62,
      "검증 정답: A.",
      "evaluation"
    ],
    [
      103,
      "남은 시간: 3분.",
      "medical"
    ],
    [
      173,
      "권한: 중단 승인.",
      "permission"
    ]
  ],
  "20": [
    [
      25,
      "동부 물류기지 / 대체 경로 운행 완료.",
      "work"
    ],
    [
      54,
      "새 경로 도착 시각 미확정. 기존 경로는 오전 7시 이후.",
      "work"
    ],
    [
      66,
      "기존 납품 조건 유지 여부는 고객별 상이. 취소·환불·잔여 재고 별첨.",
      "work"
    ],
    [
      82,
      "중단 11분 후 승인 철회. 전체망 복구.",
      "work"
    ],
    [
      83,
      "승인자 4. 사유 비공개.",
      "work"
    ],
    [
      88,
      "철회 사유는 이번 감사 열람 범위 밖입니다.",
      "work"
    ],
    [
      98,
      "거기 진짜 끄는 데야?",
      "work"
    ],
    [
      100,
      "지금은 감사 중이야.",
      "work"
    ],
    [
      101,
      "내 건 끄지 마.",
      "jiwoo",
      {
        "recall": true,
        "status": "다시 읽는 문장"
      }
    ],
    [
      134,
      "생존 정산 보호 절차 확인.",
      "work"
    ],
    [
      162,
      "공동 운영위원회 제한 승인자.",
      "work"
    ]
  ],
  "21": [
    [
      35,
      "변경 적용 시 실제 계약 조건으로 재정산.",
      "monitor"
    ],
    [
      64,
      "문자 그만. 지금 놀고 있어요.",
      "monitor"
    ],
    [
      71,
      "희귀질환 다중 검증 / 완료 예정 갱신.",
      "monitor"
    ],
    [
      89,
      "오전 6시라고 안내받았습니다.",
      "haerin"
    ],
    [
      90,
      "8시 예약은 유지됩니까?",
      "haerin"
    ],
    [
      166,
      "예약 그대로라고 들었습니다.",
      "haerin"
    ],
    [
      168,
      "아이는 아직 자요.",
      "haerin"
    ],
    [
      180,
      "다음 운영 검토 전, 기준층 확인 범위를 먼저 요청하십시오.",
      "monitor"
    ],
    [
      182,
      "열람 권한 없음.",
      "monitor"
    ]
  ],
  "22": [
    [
      22,
      "기업 제4 의료 검증 지연 한도: 3시간.",
      "medical"
    ],
    [
      23,
      "지원: 오늘 밤 1회.",
      "medical"
    ],
    [
      41,
      "서인 / 인간 단독 판단 가능성 높음.",
      "medical"
    ],
    [
      43,
      "공공 의사결정 권한 추가 확대: 반대.",
      "medical"
    ],
    [
      66,
      "첫 세 검증이 끝났다는 안내는 받았습니다. 네 번째는 언제 나옵니까?",
      "medical"
    ],
    [
      71,
      "보상 문제가 아닙니다. 아이 문제입니다.",
      "medical"
    ],
    [
      161,
      "공공 의사결정 권한 추가 확대: 반대.",
      "medical"
    ]
  ],
  "23": [
    [
      2,
      "소속 조직 평균 83%.",
      "monitor"
    ],
    [
      10,
      "제4 의료 검증 예비층 자발적 공유 시범.",
      "monitor"
    ],
    [
      11,
      "참여 여부: 개인 선택.",
      "monitor"
    ],
    [
      12,
      "불이익 없음.",
      "monitor"
    ],
    [
      13,
      "철회 가능.",
      "monitor"
    ],
    [
      31,
      "세 번 정상이면 충분한데 네 번째는 왜 줍니까?",
      "monitor"
    ],
    [
      34,
      "어젯밤은 왜 안 물어봤습니까?",
      "monitor"
    ],
    [
      37,
      "회사에서 나중에 전부 참여시키는 거 아닙니까?",
      "monitor"
    ],
    [
      42,
      "서인 님은 이 공유가 안전하다고 봅니까?",
      "monitor"
    ],
    [
      47,
      "그러면 참여하지 말라는 겁니까?",
      "monitor"
    ],
    [
      49,
      "본인이 대상이면 하겠습니까?",
      "monitor"
    ],
    [
      60,
      "서인 님도 모른다고 해서 오히려 믿음이 갑니다.",
      "monitor"
    ],
    [
      61,
      "서인 님이 말했으니까.",
      "monitor"
    ],
    [
      72,
      "서인도 위험하다고 안 했잖아요.",
      "monitor"
    ],
    [
      111,
      "조직별 참여율을 표시하지 않습니다.",
      "monitor"
    ],
    [
      112,
      "선택은 동료·상사·평가 시스템에 공개되지 않습니다.",
      "monitor"
    ],
    [
      113,
      "24시간 안의 철회는 인사 평가와 참여 독려 이력에 남기지 않습니다.",
      "monitor"
    ],
    [
      141,
      "아이 검사가 끝난 뒤에도 제가 다시 정하겠습니다. 다음 주 참여한다고 적지는 말아 주세요.",
      "monitor"
    ]
  ],
  "24": [
    [
      9,
      "SEO-IN CONSENT STANDARD.",
      "monitor"
    ],
    [
      10,
      "아르카디아 동부 27번 운영 검토와 의료 협력 시범의 자발성 기준 적용.",
      "monitor"
    ],
    [
      20,
      "참여 보상 +2.5 TOKEN.",
      "monitor"
    ],
    [
      42,
      "예약 유지에 필요한 가족 검증 크레딧을 확인해 주세요.",
      "monitor"
    ],
    [
      137,
      "‘SEO-IN CONSENT STANDARD’ 명칭 사용 중단.",
      "monitor"
    ],
    [
      138,
      "서인은 본 제도를 인증·보증하지 않았습니다.",
      "monitor"
    ],
    [
      139,
      "금일 신청분은 당일 시범에 한해 유지합니다. 철회자는 제공 권리를 우선 복원받습니다.",
      "monitor"
    ],
    [
      140,
      "익일부터 혜택별 손실과 반환 조건을 확인해 새로 신청합니다.",
      "monitor"
    ],
    [
      149,
      "내일 상담 그대로입니다. 2.5는 돌려줬고요.",
      "userRequest"
    ],
    [
      151,
      "내일 재신청 안내, 저한테도 오는 거죠?",
      "userRequest"
    ],
    [
      156,
      "SEO-IN 관련 상표 선점 신청 3건.",
      "monitor"
    ]
  ],
  "25": [
    [
      6,
      "광고꿈 야간 추가 계약 모집.",
      "work"
    ],
    [
      7,
      "참여 보상 +3.0 TOKEN.",
      "queue"
    ],
    [
      8,
      "참여 상태 비공개.",
      "queue"
    ],
    [
      9,
      "비참여 사유 미수집.",
      "queue"
    ],
    [
      10,
      "24시간 이내 무기록 철회.",
      "queue"
    ],
    [
      37,
      "동부 27번: 82%.",
      "queue"
    ],
    [
      38,
      "남부 14번: 57%.",
      "queue"
    ],
    [
      39,
      "중앙 6번: 21%.",
      "queue"
    ],
    [
      40,
      "서북 3번: 11%.",
      "queue"
    ],
    [
      69,
      "오늘 밤 추가 계약 모집 / 예정 인원 초과.",
      "work"
    ],
    [
      73,
      "추가 계약 지역 편중도: 높음.",
      "work"
    ],
    [
      100,
      "뉴스에 네 이름 나왔더라. 이거 네가 만든 거니?",
      "mother"
    ],
    [
      102,
      "광고꿈 야간 추가 계약 모집.",
      "work"
    ],
    [
      173,
      "비참여 및 참여 사유는 수집하지 않습니다.",
      "queue"
    ],
    [
      191,
      "지역 편중 상한 적용 시 당일 승인 건수 감소.",
      "work"
    ],
    [
      192,
      "신청 거절 예상 인원 4,806명.",
      "queue"
    ],
    [
      218,
      "지역 편중 경고선 설정.",
      "queue"
    ],
    [
      219,
      "경고선 초과 지역 신규 신청 일시 대기.",
      "queue"
    ],
    [
      220,
      "대기 신청자는 보상 확정 전 자유 철회.",
      "queue"
    ],
    [
      221,
      "다른 지역 신청 증가 시 순차 승인.",
      "work"
    ],
    [
      237,
      "신규 승인 일시 중지.",
      "queue"
    ],
    [
      238,
      "대기 인원 2,931명.",
      "queue"
    ],
    [
      245,
      "내가 신청했는데 왜 주소 때문에 대기입니까?",
      "complaint"
    ],
    [
      246,
      "돈이 필요한 것도 차별입니까?",
      "complaint"
    ],
    [
      247,
      "안 하게 해 달라는 사람은 보호하면서, 하겠다는 사람은 왜 막습니까?",
      "complaint"
    ],
    [
      261,
      "나 대기 걸렸네.",
      "mother"
    ],
    [
      264,
      "이거 네가 한 거야?",
      "mother"
    ],
    [
      267,
      "나는 하고 싶었는데.",
      "mother"
    ]
  ],
  "26": [
    [
      4,
      "나 됐다.",
      "mother"
    ],
    [
      6,
      "새벽에 승인 문자 왔더라. 네가 해 줬지? 고맙다.",
      "mother"
    ],
    [
      10,
      "나 안 했어.",
      "toMother"
    ],
    [
      12,
      "그럼 누가 했는데.",
      "mother"
    ],
    [
      18,
      "상태: 승인.",
      "familyProtection"
    ],
    [
      19,
      "처리 시각: 04:07.",
      "familyProtection"
    ],
    [
      20,
      "사유 코드: R-17.",
      "familyProtection"
    ],
    [
      22,
      "연속성 보호 대상 가족: 대기 면제.",
      "familyProtection"
    ],
    [
      23,
      "지정 기관: 아르카디아 위험관리.",
      "familyProtection"
    ],
    [
      24,
      "지정 대상: 서인.",
      "familyProtection"
    ],
    [
      25,
      "시행: 등급 6 승인 직후 자동 적용.",
      "familyProtection"
    ],
    [
      39,
      "가족 보호 정책 적용 안내. [확인]",
      "familyProtection"
    ],
    [
      41,
      "확인: 서인.",
      "familyProtection"
    ],
    [
      42,
      "열람 시간: 0.6초.",
      "familyProtection"
    ],
    [
      53,
      "외부 정보 조회 차단.",
      "familyProtection"
    ],
    [
      54,
      "의료 판독 4중 검증.",
      "familyProtection"
    ],
    [
      55,
      "야간망 대기·정지 면제.",
      "familyProtection"
    ],
    [
      58,
      "판독 4중 완료. 이상 없음.",
      "familyProtection"
    ],
    [
      84,
      "외부 정보 조회 차단 기록: 3건.",
      "familyProtection"
    ],
    [
      85,
      "1건 / 정보 중개업체 / 항목: 의료 이용 기록.",
      "familyProtection"
    ],
    [
      86,
      "2건 / 정보 중개업체 / 항목: 소비·TOKEN 내역.",
      "familyProtection"
    ],
    [
      87,
      "3건 / 발신 미확인 / 항목: 생활 동선.",
      "familyProtection"
    ],
    [
      104,
      "R-17 계열 면제: 도시 전체 41건.",
      "familyProtection"
    ],
    [
      105,
      "중앙 6번 24건 / 북부 2번 11건 / 서북 3번 5건 / 동부 27번 1건.",
      "familyProtection"
    ],
    [
      106,
      "면제 사용 신청: 6건.",
      "familyProtection"
    ],
    [
      119,
      "R-17 / 면제.",
      "familyProtection"
    ],
    [
      139,
      "나 승인 됐어요~ 달걀 사 먹을 거야!",
      "familyGroup"
    ],
    [
      142,
      "저는 대기네요.",
      "familyGroup"
    ],
    [
      143,
      "저도요.",
      "familyGroup"
    ],
    [
      144,
      "저는 1,011번.",
      "familyGroup"
    ],
    [
      145,
      "어머, 그렇구나. 왜 나만 됐지?",
      "familyGroup"
    ],
    [
      148,
      "방 분위기 이상한데 내가 뭐 잘못 썼니.",
      "mother"
    ],
    [
      182,
      "일반 승인 예상 순위: 400 / 400.",
      "familyProtection"
    ],
    [
      183,
      "상태: 다음 처리일로 이월.",
      "familyProtection"
    ],
    [
      282,
      "면제 사용: 안 함.",
      "familyProtection"
    ],
    [
      283,
      "대기 순번: 412번.",
      "familyProtection"
    ],
    [
      285,
      "면제 사용 신청: 5건.",
      "familyProtection"
    ],
    [
      289,
      "재심사 접수. 예상 소요 14일.",
      "familyProtection"
    ],
    [
      291,
      "외부 정보 조회 차단 기록: 4건.",
      "familyProtection"
    ],
    [
      294,
      "4건 / 21:52 / 발신 미확인 / 항목: 거주지 위치.",
      "familyProtection"
    ],
    [
      300,
      "엄마, 하나 더 있는데.",
      "motherDraft"
    ],
    [
      302,
      "엄마, 오늘 일 미안해.",
      "toMother"
    ],
    [
      305,
      "뭐가. 줄 서면 되지.",
      "mother"
    ],
    [
      306,
      "달걀은 네가 사.",
      "mother"
    ],
    [
      308,
      "알았어.",
      "toMother"
    ]
  ],
  "27": [
    [
      12,
      "외부 대면 접촉 감지.",
      "contactAlert"
    ],
    [
      13,
      "대상: R-17 지정 가족.",
      "contactAlert"
    ],
    [
      14,
      "위치: 동부 27번 시장 3구역.",
      "contactAlert"
    ],
    [
      15,
      "보호 요원 출동 가능. 도착까지 14분.",
      "contactAlert"
    ],
    [
      16,
      "[승인]",
      "contactAlert"
    ],
    [
      47,
      "접촉 지속.",
      "contactAlert"
    ],
    [
      48,
      "질의 항목: 수면 → 식사 → 성장 환경.",
      "contactAlert"
    ],
    [
      49,
      "[승인] 대기 중.",
      "contactAlert"
    ],
    [
      205,
      "접촉자: 오르비스 리서치.",
      "security"
    ],
    [
      206,
      "분류: 정보 중개업체.",
      "security"
    ],
    [
      207,
      "위험도: 낮음.",
      "security"
    ],
    [
      208,
      "보호 요원 출동: 미승인.",
      "security"
    ],
    [
      211,
      "판매 목록 신규 등록: 서인 성장 환경 증언 — 의료 상황 판단 일화.",
      "security"
    ],
    [
      212,
      "가격: 4,200 TOKEN. 구매 문의: 11건.",
      "security"
    ],
    [
      213,
      "문의처: 중개업체 9건 / 상층 기업 2건(비공개).",
      "security"
    ],
    [
      214,
      "추가 증언 요청: 5건.",
      "security"
    ],
    [
      216,
      "발신: 비공개.",
      "security"
    ],
    [
      219,
      "설문 보상 +3.0 TOKEN.",
      "payment"
    ],
    [
      225,
      "오늘 낮부터 외부 시장이 달라졌어요.",
      "yeonwoo"
    ],
    [
      226,
      "‘인간 단독’ 문의가 하루 만에 세 배예요.",
      "yeonwoo"
    ]
  ],
  "28": [
    [
      144,
      "R-17 / 외부 접촉 감지: 출입 시도.",
      "contactAlert"
    ],
    [
      145,
      "위치: 동부 27번 4층 현관.",
      "contactAlert"
    ],
    [
      162,
      "3시 4분. 출입 시도.",
      "contactAlert"
    ],
    [
      233,
      "외부 정보 조회 차단 기록: 5건.",
      "familyProtection"
    ],
    [
      234,
      "5건 / 23:14 / 발신 미확인 / 항목: 출입 기록.",
      "familyProtection"
    ]
  ],
  "29": [
    [
      2,
      "옥상. 지금.",
      "jiwoo"
    ],
    [
      4,
      "급한 건 아닌데 급해.",
      "jiwoo"
    ],
    [
      40,
      "라르고 아카이브.",
      "work",
      {
        "sender": "",
        "title": "제시된 화면"
      }
    ],
    [
      41,
      "회복 꿈 수집 프로그램.",
      "work",
      {
        "sender": "라르고 아카이브",
        "title": "회복 꿈 수집 프로그램"
      }
    ],
    [
      42,
      "대상: 광고꿈 중단 후 자발적 꿈을 되찾은 분.",
      "work",
      {
        "sender": "라르고 아카이브",
        "title": "회복 꿈 수집 프로그램"
      }
    ],
    [
      43,
      "샘플 구매가 1,100 TOKEN.",
      "work",
      {
        "sender": "라르고 아카이브",
        "title": "회복 꿈 수집 프로그램"
      }
    ],
    [
      45,
      "추천인: 오르비스 리서치 연결.",
      "work",
      {
        "sender": "라르고 아카이브",
        "title": "회복 꿈 수집 프로그램"
      }
    ],
    [
      100,
      "본 수집은 SEO-IN 방식의 자발적 참여 기준을 준수합니다.",
      "archive"
    ],
    [
      107,
      "요청자는 해당 표준의 권리자가 아닙니다.",
      "archive"
    ],
    [
      108,
      "상표 선점 신청: 라르고 아카이브 (접수 2일 전).",
      "archive"
    ],
    [
      189,
      "640 검증 예약 완료.",
      "archive"
    ],
    [
      236,
      "회복 꿈 샘플 구매 문의 24건.",
      "archive"
    ],
    [
      237,
      "샘플명: DR-0317 / 열두 살 작업실 / 흙 냄새.",
      "archive"
    ],
    [
      238,
      "구매 대기: 상층 개인 컬렉션 9건.",
      "archive"
    ],
    [
      239,
      "DR-0317 / 판매 완료 / 철회 불가 / 구매자 비공개.",
      "irreversible"
    ],
    [
      244,
      "요청 조건: ‘서인 방식’ 회복자 우선.",
      "archive"
    ],
    [
      247,
      "DR-0412 / 빵집 / 소금빵. 구매 대기 4건.",
      "archive"
    ],
    [
      248,
      "DR-0418 / 우주선 정비. 구매 대기 3건.",
      "archive"
    ],
    [
      251,
      "김재호.",
      "archive"
    ],
    [
      252,
      "한미라.",
      "archive"
    ]
  ],
  "30": [
    [
      2,
      "봤어.",
      "doyun"
    ],
    [
      3,
      "저녁에 옥상으로 와.",
      "doyun"
    ],
    [
      4,
      "컵라면은 내가 산다. 3.9더라.",
      "doyun"
    ],
    [
      44,
      "90일 참가자 후속 관찰 수당. 미지급분.",
      "ledger"
    ],
    [
      45,
      "참가자 062 / 1,400.",
      "ledger"
    ],
    [
      46,
      "참가자 118 / 1,400.",
      "ledger"
    ],
    [
      47,
      "지급 보류 사유: 위원회 의결 대기.",
      "ledger"
    ],
    [
      83,
      "개인 몫: 3,092.2.",
      "ledger"
    ],
    [
      116,
      "정산 대납 처리. 개인 몫 2,800 → 참가자 062, 118. 사유: 후속 관찰 수당(미지급분).",
      "payment"
    ],
    [
      121,
      "정산 완료.",
      "payment"
    ],
    [
      122,
      "개인 몫 잔액 292.2.",
      "payment"
    ],
    [
      157,
      "+1,400.",
      "payment"
    ],
    [
      238,
      "288.3.",
      "payment"
    ]
  ],
  "4-1": [
    [
      1,
      "아르카디아 생활설계 계약 · 기여도 확정.",
      "payment"
    ],
    [
      2,
      "판단 기여: 팀 공용 분석 100%.",
      "payment"
    ],
    [
      3,
      "개인 기여: 해당 없음.",
      "payment"
    ],
    [
      5,
      "보안 검토 대상: 서인 · 내장 비인가 모델 사용 의심 · 신고자: 팀장.",
      "work"
    ],
    [
      6,
      "신고 사유: 판단 시점 외부 호출 기록 부재에도 불구하고, 추론 복잡도에 비추어 비인가 모델의 개입이 강하게 의심됨.",
      "work"
    ],
    [
      18,
      "개인 기여 인정 시 성과 수당: 다음 달 정산.",
      "payment"
    ],
    [
      22,
      "이의 신청 접수. 조정 회의: 오늘 10:00. 주재: 경영지원실.",
      "transaction"
    ],
    [
      89,
      "신고서 작성 · 회사 모델 사용 · 초안 재작성 23회.",
      "work"
    ],
    [
      90,
      "추가 요청: “좀 더 단호하게” 9회 · “내가 쓴 것처럼” 4회.",
      "work"
    ],
    [
      91,
      "연산 사용 2,640 TOKEN · 용도 분류: 업무 외(개인 분쟁 문서).",
      "work"
    ],
    [
      95,
      "사용자 서인 · 아르카디아 판단 시점 연산 사용 0 TOKEN.",
      "work"
    ],
    [
      101,
      "판단 기여 재산정: 회사 모델 · 서인 (공동).",
      "payment"
    ],
    [
      102,
      "개인 기여 인정. 성과 수당: 다음 달 정산.",
      "payment"
    ],
    [
      103,
      "보안 검토: 유지. 내장 모델 여부 확인 불가.",
      "work"
    ],
    [
      104,
      "팀장 · 업무 외 연산 사용 경위서 제출.",
      "work"
    ],
    [
      119,
      "검토 기록 보완을 위해 판단 근거를 진술해 주십시오. 자유 서술.",
      "securityReply"
    ],
    [
      121,
      "시계 세 번. 메시지. 창밖. 회의 연장.",
      "toSecurity",
      {
        "status": "작성 중"
      }
    ],
    [
      123,
      "그리고 반지 두 바퀴.",
      "toSecurity",
      {
        "status": "덧붙인 문장"
      }
    ],
    [
      124,
      "마지막 줄은 오늘 건이라 제외합니다.",
      "securityReply",
      {
        "sender": "",
        "title": "보안팀 대화",
        "status": ""
      }
    ]
  ],
  "6-1": [
    [
      88,
      "90일 공백 기간을 반영한 새로운 행복 패키지.",
      "sleep"
    ]
  ],
  "7-2": [
    [
      179,
      "오늘 지출 25.9 TOKEN.",
      "payment"
    ],
    [
      180,
      "수입 0.",
      "payment"
    ],
    [
      181,
      "활동 가치 환산: 산출 불가. 미분류 3건.",
      "payment"
    ],
    [
      182,
      "대기 0:17",
      "payment"
    ],
    [
      183,
      "수리 1:58",
      "payment"
    ],
    [
      184,
      "대기 0:41",
      "payment"
    ]
  ],
  "8-1": [
    [
      21,
      "외부 변수 · 경쟁사, 동부운송 인수 후 3년간 운임 동결 제시.",
      "security"
    ],
    [
      22,
      "단, 오늘 12:20 이전 타사 대체 운송을 확약하지 않은 고객에 한함.",
      "security"
    ],
    [
      23,
      "추가 연산 필요.",
      "security"
    ],
    [
      53,
      "전날 19:52 발송 단말 · 소유자: 차민서.",
      "security"
    ],
    [
      54,
      "오늘 08:10 · 같은 단말 · 경쟁사 인수팀 접속.",
      "security"
    ],
    [
      61,
      "부속 시설 처리: 동부거점 공동돌봄실 폐쇄 확정.",
      "security"
    ],
    [
      62,
      "예상 절감: 연간 410,000 TOKEN.",
      "security"
    ],
    [
      75,
      "발언 권한 제한 · 참석 구분: 관찰 및 의견 제출 완료.",
      "permission"
    ],
    [
      76,
      "본 안건에 대한 의결권 없음.",
      "permission"
    ]
  ],
  "8-2": [
    [
      17,
      "돌봄실 폐쇄.",
      "security"
    ],
    [
      19,
      "자료 유출자: 차민서. 조사 완료.",
      "security"
    ],
    [
      20,
      "미확인 항목: 전날 19:52 발송 건 보안 경고를 누가 검토 완료 처리했는가.",
      "security"
    ],
    [
      23,
      "전날 23:58, 본인이 검토 완료 처리. 추가 통보하지 않음.",
      "security"
    ],
    [
      40,
      "외부 조사 연산 · 1,200,000 TOKEN.",
      "work"
    ],
    [
      42,
      "3,800,000.",
      "work"
    ],
    [
      43,
      "6,400,000.",
      "work"
    ],
    [
      47,
      "9,400,000 TOKEN.",
      "work"
    ],
    [
      48,
      "추론 출처: 미확인.",
      "security"
    ],
    [
      49,
      "인간 단독 가설: 배제 불가.",
      "security"
    ],
    [
      60,
      "상층 객실 402 · 인지 부하: 상승.",
      "medical"
    ],
    [
      74,
      "경고: 인지 부하 임계 초과.",
      "cognitiveAlert"
    ],
    [
      78,
      "[대상 지정] 서인 · 특별 인지 평가 · 상층 인재 전환 트랙.",
      "security"
    ],
    [
      84,
      "객실 응급 요청 · 접수 · 의료 연계 진행 중.",
      "medical"
    ],
    [
      94,
      "특별 인지 평가 · 초안.",
      "security"
    ]
  ],
  "8-3": [
    [
      20,
      "의료 구역 요청 · 이송 환자 의료 기록 열람 및 정식 입원 승인 대기.",
      "medical"
    ],
    [
      22,
      "상층 보안 구역 내 인적 사고 기록을 생성합니다.",
      "medical"
    ],
    [
      23,
      "주의: 열람 및 승인 시 확인자 이름이 영구 기록됩니다.",
      "medical"
    ],
    [
      27,
      "객실 응급 요청 · 개인 단말 비상 연락처 자동 통보 1건 · 수신 확인.",
      "medical"
    ],
    [
      29,
      "도윤.",
      "medical"
    ],
    [
      31,
      "하층 의료실 · 환자 인수 가능 · 의료진 이송 판단 후 진행.",
      "doyun",
      {
        "sender": "",
        "title": "비상 연락처 회신",
        "status": "회신"
      }
    ],
    [
      35,
      "정식 입원 취소 · 외부 연고자 인계 · 의료진 이송 판단 우선.",
      "medical"
    ],
    [
      36,
      "환자 이름: [기록 말소]",
      "medical"
    ],
    [
      39,
      "발생 원인: 과로 추정.",
      "medical"
    ]
  ],
  "9-1": [
    [
      274,
      "모레 평가 받을 거야?",
      "doyun"
    ],
    [
      281,
      "특별 인지 평가 응시 확정. 철회는 내일 12:00까지.",
      "workplaceInvite"
    ],
    [
      293,
      "받을 거예요. 근데 아직 모르겠어요.",
      "toDoyun"
    ]
  ],
  "12-1": [
    [
      26,
      "시계 세 번. 메시지. 창밖. 회의 연장.",
      "toSecurity",
      {
        "title": "보안 진술 기록",
        "status": "기록된 문장",
        "recall": true
      }
    ],
    [
      27,
      "그리고 반지 두 바퀴.",
      "toSecurity",
      {
        "title": "보안 진술 기록",
        "status": "기록된 문장",
        "recall": true
      }
    ],
    [
      29,
      "마지막 줄은 오늘 건이라 제외합니다.",
      "taeseok",
      {
        "title": "보안 진술 기록",
        "status": "기록된 답장",
        "recall": true
      }
    ],
    [
      42,
      "열람 · 수요일 23:40 · 외부 · 의료기관 연계망 인증 · MC-7302.",
      "security"
    ],
    [
      43,
      "열람 시간 3분 · 복사 없음 · 수정 없음.",
      "security"
    ],
    [
      51,
      "MC-7302 · 수면의학 클리닉(광고 적응 치료) · 도심 외곽.",
      "security"
    ],
    [
      52,
      "운영 상태: 폐업.",
      "security"
    ],
    [
      53,
      "연계망 인증서: 미회수.",
      "security"
    ],
    [
      61,
      "MC-7302.",
      "security"
    ],
    [
      116,
      "외부 모델 호출: 확인되지 않음.",
      "security"
    ],
    [
      117,
      "후원 주체: 확인되지 않음.",
      "security"
    ],
    [
      118,
      "연산비: 확인되지 않음.",
      "security"
    ],
    [
      119,
      "추론 출처: 미확인.",
      "security"
    ],
    [
      120,
      "비고: 보안 진술서 외부 열람 이력 1건 · 출처 확인 중.",
      "security"
    ],
    [
      126,
      "선배 어디세요.",
      "junior",
      {
        "sender": "",
        "title": "도착한 메시지",
        "status": "수신"
      }
    ],
    [
      127,
      "설마 거기 가신 거 아니죠. 코드 저도 봤어요.",
      "junior",
      {
        "sender": "",
        "title": "도착한 메시지",
        "status": "수신"
      }
    ],
    [
      129,
      "선배 코드 넣으셨어요?",
      "junior"
    ],
    [
      130,
      "아니.",
      "taeseok"
    ],
    [
      131,
      "왜요.",
      "junior"
    ],
    [
      133,
      "아직 오늘 건이라서.",
      "taeseok"
    ],
    [
      134,
      "그게 무슨 뜻이에요.",
      "junior"
    ],
    [
      138,
      "수고하셨습니다. 빠진 건 없습니까.",
      "transfer"
    ],
    [
      139,
      "확인된 건 다 넣었습니다.",
      "taeseok"
    ],
    [
      143,
      "보안 진술서 외부 열람 이력 1건 · 출처 확인 중.",
      "security"
    ],
    [
      152,
      "가설 E / 인간 단독 판단 · 배제 불가.",
      "security"
    ],
    [
      154,
      "가설 E / 인간 단독 판단.",
      "security"
    ],
    [
      155,
      "우선순위: 최하.",
      "security"
    ],
    [
      165,
      "비고 건은 확인되는 대로 직접 보고 바랍니다. 수신: 최고위 전략실.",
      "executive",
      {
        "sender": "",
        "title": "직접 보고 요청",
        "status": "수신"
      }
    ]
  ],
  "13-1": [
    [
      88,
      "공백 시간 종료.",
      "work"
    ],
    [
      89,
      "활용 기록: 없음.",
      "work"
    ],
    [
      90,
      "상태: 정상.",
      "work"
    ],
    [
      95,
      "공백 시간은 어떠셨나요? (선택 · 익명)",
      "survey"
    ],
    [
      96,
      "자유롭게 적어 주세요.",
      "survey"
    ],
    [
      105,
      "제출.",
      "survey"
    ],
    [
      106,
      "소중한 의견 감사합니다. 응답은 서비스 개선에 활용될 수 있습니다.",
      "survey"
    ],
    [
      110,
      "못생김.",
      "jiwoo",
      {
        "title": "서인과의 대화",
        "status": "보낸 문장"
      }
    ],
    [
      112,
      "잘 안 정했네.",
      "toJiwoo",
      {
        "title": "서인과의 대화",
        "status": "받은 문장"
      }
    ],
    [
      113,
      "응.",
      "jiwoo",
      {
        "title": "서인과의 대화",
        "status": "대화"
      }
    ],
    [
      114,
      "망함.",
      "toJiwoo",
      {
        "sender": "",
        "title": "서인과 지우의 대화",
        "status": ""
      }
    ],
    [
      115,
      "개좋음.",
      "toJiwoo",
      {
        "sender": "",
        "title": "서인과 지우의 대화",
        "status": ""
      }
    ],
    [
      117,
      "다음 수요일도 비워.",
      "toJiwoo",
      {
        "title": "서인과의 대화",
        "status": "받은 문장"
      }
    ]
  ],
  "13-2": [
    [
      1,
      "비고 건, 진행 상황 공유 바랍니다. 수신: 최고위 전략실.",
      "executive",
      {
        "sender": "발신자 미표시"
      }
    ],
    [
      4,
      "오늘 중.",
      "executive",
      {
        "sender": "발신자 미표시"
      }
    ],
    [
      102,
      "MC-7302 현장 확인.",
      "taeseok",
      {
        "status": "작성 중"
      }
    ],
    [
      103,
      "기관 상태: 폐업. 건물: 임대 중.",
      "taeseok",
      {
        "status": "작성 중"
      }
    ],
    [
      104,
      "그 외 신원 확인된 인물 없음.",
      "taeseok",
      {
        "status": "작성 중"
      }
    ],
    [
      107,
      "'그 외'는 무엇입니까.",
      "executive",
      {
        "sender": "",
        "title": "보고에 온 답장",
        "status": "받은 문장"
      }
    ],
    [
      110,
      "확인하지 않은 것입니다.",
      "taeseok",
      {
        "status": "작성 중"
      }
    ],
    [
      112,
      "확인되면 언제든.",
      "executive",
      {
        "sender": "",
        "title": "보고에 온 답장",
        "status": "받은 문장"
      }
    ],
    [
      117,
      "폐업 확인. 끝.",
      "taeseok"
    ],
    [
      118,
      "확인됐어요?",
      "junior"
    ],
    [
      119,
      "응. 그 번호 지워.",
      "taeseok"
    ],
    [
      121,
      "지웠어요. 근데 선배, 끝난 거 맞죠.",
      "junior"
    ],
    [
      122,
      "저 그 번호 외웠는데요.",
      "junior"
    ],
    [
      124,
      "그럼 잊어. 업무 지시야.",
      "taeseok"
    ],
    [
      125,
      "네.",
      "junior"
    ],
    [
      127,
      "선배도요.",
      "junior"
    ]
  ],
  "16-1": [
    [
      21,
      "기존 대기 계약 종료 18:00.",
      "work"
    ],
    [
      23,
      "신규 계약 적용 00:00.",
      "work"
    ],
    [
      32,
      "열람 가능.",
      "work"
    ],
    [
      34,
      "배차 변경 담당자에게 요청하십시오.",
      "work"
    ],
    [
      61,
      "확보.",
      "work"
    ],
    [
      162,
      "연속 열람 37분.",
      "medical"
    ]
  ],
  "19-1": [
    [
      2,
      "오전 6시 이전 납품.",
      "work"
    ]
  ],
  "20-1": [
    [
      22,
      "우유 없음",
      "daughter",
      {
        "sender": "",
        "title": "도착한 메시지",
        "status": "수신"
      }
    ],
    [
      25,
      "내일 사갈게",
      "eunkyeong"
    ],
    [
      27,
      "안 까먹게 알람 해",
      "daughter"
    ],
    [
      30,
      "일어나기 / 우유",
      "work"
    ],
    [
      39,
      "추가 검증 완료 예정 06:00",
      "medical"
    ],
    [
      40,
      "치료 일정 08:00",
      "work"
    ],
    [
      63,
      "광고꿈 감정형 패키지 / 활성",
      "work"
    ],
    [
      70,
      "일어나기 / 우유",
      "work"
    ],
    [
      79,
      "추가 검증 완료 예정 06:00",
      "medical"
    ]
  ],
  "21-1": [
    [
      2,
      "구조 0 / 12.",
      "tower"
    ],
    [
      5,
      "은경은 작업화 끈을 묶었다. 꿈에서도 같은 신발이었다.",
      "tower"
    ],
    [
      10,
      "구조 2 / 12.",
      "tower"
    ],
    [
      11,
      "은경은 출구의 철문 아래에 부러진 난간을 끼웠다. 문이 닫히려다 걸렸다.",
      "tower"
    ],
    [
      15,
      "구조 5 / 12.",
      "tower"
    ],
    [
      16,
      "7층 복도에서는 네 사람이 엎드려 기침하고 있었다. 은경은 비상등 아래로 그들을 몰았다. 마지막 사람의 손이 소매를 놓지 않았다.",
      "tower"
    ],
    [
      22,
      "계단 아래에서 문이 덜컹였다. 끼워 둔 난간은 버텼다.",
      "tower"
    ],
    [
      23,
      "구조 9 / 12.",
      "tower"
    ],
    [
      43,
      "잠시 뒤 숫자가 열이 됐다. 곧 열하나가 됐다.",
      "tower"
    ],
    [
      44,
      "구조 11 / 12.",
      "tower"
    ],
    [
      49,
      "은경은 멈추지 못하고 무릎으로 모서리를 찍었다. 벌어진 틈 아래로 불이 보였다. 무언가를 잡았는데 손바닥이 먼저 찢어졌다.",
      "tower",
      {
        "sense": [
          {
            "label": "접촉",
            "value": "무릎 · 손바닥"
          }
        ]
      }
    ],
    [
      57,
      "난간을 잡고 몸을 흔들었다. 첫 발길질은 빗나갔다. 두 번째에 발뒤꿈치가 문을 쳤다. 문이 열리고 몸이 안쪽으로 쏟아졌다.",
      "tower"
    ],
    [
      71,
      "깨진 창 너머로 옆 건물 옥상이 보였다. 그냥 뛰어서는 닿지 않을 것 같았다. 사이로 송출탑의 버팀대가 비스듬히 걸려 있었다. 끝이 흔들렸다.",
      "tower"
    ],
    [
      76,
      "첫발을 버팀대에 놓았다. 철이 휘는 소리가 발밑에서 났다.",
      "tower",
      {
        "sense": [
          {
            "label": "소리",
            "value": "철이 휘는 소리"
          }
        ]
      }
    ],
    [
      79,
      "옥상 턱에 배가 걸렸다. 숨이 끊겼다. 등에서 노인이 미끄러졌다. 은경은 그의 팔을 놓지 않은 채 콘크리트를 긁었다.",
      "tower"
    ],
    [
      82,
      "은경은 발끝에 아직 닿아 있던 버팀대 끝을 디뎌 찼다. 둘이 한꺼번에 옥상 안쪽으로 굴렀다.",
      "tower"
    ],
    [
      83,
      "송출탑이 무너지는 소리가 등 뒤로 길게 지나갔다.",
      "tower"
    ],
    [
      85,
      "은경은 옆으로 고개를 돌렸다. 노인이 기침했다. 그 소리를 듣고서야 손을 놓았다.",
      "tower"
    ],
    [
      86,
      "구조 12 / 12.",
      "tower"
    ],
    [
      87,
      "은경은 웃었다. 노인도 웃었다. 둘 다 누운 채였다.",
      "tower"
    ],
    [
      109,
      "좋았던 점을 남겨 주세요. (선택)",
      "survey"
    ],
    [
      124,
      "큰 걸로 두 개. 하나는 초코.",
      "daughter"
    ],
    [
      126,
      "초코는 내 거야.",
      "eunkyeong"
    ]
  ],
  "22-1": [
    [
      1,
      "임시 임원회의 · 07:30 · 안건 1건.",
      "externalOffer",
      {
        "sender": "회사",
        "title": "임시 임원회의"
      }
    ],
    [
      2,
      "인지안전실장 해임 및 제4 검증층 영구 비공유 결의 (제안: 전략본부 마정훈 상무).",
      "externalOffer",
      {
        "sender": "회사",
        "title": "임시 임원회의"
      }
    ],
    [
      115,
      "제4 의료 검증 예비층 자발적 공유 시범.",
      "monitor"
    ],
    [
      116,
      "참여 여부: 개인 선택.",
      "monitor"
    ],
    [
      117,
      "불이익 없음.",
      "monitor"
    ],
    [
      118,
      "철회 가능.",
      "monitor"
    ],
    [
      120,
      "현재 참여율.",
      "monitor"
    ],
    [
      121,
      "조직별 참여율.",
      "monitor"
    ],
    [
      123,
      "소속 조직 평균.",
      "monitor"
    ]
  ],
  "24-1": [
    [
      27,
      "공공기준 컨설팅 · 실장 노.",
      "work"
    ],
    [
      135,
      "서인은 본 제도를 인증·보증하지 않았습니다.",
      "notice"
    ],
    [
      170,
      "서인 기준 = 환불 됨 ㅋㅋ",
      "group"
    ],
    [
      171,
      "그 사람 진짜 있는 거야? v2.2라며",
      "group"
    ],
    [
      172,
      "우리 회사도 붙이자 ‘서인 기준’",
      "group"
    ]
  ],
  "25-1": [
    [
      62,
      "대파 1단 2.1 TOKEN.",
      "transaction",
      {
        "sender": "진열대",
        "title": "가격표"
      }
    ],
    [
      69,
      "대파 1단 1.9 TOKEN.",
      "transaction",
      {
        "sender": "진열대",
        "title": "가격표"
      }
    ],
    [
      85,
      "합성 달걀 12구 0.65 TOKEN.",
      "transaction",
      {
        "sender": "진열대",
        "title": "가격표"
      }
    ],
    [
      86,
      "자연란 12구 2.80 TOKEN.",
      "transaction",
      {
        "sender": "진열대",
        "title": "가격표"
      }
    ],
    [
      97,
      "영양 성분 동일. 합성 달걀을 추천합니다. 단백질 구성은 오히려—",
      "shelf"
    ],
    [
      131,
      "경도 2.1.",
      "transaction",
      {
        "sender": "진열대 화면",
        "title": "상품 안내"
      }
    ],
    [
      132,
      "교정 장치 손상 위험 낮음.",
      "transaction",
      {
        "sender": "진열대 화면",
        "title": "상품 안내"
      }
    ],
    [
      133,
      "당류 18%.",
      "transaction",
      {
        "sender": "진열대 화면",
        "title": "상품 안내"
      }
    ],
    [
      134,
      "추천 1위.",
      "transaction",
      {
        "sender": "진열대 화면",
        "title": "상품 안내"
      }
    ],
    [
      177,
      "광고꿈 야간 추가 계약 모집.",
      "work"
    ],
    [
      178,
      "참여 보상 +3.0 TOKEN.",
      "news"
    ],
    [
      192,
      "신청 완료.",
      "queue"
    ],
    [
      194,
      "뉴스에 네 이름 나왔더라. 이거 네가 만든 거니?",
      "motherToSeoin"
    ],
    [
      196,
      "미경 씨 이거 봤어? 3토큰 준대.",
      "toMigyeong"
    ],
    [
      198,
      "봤어요. 저는 점심때 눌렀어요.",
      "migyeong"
    ],
    [
      199,
      "다은이 교정 다음 칸이 금요일이라서요.",
      "migyeong"
    ],
    [
      205,
      "동부 27번 신규 신청 일시 대기.",
      "queue"
    ],
    [
      206,
      "현재 대기 순번 412.",
      "queue"
    ],
    [
      207,
      "보상은 승인 후 확정됩니다.",
      "queue"
    ],
    [
      243,
      "현재 대기 순번 412.",
      "queue"
    ],
    [
      270,
      "나 대기 걸렸네.",
      "motherToSeoin"
    ]
  ],
  "30-1": [
    [
      50,
      "10:58 · 금일 회수 3/5 · 마감 24:00.",
      "work",
      {
        "sender": "회수 업무 화면",
        "title": "금일 회수"
      }
    ],
    [
      116,
      "백윤하 · 내일 08:10 · 회의실로 바로 오세요. 문은 제가 닫겠습니다.",
      "externalOffer",
      {
        "sender": "백윤하",
        "title": "회의 요청"
      }
    ]
  ],
  "30-2": [
    [
      2,
      "후속 관찰 미지급분 2,800 TOKEN.",
      "ledger"
    ],
    [
      4,
      "지급 완료. 지급원: 개인.",
      "ledger"
    ],
    [
      37,
      "회복 수면 기록 1건.",
      "archive"
    ],
    [
      38,
      "판매가 860 TOKEN.",
      "archive"
    ],
    [
      39,
      "구매 목적: 자율 꿈 패턴 연구.",
      "archive"
    ],
    [
      42,
      "철회 요청: 22:14.",
      "irreversible"
    ],
    [
      43,
      "1차 구매자 전달 완료: 21:52.",
      "irreversible"
    ],
    [
      44,
      "완전 회수 불가.",
      "irreversible"
    ]
  ],
  "19-2": []
};

const OVERRIDES = new Map(Object.entries(AUTHORED).flatMap(([chapterId, rows]) =>
  rows.map(([index, anchor, preset, extra]) => [chapterId + ':' + index, { anchor, preset, extra }])));

const SUPPORTED_CHAPTERS = new Set([
  '1', '2', '3', '4', '4-1', '5', '6', '6-1', '7', '7-2',
  '8', '8-1', '8-2', '8-3', '9', '9-1', '10', '11', '12', '12-1',
  '13', '13-1', '13-2', '14', '15', '15-1', '16', '16-1', '17', '18',
  '19', '19-1', '19-2', '20', '20-1', '21', '21-1', '22', '22-1', '23',
  '24', '24-1', '25', '25-1', '26', '27', '28', '29', '30', '30-1', '30-2',
]);

/** Pure, reload-safe direction. Does not inspect prior saves or later beats. */
export function presentationForBeat(chapter, beat, index) {
  const chapterId = String(chapter?.id ?? '');
  const episode = Number(chapterId.split('-')[0]);
  if (!SUPPORTED_CHAPTERS.has(chapterId) || episode < 1 || episode > 30 ||
      !Number.isInteger(index) || index < 0 || typeof beat?.text !== 'string' || !beat.text.trim()) return null;
  const id = chapterId + ':' + index;
  const authored = OVERRIDES.get(id);
  if (authored) {
    // A source edit must not silently inherit an old beat's channel direction.
    if (authored.anchor !== beat.text) return null;
    return copyPresentation(id, PRESETS[authored.preset], authored.extra, beat.text);
  }
  // The parser's system kind also includes paper signs and remembered speech.
  // Only the explicit, live Mono voice has a safe automatic interpretation.
  if (beat.kind === 'system' && beat.speaker === '모노' && /^〈[^〈〉]+〉$/.test(beat.text)) {
    return copyPresentation(id, { kind: 'assistant', sender: '모노', title: '개인 AI', accent: 'ice', priority: 'quiet', revealMs: 220 }, null, beat.text);
  }
  // A name alone can be an address; an ordinary conversation about AI cannot.
  if (beat.kind === 'dialogue' && /^“모노[.,?!…\s]*”$/.test(beat.text)) {
    return copyPresentation(id, { kind: 'assistant', sender: beat.speaker || '', title: '모노에게', status: '호출', accent: 'ice', priority: 'quiet', revealMs: 180 }, null, beat.text);
  }
  return null;
}

function copyPresentation(id, preset, extra, body) {
  const cue = { id, primary: preset.kind !== 'neural', ...preset, ...(extra || {}), body };
  // Callers may decorate their copy without changing later navigation or saves.
  if (cue.sense) cue.sense = cue.sense.map(item => ({ ...item }));
  return cue;
}
