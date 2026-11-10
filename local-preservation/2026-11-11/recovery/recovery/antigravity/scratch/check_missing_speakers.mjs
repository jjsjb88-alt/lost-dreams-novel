import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {
  SEQUENCE_19_22_CHAPTERS,
  sequenceSpeaker,
} from 'file:///C:/Users/jbseo/Desktop/lost-dreams-novel/vn/sequence-19-22.js';

const vnDir = 'C:/Users/jbseo/Desktop/lost-dreams-novel/vn';
const code = fs.readFileSync(path.join(vnDir, 'story-data.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(code, sandbox);
const story = sandbox.window.STORY;
const chaptersById = new Map(story.chapters.map((ch) => [ch.id, ch]));

let missingCount = 0;
for (const id of SEQUENCE_19_22_CHAPTERS) {
  const ch = chaptersById.get(id);
  ch.beats.forEach((beat, idx) => {
    if (beat.kind === 'dialogue') {
      const sp = sequenceSpeaker(ch, idx, beat);
      if (!sp) {
        missingCount++;
        const prev = ch.beats[idx - 1]?.text || '';
        const next = ch.beats[idx + 1]?.text || '';
        console.log(`${id}:${idx} | prev=${prev} | text=${beat.text} | next=${next}`);
      }
    }
  });
}
console.log(`Total missing dialogue speakers: ${missingCount}`);
