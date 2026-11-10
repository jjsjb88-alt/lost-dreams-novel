import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {presentationForBeat} from './neural-cues.js';
const box={window:{}};
vm.runInNewContext(await fs.readFile(new URL('./story-data.js',import.meta.url),'utf8'),box);
const story=JSON.parse(JSON.stringify(box.window.STORY));
const ids=['19','19-1','19-2','20','20-1','21','21-1','22'];
const chapter=id=>story.chapters.find(c=>c.id===id);
const atText=(id,text)=>chapter(id).beats.find(b=>b.text.includes(text));

test('mixed sequence includes every manuscript paragraph once, with current titles and source lines',async()=>{
 const offset=story.chapters.findIndex(c=>c.id==='19');
 assert.deepEqual(story.chapters.slice(offset,offset+ids.length).map(c=>c.id),ids);
 for(const id of ids){
  const c=chapter(id),md=await fs.readFile(new URL('../'+c.sourcePath,import.meta.url),'utf8');
  assert.equal(c.title,md.split(/\r?\n/)[0].replace(/^#\s*/,''));
  const paragraphs=md.replace(/^# .*\r?\n/,'').split(/\n\s*\n/).map(s=>s.trim()).filter(s=>s&&s!=='***').map(s=>s.replaceAll('**',''));
  assert.deepEqual(c.beats.map(b=>b.text),paragraphs,id+' paragraph coverage');
  for(const b of c.beats){
   assert.equal(md.split(/\r?\n/).slice(b.sourceLine-1,b.endLine).join('\n').replaceAll('**',''),b.text,id+':'+b.sourceLine);
   if(b.kind==='dialogue')assert(b.speaker,id+':'+b.sourceParagraph+' missing speaker');
   assert(story.assets[b.scene],id+' missing background');
  }
 }
});

test('interview, lunch call, rooftop and hospital keep the people in their actual spaces',()=>{
 assert.equal(atText('19','의심할 자격을 준 것').speaker,'서인');
 assert(!atText('19','의심할 자격을 준 것').direction.cast.some(p=>p.id==='yoonsera'));
 assert.equal(atText('20','말리면 그만둘 거야').speaker,'도윤');
 assert.equal(atText('20','말리면 그만둘 거야').scene,'rooftop');
 assert(atText('20','내가 아침에 싫다고').direction.cast.find(p=>p.id==='jiwoo').remote);
 assert.equal(atText('19-1','확인 중입니다.').speaker,'서인');
 assert.equal(atText('19-2','그럼 원래 하기로 한 일은').speaker,'식품 담당자');
 assert.equal(atText('20-1','병원 끝나고 학교 갈').speaker,'문해린');
 assert.equal(atText('20-1','지난번에도 세 개였어').speaker,'은경의 딸');
 assert.equal(atText('21-1','끝까지 갔어요').speaker,'최은경');
 assert.equal(atText('22','오늘은 셋이 같은 답').speaker,'서인');
 assert(!atText('22','오늘은 셋이 같은 답').direction.cast.some(p=>p.id==='yoonsera'&&!p.remote));
});

test('mixed narration and channel direction retain the secret boundary and real outcome distinctions',()=>{
 const restricted=/야간 (?:인간 )?인지 공급|인지 부하 완화|저부하 수면|가난한 사람의 뇌|완화 폭|14%|14\s*→\s*8/;
 for(const id of ids){const c=chapter(id);for(const [i,b] of c.beats.entries()){
  assert(!restricted.test(JSON.stringify(b)),id+':'+i);
  const cue=presentationForBeat(c,b,i);if(cue)assert.equal(cue.body,b.text,id+' stale cue');
 }}
 assert(atText('19-1','환불 확인 대기'));
 assert(atText('19-2','추가 작업비: 28 TOKEN'));
 assert(atText('21','정확한 원인은 아직 확인하지 못했습니다'));
 assert(atText('22','다음 날 새벽 1시 12분'));
 assert(atText('22','처음 밤에도 두 분은 같은 답'));
});
