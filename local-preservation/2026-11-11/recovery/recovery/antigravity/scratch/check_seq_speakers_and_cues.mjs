import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {
  SEQUENCE_19_22_CHAPTERS,
  sequenceSpeaker,
} from 'file:///C:/Users/jbseo/Desktop/lost-dreams-novel/vn/sequence-19-22.js';
import { presentationForBeat } from 'file:///C:/Users/jbseo/Desktop/lost-dreams-novel/vn/neural-cues.js';

const vnDir = 'C:/Users/jbseo/Desktop/lost-dreams-novel/vn';
const code = fs.readFileSync(path.join(vnDir, 'story-data.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(code, sandbox);
const story = sandbox.window.STORY;
const chaptersById = new Map(story.chapters.map((ch) => [ch.id, ch]));

console.log('=== MISSING DIALOGUE SPEAKERS ===');
for (const id of SEQUENCE_19_22_CHAPTERS) {
  const ch = chaptersById.get(id);
  ch.beats.forEach((beat, idx) => {
    if (beat.kind === 'dialogue') {
      const sp = sequenceSpeaker(ch, idx, beat);
      if (!sp) {
        const prev = ch.beats[idx - 1]?.text || '';
        const next = ch.beats[idx + 1]?.text || '';
        console.log(`${id}:${idx} | prev=${prev} | text=${beat.text} | next=${next}`);
      }
    }
  });
}

console.log('=== SYSTEM BEATS AND PRESENTATION ===');
for (const id of SEQUENCE_19_22_CHAPTERS) {
  const ch = chaptersById.get(id);
  ch.beats.forEach((beat, idx) => {
    if (beat.kind === 'system') {
      const cue = presentationForBeat(ch, beat, idx);
      console.log(`${id}:${idx} | cue=${cue ? `${cue.kind}:${cue.sender}` : 'NULL'} | text=${beat.text}`);
    }
  });
}
