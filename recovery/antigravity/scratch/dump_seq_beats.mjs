import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const vnDir = 'C:/Users/jbseo/Desktop/lost-dreams-novel/vn';
const code = fs.readFileSync(path.join(vnDir, 'story-data.js'), 'utf8');
const sandbox = { window: {} };
vm.runInNewContext(code, sandbox);
const story = sandbox.window.STORY;
const chaptersById = new Map(story.chapters.map((ch) => [ch.id, ch]));

const outDir = 'C:/Users/jbseo/.gemini/antigravity-cli/brain/e2d8e107-51da-4d48-ac0c-d7e6ea1487ac/scratch';
for (const id of ['19', '20', '20-1', '21', '21-1', '22']) {
  const ch = chaptersById.get(id);
  const lines = [`# Chapter ${id}: ${ch.title} (${ch.beats.length} beats)`];
  ch.beats.forEach((b, i) => {
    lines.push(`${i} | ${b.kind} | sp=${b.speaker || ''} | sc=${b.scene || ''} | ${b.text}`);
  });
  fs.writeFileSync(path.join(outDir, `beats_${id}.txt`), lines.join('\n'), 'utf8');
}
console.log('Wrote beats_19..22.txt');
