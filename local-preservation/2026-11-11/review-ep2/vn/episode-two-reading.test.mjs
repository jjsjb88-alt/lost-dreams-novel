import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { episodeTwoReadingPage, episodeTwoPreviousPage, episodeTwoSpeaker } from './episode-two-reading.js';
import { episodeTwoDirection, EPISODE_TWO_SCENES } from './episode-two.js';
import { presentationForBeat } from './neural-cues.js';

const context = { window: {} };
vm.runInNewContext(await readFile(new URL('./story-data.js', import.meta.url), 'utf8'), context);
const first = context.window.STORY.chapters.find(chapter => chapter.id === '1');
const second = context.window.STORY.chapters.find(chapter => chapter.id === '2');

test('Episode 2 reading pages cover the unchanged 286 source beats exactly once in order', () => {
  const before = JSON.stringify(second), entries = [], starts = [];
  for (let index = 0; index < second.beats.length;) {
    const page = episodeTwoReadingPage(second, index);
    starts.push(index);
    entries.push(...page.entries);
    assert.ok(page.entries.length >= 1 && page.entries.length <= 6);
    for (const entry of page.entries) assert.ok(page.text.includes(entry.text));
    index = page.end + 1;
  }
  assert.deepEqual(entries.map(entry => entry.index), Array.from({ length: 286 }, (_, index) => index));
  assert.deepEqual(entries.map(entry => entry.text), Array.from(second.beats, beat => beat.text));
  assert.equal(JSON.stringify(second), before);
  assert.ok(starts.length < 180, 'reading pages should consolidate fragmented short exchanges');
  for (let page = 1; page < starts.length; page++) {
    assert.equal(episodeTwoPreviousPage(second, starts[page]), starts[page - 1]);
  }
});

test('old saves at every Episode 2 source index resume at that exact beat', () => {
  for (let index = 0; index < 286; index++) {
    const page = episodeTwoReadingPage(second, index);
    assert.equal(page.start, index);
    assert.equal(page.entries[0].index, index);
    assert.equal(page.entries[0].text, second.beats[index].text);
    assert.equal(page.entries[0].speaker, episodeTwoSpeaker(index, second.beats[index]));
    assert.ok(page.entries.every(entry => entry.index >= index));
  }
});

test('scene starts, signals, acting changes, sound effects and pauses are never skipped inside a reading page', () => {
  const boundaries = new Set(EPISODE_TWO_SCENES.map(scene => scene.index));
  for (let index = 0; index < 286; index++) {
    const page = episodeTwoReadingPage(second, index);
    for (const entry of page.entries.slice(1)) {
      const cue = episodeTwoDirection(second, entry.index);
      assert.ok(!boundaries.has(entry.index), `scene start ${entry.index}`);
      assert.equal(cue.fx, null, `effect at ${entry.index}`);
      assert.equal(cue.gap, 0, `pause at ${entry.index}`);
      assert.equal(presentationForBeat(second, second.beats[entry.index], entry.index), null);
      for (const key of ['actors', 'document', 'cg', 'backgroundAsset', 'music', 'ambience', 'shot']) {
        assert.equal(JSON.stringify(cue[key]), JSON.stringify(episodeTwoDirection(second, index)[key]), `${key} at ${entry.index}`);
      }
    }
  }
  for (const index of [8, 83, 97, 137, 146, 150, 222, 239, 257, 264, 265, 269, 270, 271, 280, 283, 285]) {
    const page = episodeTwoReadingPage(second, index);
    assert.equal(page.start, index, `preserve distinct start at ${index}`);
    assert.equal(page.end, index, `preserve distinct end at ${index}`);
  }
});

test('multi-speaker exchanges label each voice and non-Episode-2 chapters return null', () => {
  const page = episodeTwoReadingPage(second, 33);
  assert.ok(page.entries.length > 1);
  for (const entry of page.entries) {
    assert.ok(page.text.includes(`${entry.speaker} · ${entry.text}`));
  }
  const motherPage = episodeTwoReadingPage(second, 58);
  assert.equal(motherPage.start, 58);
  assert.equal(motherPage.end, 61);
  assert.ok(motherPage.text.includes('하고 싶으면 해'));
  assert.ok(motherPage.text.includes('대신 돈은 계산해야지'));
  assert.equal(episodeTwoReadingPage(first, 0), null);
  assert.equal(episodeTwoPreviousPage(first, 1), null);
  assert.equal(episodeTwoReadingPage(second, -1), null);
  assert.equal(episodeTwoReadingPage(second, 286), null);
});
