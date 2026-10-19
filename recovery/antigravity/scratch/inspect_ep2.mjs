import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const vnRoot = 'C:/Users/jbseo/Desktop/lost-dreams-novel/vn';
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(vnRoot, 'story-data.js'), 'utf8'), ctx);
const ch1 = ctx.window.STORY.chapters.find(c => c.id === '1');
const ch2 = ctx.window.STORY.chapters.find(c => c.id === '2');
const ch3 = ctx.window.STORY.chapters.find(c => c.id === '3');
const { presentationForBeat } = await import(pathToFileURL(path.join(vnRoot, 'neural-cues.js')).href);

console.log('ch1 beats:', ch1.beats.length, 'ch2 beats:', ch2.beats.length, 'ch3 beats:', ch3.beats.length);
console.log('ch2 meta:', { id: ch2.id, label: ch2.label, title: ch2.title, sourcePath: ch2.sourcePath });

const lines = [];
for (let i = 0; i < ch2.beats.length; i++) {
  const b = ch2.beats[i];
  const cue = presentationForBeat(ch2, b, i);
  lines.push(JSON.stringify({
    i,
    kind: b.kind,
    speaker: b.speaker || '',
    scene: b.scene || '',
    portrait: b.portrait || '',
    text: b.text,
    choice: b.choice || null,
    dir: b.direction || null,
    neural: cue || null,
  }));
}
fs.writeFileSync('C:/Users/jbseo/.gemini/antigravity-cli/brain/e2d8e107-51da-4d48-ac0c-d7e6ea1487ac/scratch/ep2_beats.jsonl', lines.join('\n'), 'utf8');
console.log('Wrote ep2_beats.jsonl with', lines.length, 'lines.');
