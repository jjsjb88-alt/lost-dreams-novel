import test from 'node:test';
import assert from 'node:assert/strict';
import {preparePerception,communicationReadDelay,sensoryContextForBeat} from './perception.js';
const beats=['수면 정산','기본 광고 +8.1 TOKEN','보너스 +3.4 TOKEN','이후의 답변'];
const chapter={id:'1',beats:beats.map(text=>({text,kind:'system'}))};
const resolve=(c,b,i)=>({id:`${c.id}:${i}`,kind:'system',sender:'정산',title:'수면 정산',body:b.text,primary:true});
test('packet only accumulates visited earlier fragments; never a future fragment',()=>{
 const p=preparePerception(chapter,2,resolve,i=>i>=1);
 assert.deepEqual(p.presentation.history.map(x=>x.body),[beats[1]]);
 assert.equal(p.presentation.body,beats[2]);assert.equal(p.groupId,'1:1:system:정산');
 assert.ok(!JSON.stringify(p).includes(beats[3]));
});
test('new reader jumping into a scene receives no unvisited transcript',()=>{
 assert.deepEqual(preparePerception(chapter,2,resolve,()=>false).presentation.history,[]);
});
test('narration, long text and choice keep the full original at the normal reading surface',()=>{
 for(const b of [{text:'직접 느낀 기억',choice:null},{text:'긴 문장'.repeat(110)},{text:'답을 고른다',choice:{}}]){
  const c={id:'1',beats:[b]};
  const p=preparePerception(c,0,(c,b)=>({...resolve(c,b,0),kind:b.text==='직접 느낀 기억'?'neural':'assistant'}));
  assert.equal(p.primary,false);assert.equal(p.presentation.body,'');assert.equal(p.source.body,b.text);
 }
});
test('a mismatched source body is rejected rather than silently replacing the story',()=>{
 assert.equal(preparePerception(chapter,1,()=>({...resolve(chapter,chapter.beats[1],1),body:'다른 판본'})),null);
});
test('channel and sender boundaries prevent unrelated messages being merged',()=>{
 const p=preparePerception(chapter,2,(c,b,i)=>({...resolve(c,b,i),sender:i===1?'다른 사람':'정산'}));
 assert.deepEqual(p.presentation.history,[]);
});
test('automatic reading leaves time for a complete packet and respects bounded pauses',()=>{
 assert.ok(communicationReadDelay('문장'.repeat(70))>communicationReadDelay('짧은 응답'));
 assert.equal(communicationReadDelay('x'.repeat(10000),50000),18000);
});
test('successive sensory passages remain one contact rather than restarting the arrival cue',()=>{
 const sensory=(c,b,i)=>({...resolve(c,b,i),kind:'neural',primary:false});
 const a=preparePerception(chapter,0,sensory),b=preparePerception(chapter,1,sensory);
 assert.equal(a.groupId,b.groupId);assert.deepEqual(b.presentation.history,[]);
});
test('sensory ambience survives narration but not waking up or merely recalling a dream',()=>{
 const c={id:'2',beats:[
  {text:'바다가 펼쳐졌다.',scene:'dream',direction:{mood:'dream',place:'광고꿈'}},
  {text:'광고가 기억을 학습했다.',scene:'dream',direction:{mood:'dream',place:'광고꿈'}},
  {text:'눈을 떴다.',scene:'room',direction:{mood:'quiet',place:'방'}},
  {text:'바다가 떠올랐다.',scene:'dream',direction:{mood:'dream',place:'광고꿈'}},
 ]};
 const resolve=(c,b,i)=>i===0?{kind:'neural'}:null;
 assert.equal(sensoryContextForBeat(c,1,resolve),true);
 assert.equal(sensoryContextForBeat(c,2,resolve),false);
 assert.equal(sensoryContextForBeat(c,3,resolve),false);
});
