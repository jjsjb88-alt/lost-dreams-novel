import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { episodeOneReadingPage, episodeOnePreviousPage, isEpisodeOneObservation } from './episode-one-reading.js';
import { episodeOneDirection, EPISODE_ONE_SCENES } from './episode-one.js';
import { presentationForBeat } from './neural-cues.js';

const context = { window: {} };
vm.runInNewContext(await readFile(new URL('./story-data.js', import.meta.url), 'utf8'), context);
const first = context.window.STORY.chapters.find(chapter => chapter.id === '1');
const second = context.window.STORY.chapters.find(chapter => chapter.id === '2');

test('reading pages cover the unchanged source exactly once in order', () => {
  const before = JSON.stringify(first), entries = [], starts = [];
  for (let index = 0; index < first.beats.length;) {
    const page = episodeOneReadingPage(first, index);
    starts.push(index); entries.push(...page.entries);
    assert.ok(page.entries.length <= 4);
    for (const entry of page.entries) assert.ok(page.text.includes(entry.text));
    index = page.end + 1;
  }
  assert.deepEqual(entries.map(entry => entry.index), Array.from({ length: 263 }, (_, index) => index));
  assert.deepEqual(entries.map(entry => entry.text), Array.from(first.beats, beat => beat.text));
  assert.equal(JSON.stringify(first), before);
  assert.ok(starts.length < 220, 'the revision should actually reduce repetitive advance actions');
  for (let page = 1; page < starts.length; page++) assert.equal(episodeOnePreviousPage(first, starts[page]), starts[page - 1]);
});

test('old saves at every source index resume exactly there', () => {
  for (let index = 0; index < 263; index++) {
    const page = episodeOneReadingPage(first, index);
    assert.equal(page.start, index); assert.equal(page.entries[0].index, index);
    assert.equal(page.entries[0].text, first.beats[index].text);
    assert.ok(page.entries.every(entry => entry.index >= index));
  }
});

test('scene starts, signals, acting changes and later sound cues are not skipped', () => {
  const boundaries = new Set(EPISODE_ONE_SCENES.map(scene => scene.index));
  for (let index = 0; index < 263; index++) {
    const page = episodeOneReadingPage(first, index);
    for (const entry of page.entries.slice(1)) {
      const cue = episodeOneDirection(first, entry.index);
      assert.ok(!boundaries.has(entry.index), `scene start ${entry.index}`);
      assert.equal(cue.fx, null, `effect at ${entry.index}`);
      assert.equal(cue.gap, 0, `pause at ${entry.index}`);
      assert.equal(presentationForBeat(first, first.beats[entry.index], entry.index), null);
      for (const key of ['actors', 'document', 'cg', 'music', 'ambience', 'shot']) {
        assert.equal(JSON.stringify(cue[key]), JSON.stringify(episodeOneDirection(first, index)[key]), `${key} at ${entry.index}`);
      }
    }
  }
  for (const index of [155, 157, 159, 256, 257, 258, 259, 260, 261, 262]) {
    const page = episodeOneReadingPage(first, index);
    assert.equal(page.end, index, `preserve the authored pause at ${index}`);
  }
});

test('multi-speaker exchanges name each voice and retirement warnings name the event', () => {
  const page = episodeOneReadingPage(first, 110);
  assert.ok(page.entries.length > 1);
  for (const entry of page.entries) assert.ok(page.text.includes(`${entry.speaker} · ${entry.text}`));
  assert.equal(presentationForBeat(first, first.beats[117], 117).title, '퇴직 의사 확인서');
  assert.equal(presentationForBeat(first, first.beats[124], 124).title, '퇴직 시 불이익');
});

test('the observation exemption is limited to the unchanged episode-one review point', () => {
  assert.equal(isEpisodeOneObservation(first, 240), true);
  for (const index of [0, 239, 241]) assert.equal(isEpisodeOneObservation(first, index), false);
  assert.equal(isEpisodeOneObservation(second, 240), false);
  assert.equal(episodeOneReadingPage(second, 0), null);
  assert.equal(episodeOnePreviousPage(second, 1), null);
  const changed = structuredClone(first); changed.beats[240].choice.prompt = '다른 선택';
  assert.equal(isEpisodeOneObservation(changed, 240), false);
  assert.equal(episodeOneReadingPage(first, -1), null);
  assert.equal(episodeOneReadingPage(first, 263), null);
});
