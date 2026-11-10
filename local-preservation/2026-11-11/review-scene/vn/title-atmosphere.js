/** Ambient canvas only: preserves all gameplay, saves and button hit targets. */
export function createTitleAtmosphere({screen,canvas,document:doc=document,window:win=window}) {
  if (!screen || !canvas) return {dispose(){}};
  const context = canvas.getContext?.('2d', {alpha:true});
  if (!context) return {dispose(){}};
  const motion = typeof win.matchMedia==='function'
    ? win.matchMedia('(prefers-reduced-motion: reduce)') : {matches:false};
  let frame = 0,active=false,disposed=false,viewWidth=1,viewHeight=1,lastPaint=0;
  let motes=[],screenX=0,screenY=0,lastTouch=0;
  // Deterministic motion prevents random spatial flashes on save / continue.
  let seed=91027;
  function random(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
  function resize(){
    const w=Math.max(1,screen.clientWidth||1),h=Math.max(1,screen.clientHeight||1);
    const pixelRatio=Math.min(1.5,Math.max(1,win.devicePixelRatio||1));
    viewWidth=w;viewHeight=h;
    canvas.width=Math.ceil(w*pixelRatio);canvas.height=Math.ceil(h*pixelRatio);
    context.setTransform(pixelRatio,0,0,pixelRatio,0,0);
    seed=91027;
    motes=Array.from({length:w<600?28:52},(_,i)=>({
      x:random()*w,y:random()*h,r:.35+random()*1.1,
      a:.1+random()*.4,vx:(random()-.5)*.22,
      vy:-.07-random()*.19,phase:random()*Math.PI*2,
      tint:i%5===0?'255,216,166':'168,209,255'
    }));
  }
  function draw(time){
    if(!active || disposed)return;
    frame=win.requestAnimationFrame(draw);
    if(time-lastPaint<33)return; // ~30 FPS ceiling on mobile.
    lastPaint=time;
    context.clearRect(0,0,viewWidth,viewHeight);
    const dt=.5;
    for(const mote of motes){
      mote.x+=mote.vx*dt; mote.y+=mote.vy*dt;
      if(mote.y<-.5)mote.y=viewHeight+2;
      if(mote.x<0)mote.x=viewWidth; if(mote.x>viewWidth)mote.x=0;
      const pulse=.7+.3*Math.sin(time*.001+mote.phase);
      context.beginPath();context.arc(mote.x,mote.y,mote.r,0,Math.PI*2);
      context.fillStyle=`rgba(${mote.tint},${(mote.a*pulse).toFixed(3)})`;
      context.fill();
    }
    // Atmospheric streaks stay behind text, never intercept taps.
    context.lineWidth=.7;
    for(let i=0;i<11;i++){
      const x=(i*177.7+time*.007)%viewWidth;
      const y=viewHeight*(.83+(i%6)*.028);
      const alpha=.07+.08*Math.sin(i+time*.0008)**2;
      context.strokeStyle=`rgba(157,199,255,${alpha.toFixed(3)})`;
      context.beginPath();context.moveTo(x,y);context.lineTo(x+13+(i%4)*7,y);
      context.stroke();
    }
  }
  function update(){
    if(disposed)return;
    const shouldRun=!doc.hidden&&!screen.hidden&&!motion.matches;
    if(shouldRun===active)return;
    active=shouldRun;
    if(active){resize();lastPaint=0;frame=win.requestAnimationFrame(draw);}
    else {if(frame)win.cancelAnimationFrame(frame);frame=0;context.clearRect(0,0,viewWidth,viewHeight);}
  }
  function pointer(event){
    if(!active||!event||event.pointerType==='touch'||event.buttons)return;
    const rect=screen.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    const x=(event.clientX-rect.left)/rect.width-.5;
    const y=(event.clientY-rect.top)/rect.height-.5;
    screenX=x*7; screenY=y*5;
    screen.style.setProperty('--scene-shift-x',`${screenX.toFixed(1)}px`);
    screen.style.setProperty('--scene-shift-y',`${screenY.toFixed(1)}px`);
  }
  function leave(){screen.style.setProperty('--scene-shift-x','0px');screen.style.setProperty('--scene-shift-y','0px');}
  const watch=new MutationObserver(update);
  watch.observe(screen,{attributes:true,attributeFilter:['hidden']});
  const resizeObserver=typeof win.ResizeObserver==='function'?new win.ResizeObserver(()=>{if(active)resize();}):null;
  resizeObserver?.observe(screen);
  doc.addEventListener('visibilitychange',update);
  screen.addEventListener('pointermove',pointer,{passive:true});
  screen.addEventListener('pointerleave',leave);
  win.addEventListener('resize',update);
  motion.addEventListener?.('change',update);
  update();
  return {dispose(){
    disposed=true;active=false;if(frame)win.cancelAnimationFrame(frame);
    watch.disconnect();resizeObserver?.disconnect();
    doc.removeEventListener('visibilitychange',update);
    screen.removeEventListener('pointermove',pointer);
    screen.removeEventListener('pointerleave',leave);
    win.removeEventListener('resize',update);
    motion.removeEventListener?.('change',update);
    leave();
  }};
}
