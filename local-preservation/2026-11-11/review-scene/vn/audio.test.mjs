import test from 'node:test';
import assert from 'node:assert/strict';
import { createAudioDirector } from './audio.js';

// The fake records scheduling and graph lifetime; no speaker or browser unlock is used.
class Parameter {
  value = 0;
  events = [];
  setValueAtTime(value, time) { this.events.push({ type: 'set', value, time }); }
  exponentialRampToValueAtTime(value, time) { this.events.push({ type: 'ramp', value, time }); }
  setTargetAtTime(value, time, constant) { this.events.push({ type: 'target', value, time, constant }); }
}
class Node {
  disconnected = false;
  connections = [];
  constructor(context) { this.context = context; context.nodes.push(this); }
  connect(node) { this.connections.push(node); return node; }
  disconnect() { this.disconnected = true; this.connections = []; }
}
class Source extends Node {
  frequency = new Parameter();
  stops = [];
  start(time = this.context.currentTime) { this.startTime = time; this.context.started.push(this); }
  stop(time = this.context.currentTime) { this.stops.push(time); }
  finish() { this.onended?.(); }
}

function setup(t, { sound = true, resume = null } = {}) {
  const savedAudio = Object.getOwnPropertyDescriptor(globalThis, 'AudioContext');
  const savedDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const contexts = [], settings = { sound, volume: 50 }, document = { hidden: false };
  globalThis.document = document;
  globalThis.AudioContext = class {
    state = 'suspended';
    currentTime = 5;
    sampleRate = 8000;
    nodes = [];
    started = [];
    resumeCalls = 0;
    destination = {};
    constructor() { contexts.push(this); }
    resume() { this.resumeCalls++; if (resume) return resume(this); this.state = 'running'; return Promise.resolve(); }
    createGain() { const node = new Node(this); node.gain = new Parameter(); return node; }
    createOscillator() { return new Source(this); }
    createBufferSource() { return new Source(this); }
    createBiquadFilter() { const node = new Node(this); node.frequency = new Parameter(); node.Q = new Parameter(); return node; }
    createStereoPanner() { const node = new Node(this); node.pan = new Parameter(); return node; }
    createBuffer(channels, length) { return { getChannelData: () => new Float32Array(length) }; }
  };
  const audio = createAudioDirector(() => settings);
  t.after(() => {
    audio.stop();
    if (savedAudio) Object.defineProperty(globalThis, 'AudioContext', savedAudio); else delete globalThis.AudioContext;
    if (savedDocument) Object.defineProperty(globalThis, 'document', savedDocument); else delete globalThis.document;
  });
  return { audio, contexts, settings, document };
}

test('muted cues and effects never enable sound or create an audio context', async t => {
  const { audio, contexts, settings } = setup(t, { sound: false });
  for (const kind of ['assistant', 'message', 'neural', 'system', 'broadcast']) assert.equal(audio.cue(kind), false);
  assert.equal(audio.effect('notification'), false);
  assert.equal(await audio.resume('city'), false);
  assert.equal(contexts.length, 0);
  assert.equal(settings.sound, false);
  settings.sound = true;
  assert.equal(audio.cue('message'), false);
  assert.equal(audio.effect('notification'), false);
  assert.equal(contexts.length, 0, 'only the explicit resume path may create a context');
});

test('a suspended context cannot be unlocked or queued by a cue', async t => {
  const { audio, contexts } = setup(t);
  await audio.resume('city');
  const ctx = contexts[0], before = ctx.started.length, unlocks = ctx.resumeCalls;
  ctx.state = 'suspended';
  assert.equal(audio.cue('neural'), false);
  assert.equal(audio.effect('notification'), false);
  assert.equal(ctx.resumeCalls, unlocks);
  ctx.state = 'running';
  assert.equal(ctx.started.length, before, 'a skipped cue is not replayed later');
  audio.stop();
  assert.equal(audio.cue('message'), false, 'stop disarms later cues until the next resume');
});

test('restores stay quiet while all five communication channels have finite, tapered cues', async t => {
  const { audio, contexts } = setup(t);
  await audio.resume('silence');
  const ctx = contexts[0];
  assert.equal(audio.cue('neural', { instant: true }), false);
  assert.equal(audio.cue('unknown'), false);
  assert.equal(ctx.started.length, 0);
  const signatures = [];
  for (const kind of ['assistant', 'message', 'neural', 'system', 'broadcast']) {
    const before = ctx.started.length;
    assert.equal(audio.cue(kind, { priority: 'interrupt' }), true);
    const sources = ctx.started.slice(before);
    assert(sources.length > 0 && sources.length <= 4);
    for (const source of sources) {
      assert(source.stops.some(time => Number.isFinite(time) && time > source.startTime && time - source.startTime < 1.2));
      const gain = source.buffer ? source.connections[0].connections[0] : source.connections[0];
      const envelope = gain.gain ? gain : gain.connections[0];
      const ramps = envelope.gain.events.filter(event => event.type === 'ramp');
      assert(ramps.every(event => event.value > 0 && event.value <= .16));
      assert(ramps[0].time > source.startTime, 'there is an attack rather than a gain spike');
      assert(ramps.at(-1).value < ramps[0].value, 'the cue tapers before its scheduled stop');
    }
    signatures.push(JSON.stringify(sources.map(source => ({ noise: !!source.buffer, frequency: source.frequency.events, duration: source.stops[0] - source.startTime }))));
    sources.forEach(source => source.finish());
    assert(sources.every(source => source.disconnected));
  }
  assert.equal(new Set(signatures).size, 5, 'communication channels have distinct sound contours');
});

test('disabling sound stops and disconnects ambient, noise and oscillator sources', async t => {
  const { audio, contexts, settings } = setup(t);
  await audio.resume('city'); audio.cue('neural'); audio.effect('paper');
  const ctx = contexts[0], sources = [...ctx.started];
  assert(sources.some(source => source.buffer));
  settings.sound = false; audio.setVolume();
  assert(sources.every(source => source.disconnected && source.stops.includes(ctx.currentTime)));
  assert.equal(audio.cue('assistant'), false);
  assert.equal(ctx.started.length, sources.length);
});

test('scene changes remove old transients and rapid cues keep a bounded live graph', async t => {
  const { audio, contexts } = setup(t);
  await audio.resume('city'); audio.cue('neural');
  const ctx = contexts[0], previous = [...ctx.started];
  await audio.resume('home');
  assert(previous.every(source => source.disconnected));
  for (let i = 0; i < 30; i++) audio.cue('broadcast');
  assert(ctx.started.filter(source => !source.disconnected).length <= 11);
  audio.stop();
  assert(ctx.started.every(source => source.disconnected));
});

test('neural focus ducks only ambience and null restores it, including focus before graph creation', async t => {
  const { audio, contexts } = setup(t);
  audio.setCommunicationFocus('neural');
  await audio.resume('silence');
  const [master, ambience] = contexts[0].nodes;
  const volumeEvents = master.gain.events.length;
  assert(ambience.gain.events.at(-1).value > 0 && ambience.gain.events.at(-1).value < 1);
  assert(ambience.gain.events.at(-1).constant > 0);
  audio.setCommunicationFocus(null);
  assert.equal(ambience.gain.events.at(-1).value, 1);
  assert.equal(master.gain.events.length, volumeEvents, 'focus does not duck the cue output');
});

test('a pending browser resume cannot start stale ambience after stop or disabling sound', async t => {
  let release;
  const { audio, contexts, settings } = setup(t, { resume: ctx => new Promise(resolve => { release = () => { ctx.state = 'running'; resolve(); }; }) });
  const pending = audio.resume('city');
  settings.sound = false; audio.stop(); release();
  assert.equal(await pending, false);
  assert.equal(contexts[0].started.length, 0);
});

test('hidden pages dispose active sound and do not emit communication cues', async t => {
  const { audio, contexts, document } = setup(t);
  await audio.resume('city'); audio.cue('assistant');
  document.hidden = true;
  assert.equal(audio.cue('broadcast'), false);
  assert(contexts[0].started.every(source => source.disconnected));
});
