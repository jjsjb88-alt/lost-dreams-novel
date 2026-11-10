import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url),{chromium}=require('playwright-core');
const root=fileURLToPath(new URL('../../../',import.meta.url));
const out=path.join(root,'loop/.runtime/scene-mix-20261020');fs.mkdirSync(out,{recursive:true});
const proof=path.join(root,'vn/notes/scene-mix-proof');fs.mkdirSync(proof,{recursive:true});
const box={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'vn/story-data.js'),'utf8'),box);
const story=box.window.STORY,ids=['19','19-1','19-2','20','20-1','21','21-1','22'];
const chapter=id=>story.chapters.find(c=>c.id===id);
const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.md':'text/plain','.webp':'image/webp','.avif':'image/avif','.jpg':'image/jpeg','.png':'image/png','.mp4':'video/mp4','.mp3':'audio/mpeg'};
const server=http.createServer((req,res)=>{const pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);if(pathname==='/favicon.ico'){res.writeHead(204).end();return;}const file=path.resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));if(!file.startsWith(root)||pathname.includes('/.git')){res.writeHead(403).end();return;}try{if(!fs.statSync(file).isFile())throw Error('file');res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
const errors=[],screenshots=[],results=[];let stepped=0;
try{
 const ctx=await browser.newContext({viewport:{width:400,height:844},reducedMotion:'reduce'});
 await ctx.addInitScript(()=>{if(!localStorage.getItem('lost_dreams_vn_20261018_release1'))localStorage.setItem('lost_dreams_vn_20261018_release1',JSON.stringify({version:2,settings:{instant:true,sound:false,reducedMotion:true,fontSize:20},seen:[],slots:[],autosave:null}));});
 const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(base+'/vn/?chapter=19&beat=0');await page.locator('#gameScreen').waitFor({state:'visible'});
 const capture=new Map([['19:138','19-doubt'],['19-1:66','19-1-refund'],['19-2:181','19-2-dinner'],['20:151','20-refusal'],['20:195','20-rooftop'],['20-1:53','20-1-school'],['21:144','21-seven-lines'],['21-1:88','21-1-victory'],['22:52','22-dissent'],['22:98','22-child-shoes'],['22:167','22-three-signatures']]);
 for(const id of ids){
  const c=chapter(id);
  for(let i=0;i<c.beats.length;i++){
   const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('lost_dreams_vn_20261018_release1')).autosave.progress);
   assert.equal(saved.chapterId,id);assert.equal(saved.beatIndex,i,id+' walkthrough');
   if(capture.has(id+':'+i)){const name=capture.get(id+':'+i)+'-mobile.png';await page.screenshot({path:path.join(proof,name)});screenshots.push(name);}
   if(id==='19-1'&&i===79){await page.goto(base+'/vn/');await page.locator('#continueButton').click();const resumed=await page.evaluate(()=>JSON.parse(localStorage.getItem('lost_dreams_vn_20261018_release1')).autosave.progress);assert.equal(resumed.chapterId,id);assert.equal(resumed.beatIndex,i);}
   await page.keyboard.press('Space');stepped++;
  }
  await page.locator('.end-screen').waitFor({state:'visible'});
  results.push({chapter:id,beats:c.beats.length});console.log(JSON.stringify({chapter:id,steps:stepped}));
  if(id!=='22')await page.locator('.end-card button').first().click();
 }
 await ctx.close();
 const portraits=[];
 for(const fileMode of [false,true])for(const viewport of [{width:400,height:844},{width:1440,height:900}]){
  const context=await browser.newContext({viewport,reducedMotion:'reduce'}),p=await context.newPage(),requests=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(r.resourceType()!=='document'&&!r.url().startsWith('data:'))requests.push(r.url());});
  for(const [id,needle,actor] of [['19','초청 확인 중입니다','yoonsera'],['20-1','알람 있어','eunkyung'],['20-1','의자 뒤','haerin']]){
   const beat=chapter(id).beats.findIndex(b=>b.text.includes(needle));
   const url=fileMode?pathToFileURL(path.join(root,'vn/play-offline.html')):new URL(base+'/vn/play-offline.html');url.search=new URLSearchParams({chapter:id,beat:String(beat)});
   await p.goto(url.href,{waitUntil:'load'});await p.locator('#gameScreen').waitFor({state:'visible'});
   const img=await p.locator('#portraitImage').evaluate(async img=>{await img.decode();return {src:img.getAttribute('src'),width:img.naturalWidth,height:img.naturalHeight};});
   assert.equal(img.src,'data:image/webp;base64,'+fs.readFileSync(path.join(root,'vn/assets',actor+'.webp')).toString('base64'));
   assert(img.width>0&&img.height>0);portraits.push({protocol:fileMode?'file':'http',viewport:viewport.width,actor,matchesExpectedAsset:true});
  }
  assert.deepEqual(requests,[]);await context.close();
 }
 const desktop=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'}),d=await desktop.newPage();d.on('pageerror',e=>errors.push(e.message));
 for(const [id,needle,name] of [['19','의심할 자격을 준 것','19-doubt'],['20','말리면 그만둘 거야','20-rooftop'],['22','오늘은 셋이 같은 답','22-three-signatures']]){
  const beat=chapter(id).beats.findIndex(b=>b.text.includes(needle));await d.goto(base+'/vn/?chapter='+id+'&beat='+beat);await d.locator('#gameScreen').waitFor({state:'visible'});await d.waitForFunction(text=>document.querySelector('#storyText')?.textContent===text,chapter(id).beats[beat].text);await d.screenshot({path:path.join(proof,name+'-desktop.png')});screenshots.push(name+'-desktop.png');
 }
 await desktop.close();
 const pilot=await browser.newContext({viewport:{width:400,height:900},reducedMotion:'reduce'}),p=await pilot.newPage();p.on('pageerror',e=>errors.push('pilot '+e.message));
 for(const id of ['19','20','21','22']){await p.goto(base+'/pilot.html#ep'+id);await p.waitForFunction(title=>document.getElementById('title')?.textContent===title,chapter(id).title.replace(/^제[^.]+\.\s*/,''));assert((await p.locator('#prose').innerText()).includes(chapter(id).beats[0].text));}
 await pilot.close();assert.deepEqual(errors,[]);
 const report={status:'PASS',chapters:results,totalBeatsStepped:stepped,saveResumeVerified:true,offlinePortraits:portraits,pageAndConsoleErrors:errors,screenshots};fs.writeFileSync(path.join(out,'browser-verification.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:'PASS',totalBeatsStepped:stepped,offlinePortraitCases:portraits.length,screenshots:screenshots.length,errors:0}));
}finally{await browser.close();server.closeAllConnections();await new Promise(r=>server.close(r));}
