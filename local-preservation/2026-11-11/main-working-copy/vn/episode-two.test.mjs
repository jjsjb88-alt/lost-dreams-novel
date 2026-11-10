import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const ownDirectory = dirname(fileURLToPath(import.meta.url));
const vnRoot = resolve(ownDirectory);
const { episodeTwoDirection, EPISODE_TWO_SCENES } = await import(pathToFileURL(resolve(vnRoot, 'episode-two.js')));
const { episodeTwoSpeaker } = await import(pathToFileURL(resolve(vnRoot, 'episode-two-reading.js')));
const { presentationForBeat } = await import(pathToFileURL(resolve(vnRoot, 'neural-cues.js')));
const { EP1_ASSETS } = await import(pathToFileURL(resolve(vnRoot, 'ep1-assets.js')));

const storyContext = { window: {} };
vm.runInNewContext(await readFile(resolve(vnRoot, 'story-data.js'), 'utf8'), storyContext, { timeout: 10000 });
const chapterOne = storyContext.window.STORY.chapters.find(value => value.id === '1');
const chapter = storyContext.window.STORY.chapters.find(value => value.id === '2');
const chapterThree = storyContext.window.STORY.chapters.find(value => value.id === '3');
const clone = value => JSON.parse(JSON.stringify(value));
const at = index => episodeTwoDirection(chapter, index);

test('the authored second episode covers every original beat and restores all missing dialogue speakers without mutating source beats', () => {
  assert.equal(chapter.beats.length, 286);
  const before = JSON.stringify(chapter);
  for (let index = 0; index < chapter.beats.length; index += 1) {
    const cue = at(index);
    const beat = chapter.beats[index];
    const speaker = episodeTwoSpeaker(index, beat);
    assert.ok(cue, `missing direction at beat ${index}`);
    assert.equal(cue.index, index);
    assert.equal(cue.focus, speaker, `wrong speaker focus at beat ${index}`);
    if (beat.kind === 'dialogue') {
      assert.ok(speaker.length > 0, `missing speaker for dialogue beat ${index}: ${beat.text}`);
    }
    assert.ok(Array.isArray(cue.actors));
  }
  assert.equal(JSON.stringify(chapter), before, 'resolving direction must not modify source beats');
});

test('changed scene anchors, wrong beat counts, other chapters and invalid indices fail closed', () => {
  assert.equal(EPISODE_TWO_SCENES.length, 24);
  for (const { index } of EPISODE_TWO_SCENES) {
    const changed = clone(chapter);
    changed.beats[index].text += ' 다른 판본';
    assert.equal(episodeTwoDirection(changed, index), null, `accepted changed scene anchor ${index}`);
    assert.equal(episodeTwoDirection(changed, 0), null, `accepted mismatched source at ${index}`);
  }
  const truncated = clone(chapter);
  truncated.beats.pop();
  assert.equal(episodeTwoDirection(truncated, 0), null);
  for (const index of [-1, 286, 1.5, NaN, undefined, null]) {
    assert.equal(episodeTwoDirection(chapter, index), null, `accepted invalid index ${String(index)}`);
  }
  assert.equal(episodeTwoDirection(null, 0), null);
  assert.equal(episodeTwoDirection({ id: '2' }, 0), null);
  assert.equal(episodeTwoDirection(chapterOne, 0), null);
  assert.equal(episodeTwoDirection(chapterThree, 0), null);
});

test('key scenes 1-3: ad-free morning +0 TOKEN, mother checkup 300 token calculation, and Jiwoo empty desk + invite sender', () => {
  const report = presentationForBeat(chapter, chapter.beats[8], 8);
  assert.equal(report.title, '수면 정산');
  assert.ok(report.body.includes('+0 TOKEN'));
  assert.equal(at(0).backgroundAsset, 'homeNight');
  assert.equal(at(8).backgroundAsset, 'homeMorning');

  assert.equal(episodeTwoSpeaker(21, chapter.beats[21]), '어머니');
  assert.equal(episodeTwoSpeaker(56, chapter.beats[56]), '서인');
  assert.equal(episodeTwoSpeaker(59, chapter.beats[59]), '어머니');
  assert.equal(at(58).cg, 'table');
  assert.equal(at(60).cg, 'table');
  assert.equal(episodeTwoSpeaker(61, chapter.beats[61]), '어머니');

  assert.equal(at(65).backgroundAsset, 'officeEmptyDesk');
  assert.deepEqual(at(65).actors, []);
  const invite = presentationForBeat(chapter, chapter.beats[83], 83);
  assert.equal(invite.kind, 'message');
  assert.equal(invite.sender, '지우');
  assert.equal(invite.body, '오늘 시간 돼?');
});

test('key scene 4: father confrontation shows tablet simulation, gives weight to 137 and 146, and keeps father bowed to 150', () => {
  assert.equal(at(95).cg, 'cgFatherTablet');
  const sim = presentationForBeat(chapter, chapter.beats[97], 97);
  assert.equal(sim.sender, '지우 아버지의 태블릿');
  assert.equal(sim.title, '가계 시뮬레이션');
  assert.equal(sim.accent, 'rose');

  assert.equal(at(100).document.phase, 'red');
  assert.equal(at(100).document.showRisks, true);
  assert.equal(at(112).actors.find(a => a.id === 'father').asset, 'fatherUrgent');
  assert.equal(at(119).actors.find(a => a.id === 'father').asset, 'fatherCalm');

  assert.equal(chapter.beats[137].text, '“내가 없잖아.”');
  assert.equal(episodeTwoSpeaker(137, chapter.beats[137]), '지우');
  assert.equal(at(137).gap, 0.65);

  assert.equal(chapter.beats[146].text, '아버지가 화면을 껐다.');
  assert.equal(at(145).document.phase, 'red');
  assert.equal(at(146).document, null);
  assert.equal(at(146).fx, 'tabletOff');
  assert.equal(at(146).gap, 0.65);
  for (let index = 146; index <= 150; index += 1) {
    const father = at(index).actors.find(a => a.id === 'father');
    assert.equal(father.asset, 'fatherBowed');
    assert.equal(father.pose, 'bowed');
    assert.equal(at(index).document, null);
  }
});

test('key scenes 5-8: clay cup outside, turning ad back on, serene dream without Mono response, and 03:24 sequential messages', () => {
  assert.equal(at(173).cg, 'cgClayStreet');
  assert.equal(episodeTwoSpeaker(177, chapter.beats[177]), '서인');
  assert.equal(episodeTwoSpeaker(178, chapter.beats[178]), '지우');
  assert.equal(episodeTwoSpeaker(197, chapter.beats[197]), '지우');

  assert.equal(at(222).fx, 'release');
  assert.equal(at(222).music, null);
  assert.equal(at(230).cg, 'night');

  assert.equal(at(232).cg, 'cgDreamResort');
  assert.equal(at(232).music, 'musicSereneDream');
  assert.equal(episodeTwoSpeaker(239, chapter.beats[239]), '꿈속 지우');
  const monoCall = presentationForBeat(chapter, chapter.beats[257], 257);
  assert.equal(monoCall.status, '응답 없음');

  assert.equal(presentationForBeat(chapter, chapter.beats[264], 264).title, '선택 확인');
  assert.equal(at(265).fx, 'adCutoff');
  for (let index = 266; index < 286; index += 1) {
    assert.equal(at(index).music, null, `music should stop after dream termination at ${index}`);
    assert.equal(at(index).ambience, null, `ambience should stop after dream termination at ${index}`);
  }
  assert.equal(presentationForBeat(chapter, chapter.beats[269], 269).title, '중도 종료 정산');
  assert.equal(at(271).blackout, true);

  for (const [index, expected] of [[280, '나 꿈꿨어.'], [283, '근데 하나도 안 행복해.'], [285, '이상하게 좋다.']]) {
    const msg = presentationForBeat(chapter, chapter.beats[index], index);
    assert.equal(msg.kind, 'message');
    assert.equal(msg.sender, '지우');
    assert.equal(msg.body, expected);
  }
});

test('all Episode 2 directed assets exist in EP1_ASSETS and new WebP images have distinct SHA-256 digests', async () => {
  const used = new Set();
  for (let index = 0; index < 286; index += 1) {
    const cue = at(index);
    for (const person of cue.actors) used.add(person.asset);
    for (const key of ['cg', 'backgroundAsset', 'ambience', 'music', 'fx']) if (cue[key]) used.add(cue[key]);
  }
  for (const key of used) {
    assert.ok(EP1_ASSETS[key], `missing EP1_ASSETS mapping for ${key}`);
    const absolutePath = resolve(vnRoot, EP1_ASSETS[key]);
    assert.ok(absolutePath.startsWith(`${vnRoot}${sep}`));
    const details = await stat(absolutePath);
    assert.ok(details.isFile() && details.size > 0, `empty or absent asset: ${key}`);
  }

  const ep2Images = [
    'fatherCalm', 'fatherUrgent', 'fatherBowed',
    'officeEmptyDesk', 'jiwooHome',
    'cgFatherTablet', 'cgClayStreet', 'cgDreamResort',
  ];
  const digests = new Set();
  for (const key of ep2Images) {
    const bytes = await readFile(resolve(vnRoot, EP1_ASSETS[key]));
    assert.ok(bytes.length > 10000, `unexpectedly small ${key}`);
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    const digest = createHash('sha256').update(bytes).digest('hex');
    assert.ok(!digests.has(digest), `duplicate image digest for ${key}`);
    digests.add(digest);
  }
});
