import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {presentationForBeat} from './neural-cues.js';
import {normalizeStory,freshProgress,makeSave,readStore,writeStore,emptyStore} from './state.js';
const box={window:{}};vm.runInNewContext(await fs.readFile(new URL('./story-data.js',import.meta.url),'utf8'),box);
const raw=JSON.parse(JSON.stringify(box.window.STORY)),story=normalizeStory(raw);
const chapter=id=>story.chapters.find(c=>c.id===id);
const at=(id,line)=>chapter(id).beats.find(b=>b.sourceLine>=line);
test('all 30 episodes and all 21 included side stories have restorable authored stages',()=>{
 const directed=story.chapters.filter(c=>Number(c.id.split('-')[0])<=30);
 assert.equal(directed.length,51);assert.equal(directed.filter(c=>c.kind==='bumper').length,21);
 for(const c of directed)for(const b of c.beats){assert(b.direction?.place,c.id);assert(story.assets[b.scene]||b.scene==='neutral',c.id);}
 assert(story.chapters.filter(c=>Number(c.id.split('-')[0])>30).every(c=>c.beats.every(b=>!b.direction)));
});
test('normalization preserves every authored chart, CG, cast and quiet passage',()=>{
 for(let ci=0;ci<raw.chapters.length;ci++)for(let bi=0;bi<raw.chapters[ci].beats.length;bi++){
  const a=raw.chapters[ci].beats[bi].direction,b=story.chapters[ci].beats[bi].direction;if(!a)continue;
  assert.equal(b.visual?.id,a.visual?.id);assert.equal(b.visual?.image,a.visual?.image);assert.equal(b.visual?.chart?.type,a.visual?.chart?.type);
  assert.deepEqual(b.cast,a.cast);assert.equal(b.music,a.music);
 }
});
test('revised public contracts never expose human compute or turn medical sharing into sleep relief',async()=>{
 const restricted=/야간 (?:인간 )?인지 공급|인지 부하 완화|저부하 수면|가난한 사람의 뇌|패키지 강도 상한.*14%|완화 폭.*14.*8/;
 const cues=await fs.readFile(new URL('./neural-cues.js',import.meta.url),'utf8');
 for(const id of ['20-1','21','21-1','22','22-1','23','24','24-1','25','25-1']){
  const c=raw.chapters.find(c=>c.id===id);assert(c,id);assert(!restricted.test(JSON.stringify(c)),id);
  const md=await fs.readFile(new URL('../'+c.sourcePath,import.meta.url),'utf8');
  for(const b of c.beats){
   assert(!restricted.test(b.text),id);
   assert(!restricted.test(JSON.stringify(presentationForBeat(c,b,c.beats.indexOf(b)))),id+' channel');
   if(id==='21-1')continue;
   const source=md.split(/\r?\n/).slice(b.sourceLine-1,b.endLine).join('\n').replaceAll('**','');
   assert.equal(b.text,source,`${id}:${b.sourceLine}`);
  }
 }
 assert(!cues.includes('동부 27번 야간 인지 부하 완화 가능치'));
});
test('medical bid D never acquires a fabricated success probability',()=>{
 const b=chapter('16').beats.find(b=>b.direction?.visual?.title.startsWith('대안 D'));
 assert(b);assert(!b.direction.visual.chart);assert(b.direction.visual.rows.some(r=>r.label==='성공률'&&r.value==='없음'));
});
test('financial flow belongs to Doyun and never uses the full household amount twice',()=>{
 const before=chapter('30').beats.find(b=>b.direction?.visual?.title==='지급 전 · 도윤의 개인 몫');assert(before);
 const after=chapter('30').beats.find(b=>b.direction?.visual?.title==='대납 2,800 이후의 잔액');assert(after);
 assert.deepEqual(after.direction.visual.chart.items.map(x=>x.value),['3,092.2','−2,800','292.2']);
});
test('interview, recovery and message staging do not leave the wrong person in the room',()=>{
 const interview=chapter('19').beats.find(b=>b.text==='“그 질문이 승급과 관련 있습니까?”');
 assert(interview.direction.cast.some(p=>p.id==='yoonsera'));
 assert(interview.direction.cast.some(p=>p.id==='yeonwoo'));
 const corridor=chapter('19').beats.find(b=>b.text.startsWith('복도로 나온 서인은'));
 assert(!corridor.direction.cast.some(p=>p.id==='yoonsera'));
 assert(corridor.direction.cast.some(p=>p.id==='yeonwoo'));
 assert(at('6',361).direction.cast.some(p=>p.id==='doyun'));
 assert(!at('6',413).direction.cast.some(p=>p.id==='reho'));
 assert(!at('26',281).direction.cast.some(p=>p.id==='mother'));
 const home=chapter('26').beats.find(b=>b.text==='저녁 7시.');assert(home.direction.cast.some(p=>p.id==='mother'));
});
test('old save position and chosen observation are retained while stage reconstructs from the beat',()=>{
 let rawStore='';const storage={getItem:()=>rawStore,setItem:(k,v)=>{rawStore=v;}};
 const p={...freshProgress(story,'6'),beatIndex:225,choices:{'6:225':1}};
 assert(writeStore(storage,{...emptyStore(),autosave:makeSave(p,chapter('6'),chapter('6').beats[225])}));
 const read=readStore(storage,story);assert.deepEqual(read.autosave.progress,p);
 assert.equal(chapter('6').beats[225].choice.options.length,2);
 assert.deepEqual(chapter('6').beats[225].direction,normalizeStory(raw).chapters.find(c=>c.id==='6').beats[225].direction);
});
