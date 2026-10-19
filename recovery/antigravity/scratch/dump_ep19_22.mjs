import fs from 'node:fs';
import vm from 'node:vm';

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync('C:/Users/jbseo/Desktop/lost-dreams-novel/vn/story-data.js', 'utf8'), ctx);
const { presentationForBeat } = await import('file:///C:/Users/jbseo/Desktop/lost-dreams-novel/vn/neural-cues.js');

const ids = ['19', '20', '20-1', '21', '21-1', '22'];
let out = '';
for (const id of ids) {
  const c = ctx.window.STORY.chapters.find(x => x.id === id);
  out += `=== CHAPTER ${id} : ${c.title} (${c.beats.length} beats) ===\n`;
  c.beats.forEach((b, i) => {
    const cue = presentationForBeat(c, b, i);
    const cueInfo = cue ? `CUE(${cue.kind}|${cue.sender}|${cue.title}|primary=${cue.primary})` : '';
    const dir = b.direction ? JSON.stringify({
      place: b.direction.place,
      mood: b.direction.mood,
      cast: b.direction.cast?.map(p => p.id),
      visual: b.direction.visual?.title,
    }) : '';
    out += `${id}:${i} [${b.kind}] spk=${JSON.stringify(b.speaker || '')} scene=${b.scene} ${cueInfo} ${dir} :: ${JSON.stringify(b.text)}\n`;
  });
}
fs.writeFileSync('C:/Users/jbseo/.gemini/antigravity-cli/brain/e2d8e107-51da-4d48-ac0c-d7e6ea1487ac/scratch/ep19_22_beats.txt', out, 'utf8');
console.log('Wrote lines:', out.split('\n').length);
