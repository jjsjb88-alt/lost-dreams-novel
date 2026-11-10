import { episodeTwoDirection, episodeTwoSpeaker, isEpisodeTwo } from './episode-two.js?v=ep12-20261019-r3';
import { presentationForBeat } from './neural-cues.js?v=ep12-20261019-r3';
const RANGES=new Map([[0,2],[3,4],[16,19],[25,27],[37,38],[44,47],[50,51],[58,60],[62,64],[65,66],[67,69],[70,72],[79,81],[85,86],[90,91],[95,96],[119,121],[122,123],[130,131],[135,136],[138,139],[148,150],[151,152],[169,172],[173,174],[183,186],[206,206],[224,227],[228,229],[233,234],[235,237],[240,243],[250,252],[253,256],[257,259],[272,274],[275,277],[278,279],[281,282]]);
const pages=new WeakMap();
const state=cue=>JSON.stringify([cue.sceneStart,cue.actors,cue.cg,cue.shot,cue.music,cue.ambience,cue.backgroundAsset,cue.holdMotion]);
function pageMap(chapter){
  if(!isEpisodeTwo(chapter))return null;
  if(pages.has(chapter))return pages.get(chapter);
  const map=new Map();
  for(let start=0;start<286;){
    const first=chapter.beats[start],cue=episodeTwoDirection(chapter,start);let end=start;
    if(!first.choice&&!presentationForBeat(chapter,first,start))for(let i=start+1;i<=(RANGES.get(start)??start);i++){
      const beat=chapter.beats[i],next=episodeTwoDirection(chapter,i);
      if(beat.choice||next.fx||next.gap||presentationForBeat(chapter,beat,i)||state(next)!==state(cue))break;
      end=i;
    }
    for(let i=start;i<=end;i++)map.set(i,{start,end});
    start=end+1;
  }
  pages.set(chapter,map);return map;
}
export function episodeTwoReadingPage(chapter,index){
  if(!Number.isInteger(index))return null;const range=pageMap(chapter)?.get(index);if(!range)return null;
  const entries=chapter.beats.slice(index,range.end+1).map((beat,offset)=>({...beat,index:index+offset,speaker:episodeTwoSpeaker(chapter,index+offset)}));
  const speakers=new Set(entries.filter(b=>b.speaker).map(b=>b.speaker));
  const labelLines=entries.length>1&&!(entries.every(b=>b.kind==='dialogue')&&speakers.size===1);
  return{start:index,end:range.end,entries,text:entries.map(b=>labelLines&&b.speaker?`${b.speaker} · ${b.text}`:b.text).join('\n'),speaker:labelLines?'':entries[0].speaker||'',focus:entries.findLast(b=>b.speaker)?.speaker||''};
}
export function episodeTwoPreviousPage(chapter,index){
  const map=pageMap(chapter),current=map?.get(index);if(!current||index===0)return null;
  return index>current.start?current.start:map.get(index-1).start;
}
