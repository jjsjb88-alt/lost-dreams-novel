const NOTES = { city: [110, 164.81, 220], home: [130.81, 196, 261.63], warm: [146.83, 220, 293.66], tension: [103.83, 155.56, 207.65], dream: [123.47, 185, 277.18], silence: [] };
const COMMUNICATIONS = new Set(['assistant', 'message', 'neural', 'system', 'broadcast']);
const EFFECTS = new Set(['notification', 'pulse', 'impact', 'drip', 'paper', 'door', 'alarm']);
const FLOOR = .0001;

export function createAudioDirector(getSettings) {
  let context = null, master = null, ambience = null, timer = 0, step = 0;
  let active = false, armed = false, currentMotif = '', focus = null, resumeVersion = 0;
  const voices = new Set(), transients = new Set();
  const settings = () => getSettings() ?? {};
  const hidden = () => typeof document !== 'undefined' && document.hidden;
  const level = () => Math.max(0, Math.min(100, Number(settings().volume) || 0)) / 100 * .075;

  function ensure() {
    if (!context) {
      const Context = globalThis.AudioContext ?? globalThis.webkitAudioContext;
      if (!Context) return null;
      try {
        context = new Context();
        master = context.createGain(); master.gain.value = 0; master.connect(context.destination);
        ambience = context.createGain(); ambience.gain.value = 1; ambience.connect(master);
      } catch { context = null; master = null; ambience = null; }
    }
    return context;
  }

  function track(source, nodes, group = null) {
    const voice = { source, nodes, group, disposed: false };
    voices.add(voice); group?.add(voice);
    source.onended = () => dispose(voice);
    return voice;
  }

  function dispose(voice) {
    if (voice.disposed) return;
    voice.disposed = true;
    voice.source.onended = null;
    for (const node of [voice.source, ...voice.nodes]) { try { node.disconnect(); } catch {} }
    voices.delete(voice);
    if (voice.group) {
      voice.group.delete(voice);
      if (!voice.group.size) transients.delete(voice.group);
    }
  }

  function clearVoices(group = null) {
    for (const voice of [...(group ?? voices)]) {
      try { voice.source.stop(); } catch {}
      dispose(voice);
    }
  }

  function stop() {
    ++resumeVersion;
    active = false; armed = false; currentMotif = ''; focus = null;
    clearTimeout(timer); timer = 0; clearVoices();
    if (context && master) {
      master.gain.setTargetAtTime(0, context.currentTime, .08);
      ambience.gain.setTargetAtTime(1, context.currentTime, .3);
    }
  }

  function envelope(param, now, duration, peak, attack) {
    param.setValueAtTime(FLOOR, now);
    param.exponentialRampToValueAtTime(Math.max(FLOOR, Math.min(.16, peak)), now + attack);
    param.exponentialRampToValueAtTime(FLOOR, now + duration);
  }

  function tone(group, { frequency, end = frequency, duration = .24, delay = 0, peak = .05, attack = .025, wave = 'sine', filter = null, pan = 0, bus = master }) {
    const now = context.currentTime + delay, source = context.createOscillator(), gain = context.createGain(), nodes = [gain];
    source.type = wave; source.frequency.setValueAtTime(frequency, now);
    if (end !== frequency) source.frequency.exponentialRampToValueAtTime(end, now + duration);
    envelope(gain.gain, now, duration, peak, attack);
    let output = source;
    if (filter) {
      const node = context.createBiquadFilter(); node.type = filter.type;
      node.frequency.value = filter.frequency; node.Q.value = filter.q ?? .7;
      output.connect(node); output = node; nodes.push(node);
    }
    output.connect(gain); output = gain;
    if (pan && context.createStereoPanner) {
      const panner = context.createStereoPanner(); panner.pan.value = pan;
      output.connect(panner); output = panner; nodes.push(panner);
    }
    output.connect(bus);
    track(source, nodes, group); source.start(now); source.stop(now + duration + .02);
  }

  function stream(group, { duration = .22, delay = 0, peak = .018, attack = .045, frequency = 850, end = frequency, q = .8, type = 'bandpass' }) {
    const now = context.currentTime + delay, length = Math.max(1, Math.ceil(context.sampleRate * duration));
    const buffer = context.createBuffer(1, length, context.sampleRate), data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    const source = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain();
    source.buffer = buffer; filter.type = type; filter.Q.value = q;
    filter.frequency.setValueAtTime(frequency, now);
    if (end !== frequency) filter.frequency.exponentialRampToValueAtTime(end, now + duration);
    envelope(gain.gain, now, duration, peak, attack);
    source.connect(filter); filter.connect(gain); gain.connect(master);
    track(source, [filter, gain], group); source.start(now); source.stop(now + duration + .02);
  }

  function newTransient() {
    // A fast skip or repeated notification cannot stack an unbounded mix.
    while (transients.size >= 3) clearVoices(transients.values().next().value);
    const group = new Set(); transients.add(group); return group;
  }

  function tick(motif) {
    if (!active || !settings().sound || hidden()) { stop(); return; }
    for (const voice of [...voices]) if (!voice.group) { try { voice.source.stop(); } catch {} dispose(voice); }
    const notes = NOTES[motif] ?? [];
    if (notes.length) {
      const base = notes[step++ % notes.length];
      tone(null, { frequency: base, peak: .15, duration: 7.5, attack: 1.8, bus: ambience });
      tone(null, { frequency: base * 1.5, peak: .05, duration: 7.5, attack: 1.8, wave: 'triangle', bus: ambience });
    }
    timer = setTimeout(() => tick(motif), 7800);
  }

  async function resume(motif) {
    if (!settings().sound || hidden() || !motif) { stop(); return false; }
    const ctx = ensure(); if (!ctx) return false;
    const version = ++resumeVersion;
    armed = true;
    if (currentMotif !== motif) {
      active = false; clearTimeout(timer); timer = 0; clearVoices();
      currentMotif = motif;
    }
    // Only this existing, user-enabled entry point may request an unlock.
    // Cues never resume a suspended context or queue themselves for later.
    if (ctx.state !== 'running') {
      try { await ctx.resume(); } catch { return false; }
    }
    if (version !== resumeVersion || !settings().sound || hidden() || !armed || ctx.state !== 'running') return false;
    setVolume(); setCommunicationFocus(focus);
    if (!active && motif !== 'silence') { active = true; tick(motif); }
    return true;
  }

  function canPlay() {
    if (!settings().sound || hidden()) { if (context) stop(); return false; }
    return !!(armed && context?.state === 'running');
  }

  function effect(name) {
    if (!EFFECTS.has(name) || !canPlay()) return false;
    setVolume();
    const group = newTransient();
    if (name === 'paper') {
      stream(group, { duration: .22, peak: .012, attack: .025, frequency: 1200, type: 'highpass' });
      return true;
    }
    const frequency = name === 'notification' ? 660 : name === 'impact' ? 95 : name === 'drip' ? 880 : name === 'door' ? 125 : name === 'alarm' ? 740 : 220;
    const duration = name === 'drip' ? .24 : name === 'door' ? .48 : name === 'alarm' ? .52 : name === 'notification' ? .12 : .3;
    const end = name === 'impact' ? 42 : name === 'drip' ? 250 : name === 'door' ? 54 : name === 'alarm' ? 554 : frequency;
    const peak = name === 'drip' ? .014 : name === 'alarm' ? .022 : name === 'notification' ? .035 : .045;
    tone(group, { frequency, end, duration, peak, attack: .02, wave: ['impact', 'door'].includes(name) ? 'triangle' : 'sine' });
    return true;
  }

  function cue(kind, { priority = 'normal', instant = false } = {}) {
    if (instant || !COMMUNICATIONS.has(kind) || !canPlay()) return false;
    setVolume();
    const group = newTransient();
    const scale = ['quiet', 'low'].includes(priority) ? .72 : ['high', 'urgent', 'interrupt'].includes(priority) ? 1.08 : 1;
    const play = options => tone(group, { ...options, peak: (options.peak ?? .05) * scale });
    const air = options => stream(group, { ...options, peak: (options.peak ?? .018) * scale });
    if (kind === 'assistant') {
      air({ duration: .24, peak: .016, attack: .08, frequency: 1050, end: 700 });
      play({ frequency: 310, end: 348, duration: .3, delay: .06, peak: .05, attack: .09 });
      play({ frequency: 465, end: 522, duration: .22, delay: .1, peak: .018, attack: .07 });
    } else if (kind === 'message') {
      play({ frequency: 620, end: 570, duration: .2, peak: .06, attack: .02, pan: -.28 });
      play({ frequency: 930, end: 855, duration: .17, delay: .07, peak: .022, attack: .025, pan: -.18 });
    } else if (kind === 'neural') {
      air({ duration: .84, peak: .034, attack: .25, frequency: 720, end: 1280, q: 1.1 });
      play({ frequency: 146.83, end: 196, duration: .88, peak: .05, attack: .27 });
      play({ frequency: 293.66, end: 330, duration: .68, delay: .07, peak: .022, attack: .24, pan: .12 });
    } else if (kind === 'system') {
      play({ frequency: 440, duration: .12, peak: .047, attack: .018, wave: 'triangle' });
      play({ frequency: 660, duration: .14, delay: .09, peak: .04, attack: .018 });
    } else {
      const filter = { type: 'lowpass', frequency: 680, q: .6 };
      air({ duration: .46, peak: .012, attack: .13, frequency: 460, q: .7 });
      play({ frequency: 196, end: 220, duration: .48, peak: .065, attack: .1, wave: 'triangle', filter, pan: .16 });
      play({ frequency: 294, end: 330, duration: .36, delay: .06, peak: .027, attack: .09, filter, pan: .16 });
    }
    return true;
  }

  function setCommunicationFocus(kind = null) {
    focus = COMMUNICATIONS.has(kind) || kind === 'interrupt' ? kind : null;
    if (!context || !ambience) return;
    const target = focus === 'neural' || focus === 'interrupt' ? .58 : focus === 'broadcast' ? .78 : focus ? .9 : 1;
    ambience.gain.setTargetAtTime(target, context.currentTime, focus ? .18 : .4);
  }

  function setVolume() {
    if (context && master) master.gain.setTargetAtTime(armed && settings().sound && !hidden() ? level() : 0, context.currentTime, .3);
    if (context && (!settings().sound || hidden())) stop();
  }

  return { resume, stop, effect, setVolume, cue, setCommunicationFocus };
}
