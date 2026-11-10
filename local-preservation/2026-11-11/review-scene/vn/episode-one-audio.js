export function createEpisodeOneAudio(getSettings,assets,{onStatus=()=>{}}={}){
  let context=null,master=null,version=0,current=null,gapTimer=0,lastEffect='';
  const buffers=new Map(),tracks=new Map(),effects=new Set(),voices=new Set(),positions=new Map();
  const allowed=()=>Boolean(getSettings()?.sound)&&!document.hidden;
  const level=()=>Math.min(1,Math.max(0,(Number(getSettings()?.volume)||0)/100));
  function ensure(){
    if(context)return context;const Context=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Context)return null;
    try{context=new Context();master=context.createGain();master.gain.value=level();master.connect(context.destination);return context;}catch{return null;}
  }
  async function load(key){
    if(!assets[key])return null;if(!buffers.has(key))buffers.set(key,fetch(assets[key]).then(r=>{if(!r.ok)throw new Error('음원 파일을 불러오지 못했습니다.');return r.arrayBuffer();}).then(b=>context.decodeAudioData(b)).catch(e=>{buffers.delete(key);console.warn('1화 음원 준비 실패',key,e.message);return null;}));return buffers.get(key);
  }
  function dispose(voice,fade=0){
    if(!voice)return;const now=context?.currentTime||0;
    if(voice.key&&voice.source.loop&&!voice.retired)positions.set(voice.key,(voice.offset+now-voice.startedAt)%voice.source.buffer.duration);
    voice.retired=true;
    try{voice.gain.gain.cancelScheduledValues(now);if(fade){voice.gain.gain.setTargetAtTime(0,now,fade/3);voice.source.stop(now+fade);}else voice.source.stop();}catch{}
  }
  function stop(){version++;current=null;lastEffect='';clearTimeout(gapTimer);for(const v of [...voices])dispose(v);tracks.clear();effects.clear();if(master&&context){master.gain.cancelScheduledValues(context.currentTime);master.gain.setValueAtTime(0,context.currentTime);}onStatus('silent');}
  function source(buffer,loop,volume,key){
    const node=context.createBufferSource(),gain=context.createGain(),offset=loop?(positions.get(key)||0)%buffer.duration:0;
    node.buffer=buffer;node.loop=loop;gain.gain.value=0;node.connect(gain);gain.connect(master);
    const voice={source:node,gain,key,offset,startedAt:context.currentTime,retired:false};voices.add(voice);
    node.onended=()=>{voices.delete(voice);effects.delete(voice);try{node.disconnect();gain.disconnect();}catch{}if(!tracks.size&&!effects.size)onStatus('silent');};
    node.start(0,offset);gain.gain.setTargetAtTime(volume,context.currentTime,.45);return voice;
  }
  async function unlock(){const ctx=ensure();if(!ctx){onStatus('unavailable');return false;}try{await ctx.resume();onStatus(ctx.state==='running'?'ready':'blocked');return ctx.state==='running';}catch{onStatus('blocked');return false;}}
  async function render(cue,{quiet=false}={}){
    if(!cue||cue.silence||!allowed()){stop();return;}
    if(!context||context.state!=='running')return;
    if(cue.hardCut&&!quiet)stop();
    const serial=++version,valid=()=>serial===version&&allowed();
    current=`${cue.music||''}:${cue.ambience||''}`;clearTimeout(gapTimer);
    master.gain.setTargetAtTime(level(),context.currentTime,.08);
    const desired=[['music',cue.music,.46],['ambience',cue.ambience,.76]];
    const trackWork=Promise.all(desired.map(async([bus,key,gain])=>{
        const prior=tracks.get(bus);if(prior?.key===key)return;if(prior){dispose(prior,1.4);tracks.delete(bus);}
        if(key){const buffer=await load(key);if(!valid()||!buffer)return;const v=source(buffer,true,gain,key);tracks.set(bus,v);}
    }));
    if(cue.gap&&!quiet){master.gain.setTargetAtTime(0,context.currentTime,.015);clearTimeout(gapTimer);const serial=version;gapTimer=setTimeout(()=>{if(serial===version&&allowed())master.gain.setTargetAtTime(level(),context.currentTime,.06);},cue.gap*1000);}
    const effectKey=`${cue.chapterId||'1'}:${cue.index}:${cue.fx||''}`;
    if(!quiet&&cue.fx&&effectKey!==lastEffect){
      lastEffect=effectKey;const buffer=await load(cue.fx);if(!valid()||!buffer)return;
      while(effects.size>=3){const old=effects.values().next().value;dispose(old);effects.delete(old);}
      const v=source(buffer,false,.8,cue.fx);effects.add(v);
    }
    await trackWork;
    if(valid())onStatus(tracks.size||effects.size?'playing':'silent',{music:tracks.get('music')?.key||'',ambience:tracks.get('ambience')?.key||''});
  }
  async function prime(){if(!ensure())return;await Promise.all(Object.keys(assets).filter(key=>/\.(mp3|ogg|wav)$/.test(assets[key])).map(load));}
  function setVolume(){if(master&&context)master.gain.setTargetAtTime(allowed()&&current?level():0,context.currentTime,.08);}
  function reset(){stop();positions.clear();}
  return{unlock,render,stop,reset,prime,setVolume};
}
