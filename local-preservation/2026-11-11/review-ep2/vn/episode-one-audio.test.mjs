import assert from 'node:assert/strict';
import test from 'node:test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// EP1_VN_ROOT points to the directory containing episode-one-audio.js.
// After this test is copied beside that module, no environment variable is needed.
const moduleUrl = process.env.EP1_VN_ROOT
  ? pathToFileURL(resolve(process.env.EP1_VN_ROOT, 'episode-one-audio.js')).href
  : new URL('./episode-one-audio.js', import.meta.url).href;
const { createEpisodeOneAudio } = await import(moduleUrl);

function audioRig(t, delayedKeys = []) {
  const saved = Object.fromEntries(
    ['AudioContext', 'document', 'fetch'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]),
  );
  const pending = new Map(delayedKeys.map(key => {
    let release;
    const promise = new Promise(resolvePromise => { release = resolvePromise; });
    return [key, { promise, release }];
  }));
  const contexts = [], events = [];

  class FakeParam {
    constructor() { this.value = 0; }
    setTargetAtTime(value) { this.value = value; }
    cancelScheduledValues() {}
    setValueAtTime(value) { this.value = value; }
  }

  class FakeContext {
    constructor() {
      this.state = 'running';
      this.currentTime = 0;
      this.destination = {};
      this.nodes = [];
      contexts.push(this);
    }
    createGain() {
      return { gain: new FakeParam(), connect() {}, disconnect() {} };
    }
    createBufferSource() {
      const context = this;
      const node = {
        loop: false, onended: null, stopCalls: [],
        connect() {}, disconnect() {},
        start(when, offset) {
          events.push({ type: 'start', key: this.buffer.key, offset, when });
        },
        stop(when) {
          this.stopCalls.push(when ?? 0);
          events.push({ type: 'stop', key: this.buffer?.key, when: when ?? 0 });
          // A fading source remains live until stopped immediately or its
          // scheduled end arrives. This allows stop-during-fade to be checked.
          if (!when || when <= context.currentTime) queueMicrotask(() => this.onended?.());
        },
      };
      this.nodes.push(node);
      return node;
    }
    async resume() {}
    async decodeAudioData(key) { return { key, duration: 60 }; }
  }

  globalThis.AudioContext = FakeContext;
  globalThis.document = { hidden: false };
  globalThis.fetch = async key => {
    await pending.get(key)?.promise;
    return { ok: true, arrayBuffer: async () => key };
  };
  const assets = Object.fromEntries(
    ['musicSea', 'musicTable', 'coast', 'room', 'box', 'approval', 'amber'].map(key => [key, key]),
  );
  const audio = createEpisodeOneAudio(() => ({ sound: true, volume: 50 }), assets);

  t.after(() => {
    audio.stop();
    for (const request of pending.values()) request.release();
    for (const [key, descriptor] of Object.entries(saved)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  return { audio, contexts, events, release: key => pending.get(key)?.release() };
}

test('stop during delayed loading prevents stale music and effects', async t => {
  const r = audioRig(t, ['musicSea', 'box']);
  await r.audio.unlock();
  const rendering = r.audio.render({ index: 12, music: 'musicSea', ambience: 'coast', fx: 'box' });
  r.audio.stop();
  r.release('musicSea');
  r.release('box');
  await rendering;
  assert.equal(r.events.filter(event => event.type === 'start').length, 0);
});

test('same music fast navigation rejects a delayed previous effect', async t => {
  const r = audioRig(t, ['approval']);
  await r.audio.unlock();
  await r.audio.render({ index: 100, music: 'musicSea', ambience: 'coast' });
  const previous = r.audio.render({ index: 122, music: 'musicSea', ambience: 'coast', fx: 'approval' });
  await r.audio.render({ index: 123, music: 'musicSea', ambience: 'coast', fx: 'amber' });
  r.release('approval');
  await previous;
  const started = key => r.events.filter(event => event.type === 'start' && event.key === key);
  assert.equal(started('approval').length, 0);
  assert.equal(started('amber').length, 1);
  assert.equal(started('musicSea').length, 1);
  assert.equal(started('coast').length, 1);
});

test('stop also stops retired and fading voices immediately', async t => {
  const r = audioRig(t);
  await r.audio.unlock();
  await r.audio.render({ index: 12, music: 'musicSea', ambience: 'coast' });
  r.contexts[0].currentTime = 12;
  await r.audio.render({ index: 30, music: 'musicTable', ambience: 'room' });
  const fading = r.contexts[0].nodes.filter(node => ['musicSea', 'coast'].includes(node.buffer.key));
  assert.equal(fading.length, 2);
  assert(fading.every(node => node.stopCalls.some(time => time > 12)));
  r.audio.stop();
  assert(fading.every(node => node.stopCalls.at(-1) === 0));
  assert(r.contexts[0].nodes.every(node => node.stopCalls.at(-1) === 0));
});

test('quiet resume preserves loop offset without effects or duplicate restart', async t => {
  const r = audioRig(t);
  await r.audio.unlock();
  await r.audio.render({ index: 12, music: 'musicSea', ambience: 'coast' });
  r.contexts[0].currentTime = 42;
  r.audio.stop();
  await Promise.resolve();
  await r.audio.render({ index: 122, music: 'musicSea', ambience: 'coast', fx: 'box' }, { quiet: true });
  const starts = () => r.events.filter(event => event.type === 'start');
  assert.equal(starts().filter(event => event.key === 'box').length, 0);
  assert.equal(starts().filter(event => event.key === 'musicSea').at(-1).offset, 42);
  assert.equal(starts().filter(event => event.key === 'coast').at(-1).offset, 42);
  const count = starts().length;
  await r.audio.render({ index: 123, music: 'musicSea', ambience: 'coast', fx: 'amber' }, { quiet: true });
  assert.equal(starts().length, count);
});
