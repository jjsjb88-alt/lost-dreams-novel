import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addSeen, clamp, clampProgress, emptyStore, freshProgress, makeSave,
  migrateStore, nextProgress, normalizeStory, previousProgress, readStore,
  selectChoice, writeStore,
} from './state.js';

const story = normalizeStory({ chapters: [
  { id: 'one', label: '제1장', title: '첫 장', beats: [
    { text: '첫 문장', choice: { prompt: '선택', options: [{ label: '예', note: '기록' }, { label: '아니오' }] } },
    { text: '이어지는 문장' },
  ] },
  { id: 'two', label: '제2장', title: '둘째 장', beats: [{ text: '다음 장' }] },
] });

test('old save settings gain a safe automatic reading delay and imported values stay bounded', () => {
  assert.equal(migrateStore({version:1,settings:{fontSize:24}},story).settings.autoWait,1500);
  assert.equal(migrateStore({version:1,settings:{autoWait:-100}},story).settings.autoWait,500);
  assert.equal(migrateStore({version:1,settings:{autoWait:999999}},story).settings.autoWait,5000);
});

test('a rejected browser write reports failure and leaves the prior save intact', () => {
  const prior = '{"prior":true}'; let saved = prior;
  const storage = {getItem:()=>saved,setItem:()=>{throw new Error('quota exceeded');}};
  assert.equal(writeStore(storage,emptyStore()),false);
  assert.equal(storage.getItem(),prior);
});

test('progress clamps invalid chapters and out-of-range beat indices', () => {
  assert.deepEqual(clampProgress({ chapterId: 'missing', beatIndex: 99 }, story), {
    chapterId: 'one', beatIndex: 1, choices: {}, finished: false,
  });
  assert.equal(clamp(-10, 0, 4), 0);
  assert.equal(clamp(999, 0, 4), 4);
});

test('next and previous move through beats and chapter boundaries', () => {
  const start = freshProgress(story);
  const second = nextProgress(start, story);
  assert.equal(second.beatIndex, 1);
  const nextChapter = nextProgress(second, story);
  assert.deepEqual([nextChapter.chapterId, nextChapter.beatIndex], ['two', 0]);
  const back = previousProgress(nextChapter, story);
  assert.deepEqual([back.chapterId, back.beatIndex], ['one', 1]);
  assert.equal(nextProgress(nextChapter, story).finished, true);
});

test('choice selection records the selected option while story proceeds to its authored next beat', () => {
  const selected = selectChoice(freshProgress(story), 'one', 0, 1);
  assert.equal(selected.choices['one:0'], 1);
  assert.equal(nextProgress(selected, story).beatIndex, 1);
});

test('save round trip preserves progress and choice history', () => {
  const storage = new Map();
  const adapter = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
  const progress = selectChoice(freshProgress(story), 'one', 0, 0);
  const store = { ...emptyStore(), autosave: makeSave(progress, story.chapters[0], story.chapters[0].beats[0]) };
  assert.equal(writeStore(adapter, store), true);
  const loaded = readStore(adapter, story);
  assert.equal(loaded.autosave.progress.choices['one:0'], 0);
  assert.equal(loaded.autosave.progress.chapterId, 'one');
});

test('migration tolerates old save shape and corrupt storage falls back safely', () => {
  const old = migrateStore({ save: { chapterId: 'two', beatIndex: 800 }, settings: { fontSize: 99 } }, story);
  assert.deepEqual([old.autosave.progress.chapterId, old.autosave.progress.beatIndex], ['two', 0]);
  assert.equal(old.settings.fontSize, 28);
  assert.equal(readStore({ getItem: () => '{bad' }, story).autosave, null);
});

test('seen-beat history stays unique and bounded', () => {
  assert.deepEqual(addSeen(['one:0'], 'one', 0), ['one:0']);
  assert.deepEqual(addSeen([], 'one', 1), ['one:1']);
});

