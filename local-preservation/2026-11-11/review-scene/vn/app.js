import {
  STORAGE_KEY, MAX_BACKLOG, addSeen, clampProgress,
  freshProgress, isSeen, makeSave, nextProgress,
  normalizeStory, previousProgress, readStore, selectChoice, writeStore,
} from './state.js';
import { createAudioDirector } from './audio.js';
import { createMotifSVG, directedCast, sceneClass } from './direction.js';
import { presentationForBeat } from './neural-cues.js?v=scene-mix-20261020';
import { NeuralStage } from './neural-stage.js';
import { preparePerception, communicationReadDelay, sensoryContextForBeat } from './perception.js';
import { exportSaveData, importSaveData } from './save-portability.js';
import { EP1_ASSETS } from './ep1-assets.js?v=ep12-20261019-r3';
import { episodeOneDirection, EPISODE_ONE_SCENES } from './episode-one.js?v=ep12-20261019-r3';
import { EpisodeOneStage } from './episode-one-stage.js?v=ep12-20261019-r3';
import { createEpisodeOneAudio } from './episode-one-audio.js?v=ep12-20261019-r3';
import { episodeOneReadingPage, episodeOnePreviousPage, isEpisodeOneObservation } from './episode-one-reading.js?v=ep12-20261019-r3';
import { createEpisodeOneTeaser } from './episode-one-teaser.js';
import { createTitleAtmosphere } from './title-atmosphere.js';
import { episodeTwoDirection, episodeTwoSpeaker, EPISODE_TWO_SCENES } from './episode-two.js?v=ep12-20261019-r3';
import { episodeTwoReadingPage, episodeTwoPreviousPage } from './episode-two-reading.js?v=ep12-20261019-r3';

const story = normalizeStory(window.STORY);
document.documentElement.dataset.vnBuild='scene-mix-20261020';
const $ = (id) => document.getElementById(id);
const titleScreen = $('titleScreen'), gameScreen = $('gameScreen');
createTitleAtmosphere({screen:titleScreen,canvas:$('titleAtmosphere')});
const modal = $('modal'), modalContent = $('modalContent');
const episodeTeaser = createEpisodeOneTeaser({ dialog: $('episodeTeaser'), video: $('teaserVideo'), skip: $('teaserSkip'), pause: $('teaserPause'), status: $('teaserStatus') });
const stageImage = $('stageImage'), portraitWrap = $('portraitWrap'), portraitImage = $('portraitImage');
const secondaryPortraitWrap = $('secondaryPortraitWrap'), secondaryPortraitImage = $('secondaryPortraitImage');
const sceneLayers = [$('sceneLayerA'), $('sceneLayerB')];
const storyText = $('storyText'), speakerNode = $('speaker'), choiceArea = $('choiceArea');
const directionCard = $('directionCard'), castRail = $('castRail'), placeRibbon = $('placeRibbon'), motifStage = $('motifStage');
let browserStorage; try { browserStorage = localStorage; } catch { browserStorage = null; }
let store = readStore(browserStorage, story), progress = freshProgress(story);
// Playback always waits for a fresh action after loading or continuing a save.
store.settings.auto = false; store.settings.skip = false;
let storageHealthy = Boolean(browserStorage), storageWarningShown = false, restoreFocus = null;
let typeTimer = 0, fullText = '', typing = false, modalMode = '', backlog = [];
let backlogRestore = null, transientBacklog = false, autoTimer = 0, previousPlace = '';
let pendingChapter = null;
const audio = createAudioDirector(() => store.settings);
const neuralStage = new NeuralStage($('neuralStage'));
const episodeStage = new EpisodeOneStage($('episodeOneStage'), EP1_ASSETS);
const episodeAudio = createEpisodeOneAudio(() => store.settings, EP1_ASSETS, {onStatus:(status,tracks={})=>{
  $('soundToggle').dataset.audioStatus=status;
  $('soundToggle').dataset.music=tracks.music||'';
  $('soundToggle').dataset.ambience=tracks.ambience||'';
  $('soundToggle').setAttribute('aria-description',({playing:'음악 또는 장면 소리가 재생 중입니다.',silent:'이 장면은 조용히 재생합니다.',ready:'소리를 재생할 준비가 되었습니다.',blocked:'소리를 다시 눌러 재생해 주세요.',unavailable:'이 브라우저는 장면 음향을 지원하지 않습니다.'})[status]||'');
}});
let currentEpisodeCue = null;
let currentReadingPage = null;
let currentPerception = null, lastCommunicationGroup = '';
let sceneFront = 0, sceneBackground = '', lastEffectKey = '', currentVisualKey = 'unset';

document.documentElement.style.setProperty('--font-size', `${store.settings.fontSize}px`);
if (story.assets?.city) document.documentElement.style.setProperty('--title-art', `url("${story.assets.city}")`);
document.title = story.title;
$('storyTitle').textContent = story.title;

function chapterAt(id = progress.chapterId) { return story.chapters.find((chapter) => chapter.id === id); }
function beatAt(pos = progress) { return chapterAt(pos.chapterId)?.beats[pos.beatIndex] ?? null; }
function needsChoice() { return Boolean(beatAt()?.choice && !isEpisodeOneObservation(chapterAt(), progress.beatIndex)); }
function saveStore() {
  const saved = Boolean(browserStorage) && writeStore(browserStorage, store, STORAGE_KEY);
  if (!saved && !storageWarningShown) { toast('브라우저에 저장하지 못했습니다. 저장과 백업에서 파일로 보관해 주세요.'); storageWarningShown = true; }
  if (saved) storageWarningShown = false;
  storageHealthy = saved; syncContinueInfo(); return saved;
}
function clearTimers() { clearTimeout(typeTimer); clearTimeout(autoTimer); }
function syncContinueInfo() {
  const save = store.autosave, chapter = save && chapterAt(save.progress.chapterId);
  $('continueButton').disabled = !save;
  $('continueInfo').textContent = save ? `이어 읽기 · ${chapter?.label || ''} · ${save.progress.beatIndex + 1}번째 문장` : '클릭 · Enter · Space로 읽기';
}
function syncReadingTools() {
  $('autoToggle').setAttribute('aria-pressed', String(store.settings.auto));
  $('skipToggle').setAttribute('aria-pressed', String(store.settings.skip));
  $('readingStatus').textContent = store.settings.auto ? '자동 진행 중 · A 또는 Esc로 멈춤' : store.settings.skip ? '읽은 문장만 넘기는 중 · K 또는 Esc로 멈춤' : '직접 읽기';
  $('previousButton').disabled = progress.chapterId === story.chapters[0]?.id && progress.beatIndex === 0;
}
function pauseReading() {
  clearTimeout(autoTimer); store.settings.auto = false; store.settings.skip = false; syncReadingTools();
}
function scheduleReading() {
  clearTimeout(autoTimer);
  if (typing || gameScreen.hidden || modal.open || document.hidden || $('stage').classList.contains('ui-hidden') || document.querySelector('.end-screen') || needsChoice() || choiceArea.querySelector('details[open]')) return;
  if (store.settings.skip) autoTimer = setTimeout(advance, 240);
  else if (store.settings.auto) {
    const textTime = Math.min(16000, Array.from(fullText).length * 42);
    const delay = Math.max(store.settings.autoWait + textTime, currentPerception ? communicationReadDelay(fullText, currentPerception.source.revealMs) : 0);
    autoTimer = setTimeout(advance, delay);
  }
}
function toggleReading(mode) {
  if (gameScreen.hidden || modal.open || document.querySelector('.end-screen')) return;
  if ($('stage').classList.contains('ui-hidden')) { setUiHidden(false); return; }
  const enabling = !store.settings[mode]; pauseReading();
  if (enabling && needsChoice()) { toast('선택 장면에서는 직접 읽어 주세요.'); return; }
  store.settings[mode] = enabling; syncReadingTools(); saveStore();
  if (mode === 'skip' && enabling && typing) { storyText.textContent = fullText; finishTyping(); }
  else scheduleReading();
  $('storyBox').focus({ preventScroll: true });
}
function syncSoundButton() {
  const button = $('soundToggle'); if (!button) return;
  button.setAttribute('aria-pressed', String(store.settings.sound));
  button.setAttribute('aria-label', store.settings.sound ? '공간음 끄기' : '공간음 켜기');
  button.title = store.settings.sound ? '공간음 끄기' : '공간음 켜기';
}
function toast(message) {
  document.querySelector('.toast')?.remove();
  const node = document.createElement('div'); node.className = 'toast'; node.textContent = message;
  node.setAttribute('role', 'status'); document.body.append(node); setTimeout(() => node.remove(), 3200);
}
function feedback() { /* Navigation stays quiet; authored cues carry sound. */ }

function formatChartValue(value, unit = '') {
  let text = String(value);
  if (typeof value === 'number' && /^-?\d+(?:\.\d+)?$/.test(text)) {
    const [integer, fraction] = text.split('.');
    text = `${Number(integer).toLocaleString('ko-KR')}${fraction ? `.${fraction}` : ''}`;
  }
  return `${text}${typeof value === 'number' ? unit : ''}`;
}

function renderChart(chart, compact = false) {
  const figure = document.createElement('figure'); figure.className = `data-chart ${chart.type}`; figure.setAttribute('role', 'group');
  const summary = chart.items.map((item) => `${item.label}: ${formatChartValue(item.value, chart.unit)}`).join('; ');
  const chartNames = { bars: '막대 비교', flow: '흐름 순서', grid: '수량 도트 그리드', timeline: '시간 순서', schedule: '시간 배정', network: '연결 구조 · 실제 지도 아님' };
  figure.setAttribute('aria-label', `${chartNames[chart.type] || '장면 자료'}: ${summary}`);
  const items = document.createElement('div'); items.className = 'chart-items';
  if (chart.type === 'grid') {
    const total = chart.items.reduce((sum, item) => sum + (typeof item.value === 'number' ? Math.max(0, Math.floor(item.value)) : 0), 0);
    const cap = Math.min(400, total);
    const counts = chart.items.map((item) => total <= 400 ? Math.max(0, Math.floor(Number(item.value) || 0)) : Math.floor(Math.max(0, Number(item.value) || 0) / total * cap));
    let remainder = cap - counts.reduce((sum, count) => sum + count, 0);
    for (let i = 0; remainder > 0 && counts.length; i = (i + 1) % counts.length) { if (Number(chart.items[i].value) > 0) { counts[i]++; remainder--; } }
    const dots = document.createElement('div'); dots.className = 'chart-grid-dots'; dots.setAttribute('aria-hidden', 'true');
    chart.items.forEach((item, index) => { for (let n = 0; n < counts[index]; n++) { const dot = document.createElement('i'); dot.className = `grid-dot tone-${index % 6}`; dots.append(dot); } });
    items.append(dots);
    const legend = document.createElement('div'); legend.className = 'chart-grid-legend';
    chart.items.forEach((item, index) => { const row = document.createElement('div'); row.className = 'chart-grid-key'; const swatch = document.createElement('i'); swatch.className = `grid-swatch tone-${index % 6}`; const label = document.createElement('span'); label.textContent = item.label; const value = document.createElement('strong'); value.textContent = formatChartValue(item.value, chart.unit); row.append(swatch, label, value); legend.append(row); });
    items.append(legend);
  } else if (chart.type === 'schedule') {
    chart.items.slice(0, 4).forEach((item) => { const block = document.createElement('div'); block.className = 'chart-schedule-block'; const label = document.createElement('span'); label.textContent = item.label; const value = document.createElement('strong'); value.textContent = item.value === '' ? '배정 없음' : formatChartValue(item.value, chart.unit); block.append(label, value); items.append(block); });
  } else if (chart.type === 'timeline' || chart.type === 'network') {
    if (chart.type === 'network') { const note = document.createElement('span'); note.className = 'chart-network-note'; note.textContent = '연결 구조 · 실제 지도 아님'; items.append(note); }
    chart.items.forEach((item, index) => { if (chart.type === 'network' && index) { const link = document.createElement('span'); link.className = 'chart-network-link'; link.setAttribute('aria-hidden', 'true'); items.append(link); } const node = document.createElement('div'); node.className = chart.type === 'timeline' ? 'chart-timeline-node' : 'chart-network-node'; const label = document.createElement('span'); label.className = 'chart-label'; label.textContent = item.label; const value = document.createElement('strong'); value.textContent = formatChartValue(item.value, chart.unit); node.append(label, value); items.append(node); });
  } else {
  const visibleItems = compact && window.matchMedia('(max-width:640px)').matches && chart.type === 'bars' ? chart.items.slice(0, 3) : chart.items;
  visibleItems.forEach((item, index) => {
    const shownValue = formatChartValue(item.value, chart.unit);
    if (chart.type === 'flow') {
      if (index) { const arrow = document.createElement('span'); arrow.className = 'chart-arrow'; arrow.setAttribute('aria-hidden', 'true'); arrow.textContent = '→'; items.append(arrow); }
      const node = document.createElement('div'); node.className = 'chart-flow-node';
      const label = document.createElement('span'); label.className = 'chart-label'; label.textContent = item.label;
      const value = document.createElement('strong'); value.textContent = shownValue; node.append(label, value); items.append(node);
      return;
    }
    const row = document.createElement('div'); row.className = 'chart-bar-row';
    const head = document.createElement('span'); head.className = 'chart-bar-head'; const label = document.createElement('span'); label.className = 'chart-label'; label.textContent = item.label;
    const value = document.createElement('strong'); value.textContent = shownValue; head.append(label, value); row.append(head);
    const track = document.createElement('span'); track.className = 'chart-track'; track.setAttribute('aria-hidden', 'true');
    const bar = document.createElement('span'); bar.className = 'chart-bar';
    if (chart.max && typeof item.value === 'number') bar.style.width = `${Math.max(0, Math.min(100, item.value / chart.max * 100))}%`;
    track.append(bar); row.append(track); items.append(row);
  });
  }
  figure.append(items); return figure;
}

function renderDirection(beat, { quiet = false } = {}) {
  const direction = beat.direction;
  stageImage.dataset.mood = direction?.mood ?? 'quiet';
  stageImage.dataset.episodeNight=String(currentEpisodeCue?.timeOfDay==='night');
  stageImage.dataset.camera = direction?.camera ?? 'wide';
  stageImage.dataset.effect = direction?.effect ?? '';
  stageImage.classList.toggle('reduced-motion', store.settings.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const place = currentEpisodeCue?.place || direction?.place || '';
  if (place && place !== previousPlace) {
    placeRibbon.textContent = place; placeRibbon.hidden = false; placeRibbon.classList.remove('arrive');
    requestAnimationFrame(() => placeRibbon.classList.add('arrive'));
  } else if (!place) placeRibbon.hidden = true;
  previousPlace = place;
  const cast = currentEpisodeCue ? [] : direction?.cast ?? [];
  castRail.replaceChildren();
  cast.forEach((person) => {
    const chip = document.createElement('span'); chip.className = `cast-chip ${person.side}${person.remote ? ' remote' : ''}${person.id === direction?.focus ? ' focused' : ''}`;
    chip.textContent = person.remote ? `${person.name} · 원격` : person.name;
    chip.setAttribute('aria-label', person.remote ? `${person.name}, 원격으로 연결됨` : person.name);
    castRail.append(chip);
  });
  castRail.hidden = !cast.length;
  const portraits = currentEpisodeCue ? [] : directedCast(direction, story.assets, beat.portrait);
  const setPortrait = (wrap, image, person) => {
    if (!person) { wrap.classList.remove('visible'); return; }
    if (image.getAttribute('src') !== story.assets[person.id]) image.src = story.assets[person.id];
    image.alt = person.name || '';
    wrap.dataset.side = person.side; wrap.classList.add('visible');
  };
  setPortrait(portraitWrap, portraitImage, portraits[0]);
  setPortrait(secondaryPortraitWrap, secondaryPortraitImage, portraits[1]);
  const visual = currentEpisodeCue ? null : direction?.visual;
  const cgFrame=Boolean(visual&&['object','dream'].includes(visual.type)&&story.assets?.[visual.image]);
  $('stage').classList.toggle('cg-active',cgFrame);
  motifStage.classList.toggle('cg-frame',cgFrame);
  const visualKey = visual ? JSON.stringify(visual) : '';
  if (visualKey !== currentVisualKey) {
    currentVisualKey = visualKey;
    directionCard.replaceChildren(); directionCard.hidden = !visual;
    motifStage.replaceChildren(); motifStage.hidden = !(visual && ['object', 'dream'].includes(visual.type) && (visual.motif || story.assets?.[visual.image]));
    if (!motifStage.hidden) {
      motifStage.dataset.motif = visual.motif ?? '';
      const cgUrl = story.assets?.[visual.image];
      if (cgUrl) { const cg = document.createElement('img'); cg.className = 'motif-cg'; cg.src = cgUrl; cg.alt = ''; motifStage.append(cg); }
      else motifStage.append(createMotifSVG(visual.motif, true));
    }
    if (visual) {
      directionCard.className = `direction-card ${visual.type}${cgFrame?' has-cg':''}`;
      directionCard.setAttribute('aria-label', `${visual.title || visual.kicker || '장면 정보'} 자세히 보기`);
      const eyebrow = document.createElement('span'); eyebrow.className = 'visual-kicker'; eyebrow.textContent = visual.kicker || visual.type;
      const title = document.createElement('strong'); title.className = 'visual-title'; title.textContent = visual.title || '';
      directionCard.append(eyebrow, title);
      const cgUrl = story.assets?.[visual.image];
      if (cgUrl) { const cg = document.createElement('img'); cg.className = 'visual-cg'; cg.src = cgUrl; cg.alt = ''; directionCard.append(cg); }
      else if (visual.motif) directionCard.append(createMotifSVG(visual.motif));
      if (visual.body) { const body = document.createElement('span'); body.className = 'visual-body'; body.textContent = visual.body; directionCard.append(body); }
      if (visual.chart) directionCard.append(renderChart(visual.chart, true));
      else if (visual.rows.length) {
        const rows = document.createElement('span'); rows.className = 'visual-rows';
        visual.rows.slice(0, 4).forEach((item) => { const row = document.createElement('span'); row.className = 'visual-row'; const label = document.createElement('span'); label.textContent = item.label; const value = document.createElement('b'); value.textContent = item.value; row.append(label, value); rows.append(row); });
        directionCard.append(rows);
      }
      if (visual.footer) { const foot = document.createElement('span'); foot.className = 'visual-footer'; foot.textContent = visual.footer; directionCard.append(foot); }
      directionCard.onclick = (event) => { event.stopPropagation(); openVisual(visual); };
      directionCard.onkeydown = (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); openVisual(visual); } };
    } else { directionCard.onclick = null; directionCard.onkeydown = null; }
  }
  if (direction?.effect) { stageImage.classList.remove('effect-active'); void stageImage.offsetWidth; stageImage.classList.add('effect-active'); }
  const effectKey = `${progress.chapterId}:${progress.beatIndex}:${direction?.effect ?? ''}`;
  const playEffect = !quiet && direction?.effect && effectKey !== lastEffectKey && !(currentPerception && ['notification','pulse'].includes(direction.effect));
  lastEffectKey = effectKey;
  if (currentEpisodeCue) {
    audio.stop(); stageImage.dataset.effect = ''; stageImage.classList.remove('effect-active'); $('stage').classList.remove('cg-active');
    episodeStage.render(currentEpisodeCue, { instant: quiet, reducedMotion: store.settings.reducedMotion });
    if (!gameScreen.hidden && !modal.open) episodeAudio.render(currentEpisodeCue, { quiet });
    else episodeAudio.stop();
  } else {
    episodeStage.clear(); episodeAudio.stop();
    if (direction?.music && !gameScreen.hidden && !modal.open) audio.resume(direction.music);
    else audio.stop();
    if (playEffect) audio.effect(direction.effect);
  }
  syncSoundButton();
}

function openVisual(visual) {
  const root = document.createElement('div'); root.append(modalHeading(visual.title || '장면 기록', visual.kicker || '이 장면에 나타난 정보'));
  const cgUrl = story.assets?.[visual.image];
  if (cgUrl) { const cg = document.createElement('img'); cg.className = 'inspection-cg'; cg.src = cgUrl; cg.alt = ''; root.append(cg); }
  else if (visual.motif) root.append(createMotifSVG(visual.motif, true));
  if (visual.body) { const body = document.createElement('p'); body.className = 'visual-inspection-body'; body.textContent = visual.body; root.append(body); }
  if (visual.chart) root.append(renderChart(visual.chart));
  else if (visual.rows?.length) {
    const table = document.createElement('dl'); table.className = 'visual-inspection-rows';
    visual.rows.forEach((item) => { const label = document.createElement('dt'), value = document.createElement('dd'); label.textContent = item.label; value.textContent = item.value; table.append(label, value); }); root.append(table);
  }
  if (visual.footer) { const footer = document.createElement('p'); footer.className = 'visual-footer'; footer.textContent = visual.footer; root.append(footer); }
  showModal(root, 'visual');
}

function play(chapterId = story.chapters[0]?.id, beatIndex = 0, reset = false, savedProgress = null) {
  if (!story.chapters.length) { openLibrary(); return; }
  clearTimers(); pauseReading(); document.querySelector('.end-screen')?.remove();
  if (store.autosave && (reset || chapterId !== store.autosave.progress.chapterId || beatIndex !== store.autosave.progress.beatIndex)) {
    store.metadata.returnPoint = structuredClone(store.autosave);
  }
  if (reset) { backlog = []; episodeAudio.reset(); }
  progress = reset ? clampProgress({ ...freshProgress(story, chapterId), beatIndex }, story) : clampProgress(savedProgress ?? { chapterId, beatIndex }, story);
  if (!reset) {
    backlog = []; const visited = new Set(store.seen), chapterIndex = story.chapters.findIndex((item) => item.id === progress.chapterId);
    for (let c = chapterIndex; c >= 0 && backlog.length < MAX_BACKLOG; c--) {
      const chapter = story.chapters[c], end = c === chapterIndex ? progress.beatIndex - 1 : chapter.beats.length - 1;
      for (let i = end; i >= 0 && backlog.length < MAX_BACKLOG; i--) {
        if (!visited.has(`${chapter.id}:${i}`)) continue;
        const beat = chapter.beats[i]; backlog.push({ key: `${chapter.id}:${i}`, chapterId: chapter.id, beatIndex: i, label: chapter.label, speaker: beat.speaker, text: beat.text });
      }
    }
    backlog.reverse();
  }
  setUiHidden(false);
  store.autosave = makeSave(progress, chapterAt(), beatAt()); saveStore();
  titleScreen.hidden = true; gameScreen.hidden = false; pendingChapter = null;
  lastCommunicationGroup = '';
  renderBeat({ revisit: !reset });
  if (currentEpisodeCue && store.settings.sound) episodeAudio.unlock().then(ok=>{if(ok&&currentEpisodeCue&&!gameScreen.hidden&&!modal.open)episodeAudio.render(currentEpisodeCue,{quiet:true});});
}

function recordBacklog(chapter, beat, index) {
  const key = `${chapter.id}:${index}`;
  if (!beat || (backlog.length && backlog.at(-1).key === key)) return;
  backlog.push({ key, chapterId: chapter.id, beatIndex: index, label: chapter.label, speaker: beat.speaker, text: beat.text });
  if (backlog.length > MAX_BACKLOG) backlog = backlog.slice(-MAX_BACKLOG);
}

function recordBacklogPage(chapter, entries) {
  const tail = backlog.slice(-entries.length);
  // Closing a modal redraws the same reading page. Treat its entire suffix as
  // one visit, just as recordBacklog does for a single original beat.
  if (tail.length === entries.length && tail.every((entry, index) => entry.key === `${chapter.id}:${entries[index].index}`)) return;
  for (const entry of entries) recordBacklog(chapter, entry, entry.index);
}

function renderBeat({ revisit = false } = {}) {
  clearTimers();
  if (revisit) pauseReading();
  $('readingAnnouncement').textContent = ''; $('storyBox').scrollTop = 0; storyText.scrollTop = 0;
  const chapter = chapterAt(), beat = beatAt();
  if (!chapter || !beat) { renderChapterEnd(); return; }
  $('stage').dataset.chapterId = chapter.id;
  currentReadingPage = episodeOneReadingPage(chapter, progress.beatIndex) || episodeTwoReadingPage(chapter, progress.beatIndex);
  currentEpisodeCue = episodeOneDirection(chapter, progress.beatIndex) || episodeTwoDirection(chapter, progress.beatIndex);
  if (currentEpisodeCue && currentReadingPage?.entries.length > 1) currentEpisodeCue.focus = currentReadingPage.focus;
  $('storyBox').classList.toggle('reading-page', Boolean(currentReadingPage?.entries.length > 1));
  $('chapterLabel').textContent = chapter.label;
  $('chapterTitle').textContent = chapter.title;
  const total = chapter.beats.length;
  const pageEnd = currentReadingPage?.end ?? progress.beatIndex;
  $('progressText').textContent = `${progress.beatIndex === pageEnd ? progress.beatIndex + 1 : `${progress.beatIndex + 1}–${pageEnd + 1}`} / ${total}`;
  $('progressBar').style.width = `${total ? ((pageEnd + 1) / total) * 100 : 0}%`;
  stageImage.className = 'stage-image';
  const scene = currentEpisodeCue?.background || beat.scene || 'room';
  // The advertising dream begins at the beach and ends when Seoin leaves it.
  // Resolve by manuscript text rather than hard-coded beat numbers so saves stay stable.
  const dreamStart = chapter.id === '2' ? chapter.beats.findIndex(item => item.text?.includes('바다가 펼쳐졌다')) : -1;
  const dreamEnd = dreamStart >= 0 ? chapter.beats.findIndex((item, index) => index > dreamStart && item.text?.includes('서인은 버튼을 눌렀다')) : -1;
  const inJiwooDream = dreamStart >= 0 && progress.beatIndex >= dreamStart && (dreamEnd < 0 || progress.beatIndex <= dreamEnd);
  $('stage').classList.toggle('ep2-jiwoo-dream', inJiwooDream);
  const background = inJiwooDream ? './assets/ep2/jiwoo-dream-beach.avif' : (currentEpisodeCue?.backgroundAsset ? EP1_ASSETS[currentEpisodeCue.backgroundAsset] : story.assets?.[scene]);
  if (background) {
    stageImage.classList.remove('no-background');
    if (background !== sceneBackground) {
      const next = 1 - sceneFront; sceneLayers[next].style.backgroundImage = `url("${background}")`;
      sceneLayers[next].classList.add('active'); sceneLayers[sceneFront].classList.remove('active'); sceneFront = next; sceneBackground = background;
    }
  } else { stageImage.classList.add('no-background', `fallback-${sceneClass(scene)}`); }
  currentPerception = preparePerception(chapter, progress.beatIndex, presentationForBeat, (index) => isSeen(store.seen, chapter.id, index));
  const primary = Boolean(currentPerception?.primary);
  $('stage').dataset.communication = currentPerception?.source.kind || '';
  $('stage').dataset.signalPriority = currentPerception?.source.priority || '';
  $('stage').dataset.sensory = sensoryContextForBeat(chapter, progress.beatIndex, presentationForBeat) ? 'active' : '';
  $('storyBox').classList.toggle('primary-perception', primary);
  $('storyBox').setAttribute('role', primary ? 'button' : 'group');
  $('storyBox').setAttribute('aria-label', primary ? '연결 내용 다음으로 진행' : '대화 영역. 다음 문장으로 진행');
  storyText.hidden = primary;
  $('perceptionAdvance').hidden = !primary;
  renderDirection(beat, { quiet: revisit });
  // Authored graphics return immediately when perception stops; do not leave a
  // stale hidden card merely because its visual id has not changed.
  directionCard.hidden = Boolean(currentEpisodeCue) || Boolean(currentPerception) || !beat.direction?.visual;
  speakerNode.textContent = currentReadingPage?.speaker ?? episodeTwoSpeaker(chapter,progress.beatIndex) ?? beat.speaker ?? '';
  speakerNode.hidden = primary || !speakerNode.textContent;
  storyText.className = `story-text${beat.kind === 'system' ? ' system' : ''}${beat.direction?.emphasis ? ' authored-emphasis' : ''}`;
  choiceArea.replaceChildren();
  const chosenIndex = progress.choices?.[`${chapter.id}:${progress.beatIndex}`];
  if (beat.choice) renderChoices(beat, chapter, chosenIndex);
  fullText = currentReadingPage?.text ?? beat.text;
  choiceArea.hidden = Boolean(beat.choice && fullText);
  typing = Boolean(fullText);
  storyText.textContent = '';
  $('advanceIndicator').classList.toggle('hidden', typing || Boolean(needsChoice() && chosenIndex === undefined));
  const pageEntries = currentReadingPage?.entries ?? [{ ...beat, index: progress.beatIndex }];
  const seenBefore = pageEntries.every(entry => isSeen(store.seen, chapter.id, entry.index));
  if (needsChoice()) pauseReading();
  else if (store.settings.skip && !seenBefore) { pauseReading(); toast('읽지 않은 곳에 도착해 멈췄습니다.'); }
  if (!currentReadingPage) {
    recordBacklog(chapter, beat, progress.beatIndex);
    store.seen = addSeen(store.seen, chapter.id, progress.beatIndex); saveStore();
  }
  const skipping = store.settings.skip && seenBefore;
  const instant = store.settings.instant || skipping || revisit || Boolean(currentPerception && currentPerception.source.kind !== 'neural');
  if (currentPerception) {
    const continuing = lastCommunicationGroup === currentPerception.groupId;
    neuralStage.render(currentPerception.presentation, {
      primary, instant: Boolean(instant && (revisit || skipping || continuing || store.settings.instant)),
      reducedMotion: store.settings.reducedMotion,
    });
    audio.setCommunicationFocus(currentPerception.source.priority === 'interrupt' ? 'interrupt' : currentPerception.source.kind);
    if (!continuing && !currentEpisodeCue) audio.cue(currentPerception.source.kind, { priority: currentPerception.source.priority, instant: revisit || skipping });
    lastCommunicationGroup = currentPerception.groupId;
  } else {
    neuralStage.clear(); audio.setCommunicationFocus(null); lastCommunicationGroup = '';
  }
  if (currentEpisodeCue?.blackout) neuralStage.clear();
  if (instant || !fullText) { storyText.textContent = fullText; typing = false; finishTyping(); }
  else {
    const prefersReducedMotion = store.settings.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pause = prefersReducedMotion ? 0 : Math.min(1000, beat.direction?.pauseMs || 0);
    if (pause) typeTimer = setTimeout(() => typeNext(0), pause);
    else typeNext(0);
  }
  syncReadingTools();
}

function typeNext(index) {
  if (index >= fullText.length) { typing = false; finishTyping(); return; }
  storyText.textContent = fullText.slice(0, index + 1);
  const delay = Math.max(12, 1000 / store.settings.textSpeed);
  typeTimer = setTimeout(() => typeNext(index + 1), delay);
}

function finishTyping() {
  typing = false; clearTimeout(typeTimer);
  $('readingAnnouncement').textContent = $('stage').classList.contains('ui-hidden') ? '' : fullText;
  const beat = beatAt(), chapter = chapterAt();
  if (currentReadingPage) recordBacklogPage(chapter, currentReadingPage.entries);
  for (const entry of currentReadingPage?.entries ?? []) {
    store.seen = addSeen(store.seen, chapter.id, entry.index);
  }
  if (currentReadingPage) saveStore();
  choiceArea.hidden = false;
  const selected = beat?.choice && progress.choices?.[`${chapter.id}:${progress.beatIndex}`] !== undefined;
  $('advanceIndicator').classList.toggle('hidden', Boolean(needsChoice() && !selected));
  scheduleReading();
}

function renderChoices(beat, chapter, chosenIndex) {
  let container = choiceArea;
  if (isEpisodeOneObservation(chapter, progress.beatIndex)) {
    const details = document.createElement('details'); details.className = 'optional-observation';
    const summary = document.createElement('summary'); summary.textContent = '정산·수면 조건 다시 보기';
    details.append(summary); choiceArea.append(details); container = details;
    details.addEventListener('click', event => event.stopPropagation());
    details.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') event.stopPropagation(); });
    details.addEventListener('toggle', () => { if (details.open) pauseReading(); else scheduleReading(); });
  }
  const prompt = document.createElement('p'); prompt.className = 'choice-note'; prompt.textContent = beat.choice.prompt;
  container.append(prompt);
  beat.choice.options.forEach((option, index) => {
    const button = document.createElement('button'); button.className = 'choice-button';
    button.textContent = option.label; button.type = 'button'; button.classList.toggle('selected', chosenIndex === index);
    button.setAttribute('aria-pressed', chosenIndex === index ? 'true' : 'false');
    button.addEventListener('click', (event) => {
      event.stopPropagation(); clearTimeout(autoTimer); feedback();
      progress = selectChoice(progress, chapter.id, progress.beatIndex, index);
      if (option.note) {
        container.querySelector('.choice-feedback')?.remove();
        const note = document.createElement('p'); note.className = 'choice-note choice-feedback'; note.textContent = option.note; container.append(note);
      }
      choiceArea.querySelectorAll('.choice-button').forEach((item, i) => {
        item.classList.toggle('selected', i === index); item.setAttribute('aria-pressed', i === index ? 'true' : 'false');
      });
      finishTyping();
      if (!transientBacklog) { store.autosave = makeSave(progress, chapter, beat); saveStore(); }
    });
    container.append(button);
  });
  if (chosenIndex !== undefined) {
    const noteText = beat.choice.options[chosenIndex]?.note;
    if (noteText) { const note = document.createElement('p'); note.className = 'choice-note choice-feedback'; note.textContent = noteText; container.append(note); }
  }
}

function advance() {
  if ($('stage').classList.contains('ui-hidden')) { setUiHidden(false); return; }
  if (gameScreen.hidden || modal.open || document.hidden || document.querySelector('.end-screen')) return;
  clearTimeout(autoTimer);
  if (typing) { storyText.textContent = fullText; finishTyping(); return; }
  const currentBeat = beatAt(), currentChapter = chapterAt();
  if (needsChoice() && progress.choices?.[`${currentChapter.id}:${progress.beatIndex}`] === undefined) { toast('먼저 답을 골라 주세요.'); return; }
  feedback();
  const next = nextProgress({ ...progress, beatIndex: currentReadingPage?.end ?? progress.beatIndex }, story);
  if (next.finished) { progress = { ...progress, finished: true }; if (!transientBacklog) saveCurrent(); renderChapterEnd(true); return; }
  if (next.chapterId !== progress.chapterId) {
    pendingChapter = next.chapterId;
    if (!transientBacklog) saveCurrent();
    renderChapterEnd(false); return;
  }
  progress = next;
  if (!transientBacklog) saveCurrent();
  renderBeat();
}

function saveCurrent() {
  store.autosave = makeSave(progress, chapterAt(), beatAt()); saveStore();
}

function goPrevious() {
  if (gameScreen.hidden || modal.open || document.querySelector('.end-screen')) return;
  if ($('stage').classList.contains('ui-hidden')) { setUiHidden(false); return; }
  pauseReading();
  const pageIndex = episodeOnePreviousPage(chapterAt(), progress.beatIndex) ?? episodeTwoPreviousPage(chapterAt(), progress.beatIndex);
  const previous = pageIndex === null ? previousProgress(progress, story) : { ...progress, beatIndex: pageIndex, finished: false };
  if (previous.chapterId !== progress.chapterId || previous.beatIndex !== progress.beatIndex) {
    progress = previous; if (!transientBacklog) saveCurrent(); renderBeat({ revisit: true });
  }
}

function renderChapterEnd(final = false) {
  clearTimers(); pauseReading();
  episodeAudio.stop();
  neuralStage.clear(); audio.setCommunicationFocus(null); lastCommunicationGroup = '';
  document.querySelector('.end-screen')?.remove();
  const ending = document.createElement('div'); ending.className = 'end-screen';
  const card = document.createElement('section'); card.className = 'end-card';
  const eyebrow = document.createElement('p'); eyebrow.className = 'eyebrow'; eyebrow.textContent = final ? 'END OF STORY' : 'CHAPTER COMPLETE';
  const title = document.createElement('h2'); title.textContent = progress.chapterId === '1' ? '자신과 단둘이' : final ? '마지막 페이지' : '잠시 숨을 고르고';
  const message = document.createElement('p'); message.textContent = final ? '이야기의 끝에 도착했습니다. 함께 읽어 주셔서 고맙습니다.' : '이 장의 이야기를 마쳤습니다.';
  const actions = document.createElement('div'); actions.className = 'end-actions';
  const nextButton = document.createElement('button'); nextButton.textContent = final ? '목차로' : '다음 장';
  nextButton.addEventListener('click', () => {
    ending.remove();
    if (final) { titleScreen.hidden = false; gameScreen.hidden = true; return; }
    progress = { ...progress, chapterId: pendingChapter, beatIndex: 0, finished: false }; pendingChapter = null; saveCurrent(); renderBeat();
  });
  const menuButton = document.createElement('button'); menuButton.textContent = '목차';
  menuButton.addEventListener('click', () => { ending.remove(); titleScreen.hidden = false; gameScreen.hidden = true; openChapters(); });
  actions.append(nextButton, menuButton); card.append(eyebrow, title, message, actions); ending.append(card); $('stage').append(ending);
}

function showModal(content, mode) {
  if (!modal.open) restoreFocus = document.activeElement;
  clearTimers(); pauseReading(); audio.stop(); episodeAudio.stop(); neuralStage.clear(); modalMode = mode; modalContent.replaceChildren(content); if (!modal.open) modal.showModal();
  $('modalClose').focus();
}
function modalHeading(title, lead) {
  const box = document.createElement('div'), h = document.createElement('h2'), p = document.createElement('p');
  h.textContent = title; p.className = 'modal-lead'; p.textContent = lead; box.append(h, p); return box;
}
function actionButton(label, action) {
  const button = document.createElement('button'); button.type = 'button'; button.className = 'small-button'; button.textContent = label; button.addEventListener('click', action); return button;
}
function confirmAction(title, description, action, cancel = openSaves) {
  const root = document.createElement('div'); root.className = 'confirm-panel'; root.append(modalHeading(title, description));
  const actions = document.createElement('div'); actions.className = 'slot-buttons';
  actions.append(actionButton('취소', cancel), actionButton('확인하고 적용', action)); root.append(actions); showModal(root, 'confirm');
}
function returnPoint() {
  const save = store.metadata?.returnPoint, p = save?.progress, chapter = p && chapterAt(p.chapterId);
  return chapter && Number.isInteger(p.beatIndex) && p.beatIndex >= 0 && p.beatIndex < chapter.beats.length ? save : null;
}
function openSaves() {
  const root = document.createElement('div'); root.append(modalHeading('저장과 백업', '자동 저장과 수동 기록 세 칸을 보관합니다. 파일로 백업하면 다른 브라우저나 기기에서도 이어 읽을 수 있습니다.'));
  if (!storageHealthy) { const warning = document.createElement('p'); warning.className = 'storage-warning'; warning.setAttribute('role', 'alert'); warning.textContent = '브라우저 저장을 사용할 수 없습니다. 게임을 닫기 전에 읽기 기록을 파일로 백업해 주세요.'; root.append(warning); }
  const transfer = document.createElement('div'); transfer.className = 'save-transfer-actions';
  const backup = actionButton('기록 파일로 백업', () => {
    try {
      const url = URL.createObjectURL(new Blob([exportSaveData(store, story)], { type: 'application/json' }));
      const now = new Date(), stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const link = document.createElement('a'); link.href = url; link.download = `lost-dreams-save-${stamp}.json`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) { toast(error.message); }
  });
  backup.disabled = !store.autosave && !store.slots.some(Boolean);
  const fileInput = document.createElement('input'); fileInput.type = 'file'; fileInput.accept = '.json,application/json'; fileInput.hidden = true; fileInput.setAttribute('aria-label', '가져올 읽기 기록 파일');
  const importStatus = document.createElement('p'); importStatus.className = 'modal-lead'; importStatus.setAttribute('role', 'status');
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0]; if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('읽기 기록 파일은 2MB 이하만 가져올 수 있습니다.');
      const imported = importSaveData(await file.text(), story), save = imported.autosave || imported.slots.find(Boolean);
      confirmAction('읽기 기록을 가져올까요?', `${chapterAt(save.progress.chapterId)?.label} · ${save.progress.beatIndex + 1}번째 문장부터 읽습니다. 현재의 저장 칸과 설정을 가져온 파일로 바꿉니다.`, () => {
        const prior = store.autosave; store = imported; if (prior) store.metadata.returnPoint = prior;
        pauseReading(); saveStore(); document.documentElement.style.setProperty('--font-size', `${store.settings.fontSize}px`); syncSoundButton();
        closeModal(); play(save.progress.chapterId, save.progress.beatIndex, false, save.progress); toast(storageHealthy ? '읽기 기록을 가져왔습니다.' : '기록을 적용했지만 브라우저에 저장하지 못했습니다. 파일 백업을 보관해 주세요.');
      });
    } catch (error) { importStatus.textContent = error.message; fileInput.value = ''; }
  });
  transfer.append(backup, actionButton('파일에서 가져오기', () => fileInput.click()), fileInput); root.append(transfer, importStatus);
  const list = document.createElement('div'); list.className = 'slot-list';
  const entries = [{ label: '자동 저장', save: store.autosave, index: -1 }, ...(returnPoint() ? [{ label: '이동 전 읽던 곳', save: returnPoint(), index: -2 }] : []), ...store.slots.map((save, index) => ({ label: `기록 ${index + 1}`, save, index }))];
  entries.forEach((entry) => {
    const card = document.createElement('div'); card.className = 'slot-card';
    const copy = document.createElement('div'); copy.className = 'slot-copy';
    const strong = document.createElement('strong'); strong.textContent = entry.label;
    const info = document.createElement('span');
    const chapter = entry.save ? story.chapters.find((item) => item.id === entry.save.progress.chapterId) : null;
    info.textContent = entry.save ? `${chapter?.label ?? '기록'} · ${new Date(entry.save.timestamp).toLocaleString('ko-KR')} · ${entry.save.preview || '이야기 기록'}` : '비어 있음';
    copy.append(strong, info); card.append(copy);
    const buttons = document.createElement('div'); buttons.className = 'slot-buttons';
    if (entry.save) {
      const load = document.createElement('button'); load.className = 'small-button'; load.textContent = '읽기';
      load.addEventListener('click', () => { const p = clampProgress(entry.save.progress, story); closeModal(); play(p.chapterId, p.beatIndex, false, entry.save.progress); });
      buttons.append(load);
    }
    if (entry.index >= 0) {
      const saveButton = document.createElement('button'); saveButton.className = 'small-button'; saveButton.textContent = '저장';
      saveButton.addEventListener('click', () => {
        if (gameScreen.hidden) { toast('이야기를 시작한 뒤 저장할 수 있어요.'); return; }
        const commit = () => {
          store.slots[entry.index] = makeSave(progress, chapterAt(), beatAt()); const saved = saveStore();
          openSaves(); toast(saved ? `기록 ${entry.index + 1}에 저장했습니다.` : '현재 세션에만 보관했습니다. 파일 백업으로 기록을 보관해 주세요.');
        };
        if (entry.save) confirmAction(`기록 ${entry.index + 1}을 바꿀까요?`, '이 칸의 이전 기록을 현재 읽는 위치로 바꿉니다. 취소하면 이전 기록을 유지합니다.', commit);
        else commit();
      });
      buttons.append(saveButton);
    }
    card.append(buttons); list.append(card);
  });
  root.append(list); showModal(root, 'saves');
}

function openChapters() {
  const root = document.createElement('div'); root.append(modalHeading('장 선택', '읽고 싶은 곳에서 이야기를 시작할 수 있습니다.'));
  const search = document.createElement('input'); search.type = 'search'; search.className = 'chapter-search'; search.placeholder = '화수 또는 제목으로 찾기'; search.setAttribute('aria-label', '화수 또는 제목으로 찾기');
  const count = document.createElement('p'); count.className = 'modal-lead'; count.setAttribute('role', 'status');
  root.append(search, count);
  const list = document.createElement('div'); list.className = 'chapter-list';
  story.chapters.forEach((chapter, index) => {
    const card = document.createElement('div'); card.className = 'chapter-card';
    card.dataset.search = `${chapter.label} ${chapter.title} ${chapter.id}`.toLocaleLowerCase();
    const copy = document.createElement('div'); copy.className = 'chapter-copy';
    const title = document.createElement('strong'); title.textContent = chapter.title;
    if (store.autosave?.progress.chapterId === chapter.id) { const current = document.createElement('span'); current.className = 'chapter-current'; current.textContent = '읽던 장'; title.append(current); }
    if (chapter.continuity === 'held') { const tag = document.createElement('span'); tag.className = 'held-tag'; tag.textContent = '임시 연결부'; title.append(tag); }
    const sub = document.createElement('span'); sub.textContent = `${chapter.kind === 'bumper' ? '막간' : '이야기'}${chapter.beats.length ? ` · ${chapter.beats.length} 문장 묶음` : ''}`;
    copy.append(title, sub);
    const actions = document.createElement('div'); actions.className = 'chapter-actions';
    const button = document.createElement('button'); button.className = 'small-button'; button.textContent = '읽기'; button.type = 'button';
    button.addEventListener('click', () => { closeModal(); play(chapter.id, 0, true); });
    const momentsButton = document.createElement('button'); momentsButton.className = 'small-button scene-index-button'; momentsButton.textContent = '연출 장면'; momentsButton.type = 'button';
    momentsButton.disabled = chapterMoments(chapter).length === 0; momentsButton.setAttribute('aria-label', `${chapter.label} 연출 장면 찾아보기`);
    momentsButton.addEventListener('click', () => openChapterScenes(chapter));
    actions.append(button, momentsButton); card.append(copy, actions); list.append(card);
  });
  const filter = () => {
    const query = search.value.trim().toLocaleLowerCase().replace(/^제?\s*(\d+)\s*화?$/, '$1'); let visible = 0;
    for (const card of list.children) {
      const matches = /^\d+$/.test(query) ? new RegExp(`(?:^|\\D)0*${query}(?:\\D|$)`).test(card.dataset.search) : card.dataset.search.includes(query);
      card.hidden = !matches; if (matches) visible++;
    }
    count.textContent = visible ? `${visible}개 장` : '일치하는 장이 없습니다.';
  };
  search.addEventListener('input', filter); filter(); root.append(list); showModal(root, 'chapters');
}

function chapterMoments(chapter) {
  if (episodeOneDirection(chapter, 0)) return EPISODE_ONE_SCENES.map(({index,title})=>({beatIndex:index,place:title,authored:true}));
  if (episodeTwoDirection(chapter, 0)) return EPISODE_TWO_SCENES.map(({index,title})=>({beatIndex:index,place:title,authored:true}));
  const seenVisuals = new Set(), seenSignals = new Set(); let previousPlace = '';
  return chapter.beats.flatMap((beat, beatIndex) => {
    const direction = beat.direction, place = direction?.place || '';
    const placeChanged = Boolean(place && place !== previousPlace);
    previousPlace = place;
    const visual = direction?.visual;
    const visualNew = Boolean(visual?.id && !seenVisuals.has(visual.id));
    if (visual?.id) seenVisuals.add(visual.id);
    const signal = presentationForBeat(chapter, beat, beatIndex);
    const signalKey = signal ? `${signal.kind}:${signal.sender}:${signal.title}` : '';
    const signalNew = Boolean(signal && !seenSignals.has(signalKey));
    if (signal) seenSignals.add(signalKey);
    return placeChanged || visualNew || signalNew ? [{ beatIndex, place: placeChanged ? place : '', visualType: visualNew ? visual.type : '', signal: signalNew ? signal : null }] : [];
  });
}

function openChapterScenes(chapter) {
  const moments = chapterMoments(chapter);
  const root = document.createElement('div'); root.append(modalHeading('연출 장면', `${chapter.label} · 장면이 시작되는 위치를 고를 수 있습니다.`));
  if (!moments.length) { const empty = document.createElement('p'); empty.className = 'modal-lead'; empty.textContent = '이 장에는 별도로 표시한 장면 연출이 없습니다.'; root.append(empty); }
  const list = document.createElement('div'); list.className = 'chapter-list scene-index-list';
  moments.forEach((moment, index) => {
    const card = document.createElement('div'); card.className = 'chapter-card';
    const copy = document.createElement('div'); copy.className = 'chapter-copy';
    const title = document.createElement('strong'); title.textContent = `${String(index + 1).padStart(2, '0')} · ${moment.place || moment.signal?.title || '시각 기록'}`;
    const detail = document.createElement('span'); detail.textContent = moment.authored ? `${chapter.label} 연출판 · 이 장면에서 시작` : moment.signal ? `${moment.signal.sender ? `${moment.signal.sender} · ` : ''}이 장면에서 시작` : `이 장면에서 시작 · ${moment.visualType ? '정보 패널 포함' : '장소 전환'}`;
    const button = document.createElement('button'); button.className = 'small-button'; button.type = 'button'; button.textContent = '이곳에서 읽기';
    button.addEventListener('click', () => { closeModal(); play(chapter.id, moment.beatIndex, true); });
    copy.append(title, detail); card.append(copy, button); list.append(card);
  });
  root.append(list); modalContent.replaceChildren(root); modalMode = 'scenes'; $('modalClose').focus();
}

function openSettings() {
  const root = document.createElement('div'); root.append(modalHeading('읽기 설정', '화면과 읽는 속도를 편하게 조절할 수 있습니다.'));
  const rows = [
    { key: 'fontSize', label: '글자 크기', min: 16, max: 28, suffix: 'px' },
    { key: 'textSpeed', label: '글자 표시 속도', min: 8, max: 80, suffix: '자/초' },
    { key: 'autoWait', label: '자동 진행 여유', min: 500, max: 5000, suffix: 'ms' },
  ];
  rows.forEach((item) => {
    const row = document.createElement('div'); row.className = 'setting-row'; const label = document.createElement('label');
    const displayValue = (value) => item.key === 'autoWait' ? `${(value / 1000).toFixed(1)}초 + 문장 길이` : `${value} ${item.suffix}`;
    label.textContent = item.label; const output = document.createElement('output'); output.textContent = displayValue(store.settings[item.key]); label.append(output);
    const input = document.createElement('input'); input.type = 'range'; input.min = item.min; input.max = item.max; input.step = item.key === 'autoWait' ? 100 : 1; input.value = store.settings[item.key]; input.setAttribute('aria-label', item.label);
    input.addEventListener('input', () => { store.settings[item.key] = Number(input.value); output.textContent = displayValue(Number(input.value)); document.documentElement.style.setProperty('--font-size', `${store.settings.fontSize}px`); saveStore(); });
    row.append(label, input); root.append(row);
  });
  [
    ['instant', '문장 바로 표시', '한 글자씩 기다리지 않고 문장 전체를 표시합니다. 진행은 직접 누릅니다.'],
    ['sound', '음악과 장면 효과', '자체 작곡 음악과 생활 소리, 장면 효과음을 재생합니다. 언제든 끌 수 있습니다.'],
  ].forEach(([key, labelText, description]) => {
    const row = document.createElement('div'); row.className = 'setting-row'; const label = document.createElement('label'); label.textContent = labelText;
    const out = document.createElement('output'); out.textContent = description; label.append(out); const input = document.createElement('input'); input.type = 'checkbox'; input.checked = store.settings[key]; input.setAttribute('aria-label', labelText);
    input.addEventListener('change', () => { store.settings[key] = input.checked; saveStore(); if (key === 'sound') { syncSoundButton(); if (!input.checked) { audio.stop(); episodeAudio.stop(); } else episodeAudio.unlock(); } }); row.append(label, input); root.append(row);
  });
  const volumeRow = document.createElement('div'); volumeRow.className = 'setting-row'; const volumeLabel = document.createElement('label'); volumeLabel.textContent = '공간음 음량';
  const volumeOutput = document.createElement('output'); volumeOutput.textContent = `${store.settings.volume}%`; volumeLabel.append(volumeOutput);
  const volumeInput = document.createElement('input'); volumeInput.type = 'range'; volumeInput.min = 0; volumeInput.max = 70; volumeInput.value = store.settings.volume; volumeInput.setAttribute('aria-label', '공간음 음량');
  volumeInput.addEventListener('input', () => { store.settings.volume = Number(volumeInput.value); volumeOutput.textContent = `${volumeInput.value}%`; saveStore(); audio.setVolume(); episodeAudio.setVolume(); }); volumeRow.append(volumeLabel, volumeInput); root.append(volumeRow);
  const motionRow = document.createElement('div'); motionRow.className = 'setting-row'; const motionLabel = document.createElement('label'); motionLabel.textContent = '움직임 줄이기'; const motionOut = document.createElement('output'); motionOut.textContent = '카메라 이동과 화면 효과를 줄입니다.'; motionLabel.append(motionOut);
  const motionInput = document.createElement('input'); motionInput.type = 'checkbox'; motionInput.checked = store.settings.reducedMotion; motionInput.setAttribute('aria-label', '움직임 줄이기');
  motionInput.addEventListener('change', () => { store.settings.reducedMotion = motionInput.checked; saveStore(); if (beatAt()) { renderDirection(beatAt(), { quiet: true }); neuralStage.clear(); } }); motionRow.append(motionLabel, motionInput); root.append(motionRow);
  root.append(actionButton('조작 도움말', openHelp));
  showModal(root, 'settings');
}

function openHelp() {
  const root = document.createElement('div'); root.append(modalHeading('조작 도움말', '휴대폰에서는 하단 읽기 도구를 이용하세요. 자동 진행과 읽은 곳 넘김은 직접 켠 뒤에만 시작합니다.'));
  const shortcuts = document.createElement('dl'); shortcuts.className = 'shortcut-list';
  [['클릭 · Enter · Space · →', '다음 문장. 표시 중이면 현재 문장을 먼저 완성합니다.'], ['← · 이전', '이전 문장. 자동 진행을 멈춥니다.'], ['A · 자동', '문장 길이에 맞춰 자동 진행. 선택 장면과 장 끝에서 멈춥니다.'], ['K · 읽은 곳 넘김', '읽은 부분만 빠르게 이동. 미독 문장에 닿으면 멈춥니다.'], ['Esc', '자동 진행·넘김을 멈추거나 숨긴 화면을 복원합니다. 열린 창은 닫습니다.'], ['L · S · H · F', '지난 이야기 · 저장과 백업 · 화면 숨김 · 전체 화면'], ['?', '이 도움말을 엽니다.']].forEach(([key, description]) => { const term = document.createElement('dt'), detail = document.createElement('dd'); term.textContent = key; detail.textContent = description; shortcuts.append(term, detail); });
  const note = document.createElement('p'); note.className = 'modal-lead'; note.textContent = '설정·저장·지난 이야기 창을 열거나 다른 탭으로 이동하면 진행이 멈춥니다. 장과 장면을 옮기기 전 위치는 저장과 백업의 ‘이동 전 읽던 곳’에 남습니다. 파일 백업은 기기 간 수동 이동용입니다.';
  root.append(shortcuts, note); showModal(root, 'help');
}

function openLibrary() {
  const root = document.createElement('div'); root.append(modalHeading('기록과 만든 이', '이야기의 출처와 제작 정보를 모아 두었습니다.'));
  const credits = window.STORY?.credits ?? {};
  const scope = document.createElement('p'); scope.className = 'modal-lead'; scope.textContent = '1~30화에는 장면별 카메라, 인물 배치, 공간음과 신경 접속을 통한 통신 연출이 적용되어 있습니다. 개인 AI의 응답, 메시지, 감각 경험, 정산과 방송을 서로 다른 방식으로 보여 줍니다. 이후 수록분은 원문 중심의 읽기 화면으로 이어집니다. 장면 자료와 소리는 이 작품을 위해 만든 오프라인 연출입니다.'; root.append(scope);
  const author = document.createElement('p'); author.className = 'modal-lead'; author.textContent = credits.author ? `글 · ${credits.author}` : '제작 정보는 이야기 자료와 함께 표시됩니다.'; root.append(author);
  const list = document.createElement('div'); list.className = 'chapter-list';
  story.chapters.forEach((chapter) => {
    const card = document.createElement('div'); card.className = 'chapter-card'; const copy = document.createElement('div'); copy.className = 'chapter-copy';
    const title = document.createElement('strong'); title.textContent = `${chapter.label} · ${chapter.title}`;
    const path = document.createElement('span'); path.textContent = chapter.sourcePath || '출처 정보'; copy.append(title, path); card.append(copy); list.append(card);
  });
  root.append(list); showModal(root, 'library');
}

function openBacklog() {
  if (!backlog.length) { toast('아직 지난 이야기가 없습니다.'); return; }
  backlogRestore = null; transientBacklog = false;
  const root = document.createElement('div'); root.append(modalHeading('지난 이야기', '최근 읽은 문장을 다시 볼 수 있습니다. 닫으면 지금 읽던 자리로 돌아옵니다.'));
  const list = document.createElement('div'); list.className = 'backlog-list';
  backlog.slice().reverse().forEach((entry) => {
    const button = document.createElement('article'); button.className = 'backlog-entry';
    const name = document.createElement('strong'); name.textContent = `${entry.label}${entry.speaker ? ` · ${entry.speaker}` : ''}`;
    const text = document.createElement('span'); text.textContent = entry.text; button.append(name, text);
    list.append(button);
  });
  root.append(list); showModal(root, 'backlog');
}

function closeModal() {
  const restore = modalMode === 'backlog' ? backlogRestore : null;
  modal.close(); modalMode = ''; modalContent.replaceChildren();
  if (restore && transientBacklog) { progress = restore; backlogRestore = null; transientBacklog = false; renderBeat({ revisit: true }); }
  else if (!gameScreen.hidden && beatAt()) renderBeat({ revisit: true });
  if (restoreFocus?.isConnected && !restoreFocus.closest('[hidden]')) restoreFocus.focus({ preventScroll: true });
}

function openEpisodeOneDemo() {
  const root = document.createElement('div'); root.append(modalHeading('1화 · 빌린 꿈', '표정과 시선, 생활의 소리와 마지막 침묵까지.'));
  const note = document.createElement('p'); note.className = 'demo-mode-note';
  note.textContent = '약 55초의 티저 영상 뒤에 1화가 시작됩니다. 영상은 언제든 건너뛸 수 있습니다. 본편은 클릭·Enter·Space로 진행하고, A로 자동 읽기, L로 지난 대사를 볼 수 있습니다. 언제든 저장하거나 글자 크기와 소리를 바꿀 수 있습니다.';
  const actions = document.createElement('div'); actions.className = 'demo-start-actions';
  const begin = (sound) => {
    store.settings.sound = sound; saveStore();
    const unlocked = sound ? episodeAudio.unlock() : Promise.resolve(false);
    modal.close(); modalMode = ''; modalContent.replaceChildren();
    episodeTeaser.start({ src: EP1_ASSETS.teaserVideo, sound, volume: store.settings.volume, onFinish: () => {
      play('1', 0, true); syncSoundButton(); $('storyBox').focus({ preventScroll: true });
      unlocked.then(ok => { if(ok) { episodeAudio.prime(); if(currentEpisodeCue&&!gameScreen.hidden&&!modal.open) episodeAudio.render(currentEpisodeCue,{quiet:true}); } });
    } });
  };
  actions.append(actionButton('소리 켜고 시작', () => begin(true)), actionButton('조용히 시작', () => begin(false)));
  root.append(note, actions); showModal(root, 'demo');
  Object.entries(EP1_ASSETS).filter(([,path])=>path.endsWith('.webp')).forEach(([,path])=>{const image=new Image();image.src=path;});
}
$('demoButton').addEventListener('click', openEpisodeOneDemo);
$('startButton').addEventListener('click', () => play(story.chapters[0]?.id, 0, true));
$('continueButton').addEventListener('click', () => store.autosave ? play(store.autosave.progress.chapterId, store.autosave.progress.beatIndex, false, store.autosave.progress) : play(story.chapters[0]?.id, 0, true));
$('chaptersButton').addEventListener('click', openChapters);
$('titleSaveButton').addEventListener('click', openSaves);
$('settingsButton').addEventListener('click', openSettings);
$('creditsButton').addEventListener('click', openLibrary);
$('backlogButton').addEventListener('click', openBacklog);
$('saveButton').addEventListener('click', openSaves);
$('gameSettingsButton').addEventListener('click', openSettings);
$('soundToggle').addEventListener('click', () => {
  store.settings.sound = !store.settings.sound; saveStore(); syncSoundButton();
  if (!store.settings.sound) { audio.stop(); episodeAudio.stop(); }
  else if (currentEpisodeCue) episodeAudio.unlock().then(ok=>{if(ok&&!gameScreen.hidden&&!modal.open)episodeAudio.render(currentEpisodeCue,{quiet:true});});
  else { const dir = beatAt()?.direction; if (dir?.music) audio.resume(dir.music); }
});
function setUiHidden(hidden) {
  if (hidden) { pauseReading(); clearTimers(); if (typing) { storyText.textContent = fullText; finishTyping(); } }
  $('stage').classList.toggle('ui-hidden', hidden); $('uiReveal').hidden = !hidden;
  for(const node of $('stage').querySelectorAll('.hud,.place-ribbon,.cast-rail,.direction-card,.story-box,.keyboard-hint,.neural-stage,.nav-tools'))node.inert=hidden;
  $('hideUiButton').setAttribute('aria-pressed',String(hidden));
  $('hideUiButton').setAttribute('aria-label',hidden?'화면 정보 표시':'화면 정보 숨기기');
  if (hidden) $('readingAnnouncement').textContent = '';
}
$('hideUiButton').addEventListener('click',()=>{setUiHidden(!$('stage').classList.contains('ui-hidden'));if(!$('uiReveal').hidden)$('uiReveal').focus();});
$('uiReveal').addEventListener('click',()=>{setUiHidden(false);$('hideUiButton').focus();});
$('homeButton').addEventListener('click', () => { pauseReading(); clearTimers(); audio.stop(); episodeAudio.stop(); episodeStage.clear(); currentEpisodeCue=null; neuralStage.clear(); currentPerception = null; lastCommunicationGroup = ''; gameScreen.hidden = true; titleScreen.hidden = false; syncContinueInfo(); });
$('modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(); });
modal.addEventListener('cancel', (event) => { event.preventDefault(); closeModal(); });
$('advanceZone').addEventListener('click', () => { advance(); $('storyBox').focus({ preventScroll: true }); });
$('storyBox').addEventListener('click', (event) => { if (!event.target.closest('button') && !window.getSelection()?.toString()) advance(); });
$('storyBox').addEventListener('keydown', (event) => { if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return; if (event.target instanceof Element && event.target.closest('button,input,select,textarea')) return; if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); advance(); } });
$('previousButton').addEventListener('click', () => { goPrevious(); $('storyBox').focus({ preventScroll: true }); });
$('autoToggle').addEventListener('click', () => toggleReading('auto'));
$('skipToggle').addEventListener('click', () => toggleReading('skip'));
$('helpButton').addEventListener('click', openHelp);
async function toggleFullscreen() {
  try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); }
  catch { toast('이 브라우저에서는 전체 화면을 사용할 수 없습니다.'); }
}
$('fullscreenButton').hidden = !document.fullscreenEnabled;
$('fullscreenButton').addEventListener('click', toggleFullscreen);
document.addEventListener('fullscreenchange', () => { $('fullscreenButton').textContent = document.fullscreenElement ? '창으로' : '전체 화면'; $('fullscreenButton').setAttribute('aria-pressed', String(Boolean(document.fullscreenElement))); });
document.addEventListener('keydown', (event) => {
  if (modal.open || episodeTeaser.open) return;
  if (event.key === 'Escape') { event.preventDefault(); pauseReading(); if ($('stage').classList.contains('ui-hidden')) setUiHidden(false); return; }
  if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
  if (event.target instanceof Element && event.target.closest('input,select,textarea,[contenteditable="true"]')) return;
  const key = event.key.toLowerCase();
  const shortcut = { a: () => toggleReading('auto'), k: () => toggleReading('skip'), l: openBacklog, s: openSaves, h: () => setUiHidden(!$('stage').classList.contains('ui-hidden')), f: toggleFullscreen, '?': openHelp }[key];
  if (!gameScreen.hidden && shortcut) { event.preventDefault(); shortcut(); return; }
  if (event.target instanceof Element && event.target.closest('button,input,select,textarea')) return;
  if (event.key === 'ArrowRight' || event.key === ' ' || event.key === 'Enter') { event.preventDefault(); advance(); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); goPrevious(); }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { pauseReading(); clearTimers(); audio.stop(); episodeAudio.stop(); }
  else if (!gameScreen.hidden && !modal.open && !document.querySelector('.end-screen')) renderBeat({ revisit: true });
});

if (!story.chapters.length) {
  $('continueButton').disabled = true;
  $('continueButton').title = '이야기 자료가 준비되면 이어 읽기를 사용할 수 있습니다.';
}
syncSoundButton();
syncContinueInfo(); syncReadingTools();

// Open a reviewed scene without changing the saved chapter selection menu.
const reviewLink = new URLSearchParams(location.search);
const reviewChapter = reviewLink.get('chapter');
if (reviewChapter && chapterAt(reviewChapter)) {
  const index = Number.parseInt(reviewLink.get('beat'), 10) || 0;
  play(reviewChapter, Math.max(0, Math.min(chapterAt(reviewChapter).beats.length - 1, index)), true);
}
