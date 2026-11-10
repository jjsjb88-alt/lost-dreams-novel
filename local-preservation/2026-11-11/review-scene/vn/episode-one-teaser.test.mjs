import test from 'node:test';
import assert from 'node:assert/strict';
import { createEpisodeOneTeaser } from './episode-one-teaser.js';

function fixture(play = () => Promise.resolve(), startupMs = 10000) {
  const node = () => Object.assign(new EventTarget(), { textContent: '', focus() {} });
  const dialog = Object.assign(node(), { open: false, showModal() { this.open = true; }, close() { this.open = false; } });
  const video = Object.assign(node(), { paused: true, play() { this.paused = false; return play(); }, pause() { this.paused = true; }, removeAttribute() { delete this.src; }, load() {} });
  const skip = node(), pause = node(), status = node(), document = node();
  const player = createEpisodeOneTeaser({ dialog, video, skip, pause, status, document, startupMs });
  let finished = 0;
  return { player, dialog, video, skip, pause, document, get finished() { return finished; },
    start(sound = true, volume = 35) { player.start({ src: 'teaser.mp4', sound, volume, onFinish: () => finished++ }); } };
}
const emit = (node, name) => node.dispatchEvent(new Event(name, { cancelable: true }));

test('teaser respects saved volume including zero and clamps invalid ranges', () => {
  for (const [volume, expected] of [[0, 0], [35, .35], [150, 1], [-1, 0], [NaN, .35]]) {
    const f = fixture(); f.start(true, volume);
    assert.equal(f.video.volume, expected); emit(f.skip, 'click');
  }
});

test('end, skip, Escape and error each finish exactly once and release media', async () => {
  for (const kind of ['ended', 'skip', 'cancel', 'error']) {
    const f = fixture(); f.start(false);
    assert.equal(f.video.muted, true);
    assert.equal(f.dialog.open, true);
    emit(kind === 'skip' ? f.skip : kind === 'cancel' ? f.dialog : f.video, kind === 'skip' ? 'click' : kind);
    emit(f.video, 'ended'); emit(f.skip, 'click'); emit(f.video, 'error');
    assert.equal(f.finished, 1); assert.equal(f.player.open, false);
    assert.equal(f.dialog.open, false); assert.equal(f.video.paused, true); assert.equal(f.video.src, undefined);
  }
});
test('late rejection from skipped session cannot finish a subsequent session', async () => {
  let reject;
  const f = fixture(() => new Promise((_, no) => { reject = no; }));
  f.start(); const oldReject = reject; emit(f.skip, 'click'); f.start();
  oldReject(new Error('late')); await Promise.resolve(); await Promise.resolve();
  assert.equal(f.finished, 1); assert.equal(f.player.open, true);
  emit(f.skip, 'click'); assert.equal(f.finished, 2);
});
test('blocked playback and startup timeout fall through', async () => {
  const rejected = fixture(() => Promise.reject(new Error('blocked')));
  rejected.start(); await Promise.resolve(); await Promise.resolve(); assert.equal(rejected.finished, 1);
  const timed = fixture(() => new Promise(() => {}), 5);
  timed.start(); await new Promise(resolve => setTimeout(resolve, 20)); assert.equal(timed.finished, 1);
});
test('playing cancels startup timeout; tab hiding pauses and explicit resume works', async () => {
  const f = fixture(undefined, 5); f.start(); emit(f.video, 'playing');
  await new Promise(resolve => setTimeout(resolve, 20)); assert.equal(f.finished, 0);
  f.document.hidden = true; emit(f.document, 'visibilitychange');
  assert.equal(f.video.paused, true);
  // The real media element emits pause; model that event here.
  emit(f.video, 'pause'); assert.equal(f.pause.textContent, '계속 재생');
  emit(f.pause, 'click'); assert.equal(f.video.paused, false);
  emit(f.skip, 'click');
});
