import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import vm from 'node:vm';
import { episodeTwoDirection, episodeTwoSpeaker, EPISODE_TWO_SCENES } from './episode-two.js';
import { episodeTwoReadingPage, episodeTwoPreviousPage } from './episode-two-reading.js';
import { EP1_ASSETS } from './ep1-assets.js';
import { presentationForBeat } from './neural-cues.js';
const box={window:{}};
vm.runInNewContext(await readFile(new URL('./story-data.js',import.meta.url),'utf8'),box);
const second=box.window.STORY.chapters.find(c=>c.id==='2');
const at=i=>episodeTwoDirection(second,i);
test('chapter two covers every original beat without altering the source or older chapters',()=>{
  const before=JSON.stringify(second);
  for(let i=0;i<286;i++)assert.ok(at(i));
  assert.equal(JSON.stringify(second),before);
  assert.equal(episodeTwoDirection(box.window.STORY.chapters[0],0),null);
  const changed=structuredClone(second);changed.beats[137].text='다른 장면';
  // Any changed source text must fail closed rather than applying stale acting.
  assert.equal(episodeTwoDirection(changed,137),null);
  for(const i of [-1,286,1.5])assert.equal(at(i),null);
});
test('all reading pages cover exactly the original text and every old save coordinate',()=>{
  const entries=[],starts=[];
  for(let i=0;i<286;){const page=episodeTwoReadingPage(second,i);starts.push(i);entries.push(...page.entries);i=page.end+1;}
  assert.deepEqual(entries.map(b=>b.index),Array.from({length:286},(_,i)=>i));
  assert.deepEqual(entries.map(b=>b.text),Array.from(second.beats,b=>b.text));
  for(let i=0;i<286;i++){
    const page=episodeTwoReadingPage(second,i);assert.equal(page.start,i);assert.equal(page.entries[0].text,second.beats[i].text);
    if(starts.includes(i)&&i)assert.equal(episodeTwoPreviousPage(second,i),starts[starts.indexOf(i)-1]);
  }
  assert.ok(starts.length<260);
});
test('scene entries, signals, effects and important admissions remain separate stops',()=>{
  const boundaries=new Set(EPISODE_TWO_SCENES.map(s=>s.index));
  const protectedBeats=[52,97,137,195,205,239,244,264,269,280,283,285];
  for(const i of protectedBeats)assert.equal(episodeTwoReadingPage(second,i).end,i);
  for(let i=0;i<286;i++)for(const b of episodeTwoReadingPage(second,i).entries.slice(1)){
    assert.ok(!boundaries.has(b.index));assert.equal(presentationForBeat(second,b,b.index),null);assert.equal(at(b.index).fx,null);
  }
});
test('reality, medical conversation and dream keep the appropriate people and clock',()=>{
  assert.equal(at(30).actors.find(a=>a.id==='seoin').asset,'seoinHome');
  assert.equal(at(99).focus,'지우 아버지');assert.equal(at(101).focus,'지우');
  assert.ok(at(97).actors.some(a=>a.id==='father'));
  assert.equal(at(140).actors.find(a=>a.id==='jiwoo').asset,'jiwooUnsteady');
  assert.equal(at(150).actors[0].asset,'fatherDown');
  assert.equal(at(195).timeOfDay,'day');assert.equal(at(195).backgroundAsset,null);
  assert.equal(at(205).actors.find(a=>a.id==='jiwoo').asset,'jiwooRelaxed');
  assert.equal(at(239).cg,'dreamBeach');assert.deepEqual(at(239).actors,[]);assert.equal(at(239).focus,'광고 속 지우');
  assert.ok(at(266).place.includes('3시 17분'));assert.ok(at(280).place.includes('3시 24분'));
  assert.equal(episodeTwoSpeaker(second,92),'지우 아버지');
});
test('the newer remote beach CG stays visible for the entire dream without a duplicate actor',()=>{
  assert.equal(EP1_ASSETS.dreamBeach,'assets/ep2/jiwoo-dream-beach.avif');
  for(let index=232;index<=265;index++){assert.equal(at(index).cg,'dreamBeach');assert.deepEqual(at(index).actors,[]);}
  assert.notEqual(at(266).cg,'dreamBeach');
});
test('the family ledger is lossless and the interrupted dream has an authored hard silence',()=>{
  const panel=presentationForBeat(second,second.beats[97],97);
  for(const value of ['-327 TOKEN.','-43%.','+16%.','38%.'])assert.ok(panel.body.includes(value));
  assert.equal(at(257).hardCut,true);assert.equal(at(257).music,null);assert.equal(at(257).ambience,null);
  assert.equal(at(264).fx,'amber');assert.equal(at(266).ambience,'heartbeat');
  for(const i of [280,283,285]){assert.equal(at(i).music,null);assert.equal(at(i).fx,'message');}
});
test('every new character and sound key resolves to a packaged file',async()=>{
  const used=new Set();
  for(let i=0;i<286;i++){
    const cue=at(i);for(const actor of cue.actors)used.add(actor.asset);
    for(const key of ['backgroundAsset','cg','ambience','music','fx'])if(cue[key])used.add(cue[key]);
  }
  for(const key of used){assert.ok(EP1_ASSETS[key],key);assert.ok((await stat(new URL(EP1_ASSETS[key],import.meta.url))).size>0,key);}
});
