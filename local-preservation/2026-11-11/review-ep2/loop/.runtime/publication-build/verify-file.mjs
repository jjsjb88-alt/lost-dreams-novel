import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const root=process.cwd();
const require=createRequire(path.join(root,'tools/verification/antigravity/package.json'));
const {chromium}=require('playwright-core');
const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
const results=[];
try {
for(const width of [400,1440]){
 const ctx=await browser.newContext({viewport:{width,height:width===400?844:900}});
 const page=await ctx.newPage(),errors=[],external=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(r.resourceType()!=='document'&&!r.url().startsWith('data:'))external.push(r.url());});
 for(const [chapter,beat,actor] of [['19',71,'yoonsera'],['20-1',8,'eunkyung'],['20-1',36,'haerin']]){
 const url=pathToFileURL(path.join(root,'vn/play-offline.html'));
 url.search=new URLSearchParams({sequence:'19-22',chapter,beat:String(beat)}).toString();
 await page.goto(url.href,{waitUntil:'load'});
 await page.locator('#gameScreen').waitFor({state:'visible'});
 const p=await page.locator('#portraitImage').evaluate(async img=>{await img.decode();return {source:img.getAttribute('src'),width:img.naturalWidth,height:img.naturalHeight};});
 assert.equal(p.source,'data:image/webp;base64,'+fs.readFileSync(path.join(root,'vn/assets',actor+'.webp')).toString('base64'));
 assert.equal(p.width,1024);assert.equal(p.height,1536);
 results.push({actor,viewport:width,matchesExpectedAsset:true,width:p.width,height:p.height});
 }
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);await ctx.close();
}
fs.writeFileSync(path.join(root,'loop/.runtime/publication-build/file-offline.json'),JSON.stringify({status:'PASS',cases:results,externalRequests:0,pageErrors:0},null,2));
console.log(JSON.stringify({status:'PASS',cases:results.length,externalRequests:0,pageErrors:0}));
} finally {await browser.close();}
