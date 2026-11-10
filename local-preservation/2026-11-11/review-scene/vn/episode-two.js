// Presentation only. The source beats and all save coordinates stay unchanged.
const SCENES = [
  [0,'광고 없는 아침','광고 없이 잔 첫날, 서인은 아무 꿈도 꾸지 않았다.'],
  [20,'오늘은 켜','주방에 나가자 어머니가 그를 보자마자 물었다.'],
  [48,'계산해야 하는 자유','어머니는 잠시 고민하더니 의자를 빼 앉았다.'],
  [62,'계산표','출근길 내내 그 말이 따라왔다.'],
  [65,'지우의 빈자리','회사에 도착하자 지우 자리는 비어 있었다.'],
  [82,'초대','점심시간이 조금 지났을 때 메시지가 왔다.'],
  [85,'부른 사람','지우의 집이었다.'],
  [90,'팔목의 포트','거실에 중년 남자가 앉아 있었다.'],
  [97,'붉어지는 숫자','지우 광고꿈 중단: 월 -327 TOKEN.  \n퇴직 후 예상 소득: -43%.  \n가족 의료 플랜 갱신 비용: +16%.  \n차녀 교육 AI 등급 유지 가능성: 38%.'],
  [107,'팔짱','지우가 팔짱을 꼈다.'],
  [124,'한 달만','“한 달만.”'],
  [135,'내가 없잖아','지우는 오래 대답하지 않았다.'],
  [144,'꺼진 화면','아버지는 한동안 붉은 숫자만 바라봤다.'],
  [151,'제자리인 대화','집을 나선 뒤 둘은 한동안 말없이 걸었다.'],
  [173,'찌그러진 점토','지우가 주머니에서 작은 것을 꺼냈다.'],
  [190,'기억나지 않는 꿈','웃음이 사라졌다.'],
  [198,'알고 포기하기','지우가 점토를 주머니에 넣었다.'],
  [206,'사용자의 몫','그날 저녁 모노는 지우와의 만남을 분석했다.'],
  [223,'다시 켠 광고','침대에 누웠다.'],
  [232,'지나치게 아름다운 바다','바다가 펼쳐졌다.'],
  [240,'너 지우 아니지','서인은 멈췄다.'],
  [257,'대답 없는 이름','“모노.”'],
  [266,'03:17','눈을 뜨자 새벽 3시 17분이었다.'],
  [278,'03:24','새벽 3시 24분.'],
];
const validated = new WeakMap();
function sourceFingerprint(chapter){
  let hash=2166136261;
  for(const character of chapter.beats.map(b=>b.text).join('\u001f'))for(let i=0;i<character.length;i++)hash=Math.imul(hash^character.charCodeAt(i),16777619)>>>0;
  return hash.toString(16);
}
const voices = new Map();
const voice = (name, indices) => indices.forEach(index => voices.set(index, name));
voice('서인',[10,12,14,23,28,30,34,36,40,42,45,54,56,88,93,155,157,159,161,165,167,175,177,181,184,188,192,200,202,208,210,213,215,217,220,244,257,260,262,270]);
voice('어머니',[21,24,29,31,33,35,39,41,43,46,49,52,55,57,59,61]);
voice('지우',[87,89,101,103,108,110,116,124,126,128,133,137,141,143,153,156,158,160,162,164,166,168,170,176,178,180,182,185,187,189,191,193,195,197,199,201,203,205]);
voice('지우 아버지',[92,94,99,102,104,106,109,111,113,115,117,127,129,132,134,142,145,147]);
voice('옆자리 직원',[67,69]); voice('다른 직원',[70,72]);
voice('동료들',[73,74,76,77,78]); voice('광고 속 지우',[239]);
export const EPISODE_TWO_SCENES = SCENES.map(([index,title]) => ({index,title}));
export function isEpisodeTwo(chapter) {
  if(chapter?.id!=='2')return false;
  if(!validated.has(chapter))validated.set(chapter,chapter.beats?.length===286&&sourceFingerprint(chapter)==='f4703a55'&&SCENES.every(([i,,text])=>chapter.beats[i]?.text===text));
  return validated.get(chapter);
}
export function episodeTwoSpeaker(chapter,index) {
  return isEpisodeTwo(chapter) ? voices.get(index) || chapter.beats[index]?.speaker || '' : chapter?.beats?.[index]?.speaker || '';
}
const actor=(id,asset,side,gaze,pose,name)=>({id,asset,side,gaze,pose,name:name||{seoin:'서인',mother:'어머니',jiwoo:'지우',father:'지우 아버지'}[id]});
export function episodeTwoDirection(chapter,index) {
  if(!isEpisodeTwo(chapter)||!Number.isInteger(index)||index<0||index>=286)return null;
  const [start,title]=SCENES.findLast(([i])=>i<=index);
  const out={chapterId:'2',index,sceneStart:start,title,actors:[],focus:episodeTwoSpeaker(chapter,index),background:'room',backgroundAsset:'homeMorning',timeOfDay:'morning',place:'서인의 방 · 다음 날 아침',ambience:'room',music:null,fx:null,gap:0,cg:null,shot:'wide',intro:false,blackout:false,silence:false,document:null,wallAd:false,closeFinance:false,dream:false,holdMotion:false};
  if(index<20)out.actors=[actor('seoin','seoinWaking','left','right','seated')];
  if(index>=20&&index<62){
    out.background='kitchen';out.place='서인의 집 · 아침';
    out.actors=[actor('seoin','seoinHome','left','right',index>=52?'tense':'seated'),actor('mother','motherCare','right',index>=48?'down':'left',index>=48?'withdrawn':'seated')];
    if(index>=28&&index<37)out.music='musicTable';
    if(index>=48)out.shot='close';
  }
  if(index>=62&&index<65){out.background='train';out.backgroundAsset=null;out.place='출근길';out.ambience='train';out.actors=[];}
  if(index>=65&&index<85){out.background='office';out.backgroundAsset=null;out.place='회사 · 지우의 빈자리';out.ambience='office';out.actors=[actor('seoin','seoinQuestion','left','right','seated')];}
  if(index>=85&&index<151){
    out.background='kitchen';out.backgroundAsset=null;out.timeOfDay='day';out.place='지우의 집 · 거실';
    out.actors=index<90?[actor('jiwoo','jiwooGuarded','right','left','guarded')]:[
      actor('father',index>=138?'fatherDown':'fatherAppeal','left',index>=138?'down':'right',index>=138?'withdrawn':'appeal'),
      actor('jiwoo',index>=135?'jiwooUnsteady':'jiwooGuarded','right',index>=135?'down':'left',index>=135?'withdrawn':'guarded')
    ];
    if(index>=111&&index<119){out.shot='close';out.actors[0].pose='insistent';}
    if(index>=135){out.shot='close';out.holdMotion=true;}
    if(index>=144){out.actors=[actor('father','fatherDown','center','down','withdrawn')];out.shot='close';}
  }
  if(index>=151&&index<206){
    out.background='streetday';out.backgroundAsset=null;out.timeOfDay='day';out.place='지우의 집 앞 · 오후';out.ambience='street';
    const asset=index>=173&&index<190?'jiwooClay':index>=190&&index<198?'jiwooUnsteady':index>=169?'jiwooRelaxed':'jiwooGuarded';
    out.actors=[actor('seoin','seoinStanding','left','right','standing'),actor('jiwoo',asset,'right',index>=173&&index<198?'down':'left',index>=173&&index<190?'offering':index>=190&&index<198?'withdrawn':'standing')];
    if(index>=173&&index<190)out.music='musicTable';
    if(index>=190&&index<198){out.shot='close';out.holdMotion=true;}
  }
  if(index>=206){out.timeOfDay='night';out.backgroundAsset='homeNight';out.place='서인의 방 · 밤';out.ambience='nightRoom';out.actors=[actor('seoin','seoinWaking','left','right','seated')];out.shot='close';}
  if(index>=218&&index<=222){out.music=null;out.ambience=null;out.holdMotion=true;}
  if(index>=223&&index<232){out.cg='night';out.actors=[];out.music=null;}
  if(index>=232&&index<266){
    out.background='dream';out.backgroundAsset=null;out.place='광고꿈 · 소중한 사람과 떠나는 휴양지';out.cg='dreamBeach';out.dream=true;out.timeOfDay='dream';out.shot='wide';out.ambience='coast';out.music='musicSea';
    // The latest remote CG already contains Jiwoo. Do not paint a second
    // portrait over her, or cover that work with the earlier generic sea CG.
    out.actors=[];
    if(index>=240){out.music='musicChoice';out.holdMotion=true;out.shot='unease';}
    if(index>=257){out.music=null;out.ambience=null;out.shot='trapped';out.hardCut=index===257;}
  }
  if(index>=266){
    out.hardCut=index===266;
    out.place=index>=278?'서인의 방 · 새벽 3시 24분':'서인의 방 · 새벽 3시 17분';
    out.actors=[actor('seoin',index<276?'seoinStartled':'seoinRelief','left',index<276?'right':'down',index<276?'startled':'seated')];
    out.music=null;out.ambience=index<271?'heartbeat':null;out.holdMotion=index>=271;
  }
  if(index>=278){out.actors=[];out.shot='message';}
  const effects={20:'dishes',83:'message',95:'tablet',97:'amber',146:'tablet',173:'box',198:'box',222:'release',230:'approval',264:'amber',266:'release',269:'red',270:'release',280:'message',283:'message',285:'message'};
  out.fx=effects[index]||null;
  return out;
}
