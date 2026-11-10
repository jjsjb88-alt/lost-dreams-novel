/* 소설의 사실은 원고에만 둔다. 여기의 그림은 이미 읽은 소품의 흔적이다. */
const ReadingEffects=(()=>{
 const $=id=>document.getElementById(id),mq=matchMedia('(prefers-reduced-motion: reduce)');
 const read=(key,fallback)=>{try{return localStorage.getItem(key)??fallback}catch{return fallback}};
 const write=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
 let enabled=!mq.matches&&read('lost-dreams-effects','on')!=='off',sound=false,ctx=null,fan=null,observer=null;
 const assets=new Map(),heard=new Set();
 const inlineIds=new Set(['ldx-meal','bakesign','redcell','wedlog','seventhpot','eggmath','walkmin','twopots','verdict','losingbid','netbundle','views38','ldx-crosswalk','ldx-unsettled','ldx-cursorcell','ldx-claymark']);
 const svg=(body,box='0 0 260 150')=>'<svg viewBox="'+box+'" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.5">'+body+'</svg>';
 const cup=()=>svg('<path d="M88 32 Q130 22 171 33 L159 116 Q130 129 100 113 Z"/><path d="M171 46 C203 38 203 85 166 87"/>');
 const bread=()=>svg('<path d="M55 107 Q47 57 91 40 Q125 17 162 47 Q195 66 183 108 Z"/><path d="M84 53 L101 77 M114 44 L132 70 M146 53 L163 79"/>');
 const ship=()=>svg('<path d="M37 95 L111 47 L192 71 L216 102 L122 108 Z"/><path d="M102 61 L136 88 M70 97 L93 120 M181 96 L175 120"/>');
 const rings=()=>svg('<ellipse cx="77" cy="77" rx="38" ry="19" opacity=".65"/><ellipse cx="180" cy="77" rx="38" ry="19" class="ldx-removed"/><path d="M158 74 Q180 55 201 74" class="ldx-removed"/>');
 const pots=()=>'<div class="ldx-pots">'+Array.from({length:12},(_,i)=>'<i'+([5,6].includes(i)?' class="empty"':'')+'></i>').join('')+'</div>';
 const paths=()=>svg('<path d="M128 90 L45 26 M128 90 L219 31 M128 90 L60 130 M128 90 L215 130"/><circle cx="128" cy="90" r="7"/><circle cx="45" cy="26" r="5"/><circle cx="219" cy="31" r="5"/><circle cx="60" cy="130" r="5"/><circle cx="215" cy="130" r="5"/>');
 const walk=()=>svg('<path d="M126 115 L126 31 M126 115 L37 86 M126 115 L220 87 M126 115 L172 145" opacity=".5"/><rect x="115" y="106" width="22" height="18"/><path d="M114 106 L126 95 L138 106"/><circle cx="126" cy="25" r="5"/><circle cx="32" cy="85" r="5"/><circle cx="225" cy="85" r="5"/><text x="126" y="12" fill="currentColor" stroke="none" text-anchor="middle" font-size="12">병원 · 8분</text><text x="10" y="68" fill="currentColor" stroke="none" font-size="12">시장 · 3분</text><text x="177" y="68" fill="currentColor" stroke="none" font-size="12">약국 · 1분</text><text x="181" y="147" fill="currentColor" stroke="none" font-size="12">위층 · 미경 씨</text>','0 0 285 175');
 function life(id){
  const revised=window.ReaderScenes?.inline(id);if(revised!=null)return revised;
  switch(id){
   case 'ldx-meal':return '<div class="ldx-meal">'+rings()+'</div>';
   case 'bakesign':return '<div class="ldx-sign"><del>매일 엽니다</del><b>일요일은 쉽니다</b></div>';
   case 'redcell':return '<div class="ldx-window"></div>';
   case 'wedlog':return '<div class="ldx-cup">'+cup()+'</div><div class="ldx-time"><i></i><i></i><i></i><i></i></div>';
   case 'seventhpot':return '<div class="ldx-fold"></div>';
   case 'eggmath':return '<div class="ldx-market-bag"><div class="ldx-eggs">'+'<i></i>'.repeat(12)+'</div></div><span class="ldx-change">3.0 − 2.80 = 0.2</span>';
   case 'walkmin':return walk();
   case 'twopots':return pots();
   case 'netbundle':return svg('<path d="M160 45 L50 100 M160 45 L160 100 M160 45 L270 100 M160 45 L160 155" opacity=".5"/><rect x="115" y="18" width="90" height="27"/><text x="160" y="36" text-anchor="middle" fill="currentColor" stroke="none" font-size="12">야간망</text><g fill="currentColor" stroke="none" font-size="11" text-anchor="middle"><text x="50" y="117">광고 수익</text><text x="160" y="117">의료 보조</text><text x="270" y="117">주거 감면</text><text x="160" y="174">가족 TOKEN 정산</text></g>','0 0 320 195');
   case 'ldx-crosswalk':return svg('<path d="M55 50 L195 50 M55 70 L195 70 M55 90 L195 90 M55 110 L195 110" opacity=".25"/><path d="M96 30 Q100 58 96 130 M141 30 Q137 58 141 130" stroke-dasharray="3 18"/>');
   case 'ldx-unsettled':return '<div class="ldx-sign" style="text-align:left;max-width:270px;margin:auto"><span style="font-size:12px;opacity:.6">변경 사유</span><del style="font-size:13px">의료상 필요 · 비용 · 이동 거리 · 보호자 일정</del><b style="font-size:22px">✓ 기타</b></div>';
   case 'ldx-cursorcell':return '<div class="ldx-empty-cell ldx-cursorcell"><i></i></div>';
   case 'ldx-claymark':return svg('<path d="M81 135 L81 54 C81 13 133 13 133 54 L133 135 M139 135 L139 65 C139 25 188 25 188 65 L188 135" stroke-width="2"/><path d="M91 63 L91 45 Q107 31 123 45 L123 63 Q107 73 91 63 Z M149 75 L149 56 Q164 42 179 56 L179 75 Q164 84 149 75 Z"/><path d="M93 63 Q108 72 122 63 M151 75 Q165 82 178 75" stroke="#bd8a5f" stroke-width="5"/><text x="130" y="158" fill="currentColor" stroke="none" text-anchor="middle" font-size="12">두 번 씻은 뒤 · 손톱 밑</text>','0 0 260 175');
   case 'losingbid':return '<div class="ldx-contenders"><div><b>아르카디아</b><span>가격 유지</span></div><div><b>세르젠</b><span>−3.1% · 배송 보증 +7.5%</span></div><div><b>모르바</b><span>철수</span></div></div>';
   default:return null;
  }
 }
 function controls(el){
  if(el.querySelector('.ldx-popup-controls'))return;
  const bar=document.createElement('div');bar.className='ldx-popup-controls';
  const hold=document.createElement('button');hold.type='button';hold.className='ldx-hold';hold.textContent='머물러 보기';
  hold.onclick=e=>{e.stopPropagation();el.classList.add('held');if(!el.classList.contains('fast'))fastForward(el);clearTimeout(state.spCloseT);hold.textContent='천천히 읽기';hold.disabled=true};
  const close=document.createElement('button');close.type='button';close.textContent='본문으로';close.setAttribute('aria-label','연출을 닫고 본문으로 돌아가기');close.onclick=e=>{e.stopPropagation();closeSp()};
  bar.append(hold,close);el.append(bar);
 }
 function apply(){
  document.body.classList.toggle('ldx-off',!enabled);
  const b=$('fxToggle');if(b){b.setAttribute('aria-pressed',String(enabled));$('fxState').textContent=enabled?'연출 켜짐':'본문만'}
  if(!enabled){closeSp(true);document.querySelectorAll('.reveal').forEach(e=>e.classList.add('seen'));stopAudio();}
 }
 function restore(){
  if(observer)observer.disconnect();observer=null;stopAudio();heard.clear();
  document.body.classList.remove('ldx-mono-silent');
  for(const [id,el] of assets){el.className='setpiece';el.removeAttribute('aria-hidden');$('ldx-storage').append(el)}
 }
 function paragraph(ep,text){
  if(ep===30&&text.includes('컵라면으로 73개였다.'))return '<span class="ldx-trace" aria-hidden="true">'+rings()+'</span>';
  return '';
 }
 function mount(){
  apply();
  if(!state.ep||!D[state.ep])return;
  if(observer)observer.disconnect();
  const specs=[D[state.ep],...(D[state.ep].more||[])];
  for(const s of specs){if(!inlineIds.has(s.sp))continue;const el=assets.get(s.sp);if(!el)continue;
   const anchor=[...prose.children].find(p=>p.textContent.includes(s.on));if(!anchor)continue;
   const wasSeen=el.classList.contains('seen'),wasPlayed=el.classList.contains('played');
   el.className='ldx-life reveal '+(s.sp==='wedlog'?'ldx-clay':s.sp==='seventhpot'||s.sp==='bakesign'?'ldx-paper':'ldx-kitchen');
   if(wasSeen)el.classList.add('seen');if(wasPlayed)el.classList.add('played');
   el.setAttribute('aria-hidden','true');anchor.insertAdjacentElement('afterend',el);
  }
  const ep=state.ep;
  observer=new IntersectionObserver(entries=>{for(const e of entries){if(!e.isIntersecting)continue;observer.unobserve(e.target);if(state.ep!==ep)continue;const t=e.target.textContent;
   if((ep===12&&/모노.*꺼|꺼.*모노/.test(t))||(ep===9&&t.includes('시야의 숫자들이 사라졌다')))document.body.classList.add('ldx-mono-silent');
   if(ep===25&&t.includes('프라이팬 소리가 났다'))cue('pan');
   if(ep===25&&t.includes('프라이팬 소리가 멈췄다'))stopAudio();
   if(ep===38&&t.includes('낮게 도는 팬 소리'))cue('fan');
   if(ep===38&&t.includes('돌아오는 버스에서'))stopAudio();
   if(ep===40&&t.includes('패가 담요 끝을 넘어가'))cue('tile');
  }},{threshold:.25});
  for(const p of prose.children)if((ep===12&&/모노.*꺼|꺼.*모노/.test(p.textContent))||(ep===9&&p.textContent.includes('시야의 숫자들이 사라졌다'))||(ep===25&&p.textContent.includes('프라이팬 소리'))||(ep===38&&/낮게 도는 팬 소리|돌아오는 버스에서/.test(p.textContent))||(ep===40&&p.textContent.includes('패가 담요 끝을 넘어가')))observer.observe(p);
 }
 function present(id){const el=assets.get(id);if(!el||!el.classList.contains('ldx-life'))return false;stage(el);el.classList.add('seen','played');if(id==='views38'){const ep=state.ep;state.timers.push(setTimeout(()=>{if(state.ep===ep&&enabled)$('v38N').textContent='41'},1500))}return true}
 function noise(seconds,frequency,gain){
  if(!ctx||ctx.state!=='running')return null;
  const length=Math.round(ctx.sampleRate*seconds),buffer=ctx.createBuffer(1,length,ctx.sampleRate),data=buffer.getChannelData(0);
  for(let i=0;i<length;i++)data[i]=Math.random()*2-1;
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),volume=ctx.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=frequency;volume.gain.value=gain;
  source.connect(filter).connect(volume).connect(ctx.destination);source.start();return {source,volume};
 }
 function cue(kind){
  if(!sound||!enabled||heard.has(kind))return;heard.add(kind);
  if(kind==='fan'){fan=noise(2,230,.028);if(fan)fan.source.loop=true;}
  else if(kind==='pan'){fan=noise(4,2400,.026);if(fan){fan.volume.gain.setValueAtTime(0,ctx.currentTime);fan.volume.gain.linearRampToValueAtTime(.026,ctx.currentTime+.3);fan.volume.gain.linearRampToValueAtTime(0,ctx.currentTime+3.9);}}
  else{const n=noise(.12,1900,.09);if(n){n.volume.gain.setValueAtTime(.09,ctx.currentTime);n.volume.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.12);}}
 }
 function stopAudio(){if(fan){try{fan.source.stop()}catch{}fan=null}}
 function init(){
  const storage=document.createElement('div');storage.id='ldx-storage';storage.hidden=true;document.body.append(storage);
  for(const id of inlineIds){let el=$(id);if(!el&&id.startsWith('ldx-')){el=document.createElement('div');el.id=id;el.className='setpiece'}if(!el)continue;assets.set(id,el);const html=life(id);if(html!==null)el.innerHTML=html;storage.append(el)}
  document.querySelectorAll('.setpiece').forEach(controls);
  for(const id of ['thirdplan','glasspick']){
   const el=$(id);el.classList.add('ldx-human');el.querySelectorAll('.sc-row').forEach((p,i)=>{if(i<2)p.classList.add('ldx-calculation')});
   el.querySelectorAll('.sc-cols .sc-card,.sc-cols3 .sc-card').forEach(p=>p.classList.add('ldx-observation'));
  }
  const dream=$('dreamno'),receipt=document.createElement('div');receipt.className='ldx-dream-cup ldx-cup';receipt.dataset.t='1.6';receipt.innerHTML=cup();dream.querySelector('.sc').insertBefore(receipt,dream.querySelector('.sc-card'));
  const items=document.createElement('div');items.className='ldx-dream-items';items.dataset.t='6.7';items.innerHTML=bread()+ship();dream.querySelector('.sc').append(items);
  dream.querySelectorAll('.sc-cols,.sc-n').forEach(e=>e.classList.add('ldx-dream-receipt'));
  const early=$('twowants').querySelector('svg');if(early){const wrap=document.createElement('div');wrap.className='ldx-cup';wrap.innerHTML=cup();early.replaceWith(wrap)}
  $('erased2').querySelector('.er-box')?.classList.add('ldx-answer-sheet');
  const views=$('views38');if(views){views.innerHTML='<div class="ldx-quiet-input ldx-answer-sheet"><span>엄마한테 물어본다.</span><span>모르겠습니다.</span><span>예.</span></div><div class="ldx-views"><span>하이라이트 조회</span><b id="v38N">38</b><small>그중 세 개</small></div>';}
  $('fxToggle').onclick=()=>{enabled=!enabled;write('lost-dreams-effects',enabled?'on':'off');if(state.ep){if(state.anchorEl&&anchorReached(state.anchorEl.getBoundingClientRect()))state.fired.add(state.ep);for(const x of state.extra||[])if(x.el&&anchorReached(x.el.getBoundingClientRect()))state.fired.add(x.key)}apply();if(enabled&&state.ep)mount()};
  $('soundToggle').onclick=async()=>{sound=!sound;if(sound){try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();await ctx.resume();heard.clear();if(state.ep)mount()}catch{sound=false}}if(!sound)stopAudio();$('soundToggle').setAttribute('aria-pressed',String(sound));$('soundToggle').textContent=sound?'생활음 켜짐':'생활음 꺼짐'};
  mq.addEventListener('change',e=>{if(e.matches){enabled=false;apply()}});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.querySelector('.setpiece.on'))closeSp()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAudio()});
  apply();
 }
 return {init,restore,mount,paragraph,present,apply,enabled:()=>enabled,inline:id=>inlineIds.has(id),controls,cup,stopAudio};
})();
