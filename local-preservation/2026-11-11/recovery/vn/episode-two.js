const SPEAKERS = {
  // Scene 1: 광고 없는 아침 (0..19)
  5: '모노', 10: '서인', 11: '모노', 12: '서인', 13: '모노', 14: '서인', 15: '모노',
  // Scene 2: 어머니와 검진비 (20..64)
  21: '어머니', 23: '서인', 24: '어머니', 28: '서인', 29: '어머니', 30: '서인', 31: '어머니',
  33: '어머니', 34: '서인', 35: '어머니', 36: '서인', 39: '어머니', 40: '서인', 41: '어머니',
  42: '서인', 43: '어머니', 45: '서인', 46: '어머니', 49: '어머니', 52: '어머니', 54: '서인',
  55: '어머니', 56: '서인', 57: '어머니', 59: '어머니', 61: '어머니',
  // Scene 3: 지우의 빈자리와 초대 (65..84)
  67: '옆자리 직원', 69: '옆자리 직원', 70: '동료', 72: '옆자리 직원', 73: '동료',
  74: '옆자리 직원', 76: '동료', 77: '옆자리 직원', 78: '동료',
  // Scene 4: 지우 아버지와의 대면 (85..150)
  87: '지우', 88: '서인', 89: '지우', 92: '지우 아버지', 93: '서인', 94: '지우 아버지',
  99: '지우 아버지', 101: '지우', 102: '지우 아버지', 103: '지우', 104: '지우 아버지',
  106: '지우 아버지', 108: '지우', 109: '지우 아버지', 110: '지우', 111: '지우 아버지',
  113: '지우 아버지', 115: '지우 아버지', 116: '지우', 117: '지우 아버지', 124: '지우',
  126: '지우', 127: '지우 아버지', 128: '지우', 129: '지우 아버지', 132: '지우 아버지',
  133: '지우', 134: '지우 아버지', 137: '지우', 141: '지우', 142: '지우 아버지',
  143: '지우', 145: '지우 아버지', 147: '지우 아버지',
  // Scene 5: 밖에서의 점토 대화 (151..205)
  153: '지우', 155: '서인', 156: '지우', 157: '서인', 158: '지우', 159: '서인', 160: '지우',
  161: '서인', 162: '지우', 164: '지우', 165: '서인', 166: '지우', 167: '서인', 168: '지우',
  170: '지우', 175: '서인', 176: '지우', 177: '서인', 178: '지우', 180: '지우', 181: '서인',
  182: '지우', 184: '서인', 185: '지우', 187: '지우', 188: '서인', 189: '지우', 191: '지우',
  192: '서인', 193: '지우', 195: '지우', 197: '지우', 199: '지우', 200: '서인', 201: '지우',
  202: '서인', 203: '지우', 205: '지우',
  // Scene 6: 광고를 다시 켜는 서인 (206..231)
  207: '모노', 208: '서인', 209: '모노', 210: '서인', 211: '모노', 213: '서인', 214: '모노',
  215: '서인', 216: '모노', 217: '서인', 219: '모노', 220: '서인', 221: '모노',
  // Scene 7: 지나치게 아름다운 광고꿈 (232..265)
  239: '꿈속 지우', 244: '서인', 257: '서인', 260: '서인', 262: '서인',
  // Scene 8: 중도 종료와 새벽 메시지 (266..285)
  270: '서인',
};

export function episodeTwoSpeaker(index, beat = null) {
  if (Object.prototype.hasOwnProperty.call(SPEAKERS, index)) {
    return SPEAKERS[index];
  }
  return beat?.speaker || '';
}

const SCENES = [
  [0, '광고 없이 잔 첫날', '광고 없이 잔 첫날, 서인은 아무 꿈도 꾸지 않았다.', 'room', null],
  [8, '0 토큰의 아침', '수면 6시간 49분.  \n신체 회복률 97.9%.  \n감정 만족도 61.3%.  \n광고 수익 +0 TOKEN.', 'room', null],
  [20, '정산 알림이 없는 식탁', '주방에 나가자 어머니가 그를 보자마자 물었다.', 'room', 'musicTable'],
  [48, '대신 돈은 계산해야지', '어머니는 잠시 고민하더니 의자를 빼 앉았다.', 'room', 'musicTable'],
  [62, '출근길의 계산표', '출근길 내내 그 말이 따라왔다.', 'train', null],
  [65, '비어 있는 자리', '회사에 도착하자 지우 자리는 비어 있었다.', 'office', null],
  [82, '지우의 초대', '점심시간이 조금 지났을 때 메시지가 왔다.', 'office', null],
  [85, '약 냄새가 남은 거실', '지우의 집이었다.', 'livingroom', null],
  [95, '가계 시뮬레이션', '그는 앉으라고 한 뒤 한참 말을 고르다가 태블릿을 밀었다.', 'livingroom', 'musicChoice'],
  [112, '잘 살았잖아', '아버지의 목소리가 처음으로 높아졌다.', 'livingroom', 'musicChoice'],
  [135, '내가 없잖아', '지우는 오래 대답하지 않았다.', 'livingroom', null],
  [144, '꺼진 화면', '아버지는 한동안 붉은 숫자만 바라봤다.', 'livingroom', null],
  [151, '계산해도 안 나오는 것', '집을 나선 뒤 둘은 한동안 말없이 걸었다.', 'streetWalk', null],
  [169, '제자리의 웃음', '지우는 짜증을 내다가 갑자기 웃었다.', 'streetWalk', 'musicTable'],
  [173, '기억나지 않는 컵', '지우가 주머니에서 작은 것을 꺼냈다.', 'streetWalk', 'musicTable'],
  [190, '포기한 건지 빼앗긴 건지', '웃음이 사라졌다.', 'streetWalk', 'musicChoice'],
  [197, '한 달의 확인', '“한 달만 찾아볼 거야.”', 'streetWalk', 'musicTable'],
  [206, 'AI가 모르는 것', '그날 저녁 모노는 지우와의 만남을 분석했다.', 'room', 'musicChoice'],
  [223, '검은 시간과 12토큰', '침대에 누웠다.', 'room', 'musicTable'],
  [232, '소중한 사람과 떠나는 휴양지', '바다가 펼쳐졌다.', 'coast', 'musicSereneDream'],
  [250, '지나치게 아름다운', '서인은 갑자기 숨이 막혔다.', 'coast', 'musicSereneDream'],
  [257, '응답 없는 이름', '“모노.”', 'coast', 'musicSereneDream'],
  [266, '03:17 · 중도 종료', '눈을 뜨자 새벽 3시 17분이었다.', null, null],
  [278, '03:24 · 이상하게 좋다', '새벽 3시 24분.', null, null],
];

const ACTOR_NAMES = {
  seoin: '서인',
  mother: '어머니',
  jiwoo: '지우',
  father: '지우 아버지',
};

const SIMULATION_ROWS = [
  ['지우 광고꿈 중단', '월 −327 TOKEN'],
  ['퇴직 후 예상 소득', '−43%'],
  ['가족 의료 플랜 갱신 비용', '+16%'],
  ['차녀 교육 AI 등급 유지 가능성', '38%'],
];

const validated = new WeakMap();
const actor = (id, asset, side, gaze, pose) => ({
  id,
  asset,
  side,
  gaze,
  pose,
  name: ACTOR_NAMES[id] || id,
});

export const EPISODE_TWO_SCENES = SCENES.map(([index, title]) => ({ index, title }));

export function episodeTwoDirection(chapter, index) {
  if (String(chapter?.id) !== '2' || !Number.isInteger(index) || index < 0 || index >= 286) return null;
  if (!validated.has(chapter)) {
    validated.set(
      chapter,
      chapter.beats?.length === 286 && SCENES.every(([i, , text]) => chapter.beats[i]?.text === text),
    );
  }
  if (!validated.get(chapter)) return null;

  const row = SCENES.findLast(([start]) => start <= index);
  const [start, title, , ambience, music] = row;
  const beat = chapter.beats[index];
  const speaker = episodeTwoSpeaker(index, beat);

  const out = {
    index,
    sceneStart: start,
    title,
    ambience,
    music,
    actors: [],
    focus: speaker,
    cg: null,
    shot: 'wide',
    intro: index < 3,
    blackout: index === 271,
    silence: index >= 271 && index <= 276,
    hideLegacyVisual: true,
    document: null,
    wallAd: false,
    fx: null,
    gap: 0,
    closeFinance: false,
    background: 'room',
    backgroundAsset: null,
    place: '서인의 방 · 아침',
  };

  // ① 광고 없는 아침 (0..19)
  if (index < 20) {
    out.background = 'room';
    out.backgroundAsset = index < 3 ? 'homeNight' : 'homeMorning';
    out.place = index < 3 ? '광고 없이 잔 첫날' : '서인의 방 · 아침';
    if (index >= 5 && index < 8) {
      out.actors = [actor('seoin', 'seoinWaking', 'left', 'right', 'waking')];
    } else if (index >= 8) {
      out.actors = [
        actor(
          'seoin',
          index >= 16 ? 'seoinWorry' : 'seoinQuestion',
          'left',
          index >= 16 ? 'down' : 'right',
          index >= 16 ? 'seated' : 'question',
        ),
      ];
      if (index >= 16) out.shot = 'close';
    }
  }

  // ② 어머니와 검진비 (20..61)
  if (index >= 20 && index < 62) {
    out.background = 'kitchen';
    out.backgroundAsset = 'homeMorning';
    out.place = '서인의 집 · 아침 식탁';
    const motherAsset = (index >= 37 && index <= 57) ? 'motherSearching' : 'motherWarm';
    const seoinAsset = (index >= 48 || (index >= 26 && index <= 28)) ? 'seoinWorry' : 'seoinQuestion';
    out.actors = [
      actor('seoin', seoinAsset, 'left', index >= 52 ? 'down' : 'right', 'seated'),
      actor('mother', motherAsset, 'right', index >= 37 && index <= 47 ? 'left' : 'aside', 'seated'),
    ];
    if (index >= 52 && index <= 57) out.shot = 'close';
    if (index >= 58 && index <= 61) {
      out.cg = 'table';
      out.actors = [];
      out.shot = 'detail';
      out.music = null;
    }
  }

  // 출근길 연결 (62..64)
  if (index >= 62 && index < 65) {
    out.background = 'train';
    out.backgroundAsset = null;
    out.place = '출근길';
    out.actors = [actor('seoin', 'seoinWorry', 'left', 'down', 'standing')];
    out.shot = 'close';
  }

  // ③ 지우의 빈자리와 초대 (65..84)
  if (index >= 65 && index < 85) {
    out.background = 'office';
    out.backgroundAsset = 'officeEmptyDesk';
    out.place = '아르카디아 · 비어 있는 지우의 자리';
    if (index <= 66) {
      out.actors = [];
      out.shot = 'detail';
    } else {
      out.actors = [
        actor('seoin', index >= 79 ? 'seoinQuestion' : 'seoinWorry', 'left', index >= 79 ? 'right' : 'down', 'seated'),
      ];
      if (index >= 79) out.shot = 'close';
    }
  }

  // ④ 지우 아버지와의 대면 (85..150)
  if (index >= 85 && index < 151) {
    out.background = 'kitchen';
    out.backgroundAsset = 'jiwooHome';
    out.place = '지우의 집 · 거실';
    if (index < 90) {
      out.actors = [
        actor('seoin', 'seoinQuestion', 'left', 'right', 'standing'),
        actor('jiwoo', 'jiwooWounded', 'right', 'left', 'standing'),
      ];
    } else if (index >= 90 && index < 95) {
      out.actors = [
        actor('seoin', 'seoinQuestion', 'left', 'right', 'seated'),
        actor('father', 'fatherCalm', 'right', 'left', 'seated'),
      ];
      out.shot = 'close';
    } else if (index >= 95 && index <= 99) {
      out.cg = 'cgFatherTablet';
      out.actors = [];
      out.shot = 'detail';
    } else if (index >= 100 && index < 112) {
      out.actors = [
        actor('jiwoo', index >= 107 ? 'jiwooFirm' : 'jiwooWounded', 'left', 'right', 'seated'),
        actor('father', 'fatherCalm', 'right', 'left', 'seated'),
      ];
    } else if (index >= 112 && index < 118) {
      out.actors = [
        actor('jiwoo', 'jiwooWounded', 'left', 'down', 'seated'),
        actor('father', 'fatherUrgent', 'right', 'left', 'lean'),
      ];
      out.shot = 'close';
    } else if (index >= 118 && index < 124) {
      out.actors = [
        actor('seoin', 'seoinWorry', 'left', 'down', 'seated'),
        actor('father', 'fatherCalm', 'right', 'left', 'seated'),
      ];
    } else if (index >= 124 && index < 135) {
      out.actors = [
        actor('jiwoo', index <= 126 ? 'jiwooFirm' : 'jiwooWounded', 'left', 'right', 'seated'),
        actor('father', index >= 130 ? 'fatherUrgent' : 'fatherCalm', 'right', 'left', 'seated'),
      ];
      if (index >= 130) out.shot = 'close';
    } else if (index >= 135 && index < 138) {
      out.actors = [
        actor('jiwoo', 'jiwooWounded', 'left', 'down', 'seated'),
        actor('father', 'fatherCalm', 'right', 'left', 'seated'),
      ];
      out.shot = 'close';
    } else if (index >= 138 && index < 144) {
      out.actors = [
        actor('jiwoo', 'jiwooWounded', 'left', 'down', 'seated'),
        actor('father', 'fatherCalm', 'right', 'down', 'seated'),
      ];
      out.shot = 'close';
    } else if (index >= 144 && index <= 145) {
      out.actors = [
        actor('seoin', 'seoinWorry', 'left', 'down', 'seated'),
        actor('father', 'fatherCalm', 'right', 'down', 'seated'),
      ];
      out.shot = 'close';
    } else {
      out.actors = [
        actor('seoin', 'seoinWorry', 'left', 'down', 'seated'),
        actor('father', 'fatherBowed', 'right', 'down', 'bowed'),
      ];
      out.shot = 'close';
    }

    if (index >= 100 && index <= 145) {
      out.document = {
        phase: 'red',
        showRisks: true,
        label: '지우 가족 가계 시뮬레이션',
        ariaLabel: '장면 속 지우 아버지의 태블릿 가계 시뮬레이션',
        rows: SIMULATION_ROWS,
        note: '아래로 갈수록 붉은 표시가 늘어났다.',
      };
    }
  }

  // ⑤ 밖에서의 점토 대화 (151..205)
  if (index >= 151 && index < 206) {
    out.background = 'streetday';
    out.backgroundAsset = null;
    out.place = '지우의 집 밖 · 오후 골목';
    if ((index >= 173 && index <= 186) || (index >= 194 && index <= 196)) {
      out.cg = 'cgClayStreet';
      out.actors = [];
      out.shot = 'detail';
    } else {
      const jiwooAsset = (index >= 169 && index <= 172) || index >= 204
        ? 'jiwooTease'
        : (index >= 190 && index <= 193) || index <= 156
          ? 'jiwooWounded'
          : 'jiwooFirm';
      const seoinAsset = index >= 190 && index <= 196 ? 'seoinWorry' : 'seoinQuestion';
      out.actors = [
        actor('seoin', seoinAsset, 'left', 'right', 'standing'),
        actor('jiwoo', jiwooAsset, 'right', 'left', 'standing'),
      ];
      if (index >= 163 && index <= 168) out.shot = 'close';
      if (index >= 190 && index <= 193) out.shot = 'close';
      if (index >= 204) out.shot = 'close';
    }
  }

  // ⑥ 광고를 다시 켜는 서인 (206..231)
  if (index >= 206 && index < 232) {
    out.background = 'room';
    out.backgroundAsset = 'homeNight';
    out.place = '서인의 방 · 밤';
    if (index < 223) {
      out.actors = [
        actor('seoin', index >= 212 ? 'seoinAngry' : 'seoinQuestion', 'left', 'right', 'seated'),
      ];
      if (index >= 215) out.shot = 'close';
      if (index === 222) {
        out.music = null;
      }
    } else if (index < 230) {
      out.actors = [actor('seoin', 'seoinNight', 'left', 'up', 'reclining')];
      out.shot = 'close';
    } else {
      out.cg = 'night';
      out.actors = [];
      out.shot = 'detail';
    }
  }

  // ⑦ 지나치게 아름다운 광고꿈 (232..265)
  if (index >= 232 && index < 266) {
    out.background = 'dream';
    out.backgroundAsset = null;
    out.place = '광고꿈 · 소중한 사람과 떠나는 휴양지';
    out.cg = 'cgDreamResort';
    out.actors = [];
    out.shot = index >= 257 ? 'absence' : index >= 250 ? 'close' : 'wide';
  }

  // ⑧ 중도 종료와 새벽 메시지 (266..285)
  if (index >= 266) {
    out.background = 'room';
    out.backgroundAsset = 'homeNight';
    out.place = index >= 278 ? '서인의 방 · 새벽 3시 24분' : '서인의 방 · 새벽 3시 17분';
    out.music = null;
    out.ambience = null;
    out.shot = index >= 269 && index <= 277 ? 'close' : 'wide';
    if (!out.blackout) {
      const seoinWakeAsset = index >= 272 && index <= 277 ? 'seoinNight' : 'seoinWaking';
      out.actors = [actor('seoin', seoinWakeAsset, 'left', index >= 278 ? 'right' : 'down', 'waking')];
    }
  }

  if (out.blackout) {
    out.cg = null;
    out.actors = [];
    out.music = null;
    out.ambience = null;
    out.document = null;
    out.wallAd = false;
  }
  if (out.intro) {
    out.actors = [];
    out.music = null;
    out.shot = 'eyes-closed';
  }

  const effects = {
    5: 'approval',
    8: 'amber',
    20: 'dishes',
    52: 'amber',
    58: 'dishes',
    83: 'approval',
    95: 'tabletSlide',
    97: 'red',
    146: 'tabletOff',
    173: 'box',
    197: 'box',
    222: 'release',
    223: 'bedding',
    230: 'approval',
    264: 'amber',
    265: 'adCutoff',
    269: 'red',
    270: 'tabletOff',
    280: 'approval',
    283: 'approval',
    285: 'approval',
  };
  out.fx = effects[index] || null;

  if (index === 37 || index === 118) out.gap = 0.35;
  if (index === 137 || index === 146 || index === 150 || index === 258 || index === 275) out.gap = 0.65;

  return out;
}
