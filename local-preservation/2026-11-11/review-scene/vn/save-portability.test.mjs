import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyStore, makeSave, normalizeStory } from './state.js';
import { exportSaveData, importSaveData } from './save-portability.js';

const story = normalizeStory({ title: '꿈을 잃은 세계', chapters: [
  { id: 'ep001', beats: [{ text: '선택', choice: { options: [{ label: '보기' }, { label: '듣기' }] } }, { text: '두 번째 문장' }] },
  { id: 'ep002', beats: [{ text: '다음 화' }] },
] });

function savedStore() {
  const store = emptyStore();
  store.autosave = makeSave({ chapterId: 'ep001', beatIndex: 1, choices: { 'ep001:0': 1 }, finished: false }, story.chapters[0], story.chapters[0].beats[1]);
  store.slots[2] = makeSave({ chapterId: 'ep002', beatIndex: 0, choices: { 'ep001:0': 0 }, finished: true }, story.chapters[1], story.chapters[1].beats[0]);
  store.settings = { ...store.settings, fontSize: 26, instant: true, reducedMotion: true, volume: 12 };
  store.seen = ['ep001:0', 'ep001:1', 'ep002:0'];
  store.metadata = { note: '휴대폰에서 이어 읽기' };
  return store;
}

function editedFile(edit) {
  const data = JSON.parse(exportSaveData(savedStore(), story));
  edit(data);
  return JSON.stringify(data);
}

test('portable file preserves separate save choices, read history and settings without mutating the source', () => {
  const store = savedStore();
  const before = structuredClone(store);
  const text = exportSaveData(store, story);
  const envelope = JSON.parse(text);
  assert.equal(envelope.format, 'lost-dreams-save');
  assert.equal(envelope.version, 1);
  assert.equal(envelope.storyTitle, story.title);
  assert.ok(Number.isFinite(Date.parse(envelope.exportedAt)));
  assert.ok(text.includes('\n  "format"'));
  const imported = importSaveData(text, story);
  assert.deepEqual(imported, before);
  imported.autosave.progress.choices['ep001:0'] = 0;
  assert.deepEqual(store, before);
});

test('manual-only records are portable, but empty or settings-only files are rejected', () => {
  const store = savedStore();
  store.autosave = null;
  assert.equal(importSaveData(exportSaveData(store, story), story).slots[2].progress.chapterId, 'ep002');
  assert.throws(() => importSaveData(exportSaveData(emptyStore(), story), story), /저장 기록이 없습니다/);
  assert.throws(() => importSaveData('', story), /비어/);
});

test('another work, unsupported envelope and unsupported versions are rejected explicitly', () => {
  assert.throws(() => importSaveData(editedFile((data) => { data.storyTitle = '다른 작품'; }), story), /다른 작품/);
  assert.throws(() => importSaveData(editedFile((data) => { data.format = 'another-game'; }), story), /이 게임/);
  assert.throws(() => importSaveData(editedFile((data) => { data.version = 2; }), story), /버전/);
  assert.throws(() => importSaveData(editedFile((data) => { data.store.version = 9; }), story), /버전/);
  assert.throws(() => importSaveData(JSON.stringify(savedStore()), story), /이 게임/);
});

test('every imported save position is checked before migration instead of falling back to the first chapter', () => {
  assert.throws(() => importSaveData(editedFile((data) => { data.store.autosave.progress.chapterId = 'removed'; }), story), /자동 저장.*없는 화/);
  assert.throws(() => importSaveData(editedFile((data) => { data.store.slots[2].progress.beatIndex = 1; }), story), /수동 저장 3.*문장 위치/);
  for (const beatIndex of [-1, 0.5, '1', null]) {
    assert.throws(() => importSaveData(editedFile((data) => { data.store.autosave.progress.beatIndex = beatIndex; }), story), /문장 위치/);
  }
});

test('corrupt JSON and malformed save containers cannot become valid progress', () => {
  for (const text of ['{bad', 'null', '[]']) assert.throws(() => importSaveData(text, story), /손상|이 게임/);
  for (const edit of [
    (data) => { data.store.autosave = {}; },
    (data) => { data.store.slots = {}; },
    (data) => { data.store.autosave.progress.choices = []; },
    (data) => { data.store.seen = [null]; },
  ]) assert.throws(() => importSaveData(editedFile(edit), story), /손상/);
});

test('the 2MB import limit counts actual UTF-8 bytes, including Korean text', () => {
  const text = editedFile((data) => { data.store.metadata.note = '한'.repeat(710000); });
  assert.ok(text.length < 2 * 1024 * 1024);
  assert.ok(new TextEncoder().encode(text).byteLength > 2 * 1024 * 1024);
  assert.throws(() => importSaveData(text, story), /2MB/);
});
