import { episodeTwoDirection, episodeTwoSpeaker } from './episode-two.js';
import { presentationForBeat } from './neural-cues.js';

export { episodeTwoSpeaker };

// Reading-page boundaries for Episode 2. Source indices (0..285) remain
// untouched for saves, backlog, and scene direction.
const RANGES = [
  // ① 광고 없는 아침 (0..19)
  [0, 2], [3, 4], [6, 7], [9, 10], [16, 19],
  // ② 어머니와 검진비 (20..64)
  [20, 22], [23, 25], [26, 28], [29, 32], [33, 36],
  [37, 39], [40, 42], [43, 45], [46, 47], [48, 51],
  [52, 54], [55, 57], [58, 61], [62, 64],
  // ③ 지우의 빈자리와 초대 (65..84)
  [65, 66], [67, 69], [70, 72], [73, 75], [76, 78], [79, 81],
  // ④ 지우 아버지와의 대면 (85..150)
  [85, 87], [88, 89], [90, 91], [92, 94], [95, 96], [98, 99],
  [100, 103], [104, 106], [107, 109], [110, 111], [112, 114], [115, 117],
  [118, 120], [121, 123], [124, 126], [127, 129], [130, 132], [133, 134], [135, 136],
  [138, 140], [141, 143], [144, 145], [147, 149],
  // ⑤ 밖에서의 점토 대화 (151..205)
  [151, 153], [154, 156], [157, 160], [161, 162], [163, 164], [165, 168],
  [169, 172], [173, 174], [175, 178], [179, 182], [183, 186], [187, 189],
  [190, 193], [194, 196], [197, 199], [200, 203], [204, 205],
  // ⑥ 광고를 다시 켜는 서인 (206..231)
  [212, 213], [217, 218], [223, 225], [226, 229], [230, 231],
  // ⑦ 지나치게 아름다운 광고꿈 (232..265)
  [236, 237], [240, 243], [250, 252], [258, 259], [260, 261], [262, 263],
  // ⑧ 중도 종료와 새벽 메시지 (266..285)
  [266, 268], [272, 274], [275, 277], [278, 279], [281, 282],
];

const requestedEnds = new Map(RANGES);
const pages = new WeakMap();
const visualState = cue => JSON.stringify([
  cue.sceneStart, cue.background, cue.backgroundAsset, cue.place, cue.cg,
  cue.shot, cue.actors, cue.document, cue.wallAd, cue.ambience, cue.music,
  cue.closeFinance, cue.intro, cue.blackout,
]);

function pageMap(chapter) {
  if (!episodeTwoDirection(chapter, 0)) return null;
  if (pages.has(chapter)) return pages.get(chapter);
  const map = new Map();
  for (let start = 0; start < chapter.beats.length;) {
    const first = chapter.beats[start], cue = episodeTwoDirection(chapter, start);
    let end = start;
    if (!first.choice && !presentationForBeat(chapter, first, start)) {
      for (let index = start + 1; index <= (requestedEnds.get(start) ?? start); index++) {
        const beat = chapter.beats[index], nextCue = episodeTwoDirection(chapter, index);
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

export function episodeTwoReadingPage(chapter, index) {
  if (!Number.isInteger(index)) return null;
  const range = pageMap(chapter)?.get(index);
  if (!range) return null;
  // An old save or an exact source-position jump resumes at that same beat.
  const entries = chapter.beats.slice(index, range.end + 1).map((beat, offset) => {
    const beatIndex = index + offset;
    return {
      ...beat,
      index: beatIndex,
      speaker: episodeTwoSpeaker(beatIndex, beat),
    };
  });
  const speakers = new Set(entries.filter(beat => beat.speaker).map(beat => beat.speaker));
  const dialogueOnly = entries.every(beat => beat.kind === 'dialogue');
  const labelLines = entries.length > 1 && !(dialogueOnly && speakers.size === 1);
  return {
    start: index,
    end: range.end,
    entries,
    text: entries.map(beat => labelLines && beat.speaker ? `${beat.speaker} · ${beat.text}` : beat.text).join('\n'),
    speaker: labelLines ? '' : entries[0].speaker || '',
    focus: entries.findLast(beat => beat.speaker)?.speaker || '',
  };
}

export function episodeTwoPreviousPage(chapter, index) {
  const map = pageMap(chapter), current = map?.get(index);
  if (!current || index === 0) return null;
  return index > current.start ? current.start : map.get(index - 1).start;
}
