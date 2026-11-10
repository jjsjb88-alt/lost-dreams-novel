export class EpisodeOneStage {
  constructor(host,assets){
    this.host=host;this.assets=assets;this.currentCg='';this.currentScene=-1;this.actorState=new Map();
    this.cg=document.createElement('div');this.cg.className='ep1-cg';
    this.actors=document.createElement('div');this.actors.className='ep1-actors';
    this.panel=document.createElement('section');this.panel.className='ep1-document';this.panel.hidden=true;this.panel.setAttribute('aria-label','장면 속 퇴직 의사 확인서');
    this.wall=document.createElement('div');this.wall.className='ep1-wall';this.wall.hidden=true;this.wall.setAttribute('aria-hidden','true');
    this.wall.style.backgroundImage=`url("${assets.sea}")`;
    this.lids=document.createElement('div');this.lids.className='ep1-lids';this.lids.setAttribute('aria-hidden','true');
    this.host.append(this.cg,this.wall,this.actors,this.panel,this.lids);
  }
  render(cue,{instant=false,reducedMotion=false}={}){
    const stage=this.host.parentElement;
    if(!cue){this.clear();return;}
    this.host.hidden=false;stage.classList.add('episode-one');
    stage.dataset.ep1Actors=cue.actors.length?'present':'';
    stage.dataset.ep1DocumentPhase=cue.document?.phase||'';
    stage.classList.toggle('ep1-blackout',cue.blackout);stage.classList.toggle('ep1-intro',cue.intro);stage.classList.toggle('ep1-cg-active',Boolean(cue.cg));
    this.host.classList.toggle('ep1-no-motion',instant||reducedMotion||matchMedia('(prefers-reduced-motion: reduce)').matches);
    this.host.dataset.shot=cue.shot;
    this.host.dataset.cg=cue.cg||'';
    if(cue.cg!==this.currentCg){
      this.cg.replaceChildren();this.cg.style.backgroundImage=cue.cg?`url("${this.assets[cue.cg]}")`:'';if(cue.cg){const img=document.createElement('img');img.src=this.assets[cue.cg];img.alt='';this.cg.append(img);}
      this.currentCg=cue.cg;
    }
    this.cg.hidden=!cue.cg;this.wall.hidden=!cue.wallAd;
    this.lids.classList.toggle('closed',cue.intro||cue.blackout);
    const visible=new Set(cue.actors.map(p=>p.id));
    for(const [id,slot]of this.actorState)if(!visible.has(id)){slot.remove();this.actorState.delete(id);}
    for(const person of cue.actors){
      let slot=this.actorState.get(person.id);
      if(!slot){slot=document.createElement('div');slot.className='ep1-actor';slot.dataset.id=person.id;this.actorState.set(person.id,slot);this.actors.append(slot);}
      slot.dataset.side=person.side;slot.dataset.gaze=person.gaze;slot.dataset.pose=person.pose;
      slot.classList.toggle('speaking',cue.focus===person.name);slot.classList.toggle('listening',Boolean(cue.focus)&&cue.focus!==person.name);
      if(slot.dataset.asset!==person.asset){
        slot.querySelectorAll('.ep1-previous').forEach(n=>n.remove());
        const previous=slot.querySelector('img');if(previous){previous.classList.add('ep1-previous');previous.setAttribute('aria-hidden','true');previous.addEventListener('animationend',()=>previous.remove(),{once:true});}
        const img=document.createElement('img');img.src=this.assets[person.asset];img.alt=person.name;img.className='ep1-current';slot.append(img);slot.dataset.asset=person.asset;
      }
    }
    this.panel.hidden=!cue.document;
    if(cue.document){
      const signature=JSON.stringify(cue.document);
      if(this.panel.dataset.signature!==signature){
        this.panel.setAttribute('aria-label',cue.document.ariaLabel||'장면 속 퇴직 의사 확인서');
        this.panel.replaceChildren();const eyebrow=document.createElement('span');eyebrow.className='ep1-doc-label';eyebrow.textContent=cue.document.label||'퇴직 의사 확인서';this.panel.append(eyebrow);
        if(cue.document.showRisks){
          const rows=cue.document.rows||[['향후 24개월 예상 소득 안정성','−31.2%'],['가족 연계 의료 플랜 비용','+14.8%'],['주거 신용등급 하락 가능성','22.1%']];
          const dl=document.createElement('dl');rows.forEach(([k,v])=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=v;dl.append(dt,dd);});this.panel.append(dl);
          const note=document.createElement('p');note.textContent=cue.document.note??'재고를 권장합니다.';this.panel.append(note);
        }
        this.panel.dataset.signature=signature;
      }
      this.panel.dataset.phase=cue.document.phase;
    }
    if(this.currentScene!==cue.sceneStart){this.host.classList.remove('ep1-scene-arrive');void this.host.offsetWidth;this.host.classList.add('ep1-scene-arrive');this.currentScene=cue.sceneStart;}
  }
  clear(){
    this.host.hidden=true;this.host.parentElement.classList.remove('episode-one','ep1-blackout','ep1-intro','ep1-cg-active');this.host.parentElement.dataset.ep1Actors='';this.host.parentElement.dataset.ep1DocumentPhase='';this.actorState.clear();this.actors.replaceChildren();this.currentScene=-1;
  }
}
