import { episodeOneDirection } from './episode-one.js?v=ep12-20261019-r3';
import { presentationForBeat } from './neural-cues.js?v=ep12-20261019-r3';

// These are reading pages, not new story beats. Source indices remain the
// coordinate system for saves, choices, scene direction and the backlog.
const RANGES = [
  [0,1], [4,5], [9,11], [14,16], [17,18], [23,24], [28,29],
  [32,34], [40,42], [43,45], [46,49], [50,51], [52,53], [54,55],
  [58,59], [61,62], [63,64], [65,67], [68,69], [70,73],
  [74,75], [78,79], [80,82], [83,85], [94,95],
  [101,104], [106,109], [110,113], [114,116], [118,121],
  [127,129], [130,133], [134,135], [136,137], [138,140], [141,143],
  [147,150], [153,154], [160,161], [162,165], [166,168], [169,171],
  [172,173], [174,177], [178,181], [182,184], [185,186], [187,190], [191,194],
  [196,197], [199,200], [202,204], [205,206], [211,213], [222,223],
  [224,225], [233,236], [237,239], [241,243],
];
const requestedEnds = new Map(RANGES);
const pages = new WeakMap();
const visualState = cue => JSON.stringify([
  cue.sceneStart, cue.background, cue.cg, cue.shot, cue.actors, cue.document,
  cue.wallAd, cue.ambience, cue.music, cue.closeFinance, cue.intro, cue.blackout,
]);

function pageMap(chapter) {
  if (!episodeOneDirection(chapter, 0)) return null;
  if (pages.has(chapter)) return pages.get(chapter);
  const map = new Map();
  for (let start = 0; start < chapter.beats.length;) {
    const first = chapter.beats[start], cue = episodeOneDirection(chapter, start);
    let end = start;
    if (!first.choice && !presentationForBeat(chapter, first, start)) {
      for (let index = start + 1; index <= (requestedEnds.get(start) ?? start); index++) {
        const beat = chapter.beats[index], nextCue = episodeOneDirection(chapter, index);
        if (!nextCue || beat.choice || nextCue.fx || nextCue.gap ||
            presentationForBeat(chapter, beat, index) || visualState(nextCue) !== visualState(cue)) break;
        end = index;
      }
    }
    for (let index = start; index <= end; index++) map.set(index, { start, end });
    start = end + 1;
  }
  pages.set(chapter, map);
  return map;
}

export function episodeOneReadingPage(chapter, index) {
  if (!Number.isInteger(index)) return null;
  const range = pageMap(chapter)?.get(index);
  if (!range) return null;
  // An old save or an exact source-position jump resumes at that same beat.
  const entries = chapter.beats.slice(index, range.end + 1).map((beat, offset) => ({ ...beat, index: index + offset }));
  const speakers = new Set(entries.filter(beat => beat.speaker).map(beat => beat.speaker));
  const dialogueOnly = entries.every(beat => beat.kind === 'dialogue');
  const labelLines = entries.length > 1 && !(dialogueOnly && speakers.size === 1);
  return {
    start: index, end: range.end, entries,
    text: entries.map(beat => labelLines && beat.speaker ? `${beat.speaker} · ${beat.text}` : beat.text).join('\n'),
    speaker: labelLines ? '' : entries[0].speaker || '',
    focus: entries.findLast(beat => beat.speaker)?.speaker || '',
  };
}

export function episodeOnePreviousPage(chapter, index) {
  const map = pageMap(chapter), current = map?.get(index);
  if (!current || index === 0) return null;
  return index > current.start ? current.start : map.get(index - 1).start;
}

export function isEpisodeOneObservation(chapter, index) {
  return Boolean(index === 240 && episodeOneDirection(chapter, index) &&
    chapter.beats[index].text === '서인은 승인창 위에 손가락을 올린 채 멈췄다.' &&
    chapter.beats[index].choice?.prompt === '승인 전에 무엇을 다시 볼까?');
}
