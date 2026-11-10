import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
const file='vn/story-data.js',original=fs.readFileSync(file,'utf8');
const box={window:{}};vm.runInNewContext(original,box);const story=box.window.STORY;
const groups=JSON.parse(fs.readFileSync('loop/.runtime/scene-mix-20261020/speakers.json','utf8'));
const ids=Object.keys(groups),clone=v=>JSON.parse(JSON.stringify(v));
const actors={'서인':'seoin','강연우':'yeonwoo','윤세라':'yoonsera','도윤':'doyun','지우':'jiwoo','하경':'hakyung','백윤하':'yoonha','최은경':'eunkyung','문해린':'haerin'};
Object.assign(actors,{"배차 담당":"dispatcher","식품 담당자":"foodstaff","공동주방 고객":"kitchen-customer","식당 담당자":"canteen-staff","작업대 직원":"workbench-staff","원격 참석자":"committee-member","은경의 딸":"eunkyung-child","해린의 아이":"haerin-child","정산 담당자":"settlement","운영 담당자":"operations","이용자":"subscriber","의료 운영 담당자":"medical-operations","병원 예약 담당자":"hospital-reservations","구조 대상자":"rescuee","청년":"young-man","아이":"child","노인":"elder","마정훈":"majeonghun"});
const actor=(name,remote=false)=>({id:actors[name]||name,name,side:name==='서인'?'left':'right',...(remote?{remote:true}:{})});
const specs={
'19':[['meeting','윤세라와의 면담',['서인','윤세라','강연우']],['meeting','노드 31-B · 복제 검증',['서인','윤세라','강연우']],['meeting','동부 27번 · 실제 요청에 대한 의견',['서인','윤세라','강연우']],['corporate','면담실 밖 복도',['서인','강연우']],['office','감사 준비 자료',['서인','강연우']]],
'19-1':[['depot','냉장동 3번 문',['서인','배차 담당']],['office','물류기지 배차실',['서인','식품 담당자','배차 담당']],['office','배차실 · 공동주방과의 통화',['서인','식품 담당자','배차 담당']],['office','확정된 주문부터',['서인','식품 담당자','배차 담당']],['depot','냉장차가 떠난 출고장',['서인','식품 담당자','배차 담당']]],
'19-2':[['depot','소비 기한이 끝나는 식품',['서인','식품 담당자']],['kitchen','직원 식당 · 저녁 메뉴',['서인','식당 담당자']],['depot','가격과 다음 거래',['서인','식품 담당자']],['depot','식재료와 준비 작업',['서인','식품 담당자']],['depot','작업비와 부서의 시간',['서인','식품 담당자','식당 담당자']],['depot','함께 옮기는 두부',['서인','작업대 직원']],['depot','남아 있는 손실',['서인','식품 담당자']],['kitchen','자기 몫의 저녁',['서인','배차 담당','작업대 직원','식품 담당자']]],
'20':[['corporate','감사실 앞 복도',['서인','윤세라','강연우']],['meeting','중단 권한 감사',['서인','윤세라','강연우']],['meeting','전체망 중단 · 검토용 복제',['서인','윤세라']],['corporate','점심시간 · 지우와 통화',['서인']],['meeting','72시간 보호와 남은 신청',['서인','윤세라']],['corporate','제한 승인 통지',['서인','윤세라','강연우']]],
'20-1':[['kitchen','은경의 집',['최은경','은경의 딸']],['kitchen','해린의 집',['문해린','해린의 아이']],['room','은경이 고른 광고꿈',['최은경']],['room','아이의 치료를 기다리는 밤',['문해린']],['room','서로 다른 두 알람',[]]],
'21':[['meeting','04-771 · 서로 다른 두 금액',['서인','윤세라']],['meeting','오늘 밤의 계약 변경',['서인','윤세라','강연우','정산 담당자']],['meeting','별도로 들어온 의료 지연',['서인','윤세라','강연우']],['meeting','문해린과의 통화',['서인']],['meeting','일곱 병원과 남은 정산',['서인','윤세라','강연우']],['meeting','완료와 미결',['서인','윤세라','강연우']],['meeting','아침의 보고',['서인','윤세라','강연우']]],
'21-1':[['dreamtower','기울어지는 송출탑',['최은경']],['dreamtower','열한 번째 사람까지',['최은경']],['dreamtower','마지막 한 사람',['최은경','노인']],['room','여섯 시 십이 분의 아침',['최은경','은경의 딸']]],
'22':[['hospital','다음 날 새벽 · 검사실 앞',['서인','백윤하','마정훈']],['meeting','전날 아침 · 한밤의 지원 제안',['서인','백윤하','강연우']],['meeting','권한 확대에 대한 반대',['서인','백윤하']],['meeting','기업 의료 예비량 지원',['서인','백윤하','강연우']],['hospital','계약한 네 번째 검증',['서인','백윤하','마정훈']],['hospital','같이 기다리는 사람들',['서인','백윤하','마정훈']],['hospital','약속보다 늦게 열린 문',['서인','백윤하','마정훈']],['office','남아 있는 반대 의견',['서인','백윤하','강연우']]]
};
function parse(md){let section=0,start=-1,lines=[],paragraph=0,out=[];const flush=end=>{if(!lines.length)return;const raw=lines.join('\n');out.push({text:raw.replaceAll('**',''),kind:raw.startsWith('“')?'dialogue':raw.startsWith('〈')||/^\*\*[\s\S]*\*\*$/.test(raw)?'system':'narration',sourceLine:start+1,endLine:end,sourceParagraph:paragraph++,section});lines=[];};const all=md.split(/\r?\n/);for(let i=0;i<all.length;i++){const line=all[i];if(i===0&&line.startsWith('# '))continue;if(!line.trim()){flush(i);continue;}if(line.trim()==='***'){flush(i);section++;continue;}if(!lines.length)start=i;lines.push(line);}flush(all.length);return out;}
const report=[];
for(const id of ids){const c=story.chapters.find(c=>c.id===id),old=c.beats,md=fs.readFileSync(c.sourcePath,'utf8'),parsed=parse(md);const byText=new Map();for(const b of old){const list=byText.get(b.text)||[];list.push(b);byText.set(b.text,list);}
 const assigned=new Map();for(const [speaker,indices] of Object.entries(groups[id]))for(const i of indices){if(assigned.has(i))throw Error('Duplicate speaker '+id+':'+i);if(parsed[i]?.kind!=='dialogue')throw Error('Not dialogue '+id+':'+i);assigned.set(i,speaker);}
 c.title=md.split(/\r?\n/)[0].replace(/^#\s*/, '');c.continuity='scene-mix-20261020';
 c.beats=parsed.map(b=>{let [scene,place,names]=specs[id][b.section]||[];if(!scene)throw Error('Missing scene '+id+':'+b.section);
  const roof=id==='20'&&b.sourceParagraph>=179;if(roof){scene='rooftop';place='아르카디아 옥상';names=['서인','도윤'];}
  const speaker=b.kind==='dialogue'?(assigned.get(b.sourceParagraph)|| (id==='21-1'?'최은경':id==='20-1'?null:'서인')):b.text.startsWith('〈')?'모노':'';if(speaker===null)throw Error('Unassigned '+id+':'+b.sourceParagraph);
  const cast=names.map(n=>actor(n));if(speaker&&speaker!=='모노'&&!names.includes(speaker)){const remote=(id==='19'&&['하경','배차 담당'].includes(speaker))||(id==='19-1'&&['강연우','공동주방 고객'].includes(speaker))||(id==='19-2'&&speaker==='강연우')||(id==='20'&&(['원격 참석자','식품 담당자','지우'].includes(speaker)||(roof&&speaker==='강연우')))||(id==='21'&&['문해린','이용자','병원 예약 담당자','의료 운영 담당자'].includes(speaker))||(id==='22'&&(speaker==='윤세라'||(speaker==='마정훈'&&b.section===3)));cast.push(actor(speaker,remote));}
  const oldCandidates=byText.get(b.text)||[],match=oldCandidates.shift();
  let visual=match?.direction?.visual?clone(match.direction.visual):null;
  if(visual&&/야간 (?:인간 )?인지 공급|인지 부하 완화|저부하 수면|가난한 사람의 뇌|완화 폭|14%|14.*8/.test(JSON.stringify(visual)))visual=null;
  const mood=id==='21-1'&&b.section<3?'dream':(id==='19-2'&&b.section===7)||(id==='21-1'&&b.section===3)?'warm':'quiet';
  const music=id==='21-1'?'silence':scene==='kitchen'||scene==='room'?'home':scene==='rooftop'?'warm':'city';
  return {...b,speaker,scene,portrait:actors[speaker]||'',direction:{place,mood,camera:b.kind==='dialogue'?'close':'wide',cast,focus:actors[speaker]||speaker||actors[names[1]]||actors[names[0]]||'',visual,music}};
 });
 report.push({id,title:c.title,sourceParagraphs:parsed.length,dialogues:c.beats.filter(b=>b.kind==='dialogue').length,unlabelledDialogues:c.beats.filter(b=>b.kind==='dialogue'&&!b.speaker).length,sourceSections:specs[id].length,oldBeats:old.length});
}
for(const name of ['yoonsera','eunkyung','haerin']){const dest='vn/assets/'+name+'.webp';fs.copyFileSync(path.resolve('../../_recovery/lost-dreams-novel-20261019',dest),dest);story.assets[name]='assets/'+name+'.webp';}
const prefix=original.slice(0,original.indexOf('{'));fs.writeFileSync(file,prefix+JSON.stringify(story,null,2)+';\n');
const cueFile='vn/neural-cues.js',cueSource=fs.readFileSync(cueFile,'utf8'),cueBox={};vm.runInNewContext(cueSource.replaceAll('export function ','function ')+'\nglobalThis.data={AUTHORED,PRESETS};',cueBox);const authored=JSON.parse(JSON.stringify(cueBox.data.AUTHORED));const cueReport=[];
for(const id of ids){const old=authored[id]||[],rows=[],c=story.chapters.find(c=>c.id===id),used=new Set();for(const row of old){const index=c.beats.findIndex((b,i)=>b.text===row[1]&&!used.has(i));if(index>=0){used.add(index);rows.push([index,...row.slice(1)]);}}
 rows.sort((a,b)=>a[0]-b[0]);authored[id]=rows;cueReport.push({id,old:old.length,retained:rows.length,dropped:old.length-rows.length});}
const start=cueSource.indexOf('const AUTHORED = '),end=cueSource.indexOf('\nconst OVERRIDES',start);if(start<0||end<0)throw Error('cue anchor');fs.writeFileSync(cueFile,cueSource.slice(0,start)+'const AUTHORED = '+JSON.stringify(authored,null,2)+';\n'+cueSource.slice(end));
fs.writeFileSync('loop/.runtime/scene-mix-20261020/snapshot-sync.json',JSON.stringify({chapters:report,cues:cueReport},null,2)+'\n');
console.log(JSON.stringify({chapters:report,cues:cueReport},null,2));
