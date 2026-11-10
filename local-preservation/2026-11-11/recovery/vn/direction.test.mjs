import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
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
test('projected households cannot reveal actual applied households early',()=>{
 for(const b of chapter('24').beats.filter(b=>b.sourceLine<507))assert(!JSON.stringify(b.direction?.visual).includes('13,006')&&!JSON.stringify(b.direction?.visual).includes('13006'));
 const actual=at('24',507).direction.visual.chart;
 assert.deepEqual(actual.items.map(x=>x.value),[18420,13006]);
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
 assert(!at('19',133).direction.cast.some(p=>p.id==='yeonwoo'));
 assert(at('19',535).direction.cast.some(p=>p.id==='yeonwoo'));
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
