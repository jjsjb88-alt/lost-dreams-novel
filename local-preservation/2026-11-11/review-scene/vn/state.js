export const STORAGE_KEY = 'lost_dreams_vn_20261018_release1';
export const MANUAL_SLOTS = 3;
export const MAX_BACKLOG = 100;

export function clamp(value, min, max) {
  const number = Number.isFinite(Number(value)) ? Math.floor(Number(value)) : min;
  return Math.min(max, Math.max(min, number));
}

export function normalizeStory(story) {
  const chapters = Array.isArray(story?.chapters) ? story.chapters : [];
  return {
    title: typeof story?.title === 'string' && story.title.trim() ? story.title : '꿈을 잃은 세계',
    chapters: chapters.map((chapter, index) => ({
      id: String(chapter?.id ?? `chapter-${index + 1}`),
      label: String(chapter?.label ?? `제${index + 1}장`),
      title: String(chapter?.title ?? '제목 없음'),
      sourcePath: String(chapter?.sourcePath ?? ''),
      kind: chapter?.kind === 'bumper' ? 'bumper' : 'main',
      continuity: ['main', 'continuation', 'held'].includes(chapter?.continuity) ? chapter.continuity : 'main',
      beats: Array.isArray(chapter?.beats) ? chapter.beats.map((beat) => ({
        text: String(beat?.text ?? ''),
        kind: ['narration', 'dialogue', 'system'].includes(beat?.kind) ? beat.kind : 'narration',
        speaker: typeof beat?.speaker === 'string' ? beat.speaker : '',
        scene: typeof beat?.scene === 'string' && /^[a-z0-9_-]+$/i.test(beat.scene) ? beat.scene : 'neutral',
        portrait: ['doyun', 'jiwoo'].includes(beat?.portrait) ? beat.portrait : '',
        direction: normalizeDirection(beat?.direction),
        sourceLine: Number.isFinite(Number(beat?.sourceLine)) ? Math.max(1, Math.floor(Number(beat.sourceLine))) : 1,
        choice: normalizeChoice(beat?.choice),
      })) : [],
    })),
    assets: story?.assets && typeof story.assets === 'object' ? story.assets : {},
  };
}

const castIds = new Set(['doyun', 'seoin', 'jiwoo', 'hakyung', 'reho', 'mira', 'mother', 'yeonwoo', 'yoonha', 'yoonsera', 'eunkyung', 'haerin', 'dispatcher', 'foodstaff', 'kitchen-customer', 'canteen-staff', 'workbench-staff', 'committee-member', 'eunkyung-child', 'haerin-child', 'settlement', 'operations', 'subscriber', 'medical-operations', 'hospital-reservations', 'rescuee', 'young-man', 'child', 'elder', 'majeonghun']);
const moods = new Set(['quiet', 'warm', 'tense', 'cold', 'dream', 'urgent']);
const cameras = new Set(['wide', 'close', 'detail']);
const visualTypes = new Set(['phone', 'metric', 'document', 'object', 'dream', 'relationship', 'comparison', 'ledger']);
const visualMotifs = new Set(['clay', 'bread', 'metal', 'note', 'water', 'pot', 'tower', 'plants', 'ledger']);
const chartTypes = new Set(['bars', 'flow', 'grid', 'timeline', 'schedule', 'network']);
const effects = new Set(['notification', 'pulse', 'blackout', 'rain', 'dream', 'impact', 'silence', 'drip', 'paper', 'door', 'alarm']);
const music = new Set(['city', 'home', 'warm', 'tension', 'dream', 'silence']);

export function normalizeDirection(value) {
  if (!value || typeof value !== 'object') return null;
  const cast = Array.isArray(value.cast) ? value.cast.filter((person) => person && castIds.has(person.id)).map((person) => ({
    id: person.id, name: String(person.name ?? person.id), side: person.side === 'right' ? 'right' : 'left', ...(person.remote ? { remote: true } : {}),
  })) : [];
  const v = value.visual && typeof value.visual === 'object' && visualTypes.has(value.visual.type) ? {
    id: String(value.visual.id ?? ''), type: value.visual.type,
    ...(visualMotifs.has(value.visual.motif) ? { motif: value.visual.motif } : {}),
    ...(typeof value.visual.image === 'string' && /^[a-z0-9_-]+$/i.test(value.visual.image) ? { image: value.visual.image } : {}),
    ...(chartTypes.has(value.visual.chart?.type) ? { chart: {
      type: value.visual.chart.type,
      ...(Number.isFinite(Number(value.visual.chart.max)) && Number(value.visual.chart.max) > 0 ? { max: Number(value.visual.chart.max) } : {}),
      ...(typeof value.visual.chart.unit === 'string' && value.visual.chart.unit ? { unit: value.visual.chart.unit } : {}),
      items: Array.isArray(value.visual.chart.items) ? value.visual.chart.items.filter((item) => item && typeof item.label === 'string' && item.label.trim() && (typeof item.value === 'string' || Number.isFinite(item.value))).map((item) => ({ label: item.label, value: item.value })) : [],
    } } : {}),
    ...(value.visual.kicker ? { kicker: String(value.visual.kicker) } : {}),
    ...(value.visual.title ? { title: String(value.visual.title) } : {}),
    ...(value.visual.body ? { body: String(value.visual.body) } : {}),
    rows: Array.isArray(value.visual.rows) ? value.visual.rows.filter((row) => row && row.label != null).map((row) => ({ label: String(row.label), value: String(row.value ?? '') })) : [],
    ...(value.visual.footer ? { footer: String(value.visual.footer) } : {}),
  } : null;
  return {
    place: String(value.place ?? ''), mood: moods.has(value.mood) ? value.mood : 'quiet', camera: cameras.has(value.camera) ? value.camera : 'wide', cast,
    ...(castIds.has(value.focus) ? { focus: value.focus } : {}), visual: v,
    ...(Number.isFinite(Number(value.pauseMs)) && Number(value.pauseMs) > 0 ? { pauseMs: Math.min(1000, Math.floor(Number(value.pauseMs))) } : {}),
    ...(typeof value.emphasis === 'boolean' ? { emphasis: value.emphasis } : {}),
    ...(effects.has(value.effect) ? { effect: value.effect } : {}), music: music.has(value.music) ? value.music : 'silence',
  };
}

function normalizeChoice(choice) {
  if (!choice || typeof choice !== 'object') return null;
  const options = Array.isArray(choice.options) ? choice.options.map((option) => ({
    label: String(option?.label ?? ''),
    note: typeof option?.note === 'string' ? option.note : '',
  })).filter((option) => option.label) : [];
  if (!options.length) return null;
  return { prompt: String(choice.prompt ?? '어떻게 답할까?'), options };
}

export function freshProgress(story, chapterId = story.chapters[0]?.id ?? '') {
  const chapter = story.chapters.find((item) => item.id === chapterId) ?? story.chapters[0];
  return { chapterId: chapter?.id ?? '', beatIndex: 0, choices: {}, finished: false };
}

export function clampProgress(progress, story) {
  const chapter = story.chapters.find((item) => item.id === progress?.chapterId) ?? story.chapters[0];
  if (!chapter) return { chapterId: '', beatIndex: 0, choices: {}, finished: false };
  return {
    chapterId: chapter.id,
    beatIndex: clamp(progress?.beatIndex, 0, Math.max(0, chapter.beats.length - 1)),
    choices: progress?.choices && typeof progress.choices === 'object' ? { ...progress.choices } : {},
    finished: Boolean(progress?.finished),
  };
}

export function nextProgress(progress, story) {
  const current = clampProgress(progress, story);
  const chapterIndex = story.chapters.findIndex((chapter) => chapter.id === current.chapterId);
  const chapter = story.chapters[chapterIndex];
  if (current.beatIndex + 1 < chapter.beats.length) return { ...current, beatIndex: current.beatIndex + 1 };
  const nextChapter = story.chapters[chapterIndex + 1];
  if (nextChapter) return { ...current, chapterId: nextChapter.id, beatIndex: 0, finished: false };
  return { ...current, finished: true };
}

export function previousProgress(progress, story) {
  const current = clampProgress(progress, story);
  if (current.beatIndex > 0) return { ...current, beatIndex: current.beatIndex - 1 };
  const chapterIndex = story.chapters.findIndex((chapter) => chapter.id === current.chapterId);
  if (chapterIndex <= 0) return current;
  const previous = story.chapters[chapterIndex - 1];
  return { ...current, chapterId: previous.id, beatIndex: Math.max(0, previous.beats.length - 1), finished: false };
}

export function selectChoice(progress, chapterId, beatIndex, optionIndex) {
  const choices = { ...(progress.choices ?? {}), [`${chapterId}:${beatIndex}`]: optionIndex };
  return { ...progress, choices };
}

export function defaultSettings() {
  return { fontSize: 20, textSpeed: 34, autoWait: 1500, instant: false, auto: false, skip: false, sound: false, reducedMotion: false, volume: 35 };
}

export function normalizeSettings(settings) {
  return {
    fontSize: clamp(settings?.fontSize ?? 20, 16, 28),
    textSpeed: clamp(settings?.textSpeed ?? 34, 8, 80),
    autoWait: clamp(settings?.autoWait ?? 1500, 500, 5000),
    instant: Boolean(settings?.instant),
    auto: Boolean(settings?.auto),
    skip: Boolean(settings?.skip),
    sound: Boolean(settings?.sound),
    reducedMotion: Boolean(settings?.reducedMotion),
    volume: clamp(settings?.volume ?? 35, 0, 100),
  };
}

export function emptyStore() {
  return { version: 1, autosave: null, slots: [null, null, null], settings: defaultSettings(), seen: [], metadata: {} };
}

export function migrateStore(value, story) {
  const store = emptyStore();
  if (!value || typeof value !== 'object') return store;
  const old = value.version === 1 ? value : (value.save ? { autosave: value.save, settings: value.settings } : value);
  const normalizeSave = (save) => {
    if (!save || typeof save !== 'object') return null;
    return {
      progress: clampProgress(save.progress ?? save, story),
      timestamp: Number.isFinite(Number(save.timestamp)) ? Number(save.timestamp) : Date.now(),
      preview: String(save.preview ?? ''),
    };
  };
  store.autosave = normalizeSave(old.autosave);
  const slots = Array.isArray(old.slots) ? old.slots : [];
  store.slots = Array.from({ length: MANUAL_SLOTS }, (_, i) => normalizeSave(slots[i]));
  store.settings = normalizeSettings(old.settings);
  store.seen = Array.isArray(old.seen) ? [...new Set(old.seen.map(String))].slice(-100000) : [];
  store.metadata = old.metadata && typeof old.metadata === 'object' ? { ...old.metadata } : {};
  return store;
}

export function readStore(storage, story, key = STORAGE_KEY) {
  try {
    const raw = storage?.getItem(key);
    return migrateStore(raw ? JSON.parse(raw) : null, story);
  } catch {
    return emptyStore();
  }
}

export function writeStore(storage, store, key = STORAGE_KEY) {
  try { storage?.setItem(key, JSON.stringify({ ...store, version: 1 })); return true; }
  catch { return false; }
}

export function makeSave(progress, chapter, beat) {
  const preview = beat?.text?.replace(/\s+/g, ' ').slice(0, 90) ?? '';
  return { progress: { ...progress, choices: { ...(progress.choices ?? {}) } }, timestamp: Date.now(), preview };
}

export function isSeen(seen, chapterId, beatIndex) { return seen.includes(`${chapterId}:${beatIndex}`); }

export function addSeen(seen, chapterId, beatIndex) {
  return [...new Set([...seen, `${chapterId}:${beatIndex}`])].slice(-100000);
}
