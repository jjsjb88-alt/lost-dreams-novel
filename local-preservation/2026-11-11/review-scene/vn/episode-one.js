const SCENES = [
  [0,'눈을 뜨기 전','서인은 매일 아침 자신이 얼마나 행복했는지 숫자로 확인했다.','room',null],
  [12,'빌린 바다','방금 전까지 바다에 있었다.','coast','musicSea'],
  [19,'내가 좋아하냐고','“모노.”','room',null],
  [30,'같은 색의 바다','주방에서는 어머니가 합성 달걀을 굽고 있었다.','pan','musicTable'],
  [39,'기억나지 않는 이름','어머니가 접시에 달걀을 옮기며 물었다.','pan','musicTable'],
  [58,'먹을 때 돈 보지 마','식탁 모서리에 이번 달 가계 정산이 떠 있었다.','room','musicTable'],
  [74,'꿈에서 퇴근한 사람들','지하철에는 출근하는 사람보다 먼저 꿈에서 퇴근한 사람들이 가득했다.','train',null],
  [86,'하고 싶은 것','회사에 도착하자 모노가 일정을 정리했다.','office',null],
  [101,'맞은편의 웃음','맞은편에서 웃음소리가 났다.','office','musicTable'],
  [118,'두 번의 승인','“이게 뭐야?”','office','musicChoice'],
  [144,'사이에 끼어든 목소리','모노가 즉시 끼어들었다.','office',null],
  [152,'세 번의 알아','“너희 아버지 치료는?”','office',null],
  [172,'노란색의 오후','그날 오후 지우의 사내 위험도 지표가 녹색에서 노란색으로 바뀌었다.','office',null],
  [182,'내가 만든 거래','퇴근할 때 지우가 작은 상자를 건넸다.','office','musicChoice'],
  [196,'23:48','밤 11시 48분.','room','musicSea'],
  [207,'내가 원했던 것','“모노.”','room',null],
  [233,'선택은 언제나 자유입니다','서인은 승인창을 바라봤다.','room','musicChoice'],
  [251,'자신과 단둘이','아침의 바다가 떠올랐다.',null,null],
];
const validated = new WeakMap();
const actor = (id,asset,side,gaze,pose) => ({id,asset,side,gaze,pose,name:{seoin:'서인',mother:'어머니',jiwoo:'지우'}[id]});
export const EPISODE_ONE_SCENES = SCENES.map(([index,title])=>({index,title}));
export function episodeOneDirection(chapter,index) {
  if(chapter?.id!=='1'||!Number.isInteger(index)||index<0||index>=263)return null;
  if(!validated.has(chapter))validated.set(chapter,chapter.beats?.length===263&&SCENES.every(([i,,text])=>chapter.beats[i]?.text===text));
  if(!validated.get(chapter))return null;
  const row=SCENES.findLast(([start])=>start<=index),[start,title,,ambience,music]=row,beat=chapter.beats[index];
  const out={chapterId:'1',index,sceneStart:start,title,ambience,music,actors:[],focus:beat.speaker||'',cg:null,shot:'wide',intro:index<8,blackout:index>=256,silence:index>=256,hideLegacyVisual:true,document:null,wallAd:false,fx:null,gap:0,closeFinance:index>=61&&index<=73,timeOfDay:index>=196?'night':'morning'};
  out.background=index<30?'room':index<74?'kitchen':index<86?'train':index<196?'office':'room';
  out.backgroundAsset=['room','kitchen'].includes(out.background)?(index>=196?'homeNight':'homeMorning'):null;
  out.place=index>=12&&index<=18?'광고꿈의 잔상':index<30?'서인의 방':index<74?'서인의 집 · 아침':index<86?'출근 열차':index<196?'회사':'서인의 방 · 밤';
  if(index>=19&&index<30)out.actors=[actor('seoin','seoinWaking','right','right','question')];
  if(index>=30&&index<74){
    out.actors=[actor('seoin',index>=57?'seoinWaking':'seoinHome','left',index>=57?'aside':'right',index>=57?'withdrawn':'seated'),actor('mother',index>=61?'motherCare':index>=54?'motherSearching':'motherWarm','right',index>=54?'aside':'left','seated')];
    out.wallAd=index>=32&&index<=38;
    if(index<39)out.actors=out.actors.filter(p=>p.id!=='mother');
    if(index===56||index===57){out.music=null;out.ambience='room';out.shot='close';}
    if(index>=68&&index<=69){out.cg='table';out.actors=[];out.shot='detail';}
  }
  if(index>=74&&index<86)out.actors=[actor('seoin','seoinStanding','left','right','standing')];
  if(index>=86&&index<101)out.actors=[actor('seoin','seoinQuestion','left','right','seated')];
  if(index>=101&&index<182){
    const wounded=index>=153&&index<=165,firm=index>=136&&index<153;
    out.actors=[actor('seoin',index>=118?'seoinWorry':'seoinQuestion','left',index>=118?'right':'right',index>=118?'lean':'seated'),actor('jiwoo',wounded?'jiwooWounded':firm?'jiwooFirm':'jiwooTease','right',wounded?'down':firm?'left':'screen','seated')];
    if(index>=117&&index<=143)out.document={phase:index>=126?'red':index>=123?'amber':'plain',showRisks:index>=124};
    if(index>=134&&index<=143){out.shot='close';out.actors[0].asset='seoinAngry';}
    if(index>=152&&index<=171)out.shot='close';
  }
  if(index>=182&&index<196){
    out.actors=[actor('jiwoo','jiwooRelaxed','right','left','standing')];
    if(index>=185){out.cg='clay';out.actors=[];out.shot='detail';}
  }
  if(index>=196&&index<251){
    out.actors=[actor('seoin','seoinRecliningHome','left','up','reclining')];out.shot='close';
    if(index>=202&&index<=206||index>=233&&index<=250){out.cg='night';out.actors=[];out.shot='detail';}
    if(index>=214&&index<=223||index>=231&&index<=232){out.music=null;out.ambience=null;}
    if(index>=244){out.music=null;out.ambience=null;}
  }
  if(index>=12&&index<=18){out.cg='sea';out.shot=index>=15?'absence':'wide';}
  out.holdMotion=index===56||index===57||index>=153&&index<=161||index>=251;
  if(index>=251&&index<=255){out.cg=index===252?'clay':index===253?'table':'sea';out.shot='recollection';}
  if(out.blackout){out.cg=null;out.actors=[];out.music=null;out.ambience=null;out.document=null;out.wallAd=false;}
  if(out.intro){out.actors=[];out.music=null;out.shot='eyes-closed';}
  const effects={4:'approval',30:'pan',39:'dishes',61:'bedding',68:'dishes',122:'approval',123:'amber',125:'approval',126:'red',146:'release',182:'box',185:'box',202:'bedding',244:'bedding',245:'release'};
  out.fx=effects[index]||null;
  if(index===26)out.gap=.3;
  if(index===98||index===215)out.gap=.8;
  return out;
}
