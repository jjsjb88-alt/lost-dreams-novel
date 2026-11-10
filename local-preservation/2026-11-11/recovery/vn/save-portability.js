import { MANUAL_SLOTS, migrateStore } from './state.js';

const FORMAT = 'lost-dreams-save';
const VERSION = 1;
const MAX_BYTES = 2 * 1024 * 1024;
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

function currentTitle(story) {
  if (typeof story?.title !== 'string' || !story.title.trim() || !Array.isArray(story.chapters) || !story.chapters.length) {
    throw new Error('현재 작품 정보를 확인할 수 없어 읽기 기록을 처리하지 못했습니다.');
  }
  return story.title;
}

function validateSave(save, label, story) {
  if (!isRecord(save) || !isRecord(save.progress)) {
    throw new Error(`${label}의 읽기 위치가 손상되었습니다.`);
  }
  const progress = save.progress;
  const chapter = story.chapters.find((item) => item.id === progress.chapterId);
  if (typeof progress.chapterId !== 'string' || !chapter) {
    throw new Error(`${label}에 현재 원고에 없는 화가 있습니다. 이 기록은 가져올 수 없습니다.`);
  }
  if (!Number.isSafeInteger(progress.beatIndex) || progress.beatIndex < 0 || !Array.isArray(chapter.beats) || progress.beatIndex >= chapter.beats.length) {
    throw new Error(`${label}의 문장 위치가 현재 원고 범위를 벗어났습니다. 이 기록은 가져올 수 없습니다.`);
  }
  if (progress.choices !== undefined && (!isRecord(progress.choices) || Object.values(progress.choices).some((value) => !Number.isSafeInteger(value) || value < 0))) {
    throw new Error(`${label}의 선택 기록이 손상되었습니다.`);
  }
  if (progress.finished !== undefined && typeof progress.finished !== 'boolean') {
    throw new Error(`${label}의 완료 기록이 손상되었습니다.`);
  }
  if (save.timestamp !== undefined && (typeof save.timestamp !== 'number' || !Number.isFinite(save.timestamp) || save.timestamp < 0)) {
    throw new Error(`${label}의 저장 시간이 손상되었습니다.`);
  }
  if (save.preview !== undefined && typeof save.preview !== 'string') {
    throw new Error(`${label}의 미리보기가 손상되었습니다.`);
  }
}

function validateStore(store, story) {
  if (!isRecord(store)) throw new Error('읽기 기록의 내용이 손상되었습니다.');
  if (store.version !== VERSION) throw new Error('지원하지 않는 읽기 기록 버전입니다.');
  if (store.slots !== undefined && (!Array.isArray(store.slots) || store.slots.length > MANUAL_SLOTS)) {
    throw new Error('수동 저장 칸의 내용이 손상되었거나 지원하는 개수를 초과했습니다.');
  }
  if (store.settings !== undefined && !isRecord(store.settings)) throw new Error('읽기 설정이 손상되었습니다.');
  if (store.seen !== undefined && (!Array.isArray(store.seen) || store.seen.some((entry) => typeof entry !== 'string'))) {
    throw new Error('이미 읽은 문장 기록이 손상되었습니다.');
  }
  if (store.metadata !== undefined && !isRecord(store.metadata)) throw new Error('읽기 기록의 추가 정보가 손상되었습니다.');

  let count = 0;
  if (store.autosave !== null && store.autosave !== undefined) {
    validateSave(store.autosave, '자동 저장', story);
    count += 1;
  }
  for (const [index, save] of (store.slots ?? []).entries()) {
    if (save === null || save === undefined) continue;
    validateSave(save, `수동 저장 ${index + 1}`, story);
    count += 1;
  }
  if (!count) throw new Error('이 파일에는 이어 읽을 수 있는 저장 기록이 없습니다.');
}

export function exportSaveData(store, story) {
  const storyTitle = currentTitle(story);
  try {
    return JSON.stringify({
      format: FORMAT,
      version: VERSION,
      exportedAt: new Date().toISOString(),
      storyTitle,
      store,
    }, null, 2);
  } catch {
    throw new Error('읽기 기록을 파일로 만들지 못했습니다.');
  }
}

export function importSaveData(text, story) {
  const storyTitle = currentTitle(story);
  if (typeof text !== 'string' || !text.trim()) throw new Error('읽기 기록 파일이 비어 있습니다.');
  if (new TextEncoder().encode(text).byteLength > MAX_BYTES) throw new Error('읽기 기록 파일은 2MB 이하만 가져올 수 있습니다.');
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error('읽기 기록 파일을 읽지 못했습니다. 파일 내용이 손상되었습니다.'); }
  if (!isRecord(data) || data.format !== FORMAT) throw new Error('이 게임의 읽기 기록 파일이 아닙니다.');
  if (data.version !== VERSION) throw new Error('지원하지 않는 읽기 기록 파일 버전입니다.');
  if (typeof data.storyTitle !== 'string' || data.storyTitle !== storyTitle) throw new Error('다른 작품의 읽기 기록은 가져올 수 없습니다.');
  validateStore(data.store, story);
  return migrateStore(data.store, story);
}
