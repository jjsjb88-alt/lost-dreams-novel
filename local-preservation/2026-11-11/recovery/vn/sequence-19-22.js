import { EP1_ASSETS } from './ep1-assets.js';
import { presentationForBeat } from './neural-cues.js';

export const SEQUENCE_19_22_CHAPTERS = Object.freeze(['19', '20', '20-1', '21', '21-1', '22']);
const SEQUENCE_SET = new Set(SEQUENCE_19_22_CHAPTERS);

export const SEQUENCE_19_22_ASSETS = Object.freeze({
  yoonsera: EP1_ASSETS.yoonsera,
  eunkyung: EP1_ASSETS.eunkyung,
  haerin: EP1_ASSETS.haerin,
});

export const SEQUENCE_19_22_CHAPTER_INFO = Object.freeze({
  '19': {
    step: '01 / 06',
    label: '제19화',
    title: '문을 열어 주는 사람',
    summary: '04-771의 수동 중단 권한을 확인하려는 서인이 인간 승인 전용 위원 윤세라의 면담과 검증을 거친다.',
    endTitle: '열린 구멍과 등급 5',
    endMessage: '19화를 마쳤습니다. 다음 20화 「누를 수 있는 사람」에서 공동 운영위원회 중단 권한 감사와 지우의 메시지가 이어집니다.',
  },
  '20': {
    step: '02 / 06',
    label: '제20화',
    title: '누를 수 있는 사람',
    summary: '중단 권한 감사에서 72시간 보호 한계와 지우의 “내 건 끄지 마”를 마주한 서인이 등급 6 제한 승인자가 된다.',
    endTitle: '단독으로 누를 수 없는 버튼',
    endMessage: '20화를 마쳤습니다. 다음 20-1화 「두 집의 밤」에서 같은 밤을 앞둔 최은경과 문해린의 집으로 이어집니다.',
  },
  '20-1': {
    step: '03 / 06',
    label: '제20-1화',
    title: '두 집의 밤',
    summary: '동부 27번 최은경의 새벽 알람 네 개와 문해린의 오전 6시 추가 검증 완료 예정이 같은 밤 위에 놓인다.',
    endTitle: '05:40의 알람과 06:00의 검증',
    endMessage: '20-1화를 마쳤습니다. 다음 21화 「좋아진 밤의 가격」에서 동부 27번 야간 완화 시범과 희귀질환 검증 지연이 충돌합니다.',
  },
  '21': {
    step: '04 / 06',
    label: '제21화',
    title: '좋아진 밤의 가격',
    summary: '동부 27번의 야간 패키지 강도를 14% 낮추자 문해린 아이의 사전 검증이 밀리고, 서인은 직접 문해린에게 전화한다.',
    endTitle: '완화 폭 8%와 남겨진 주석',
    endMessage: '21화를 마쳤습니다. 다음 21-1화 「마지막 한 사람」에서 같은 밤을 건넌 최은경의 꿈과 아침이 이어집니다.',
  },
  '21-1': {
    step: '05 / 06',
    label: '제21-1화',
    title: '마지막 한 사람',
    summary: '완화된 밤의 구조 패키지에서 처음으로 열두 번째 노인까지 구해낸 최은경이 상처 없는 손바닥으로 아침을 맞는다.',
    endTitle: '끝까지 갔어요 · 우유 두 개',
    endMessage: '21-1화를 마쳤습니다. 시퀀스 마지막 장인 22화 「네 번째 안전」으로 이어집니다.',
  },
  '22': {
    step: '06 / 06',
    label: '제22화',
    title: '네 번째 안전',
    summary: '인지안전실장 백윤하가 기업 제4 검증층 예비 연산 전환을 제안하고, 새벽의 57분 지연 앞에서 세 사람이 같은 답을 고른다.',
    endTitle: '네 번째 안전',
    endMessage: '19~22화 시퀀스(19 → 20 → 20-1 → 21 → 21-1 → 22화)를 모두 읽었습니다. 누군가의 이긴 아침과 누군가의 57분이 나란히 기록에 남았습니다.',
  },
});

export const SEQUENCE_19_22_SCENES = Object.freeze({
  '19': Object.freeze([
    { index: 0, title: '04-771 수동 중단 권한과 승급 조건' },
    { index: 62, title: '공동 운영위원 윤세라와의 면담' },
    { index: 123, title: '첫 번째 검증 · 노드 31-B 장애와 2,400가구' },
    { index: 188, title: '두 번째 검증 · 동부 27번의 가족 행사' },
    { index: 260, title: '등급 4 → 5 승급과 감사 참여 조건' },
    { index: 307, title: '도윤과의 밤 메시지 · 비공개 참여자 4' },
  ]),
  '20': Object.freeze([
    { index: 0, title: '감사실 앞 복도 · 실제였던 동부 27번' },
    { index: 25, title: '04-771 공급망과 네 종류의 중단 버튼' },
    { index: 67, title: '11분 만에 철회된 전체망 중단과 승인자 4' },
    { index: 100, title: '지우의 메시지 · “내 건 끄지 마”' },
    { index: 131, title: '등급 6 권한 시뮬레이션과 72시간의 한계' },
    { index: 208, title: '폐쇄된 클리닉 옥상 · 도윤과의 컵라면' },
    { index: 254, title: '집으로 돌아온 밤 · 등급 6 화면' },
  ]),
  '20-1': Object.freeze([
    { index: 0, title: '동부 27번 최은경의 집 · 05:40 알람 네 개' },
    { index: 31, title: '문해린의 집 · 체육복과 06:00 사전 검증' },
    { index: 60, title: '고부하 야간 인지 패키지 활성과 두 집의 밤' },
  ]),
  '21': Object.freeze([
    { index: 0, title: '04-771 운영 회의실 · 동부 27번 14% 완화 시범' },
    { index: 42, title: '0시 31분 · 희귀질환 다중 검증 지연 경고' },
    { index: 74, title: '문해린과의 첫 통화 · “체육복까지 챙겨 놨어요”' },
    { index: 107, title: '완화 폭 14% → 8% 조정과 거주 지역 명시' },
    { index: 131, title: '1시 36분 두 번째 통화와 아침 6시의 완료' },
  ]),
  '21-1': Object.freeze([
    { index: 0, title: '기우는 송출탑 · 구조 0 / 12에서 11 / 12까지' },
    { index: 52, title: '무너진 계단 너머의 노인과 마지막 점프' },
    { index: 86, title: '구조 12 / 12 · “이겼다”와 06:12의 기상' },
    { index: 106, title: '꿈 만족도 “끝까지 갔어요”와 우유 두 개' },
  ]),
  '22': Object.freeze([
    { index: 0, title: '인지안전실장 백윤하 · 제4 검증층 전환 제안' },
    { index: 69, title: '백윤하의 반대 메모 · “그 둘이 같은 답을 고르면”' },
    { index: 88, title: '두 번째 시범과 새벽 01:12 보호자의 항의' },
    { index: 131, title: '02:09 제4 독립 검증 완료와 세 사람의 이름' },
  ]),
});

const SPEAKERS = Object.freeze({
  '19': Object.freeze({
    12: '강연우', 13: '서인', 14: '강연우', 16: '서인', 17: '강연우', 18: '서인', 19: '강연우',
    27: '서인', 29: '강연우', 30: '서인', 31: '강연우', 33: '서인', 34: '강연우',
    42: '강연우', 43: '서인', 44: '강연우', 45: '서인', 46: '강연우', 47: '서인', 48: '강연우', 49: '서인', 50: '강연우', 52: '강연우',
    58: '강연우', 59: '서인', 60: '강연우', 61: '서인',
    71: '윤세라', 74: '서인', 75: '윤세라', 77: '서인', 80: '윤세라', 81: '서인', 82: '윤세라', 86: '서인',
    88: '윤세라', 89: '서인', 90: '윤세라', 91: '서인', 92: '윤세라', 93: '서인', 94: '윤세라', 96: '서인', 97: '윤세라', 98: '서인',
    100: '윤세라', 101: '서인', 102: '윤세라', 103: '서인', 104: '윤세라',
    108: '서인', 109: '윤세라', 110: '서인', 113: '윤세라', 114: '서인', 115: '윤세라', 116: '서인', 118: '윤세라', 119: '서인',
    129: '서인', 130: '윤세라', 131: '서인', 132: '윤세라',
    144: '서인', 145: '윤세라', 146: '서인', 147: '윤세라', 148: '서인', 149: '윤세라', 150: '서인', 151: '윤세라', 152: '서인', 153: '윤세라',
    157: '서인', 159: '윤세라', 160: '서인', 162: '서인', 163: '윤세라', 164: '서인', 165: '윤세라', 167: '서인',
    171: '서인', 172: '윤세라', 174: '서인', 175: '윤세라', 176: '서인', 177: '윤세라', 178: '서인', 180: '윤세라', 181: '서인',
    192: '서인', 193: '윤세라', 204: '윤세라', 214: '윤세라', 216: '서인', 217: '윤세라', 218: '서인', 220: '윤세라',
    229: '서인', 231: '윤세라', 234: '서인', 236: '서인', 237: '윤세라', 238: '서인', 239: '윤세라', 240: '서인', 242: '서인',
    244: '윤세라', 246: '서인', 247: '윤세라', 248: '서인', 249: '윤세라', 250: '서인', 252: '윤세라', 253: '서인', 254: '윤세라', 255: '서인',
    261: '강연우', 262: '서인', 263: '강연우', 264: '서인', 265: '강연우', 267: '서인', 268: '강연우', 269: '서인', 270: '강연우', 271: '서인',
    273: '강연우', 278: '서인', 279: '강연우', 280: '서인', 281: '강연우',
    286: '서인', 288: '강연우', 289: '서인', 290: '강연우', 291: '서인', 292: '강연우', 294: '강연우',
    299: '서인', 301: '강연우', 302: '서인', 303: '강연우', 304: '서인', 306: '강연우',
  }),
  '20': Object.freeze({
    5: '윤세라', 6: '서인', 7: '윤세라', 9: '윤세라', 10: '서인', 11: '윤세라', 13: '윤세라', 14: '서인', 15: '윤세라',
    18: '서인', 19: '윤세라', 20: '서인', 21: '윤세라', 23: '윤세라',
    31: '윤세라', 40: '윤세라', 46: '서인', 47: '윤세라', 48: '서인', 55: '서인', 56: '운영위원', 64: '윤세라', 65: '서인',
    87: '윤세라', 88: '서인', 89: '윤세라', 90: '서인', 91: '윤세라', 92: '서인', 93: '윤세라', 96: '서인', 98: '윤세라', 99: '서인',
    136: '윤세라', 141: '서인', 142: '윤세라',
    160: '서인', 162: '윤세라', 163: '서인', 164: '윤세라', 165: '서인', 166: '윤세라', 167: '서인',
    174: '서인', 175: '윤세라', 176: '서인', 177: '윤세라', 179: '윤세라', 181: '서인', 182: '윤세라', 183: '서인',
    193: '강연우', 194: '서인', 195: '강연우', 196: '서인', 197: '강연우', 201: '서인', 203: '강연우', 204: '서인', 205: '강연우',
    211: '서인', 213: '도윤', 216: '도윤', 218: '서인', 220: '도윤', 221: '서인', 222: '도윤', 223: '서인', 224: '도윤', 225: '서인',
    228: '도윤', 229: '서인', 230: '도윤', 231: '서인', 232: '도윤', 234: '서인', 235: '도윤', 236: '서인',
    239: '도윤', 241: '서인', 242: '도윤', 243: '서인', 245: '도윤', 246: '서인', 247: '도윤', 248: '서인', 250: '도윤',
    275: '서인', 278: '서인',
  }),
  '20-1': Object.freeze({
    3: '딸', 4: '최은경', 5: '딸', 12: '최은경', 13: '딸', 14: '최은경',
    33: '아이', 35: '문해린', 45: '문해린', 46: '아이', 47: '문해린', 48: '아이', 51: '아이', 52: '문해린', 53: '아이', 56: '문해린',
  }),
  '21': Object.freeze({
    2: '서인', 8: '서인', 10: '윤세라', 11: '서인', 15: '윤세라', 17: '서인', 28: '윤세라', 29: '서인', 30: '윤세라', 32: '서인',
    36: '강연우', 38: '서인', 40: '강연우', 41: '서인', 45: '윤세라', 50: '서인', 52: '윤세라', 55: '서인', 57: '서인',
    70: '서인', 72: '윤세라', 73: '서인',
    75: '문해린', 76: '서인', 77: '문해린', 79: '서인', 81: '문해린', 82: '서인', 83: '문해린', 86: '서인', 87: '문해린', 88: '서인',
    90: '서인', 91: '문해린', 92: '서인', 94: '문해린', 96: '문해린',
    100: '강연우', 102: '강연우', 104: '서인', 108: '윤세라', 109: '서인', 112: '서인', 117: '윤세라', 122: '서인', 124: '윤세라',
    126: '서인', 127: '윤세라', 128: '서인',
    133: '서인', 135: '서인', 136: '문해린', 137: '서인', 138: '문해린', 140: '강연우', 141: '서인',
    156: '강연우', 157: '서인', 158: '강연우', 160: '강연우', 172: '강연우', 174: '서인', 183: '윤세라', 184: '서인',
  }),
  '21-1': Object.freeze({
    8: '최은경', 13: '최은경', 17: '요구조자', 18: '최은경', 19: '요구조자', 21: '최은경',
    26: '최은경', 28: '청년', 31: '최은경', 34: '아이', 36: '최은경', 38: '최은경', 40: '청년',
    53: '최은경', 54: '노인', 56: '최은경', 59: '노인', 60: '최은경', 61: '노인', 63: '최은경',
    67: '노인', 69: '최은경', 73: '최은경', 74: '노인', 75: '최은경', 81: '노인', 88: '최은경',
    89: '딸', 91: '딸', 93: '최은경', 94: '딸', 95: '최은경', 97: '딸',
    100: '최은경', 101: '딸', 102: '최은경', 104: '딸', 110: '최은경',
    113: '딸', 114: '최은경', 115: '딸', 117: '최은경', 119: '딸', 120: '최은경', 121: '딸',
  }),
  '22': Object.freeze({
    5: '강연우', 6: '서인', 7: '강연우',
    10: '백윤하', 13: '백윤하', 15: '서인', 16: '백윤하', 17: '서인', 18: '백윤하', 21: '서인', 22: '백윤하',
    29: '강연우', 31: '강연우', 33: '서인', 36: '서인', 37: '백윤하', 38: '서인', 40: '백윤하',
    43: '서인', 44: '백윤하', 45: '서인', 48: '백윤하', 49: '서인', 50: '백윤하',
    53: '백윤하', 54: '서인', 55: '백윤하', 58: '백윤하', 60: '백윤하', 64: '서인', 66: '서인',
    74: '서인', 75: '백윤하', 76: '서인', 79: '백윤하', 80: '서인', 81: '백윤하', 84: '백윤하', 85: '서인', 86: '백윤하',
    115: '서인', 118: '백윤하', 121: '서인', 139: '강연우', 145: '강연우', 146: '백윤하',
    149: '서인', 150: '백윤하', 153: '백윤하', 157: '서인', 161: '서인', 162: '백윤하', 165: '서인', 167: '백윤하',
  }),
});

const SPEAKER_TO_ACTOR = Object.freeze({
  서인: 'seoin',
  강연우: 'yeonwoo',
  윤세라: 'yoonsera',
  운영위원: 'yoonsera',
  도윤: 'doyun',
  최은경: 'eunkyung',
  딸: 'eunkyung',
  요구조자: 'eunkyung',
  청년: 'eunkyung',
  노인: 'eunkyung',
  문해린: 'haerin',
  아이: 'haerin',
  백윤하: 'yoonha',
});

export function isSequence1922Chapter(chapterOrId) {
  const id = typeof chapterOrId === 'string' ? chapterOrId : String(chapterOrId?.id ?? '');
  return SEQUENCE_SET.has(id);
}

export function sequenceSpeaker(chapter, index, beat) {
  const id = typeof chapter === 'string' ? chapter : String(chapter?.id ?? '');
  if (!SEQUENCE_SET.has(id)) return beat?.speaker ?? '';
  if (SPEAKERS[id]?.[index]) return SPEAKERS[id][index];
  if (beat?.speaker) return beat.speaker;
  return '';
}

function actorCast(ids, remoteIds = []) {
  const remoteSet = new Set(remoteIds);
  const names = {
    seoin: '서인',
    yeonwoo: '강연우',
    yoonsera: '윤세라',
    doyun: '도윤',
    eunkyung: '최은경',
    haerin: '문해린',
    yoonha: '백윤하',
  };
  return ids.map((id, idx) => ({
    id,
    name: names[id] || id,
    side: idx === 0 ? 'left' : 'right',
    remote: remoteSet.has(id),
  }));
}

const AUTHORED_VISUALS = Object.freeze({
  '20-1:alarms': {
    id: '20-1:alarms',
    type: 'phone',
    kicker: 'MORNING ALARMS · 05:40',
    title: '은경의 아침 알람 네 개',
    body: '새벽 출근을 앞두고 3~4분 간격으로 맞춘 기상 알람과 우유 메모.',
    rows: [
      { label: '첫 번째 알람', value: '05:40 (일어나기 / 우유)' },
      { label: '두 번째 · 세 번째', value: '05:43 · 05:47' },
      { label: '추가한 네 번째', value: '05:50' },
      { label: '수면 설정', value: '고부하 야간 인지 패키지 활성' },
    ],
    footer: '딸의 말: “알람 끄고 또 자잖아.”',
  },
  '20-1:haerin-schedule': {
    id: '20-1:haerin-schedule',
    type: 'document',
    kicker: 'PEDIATRIC IMMUNE CARE',
    title: '희귀 면역 질환 치료 예약과 사전 검증',
    body: '오전 8시 치료 예약을 지키기 위해 오전 6시까지 완료되어야 하는 다중 사전 검증.',
    chart: {
      type: 'timeline',
      unit: '',
      items: [
        { label: '야간 다중 검증', value: '진행 중' },
        { label: '추가 검증 완료 예정', value: '06:00' },
        { label: '치료 일정', value: '08:00' },
      ],
    },
    rows: [
      { label: '보호자', value: '문해린' },
      { label: '진료 과목', value: '소아 희귀 면역 질환' },
      { label: '준비물', value: '병원 서류 봉투 · 학교 체육복' },
    ],
    footer: '“병원 끝나고 학교 갈 수 있겠어?” / “내일 체육 있어.”',
  },
  '21-1:subway-rescue': {
    id: '21-1:subway-rescue',
    type: 'metric',
    kicker: 'RESCUE PACKAGE · 12 / 12',
    title: '무너지는 송출탑 · 마지막 열두 번째 구조',
    body: '완화된 밤의 고부하 구조 패키지에서 처음으로 아홉을 넘어 열두 번째 노인까지 옥상으로 구해낸 기록.',
    chart: {
      type: 'flow',
      unit: '',
      items: [
        { label: '3·5·7층 대피 유도', value: '구조 9 / 12' },
        { label: '10·11층 청년·아이', value: '구조 11 / 12' },
        { label: '옥상 버팀대 도약', value: '구조 12 / 12' },
      ],
    },
    rows: [
      { label: '이전 최고 기록', value: '구조 9 / 12' },
      { label: '오늘 밤 결과', value: '구조 12 / 12 완수' },
      { label: '만족도 음성 기록', value: '“끝까지 갔어요.”' },
    ],
    footer: '은경은 웃었다. 노인도 웃었다. “이겼다.”',
  },
  '21-1:settlement-milk': {
    id: '21-1:settlement-milk',
    type: 'ledger',
    kicker: 'MORNING 06:12 · EAST 27',
    title: '상처 없는 손바닥과 우유 두 개',
    body: '평소와 같은 정산 금액 아래 남긴 만족도 한 줄과, 딸과 약속한 우유 두 팩.',
    rows: [
      { label: '기상 시각', value: '06:12 (알람 4개 종료)' },
      { label: '야간 정산', value: '평소와 동일 (최저선 유지)' },
      { label: '만족도 기록', value: '“끝까지 갔어요.”' },
      { label: '퇴근길 약속', value: '큰 우유 두 개 (하나는 초코)' },
    ],
    footer: '“그러면 우유 두 개.” / “이긴 기념.”',
  },
});

export function sequenceBeatDirection(chapter, beat, index) {
  const id = String(chapter?.id ?? '');
  if (!SEQUENCE_SET.has(id) || !beat) return beat?.direction ?? null;
  const base = beat.direction ? { ...beat.direction } : { mood: 'quiet', camera: 'wide', place: '', cast: [], focus: '', visual: null };
  const spk = sequenceSpeaker(chapter, index, beat);
  let focusActor = SPEAKER_TO_ACTOR[spk] || base.focus || '';

  if (id === '19') {
    if (index <= 61) {
      base.place = '강연우의 사무실 · 수동 중단 권한';
      base.cast = actorCast(['seoin', 'yeonwoo']);
      if (!focusActor) focusActor = index < 11 ? 'seoin' : 'yeonwoo';
    } else if (index <= 259) {
      base.place = '공동 운영위원회 면담실 · 윤세라';
      base.cast = actorCast(['seoin', 'yoonsera']);
      if (!focusActor) focusActor = 'yoonsera';
    } else if (index <= 306) {
      base.place = '아르카디아 복도 · 등급 4 → 5';
      base.cast = actorCast(['seoin', 'yeonwoo']);
      if (!focusActor) focusActor = 'yeonwoo';
    } else {
      base.place = '서인의 방 · 참여자 4의 기록';
      base.cast = actorCast(['seoin']);
      focusActor = 'seoin';
    }
  } else if (id === '20') {
    if (index <= 24) {
      base.place = '감사실 앞 복도 · 윤세라';
      base.cast = actorCast(['seoin', 'yoonsera']);
      if (!focusActor) focusActor = 'yoonsera';
    } else if (index <= 99) {
      base.place = '공동 운영위원회 감사실 · 04-771';
      base.cast = actorCast(['seoin', 'yoonsera']);
      if (!focusActor) focusActor = 'yoonsera';
    } else if (index <= 130) {
      base.place = '감사실 · 지우의 메시지';
      base.cast = actorCast(['seoin']);
      focusActor = 'seoin';
    } else if (index <= 185) {
      base.place = '감사실 · 등급 6 권한 시뮬레이션';
      base.cast = actorCast(['seoin', 'yoonsera']);
      if (!focusActor) focusActor = 'yoonsera';
    } else if (index <= 207) {
      base.place = '감사실 · 등급 6 제한 승인자';
      base.cast = actorCast(['seoin', 'yeonwoo']);
      if (!focusActor) focusActor = 'yeonwoo';
    } else if (index <= 253) {
      base.place = '폐쇄된 수면 클리닉 옥상 · 도윤';
      base.cast = actorCast(['seoin', 'doyun']);
      if (!focusActor) focusActor = 'doyun';
    } else {
      base.place = '서인의 방 · 등급 6 화면';
      base.cast = actorCast(['seoin']);
      focusActor = 'seoin';
    }
  } else if (id === '20-1') {
    if (index <= 30) {
      base.place = '동부 27번 · 최은경의 집';
      base.cast = actorCast(['eunkyung']);
      focusActor = 'eunkyung';
      if (index >= 6 && index <= 16 && !base.visual) base.visual = AUTHORED_VISUALS['20-1:alarms'];
    } else if (index <= 59) {
      base.place = '문해린의 집 · 체육복과 병원 서류';
      base.cast = actorCast(['haerin']);
      focusActor = 'haerin';
      if (index >= 34 && index <= 57 && !base.visual) base.visual = AUTHORED_VISUALS['20-1:haerin-schedule'];
    } else if (index <= 72) {
      base.place = '동부 27번 · 은경의 침대';
      base.cast = actorCast(['eunkyung']);
      focusActor = 'eunkyung';
    } else {
      base.place = '문해린의 집 · 06:00을 기다리는 밤';
      base.cast = actorCast(['haerin']);
      focusActor = 'haerin';
    }
  } else if (id === '21') {
    if (index <= 34) {
      base.place = '04-771 운영 회의실 · 동부 27번 시범';
      base.cast = actorCast(['seoin', 'yoonsera']);
      if (!focusActor) focusActor = 'yoonsera';
    } else if (index <= 73) {
      base.place = '04-771 운영 회의실 · 희귀질환 검증 지연';
      base.cast = actorCast(focusActor === 'yeonwoo' ? ['seoin', 'yeonwoo', 'yoonsera'] : ['seoin', 'yoonsera', 'yeonwoo']);
      if (!focusActor) focusActor = 'yoonsera';
    } else if (index <= 96) {
      base.place = '운영 회의실 · 문해린과의 첫 통화';
      base.cast = actorCast(['seoin', 'haerin'], ['haerin']);
      if (!focusActor) focusActor = 'haerin';
    } else if (index <= 130) {
      base.place = '운영 회의실 · 완화 폭 14% → 8% 조정';
      base.cast = actorCast(focusActor === 'yeonwoo' ? ['seoin', 'yeonwoo', 'yoonsera'] : ['seoin', 'yoonsera', 'yeonwoo']);
      if (!focusActor) focusActor = 'yoonsera';
    } else if (index <= 143) {
      base.place = '운영 회의실 · 문해린과의 두 번째 통화';
      base.cast = actorCast(['seoin', 'haerin'], ['haerin']);
      if (!focusActor) focusActor = 'haerin';
    } else {
      base.place = '운영 회의실 · 새벽 06:00 완료와 승인자 4';
      base.cast = actorCast(focusActor === 'yeonwoo' ? ['seoin', 'yeonwoo', 'yoonsera'] : ['seoin', 'yoonsera', 'yeonwoo']);
      if (!focusActor) focusActor = 'seoin';
    }
  } else if (id === '21-1') {
    base.cast = actorCast(['eunkyung']);
    focusActor = 'eunkyung';
    if (index <= 51) {
      base.place = '고부하 구조 패키지 · 기울어진 송출탑';
    } else if (index <= 88) {
      base.place = '송출탑 옥상 · 열두 번째 노인 구조';
      if (index >= 58 && index <= 88 && !base.visual) base.visual = AUTHORED_VISUALS['21-1:subway-rescue'];
    } else if (index <= 105) {
      base.place = '동부 27번 · 은경의 아침 06:12';
    } else {
      base.place = '은경의 집 현관 · 만족도와 우유 두 개';
      if (!base.visual) base.visual = AUTHORED_VISUALS['21-1:settlement-milk'];
    }
  } else if (id === '22') {
    if (index <= 7) {
      base.place = '04-771 운영 회의실 · 제안서 도착';
      base.cast = actorCast(['seoin', 'yeonwoo']);
      if (!focusActor) focusActor = 'yeonwoo';
    } else if (index <= 87) {
      base.place = '소회의실 · 인지안전실장 백윤하';
      base.cast = actorCast(focusActor === 'yeonwoo' ? ['seoin', 'yeonwoo', 'yoonha'] : ['seoin', 'yoonha', 'yeonwoo']);
      if (!focusActor) focusActor = 'yoonha';
    } else {
      base.place = '04-771 운영 회의실 · 제4 검증과 57분';
      base.cast = actorCast(focusActor === 'yeonwoo' ? ['seoin', 'yeonwoo', 'yoonha'] : ['seoin', 'yoonha', 'yeonwoo']);
      if (!focusActor) focusActor = 'yoonha';
    }
  }

  base.focus = focusActor;
  return base;
}

function isStandaloneBeat(chapter, beat, index) {
  if (!beat) return true;
  if (beat.choice) return true;
  if (beat.kind === 'system') return true;
  const cue = presentationForBeat(chapter, beat, index);
  if (cue) return true;
  if (beat.direction?.effect) return true;
  return false;
}

const HARD_PAGE_STARTS = Object.freeze({
  '19': new Set([0, 7, 11, 20, 35, 53, 62, 70, 80, 95, 107, 123, 136, 154, 168, 184, 188, 203, 213, 222, 230, 245, 260, 274, 283, 295, 307, 320, 329, 342]),
  '20': new Set([0, 4, 16, 25, 39, 54, 67, 79, 86, 100, 118, 131, 149, 160, 170, 180, 186, 200, 208, 226, 237, 254, 263, 273, 281]),
  '20-1': new Set([0, 6, 17, 23, 31, 37, 43, 50, 60, 69, 73, 81, 89]),
  '21': new Set([0, 5, 14, 23, 31, 35, 42, 49, 60, 70, 74, 80, 89, 97, 107, 118, 125, 131, 139, 146, 155, 161, 167, 175, 181]),
  '21-1': new Set([0, 5, 11, 16, 24, 33, 42, 47, 52, 58, 65, 71, 78, 83, 89, 98, 105, 111, 118, 122]),
  '22': new Set([0, 8, 19, 28, 36, 42, 47, 52, 61, 69, 77, 83, 88, 95, 108, 114, 120, 126, 131, 136, 141, 148, 155, 160, 166]),
});

const CHAPTER_PAGE_CACHE = new Map();

function buildChapterPageRanges(chapter) {
  const id = String(chapter?.id ?? '');
  const beats = chapter?.beats ?? [];
  const cacheKey = `${id}:${beats.length}`;
  if (CHAPTER_PAGE_CACHE.has(cacheKey)) return CHAPTER_PAGE_CACHE.get(cacheKey);

  const hardStarts = HARD_PAGE_STARTS[id] ?? new Set();
  const ranges = [];
  let i = 0;

  while (i < beats.length) {
    const first = beats[i];
    if (isStandaloneBeat(chapter, first, i)) {
      ranges.push([i, i]);
      i += 1;
      continue;
    }

    const firstDir = sequenceBeatDirection(chapter, first, i);
    const firstVisualId = firstDir?.visual?.id || '';
    const firstPlace = firstDir?.place || '';
    const firstScene = first.scene || '';

    let end = i;
    let charCount = Array.from(first.text || '').length;
    let count = 1;
    let dialogueCount = first.kind === 'dialogue' ? 1 : 0;

    while (end + 1 < beats.length) {
      const nextIdx = end + 1;
      if (hardStarts.has(nextIdx)) break;
      const nextBeat = beats[nextIdx];
      if (isStandaloneBeat(chapter, nextBeat, nextIdx)) break;

      const nextDir = sequenceBeatDirection(chapter, nextBeat, nextIdx);
      if ((nextBeat.scene || '') !== firstScene) break;
      if ((nextDir?.place || '') !== firstPlace) break;
      if ((nextDir?.visual?.id || '') !== firstVisualId) break;

      const nextLen = Array.from(nextBeat.text || '').length;
      const nextIsDialogue = nextBeat.kind === 'dialogue';

      if (count >= 3) break;
      if (charCount + nextLen > 125) break;
      if (dialogueCount + (nextIsDialogue ? 1 : 0) > 2) break;
      if (beats[end].direction?.emphasis || nextBeat.direction?.emphasis) break;
      if ((beats[end].direction?.pauseMs || 0) >= 620) break;

      end = nextIdx;
      charCount += nextLen;
      count += 1;
      if (nextIsDialogue) dialogueCount += 1;
    }

    ranges.push([i, end]);
    i = end + 1;
  }

  CHAPTER_PAGE_CACHE.set(cacheKey, ranges);
  return ranges;
}

function formatSequenceEntry(entry, speakerCount, hasNarration) {
  if (entry.kind === 'dialogue' && entry.speaker && (speakerCount > 1 || hasNarration)) {
    return `${entry.speaker}: ${entry.text}`;
  }
  return entry.text;
}

export function sequenceReadingPage(chapter, index) {
  const id = String(chapter?.id ?? '');
  if (!SEQUENCE_SET.has(id) || !Array.isArray(chapter?.beats)) return null;
  if (!Number.isInteger(index) || index < 0 || index >= chapter.beats.length) return null;

  const ranges = buildChapterPageRanges(chapter);
  const range = ranges.find(([start, end]) => index >= start && index <= end) ?? [index, index];
  const [rangeStart, end] = range;
  const start = index > rangeStart ? index : rangeStart;

  const entries = [];
  for (let current = start; current <= end; current += 1) {
    const source = chapter.beats[current];
    if (!source) break;
    entries.push({
      ...source,
      index: current,
      speaker: sequenceSpeaker(chapter, current, source),
    });
  }
  if (!entries.length) return null;

  const dialogueSpeakers = [...new Set(entries.filter((e) => e.kind === 'dialogue' && e.speaker).map((e) => e.speaker))];
  const hasNarration = entries.some((e) => e.kind !== 'dialogue');
  const speaker = dialogueSpeakers.length === 1 && !hasNarration ? dialogueSpeakers[0] : '';
  const text = entries.map((e) => formatSequenceEntry(e, dialogueSpeakers.length, hasNarration)).join('\n\n');
  const lastSpeaker = [...entries].reverse().find((e) => e.speaker)?.speaker;
  const lastDir = sequenceBeatDirection(chapter, entries.at(-1), end);
  const focus = SPEAKER_TO_ACTOR[lastSpeaker] || lastDir?.focus || '';

  return { start, end, rangeStart, entries, speaker, text, focus };
}

export function sequencePreviousPage(chapter, index) {
  const id = String(chapter?.id ?? '');
  if (!SEQUENCE_SET.has(id) || !Array.isArray(chapter?.beats)) return null;
  if (!Number.isInteger(index) || index <= 0) return null;

  const ranges = buildChapterPageRanges(chapter);
  const currentRangeIndex = ranges.findIndex(([start, end]) => index >= start && index <= end);
  if (currentRangeIndex === -1) return Math.max(0, index - 1);
  return ranges[Math.max(0, currentRangeIndex - 1)][0];
}

export function nextSequence1922Progress(progress, story) {
  const chapter = story?.chapters?.find((item) => item.id === progress?.chapterId);
  if (!chapter) return { chapterId: SEQUENCE_19_22_CHAPTERS[0], beatIndex: 0, finished: false };
  if (progress.beatIndex + 1 < chapter.beats.length) {
    return {
      ...progress,
      beatIndex: progress.beatIndex + 1,
      finished: false,
      sequenceFinished: false,
    };
  }
  const seqIdx = SEQUENCE_19_22_CHAPTERS.indexOf(chapter.id);
  if (seqIdx >= 0 && seqIdx + 1 < SEQUENCE_19_22_CHAPTERS.length) {
    return {
      ...progress,
      chapterId: SEQUENCE_19_22_CHAPTERS[seqIdx + 1],
      beatIndex: 0,
      finished: false,
      sequenceFinished: false,
    };
  }
  return {
    ...progress,
    beatIndex: Math.max(0, chapter.beats.length - 1),
    finished: true,
    sequenceFinished: true,
  };
}

export function previousSequence1922Progress(progress, story) {
  const chapter = story?.chapters?.find((item) => item.id === progress?.chapterId);
  if (!chapter) return { chapterId: SEQUENCE_19_22_CHAPTERS[0], beatIndex: 0, finished: false };
  if (progress.beatIndex > 0) {
    return { ...progress, beatIndex: progress.beatIndex - 1, finished: false, sequenceFinished: false };
  }
  const seqIdx = SEQUENCE_19_22_CHAPTERS.indexOf(chapter.id);
  if (seqIdx > 0) {
    const prevChapterId = SEQUENCE_19_22_CHAPTERS[seqIdx - 1];
    const prevChapter = story?.chapters?.find((item) => item.id === prevChapterId);
    const lastIdx = Math.max(0, (prevChapter?.beats?.length || 1) - 1);
    const prevRangeStart = prevChapter ? sequenceReadingPage(prevChapter, lastIdx)?.rangeStart ?? lastIdx : 0;
    return {
      ...progress,
      chapterId: prevChapterId,
      beatIndex: prevRangeStart,
      finished: false,
      sequenceFinished: false,
    };
  }
  return { ...progress, beatIndex: 0, finished: false, sequenceFinished: false };
}
