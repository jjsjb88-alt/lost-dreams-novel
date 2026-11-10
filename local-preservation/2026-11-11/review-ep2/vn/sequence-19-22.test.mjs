import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import {
  SEQUENCE_19_22_CHAPTERS,
  SEQUENCE_19_22_ASSETS,
  SEQUENCE_19_22_CHAPTER_INFO,
  SEQUENCE_19_22_SCENES,
  isSequence1922Chapter,
  sequenceSpeaker,
  sequenceBeatDirection,
  sequenceReadingPage,
  sequencePreviousPage,
  nextSequence1922Progress,
  previousSequence1922Progress,
} from './sequence-19-22.js';
import { presentationForBeat } from './neural-cues.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadStory() {
  const code = fs.readFileSync(path.join(__dirname, 'story-data.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(code, sandbox);
  return sandbox.window.STORY;
}

const story = loadStory();
const chaptersById = new Map(story.chapters.map((ch) => [ch.id, ch]));

test('19~22화 시퀀스 6편(1,205비트) 및 신규 초상화 에셋이 모두 존재한다', () => {
  assert.deepEqual(SEQUENCE_19_22_CHAPTERS, ['19', '20', '20-1', '21', '21-1', '22']);
  let totalBeats = 0;
  for (const id of SEQUENCE_19_22_CHAPTERS) {
    assert.equal(isSequence1922Chapter(id), true);
    const ch = chaptersById.get(id);
    assert.ok(ch, `chapter ${id} exists`);
    assert.ok(SEQUENCE_19_22_CHAPTER_INFO[id], `chapter info ${id} exists`);
    assert.ok(SEQUENCE_19_22_SCENES[id]?.length >= 3, `chapter scenes ${id} exists`);
    totalBeats += ch.beats.length;
  }
  assert.equal(totalBeats, 1205);
  assert.equal(isSequence1922Chapter('19-1'), false);
  assert.equal(isSequence1922Chapter('22-1'), false);

  for (const [key, relPath] of Object.entries(SEQUENCE_19_22_ASSETS)) {
    const fullPath = path.join(__dirname, relPath);
    assert.equal(fs.existsSync(fullPath), true, `${key} asset exists at ${relPath}`);
    assert.ok(fs.statSync(fullPath).size > 10000, `${key} asset is non-empty`);
  }
});

test('19~22화 시퀀스의 모든 대사 비트(413개)에 원문 문맥 기반 화자가 빠짐없이 지정된다', () => {
  let dialogueCount = 0;
  for (const id of SEQUENCE_19_22_CHAPTERS) {
    const ch = chaptersById.get(id);
    ch.beats.forEach((beat, idx) => {
      if (beat.kind === 'dialogue') {
        dialogueCount++;
        const sp = sequenceSpeaker(ch, idx, beat);
        assert.ok(sp && sp.trim().length > 0, `${id}:${idx} missing speaker for ${beat.text}`);
      }
    });
  }
  assert.equal(dialogueCount, 413);

  // 핵심 장면별 원문 화자 검증
  const ch19 = chaptersById.get('19');
  assert.equal(sequenceSpeaker(ch19, 12, ch19.beats[12]), '강연우');
  assert.equal(sequenceSpeaker(ch19, 13, ch19.beats[13]), '서인');
  assert.equal(sequenceSpeaker(ch19, 71, ch19.beats[71]), '윤세라');
  assert.equal(sequenceSpeaker(ch19, 288, ch19.beats[288]), '강연우');

  const ch20 = chaptersById.get('20');
  assert.equal(sequenceSpeaker(ch20, 5, ch20.beats[5]), '윤세라');
  assert.equal(sequenceSpeaker(ch20, 193, ch20.beats[193]), '강연우');
  assert.equal(sequenceSpeaker(ch20, 213, ch20.beats[213]), '도윤');
  assert.equal(sequenceSpeaker(ch20, 218, ch20.beats[218]), '서인');
  assert.equal(sequenceSpeaker(ch20, 275, ch20.beats[275]), '서인');

  const ch20_1 = chaptersById.get('20-1');
  assert.equal(sequenceSpeaker(ch20_1, 3, ch20_1.beats[3]), '딸');
  assert.equal(sequenceSpeaker(ch20_1, 4, ch20_1.beats[4]), '최은경');
  assert.equal(sequenceSpeaker(ch20_1, 33, ch20_1.beats[33]), '아이');
  assert.equal(sequenceSpeaker(ch20_1, 35, ch20_1.beats[35]), '문해린');

  const ch21 = chaptersById.get('21');
  assert.equal(sequenceSpeaker(ch21, 10, ch21.beats[10]), '윤세라');
  assert.equal(sequenceSpeaker(ch21, 36, ch21.beats[36]), '강연우');
  assert.equal(sequenceSpeaker(ch21, 75, ch21.beats[75]), '문해린');
  assert.equal(sequenceSpeaker(ch21, 76, ch21.beats[76]), '서인');

  const ch21_1 = chaptersById.get('21-1');
  assert.equal(sequenceSpeaker(ch21_1, 8, ch21_1.beats[8]), '최은경');
  assert.equal(sequenceSpeaker(ch21_1, 28, ch21_1.beats[28]), '청년');
  assert.equal(sequenceSpeaker(ch21_1, 54, ch21_1.beats[54]), '노인');
  assert.equal(sequenceSpeaker(ch21_1, 88, ch21_1.beats[88]), '최은경');
  assert.equal(sequenceSpeaker(ch21_1, 89, ch21_1.beats[89]), '딸');

  const ch22 = chaptersById.get('22');
  assert.equal(sequenceSpeaker(ch22, 5, ch22.beats[5]), '강연우');
  assert.equal(sequenceSpeaker(ch22, 10, ch22.beats[10]), '백윤하');
  assert.equal(sequenceSpeaker(ch22, 165, ch22.beats[165]), '서인');
  assert.equal(sequenceSpeaker(ch22, 167, ch22.beats[167]), '백윤하');
});

test('19~22화 읽기 페이지 묶음이 1,205개 원문 인덱스를 누락·중복 없이 보존하고 중간 저장 복원을 지원한다', () => {
  for (const id of SEQUENCE_19_22_CHAPTERS) {
    const ch = chaptersById.get(id);
    const covered = [];
    let cursor = 0;
    while (cursor < ch.beats.length) {
      const page = sequenceReadingPage(ch, cursor);
      assert.ok(page, `page exists at ${id}:${cursor}`);
      assert.equal(page.start, cursor);
      assert.ok(page.end >= page.start);
      for (const entry of page.entries) {
        covered.push(entry.index);
      }
      if (ch.beats[cursor].kind === 'system' || presentationForBeat(ch, ch.beats[cursor], cursor)) {
        assert.equal(page.entries.length, 1, `system/neural beat ${id}:${cursor} remains standalone`);
      }
      if (page.entries.length > 1) {
        const mid = page.entries[1].index;
        const midPage = sequenceReadingPage(ch, mid);
        assert.equal(midPage.start, mid, `mid-group save at ${id}:${mid} resumes at exact beat`);
      }
      cursor = page.end + 1;
    }
    assert.equal(covered.length, ch.beats.length, `chapter ${id} covers all beats`);
    assert.deepEqual(covered, Array.from({ length: ch.beats.length }, (_, i) => i));

    // 역방향 이동 검증
    const prevStart = sequencePreviousPage(ch, ch.beats.length - 1);
    assert.ok(Number.isInteger(prevStart) && prevStart >= 0);
  }
});

test('19~22화 시퀀스 전용 화간 연결이 19 → 20 → 20-1 → 21 → 21-1 → 22 순서로 동작한다', () => {
  // 19화 마지막 비트에서 다음 진행 시 19-1이 아닌 20화로 직행해야 함
  const ch19 = chaptersById.get('19');
  const nextFrom19 = nextSequence1922Progress({ chapterId: '19', beatIndex: ch19.beats.length - 1 }, story);
  assert.equal(nextFrom19.chapterId, '20');
  assert.equal(nextFrom19.beatIndex, 0);
  assert.equal(nextFrom19.sequenceFinished, false);

  // 20 → 20-1 → 21 → 21-1 → 22 순서 검증
  const expectedPairs = [
    ['19', '20'],
    ['20', '20-1'],
    ['20-1', '21'],
    ['21', '21-1'],
    ['21-1', '22'],
  ];
  for (const [curr, next] of expectedPairs) {
    const ch = chaptersById.get(curr);
    const res = nextSequence1922Progress({ chapterId: curr, beatIndex: ch.beats.length - 1 }, story);
    assert.equal(res.chapterId, next);
    assert.equal(res.beatIndex, 0);
    assert.equal(res.sequenceFinished, false);
  }

  // 22화 마지막 비트에서 시퀀스 종료
  const ch22 = chaptersById.get('22');
  const endRes = nextSequence1922Progress({ chapterId: '22', beatIndex: ch22.beats.length - 1 }, story);
  assert.equal(endRes.chapterId, '22');
  assert.equal(endRes.finished, true);
  assert.equal(endRes.sequenceFinished, true);

  // 20화 첫 비트에서 이전 이동 시 19화로 복귀
  const prevFrom20 = previousSequence1922Progress({ chapterId: '20', beatIndex: 0 }, story);
  assert.equal(prevFrom20.chapterId, '19');
  assert.ok(prevFrom20.beatIndex > 0 && prevFrom20.beatIndex < ch19.beats.length);
});

test('19~22화 신경망 연출(NeuralStage) 및 인물·정보 패널 연출이 정상 연결된다', () => {
  const ch19 = chaptersById.get('19');
  const dir19 = sequenceBeatDirection(ch19, ch19.beats[71], 71);
  assert.equal(dir19.focus, 'yoonsera');
  assert.ok(dir19.cast.some((c) => c.id === 'yoonsera'));

  const ch20_1 = chaptersById.get('20-1');
  const dir20_1_alarm = sequenceBeatDirection(ch20_1, ch20_1.beats[8], 8);
  assert.equal(dir20_1_alarm.visual?.id, '20-1:alarms');
  const dir20_1_haerin = sequenceBeatDirection(ch20_1, ch20_1.beats[36], 36);
  assert.equal(dir20_1_haerin.focus, 'haerin');
  assert.equal(dir20_1_haerin.visual?.id, '20-1:haerin-schedule');

  const cueDaughter = presentationForBeat(ch20_1, ch20_1.beats[22], 22);
  assert.ok(cueDaughter);
  assert.equal(cueDaughter.sender, '딸');

  const ch21 = chaptersById.get('21');
  const cueMonitor21 = presentationForBeat(ch21, ch21.beats[19], 19);
  assert.ok(cueMonitor21);
  assert.equal(cueMonitor21.kind, 'system');

  const ch21_1 = chaptersById.get('21-1');
  const dir21_1_rescue = sequenceBeatDirection(ch21_1, ch21_1.beats[65], 65);
  assert.equal(dir21_1_rescue.focus, 'eunkyung');
  assert.equal(dir21_1_rescue.visual?.id, '21-1:subway-rescue');
  const cueDream21_1 = presentationForBeat(ch21_1, ch21_1.beats[86], 86);
  assert.ok(cueDream21_1);
  assert.equal(cueDream21_1.sender, '고부하 인지 패키지');

  const ch22 = chaptersById.get('22');
  const cueSafety = presentationForBeat(ch22, ch22.beats[1], 1);
  assert.ok(cueSafety);
  assert.equal(cueSafety.sender, '아르카디아 인지안전실');
  const cueStaff = presentationForBeat(ch22, ch22.beats[152], 152);
  assert.ok(cueStaff);
  assert.equal(cueStaff.sender, '아르카디아 직원');
});
