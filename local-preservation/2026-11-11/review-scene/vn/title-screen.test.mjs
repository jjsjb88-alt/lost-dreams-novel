import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
test('title uses the original teaser S19 artwork locally',()=>{
  const css=read('title-screen.css');
  assert.match(css,/url\("assets\/title-city\.jpg"\)/);
  const art=fs.readFileSync(path.join(root,'assets/title-city.jpg'));
  assert.ok(art.length>10000);
  assert.equal(art[0],0xff);assert.equal(art[1],0xd8);
});
test('every visible title control has a real listener or link',()=>{
  const html=read('index.html'),app=read('app.js');
  for(const id of ['demoButton','startButton','continueButton','chaptersButton','titleSaveButton','settingsButton','creditsButton']){
    assert.match(html,new RegExp('id="'+id+'"'));
    assert.ok(app.includes("'"+id+"').addEventListener('click'"),id+' is not wired');
  }
  assert.match(html,/id="galleryButton"/);
  assert.match(html,/gallery\.showModal\(\)/);
  assert.match(html,/gallery\.addEventListener\('click'/);
  assert.match(html,/id="titleGallery"/);
});
test('portrait and compact landscape keep touch menu reachable',()=>{
  const css=read('title-screen.css');
  assert.match(css,/max-aspect-ratio:3\/4/);
  assert.match(css,/overflow-y:auto/);
  assert.match(css,/min-height:46px/);
  assert.match(css,/max-height:590px/);
  assert.match(css,/\.title-gallery:not\(\[open\]\).*pointer-events:none/);
});
test('gallery assets exist and title stays available to screen readers',()=>{
  const html=read('index.html'),css=read('title-screen.css');
  assert.match(html,/<h1 id="storyTitle" class="title-accessible-heading">/);
  assert.match(css,/clip-path:inset\(50%\)/);
  for(const name of ['ep1/cg-sea.webp','ep12/cg-table-home.webp','ep1/cg-clay-woman-body.webp','ep12/cg-night-home.webp']){
    assert.ok(fs.existsSync(path.join(root,'assets',name)),name);
  }
});

test('cinematic title integrates all options in the scene',()=>{
  const html=read('index.html'),css=read('title-screen.css'),app=read('app.js');
  assert.match(html,/id="titleAtmosphere"/);
  assert.match(html,/class="title-logo-plate"/);
  assert.ok(html.includes('id="startButton"') && html.indexOf('id="startButton"') < html.indexOf('id="continueButton"'));
  assert.match(app,/import \{ createTitleAtmosphere \}/);
  assert.match(app,/createTitleAtmosphere\(\{screen:titleScreen,canvas:/);
  assert.match(css,/\.title-screen \.title-art/);
  assert.match(css,/position:absolute;inset:-3\.5%/);
  assert.match(css,/animation:mist-drift/);
  assert.ok(css.includes('max-aspect-ratio:3/4'));
  assert.match(css,/\.title-logo-plate \{/);
  assert.doesNotMatch(css,/\.title-screen \.title-content\s*\{[^}]*backdrop-filter:blur\(/);
});
test('animated layers cannot capture input and reduced-motion is respected',()=>{
  const js=read('title-atmosphere.js'),css=read('title-screen.css');
  for(const layer of ['.title-art','.title-aurora','.title-mist','.title-reflection','.title-atmosphere'])
    assert.match(css,new RegExp(layer.replace('.','\\.')+'[^{}]*\\{[^}]*pointer-events:none'));
  assert.match(js,/prefers-reduced-motion: reduce/);
  assert.match(js,/!screen\.hidden/);
  assert.match(js,/cancelAnimationFrame/);
  assert.match(js,/pointerType==='touch'/);
  assert.match(css,/prefers-reduced-motion:reduce/);
});
