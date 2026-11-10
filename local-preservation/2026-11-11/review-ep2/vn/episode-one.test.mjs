import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

// Use an argument or EP1_VN_ROOT so this review file never needs to be copied
// into the published checkout just to run it.
const ownDirectory = dirname(fileURLToPath(import.meta.url));
const runtimeArgument = process.argv.slice(2).find(value => !value.startsWith('-'));
const vnRoot = resolve(process.env.EP1_VN_ROOT || runtimeArgument || ownDirectory);
const { episodeOneDirection, EPISODE_ONE_SCENES } = await import(pathToFileURL(resolve(vnRoot, 'episode-one.js')));
const { EP1_ASSETS } = await import(pathToFileURL(resolve(vnRoot, 'ep1-assets.js')));
const storyContext = { window: {} };
vm.runInNewContext(await readFile(resolve(vnRoot, 'story-data.js'), 'utf8'), storyContext, { timeout: 10000 });
const chapter = storyContext.window.STORY.chapters.find(value => value.id === '1');
const chapterTwo = storyContext.window.STORY.chapters.find(value => value.id === '2');
const clone = value => JSON.parse(JSON.stringify(value));
const at = index => episodeOneDirection(chapter, index);

test('the authored first episode covers every original beat and preserves each source speaker', () => {
  assert.equal(chapter.beats.length, 263);
  const before = JSON.stringify(chapter);
  for (let index = 0; index < chapter.beats.length; index += 1) {
    const cue = at(index);
    assert.ok(cue, `missing direction at beat ${index}`);
    assert.equal(cue.index, index);
    assert.equal(cue.focus, chapter.beats[index].speaker || '', `wrong speaker focus at beat ${index}`);
    assert.ok(Array.isArray(cue.actors));
  }
  assert.equal(JSON.stringify(chapter), before, 'resolving direction must not modify source beats');
});

test('changed scene anchors, wrong beat counts and invalid indices fail closed', () => {
  assert.equal(EPISODE_ONE_SCENES.length, 18);
  for (const { index } of EPISODE_ONE_SCENES) {
    const changed = clone(chapter);
    changed.beats[index].text += ' 다른 판본';
    assert.equal(episodeOneDirection(changed, index), null, `accepted changed scene anchor ${index}`);
    assert.equal(episodeOneDirection(changed, 0), null, `accepted a mismatched source elsewhere at ${index}`);
  }
  const truncated = clone(chapter);
  truncated.beats.pop();
  assert.equal(episodeOneDirection(truncated, 0), null);
  for (const index of [-1, 263, 1.5, NaN, undefined, null]) {
    assert.equal(episodeOneDirection(chapter, index), null, `accepted invalid index ${String(index)}`);
  }
  assert.equal(episodeOneDirection(null, 0), null);
  assert.equal(episodeOneDirection({ id: '1' }, 0), null);
});

test('the retirement document appears only at its title and escalates after both distinct approvals', () => {
  assert.equal(chapter.beats[117].text, '퇴직 의사 확인서.');
  assert.equal(chapter.beats[122].text, '지우가 승인란을 눌렀다.');
  assert.equal(chapter.beats[123].text, '화면이 노란색으로 바뀌었다.');
  assert.equal(chapter.beats[125].text, '지우는 다시 승인했다.');
  assert.equal(chapter.beats[126].text, '이번에는 붉은색 경고가 떴다.');
  for (let index = 0; index < 117; index += 1) assert.equal(at(index).document, null, `premature document at ${index}`);
  assert.equal(at(117).document.phase, 'plain');
  assert.equal(at(122).document.phase, 'plain');
  assert.equal(at(122).fx, 'approval');
  assert.equal(at(123).document.phase, 'amber');
  assert.equal(at(123).document.showRisks, false, 'risk amounts should not precede their source paragraph');
  assert.equal(at(124).document.showRisks, true);
  assert.equal(at(125).document.phase, 'amber');
  assert.equal(at(125).fx, 'approval');
  assert.equal(at(126).document.phase, 'red');
  assert.equal(at(143).document.phase, 'red');
  assert.equal(at(144).document, null, 'the interrupted conversation must release the prior document');
});

test('Jiwoo faces Seoin before the family question removes his smile', () => {
  assert.equal(chapter.beats[136].text, '지우가 마침내 서인을 봤다.');
  assert.equal(chapter.beats[153].text, '웃음이 사라졌다.');
  const firm = at(136).actors.find(person => person.id === 'jiwoo');
  assert.equal(firm.asset, 'jiwooFirm');
  assert.equal(firm.gaze, 'left');
  assert.equal(firm.name, '지우');
  const wounded = at(153).actors.find(person => person.id === 'jiwoo');
  assert.equal(wounded.asset, 'jiwooWounded');
  assert.equal(wounded.gaze, 'down');
  assert.equal(at(152).actors.find(person => person.id === 'jiwoo').asset, 'jiwooFirm');
  assert.equal(at(166).actors.find(person => person.id === 'jiwoo').asset, 'jiwooTease');
});

test('mother closing the household display suppresses the prior finance visual through the meal', () => {
  assert.equal(chapter.beats[61].text, '서인이 숫자를 보고 있으니 어머니가 손으로 화면을 밀어 껐다.');
  assert.equal(at(60).closeFinance, false);
  for (let index = 61; index <= 73; index += 1) {
    assert.equal(at(index).closeFinance, true, `household display could remain at ${index}`);
  }
  assert.equal(at(74).closeFinance, false, 'do not suppress the separate train passenger statement');
});

test('ad-free sleep ends in genuine silence and black rather than an immediate new signal', () => {
  assert.equal(chapter.beats[256].text, '서인은 처음으로 광고를 끄고 눈을 감았다.');
  assert.equal(chapter.beats[258].text, '음악도.');
  assert.equal(at(255).blackout, false);
  for (let index = 256; index <= 262; index += 1) {
    const cue = at(index);
    assert.equal(cue.blackout, true);
    assert.equal(cue.silence, true);
    assert.equal(cue.music, null);
    assert.equal(cue.ambience, null);
    assert.equal(cue.fx, null);
    assert.equal(cue.cg, null);
    assert.equal(cue.document, null);
    assert.equal(cue.wallAd, false);
    assert.deepEqual(cue.actors, []);
  }
});

test('episode one has no scene or music override in chapter two', () => {
  assert.ok(chapterTwo?.beats.length > 0);
  const before = JSON.stringify(chapterTwo);
  for (let index = 0; index < chapterTwo.beats.length; index += 1) {
    assert.equal(episodeOneDirection(chapterTwo, index), null);
  }
  assert.equal(JSON.stringify(chapterTwo), before);
});

test('bedroom questions and all scene jumps restore the actual source space', () => {
  for(const index of [0,8,19,24,29])assert.equal(at(index).background,'room');
  for(const index of [30,39,58,73])assert.equal(at(index).background,'kitchen');
  for(const index of [74,85])assert.equal(at(index).background,'train');
  for(const index of [86,117,153,182,195])assert.equal(at(index).background,'office');
  for(const index of [196,207,233,256,262])assert.equal(at(index).background,'room');
  assert.equal(at(19).place,'서인의 방');
});

test('all directed actors, CG, ambience, music and effects resolve to real packaged assets', async () => {
  const used = new Set();
  for (let index = 0; index < 263; index += 1) {
    const cue = at(index);
    for (const person of cue.actors) used.add(person.asset);
    for (const key of ['cg', 'ambience', 'music', 'fx']) if (cue[key]) used.add(cue[key]);
  }
  for (const key of used) assert.ok(EP1_ASSETS[key], `missing mapping for ${key}`);
  for (const [key, relativePath] of Object.entries(EP1_ASSETS)) {
    const absolutePath = resolve(vnRoot, relativePath);
    assert.ok(absolutePath.startsWith(`${vnRoot}${sep}`), `asset path escapes runtime: ${key}`);
    const details = await stat(absolutePath);
    assert.ok(details.isFile() && details.size > 0, `empty or absent asset: ${key}`);
  }
});

test('character expressions and event CG are actual distinct WebP images, not repeated file copies', async () => {
  const variants = {
    seoin: ['seoinQuestion', 'seoinWorry', 'seoinAngry', 'seoinNight'],
    mother: ['motherWarm', 'motherSearching'],
    jiwoo: ['jiwooTease', 'jiwooFirm', 'jiwooWounded'],
    event: ['sea', 'table', 'clay', 'night'],
  };
  const allDigests = new Map();
  for (const [group, keys] of Object.entries(variants)) {
    const groupDigests = new Set();
    for (const key of keys) {
      const bytes = await readFile(resolve(vnRoot, EP1_ASSETS[key]));
      assert.ok(bytes.length > 1000, `unexpectedly small ${key}`);
      assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', `${key} is not RIFF`);
      assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', `${key} is not WebP`);
      const digest = createHash('sha256').update(bytes).digest('hex');
      assert.ok(!groupDigests.has(digest), `${group} uses a duplicated expression image: ${key}`);
      assert.ok(!allDigests.has(digest), `${key} duplicates ${allDigests.get(digest)}`);
      groupDigests.add(digest);
      allDigests.set(digest, key);
    }
    assert.equal(groupDigests.size, keys.length);
  }
});
