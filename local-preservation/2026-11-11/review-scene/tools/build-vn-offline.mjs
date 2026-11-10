import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

const MIME = Object.freeze({
  '.avif':'image/avif', '.webp':'image/webp', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg',
  '.gif':'image/gif', '.svg':'image/svg+xml', '.mp3':'audio/mpeg', '.ogg':'audio/ogg',
  '.wav':'audio/wav', '.m4a':'audio/mp4', '.woff2':'font/woff2', '.woff':'font/woff',
  '.mp4':'video/mp4',
});
const REQUIRED_CSS = ['styles.css','neural-stage.css','perception.css','comfort.css','episode-one.css'];
const REQUIRED_MODULES = [
  'state.js','direction.js','audio.js','neural-cues.js','neural-stage.js','perception.js',
  'save-portability.js','ep1-assets.js','episode-one.js','episode-one-stage.js','episode-one-audio.js',
];
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
const slash = value => value.replaceAll('\\','/');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const jsSafe = source => source.replace(/<\/script/gi,'<\\/script');
const jsonSafe = value => JSON.stringify(value).replaceAll('<','\\u003c');

function contained(root, candidate, label) {
  const relative = path.relative(root, candidate);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`${label} leaves the VN directory: ${candidate}`);
  }
  return candidate;
}
function localFile(root, relative, from = root) {
  if (typeof relative !== 'string' || !relative || /^(?:[a-z]+:|\/\/|[\\/])/i.test(relative)) {
    throw new Error(`Expected a VN-relative local path, received: ${String(relative)}`);
  }
  const pathOnly=relative.split(/[?#]/,1)[0];
  if(!pathOnly)throw new Error(`Empty local asset path: ${relative}`);
  return contained(root,path.resolve(from,pathOnly),relative);
}
function splitBindings(clause, moduleKey) {
  clause=clause.trim();
  if (clause.startsWith('{') && clause.endsWith('}')) {
    const names = clause.slice(1,-1).split(',').map(x=>x.trim()).filter(Boolean).map(binding=>{
      const pieces=binding.split(/\s+as\s+/).map(x=>x.trim());
      if (pieces.length>2 || !pieces.every(x=>IDENTIFIER.test(x))) throw new Error(`Unsupported named import: ${binding}`);
      return pieces.length===2 ? `${pieces[0]}:${pieces[1]}` : pieces[0];
    });
    return `const { ${names.join(', ')} }=__vnModules[${jsonSafe(moduleKey)}];`;
  }
  const star=clause.match(/^\*\s+as\s+([A-Za-z_$][\w$]*)$/);
  if (star) return `const ${star[1]}=__vnModules[${jsonSafe(moduleKey)}];`;
  throw new Error(`Only named or namespace imports are supported; received ${clause}`);
}

/**
 * Build one self-contained HTML. Reads the source VN folder, writes only the
 * explicitly requested output and its adjacent .manifest.json. No checkout
 * edits, no package installs, network access, media generation or extra fees.
 */
export async function buildOffline(vnDirectory, outputHtml) {
  if (!path.isAbsolute(vnDirectory) || !path.isAbsolute(outputHtml)) {
    throw new Error('Both arguments must be absolute paths: <VN directory> <output HTML>.');
  }
  const vn=path.resolve(vnDirectory), output=path.resolve(outputHtml);
  if (path.extname(output).toLowerCase()!=='.html') throw new Error('Output must end in .html.');
  if (output===path.join(vn,'index.html')) throw new Error('Refusing to overwrite the source index.html.');
  let html=await fs.readFile(path.join(vn,'index.html'),'utf8');
  const originalStory=await fs.readFile(path.join(vn,'story-data.js'),'utf8');
  const storyBox={window:{}};
  vm.runInNewContext(originalStory,storyBox,{filename:'story-data.js',timeout:15000});
  if (!storyBox.window.STORY || !Array.isArray(storyBox.window.STORY.chapters)) throw new Error('story-data.js did not expose window.STORY.chapters.');
  const story=JSON.parse(JSON.stringify(storyBox.window.STORY));
  const embedded=new Map(),assetDeclarations=[],assetRecords=[];

  async function assetVariable(sourcePath,baseDirectory=vn) {
    const key=sourcePath.startsWith('data:') ? sourcePath : localFile(vn,sourcePath,baseDirectory);
    if (embedded.has(key)) return embedded.get(key);
    const variable=`__vnAsset${embedded.size}`;
    let dataUrl,record;
    if (sourcePath.startsWith('data:')) {
      dataUrl=sourcePath;
      record={source:'inline data URL',mime:sourcePath.match(/^data:([^;,]+)/)?.[1]??'text/plain',bytes:Buffer.byteLength(sourcePath),sha256:hash(sourcePath)};
    } else {
      const bytes=await fs.readFile(key),mime=MIME[path.extname(key).toLowerCase()];
      if (!mime) throw new Error(`No permitted embedded MIME mapping for ${key}`);
      dataUrl=`data:${mime};base64,${bytes.toString('base64')}`;
      record={source:slash(path.relative(vn,key)),mime,bytes:bytes.length,sha256:hash(bytes)};
    }
    embedded.set(key,variable);
    assetDeclarations.push(`const ${variable}=${jsonSafe(dataUrl)};`);
    assetRecords.push({...record,variable});
    return variable;
  }

  const storyAssetAssignments=[];
  for (const [key,value] of Object.entries(story.assets??{})) {
    if (typeof value!=='string' || !value) throw new Error(`Invalid STORY.assets.${key}`);
    storyAssetAssignments.push(`window.STORY.assets[${jsonSafe(key)}]=${await assetVariable(value)};`);
  }
  const storyAssetKeys=Object.keys(story.assets??{});
  story.assets={};

  // Evaluate only the tiny pure asset-map module, then replace every runtime
  // source path with the same shared data-URL variables used above.
  const ep1Source=await fs.readFile(path.join(vn,'ep1-assets.js'),'utf8');
  const ep1Box={};
  vm.runInNewContext(`${ep1Source.replace(/^\s*export\s+/gm,'')}\n;globalThis.__ep1=EP1_ASSETS;`,ep1Box,{filename:'ep1-assets.js',timeout:1000});
  const ep1Assets=JSON.parse(JSON.stringify(ep1Box.__ep1));
  if (!ep1Assets || typeof ep1Assets!=='object' || !Object.keys(ep1Assets).length) throw new Error('EP1_ASSETS is empty.');
  const ep1Entries=[];
  for (const [key,value] of Object.entries(ep1Assets)) {
    if (typeof value!=='string' || !value) throw new Error(`Invalid EP1_ASSETS.${key}`);
    ep1Entries.push(`${jsonSafe(key)}:${await assetVariable(value)}`);
  }
  const transformedEp1=`const EP1_ASSETS=Object.freeze({${ep1Entries.join(',')}});`;

  const cssFiles=[];
  for (const match of html.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) cssFiles.push(match[1].split(/[?#]/,1)[0]);
  for (const required of REQUIRED_CSS) if (!cssFiles.includes(required)) cssFiles.push(required);
  const cssParts=[];
  for (const name of [...new Set(cssFiles)]) {
    const absolute=localFile(vn,name),base=path.dirname(absolute);
    let css=await fs.readFile(absolute,'utf8');
    if (/@import\b/i.test(css)) throw new Error(`CSS @import is unsupported for offline build: ${name}`);
    const urls=[...css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/gi)];
    for (const match of urls.reverse()) {
      const url=(match[1]??match[2]??match[3]??'').trim();
      if (!url || url.startsWith('data:') || url.startsWith('#')) continue;
      const variable=await assetVariable(url,base);
      // Asset declarations are simple string literals; decode this one without
      // exposing a build-time registry in runtime CSS.
      const declaration=assetDeclarations.find(x=>x.startsWith(`const ${variable}=`));
      const dataUrl=JSON.parse(declaration.slice(declaration.indexOf('=')+1,-1));
      css=css.slice(0,match.index)+`url("${dataUrl}")`+css.slice(match.index+match[0].length);
    }
    if (/<\/style/i.test(css)) throw new Error(`Unsafe closing style token in ${name}`);
    cssParts.push(`/* ${name} */\n${css}`);
  }

  const modules=new Map(),visiting=new Set(),order=[];
  async function visit(moduleKey) {
    moduleKey=slash(moduleKey);
    if (visiting.has(moduleKey)) throw new Error(`Circular module graph unsupported: ${moduleKey}`);
    if (modules.has(moduleKey)) return;
    visiting.add(moduleKey);
    const filename=localFile(vn,moduleKey),dirname=path.dirname(filename);
    const sourceOriginal=moduleKey==='ep1-assets.js' ? ep1Source : await fs.readFile(filename,'utf8');
    let source=moduleKey==='ep1-assets.js' ? transformedEp1 : sourceOriginal;
    // Runtime-only scene assets must also survive a downloaded single HTML.
    // Resolve against this module, then use the same deduplicated asset registry.
    const runtimeAssets=[...source.matchAll(/(['"])(\.\/assets\/[^'"\r\n]+\.(?:avif|webp|png|jpg|jpeg|gif|svg|mp4))\1/g)];
    for (const match of runtimeAssets.reverse()) {
      const variable=await assetVariable(match[2],dirname);
      source=source.slice(0,match.index)+variable+source.slice(match.index+match[0].length);
    }
    const dependencyBindings=[];
    const importPattern=/^[ \t]*import\s+(\{[\s\S]*?\}|\*\s+as\s+[A-Za-z_$][\w$]*)\s+from\s*(['"])([^'"\r\n]+)\2\s*;?[ \t]*(?:\r?\n|$)/gm;
    const matches=[...source.matchAll(importPattern)];
    for (const match of matches) {
      const dependencyFile=localFile(vn,match[3],dirname);
      const dependencyKey=slash(path.relative(vn,dependencyFile));
      await visit(dependencyKey);
      dependencyBindings.push(splitBindings(match[1],dependencyKey));
    }
    source=source.replace(importPattern,'');
    const sideEffects=[...source.matchAll(/^[ \t]*import\s*(['"])([^'"\r\n]+)\1\s*;?[ \t]*(?:\r?\n|$)/gm)];
    for (const match of sideEffects) await visit(slash(path.relative(vn,localFile(vn,match[2],dirname))));
    source=source.replace(/^[ \t]*import\s*(['"])([^'"\r\n]+)\1\s*;?[ \t]*(?:\r?\n|$)/gm,'');
    const exports=new Map();
    if (moduleKey==='ep1-assets.js') exports.set('EP1_ASSETS','EP1_ASSETS');
    source=source.replace(/^[ \t]*export\s+(async\s+)?(function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/gm,(_all,asyncPart='',kind,name)=>{
      exports.set(name,name);return `${asyncPart??''}${kind} ${name}`;
    });
    source=source.replace(/^[ \t]*export\s*\{([^}]+)\}\s*;?/gm,(_all,bindings)=>{
      for (const binding of bindings.split(',').map(x=>x.trim()).filter(Boolean)) {
        const pieces=binding.split(/\s+as\s+/).map(x=>x.trim());
        if (pieces.length>2 || !pieces.every(x=>IDENTIFIER.test(x))) throw new Error(`Unsupported export ${binding} in ${moduleKey}`);
        exports.set(pieces[1]??pieces[0],pieces[0]);
      }
      return '';
    });
    // An unrecognized import/export must never be silently dropped. Script
    // parsing provides the final language-level check after transformation.
    const exportObject=[...exports].map(([publicName,local])=>`${jsonSafe(publicName)}:${local}`).join(',');
    const bundled=`__vnModules[${jsonSafe(moduleKey)}]=(()=>{\n'use strict';\n${dependencyBindings.join('\n')}\n${source}\nreturn Object.freeze({${exportObject}});\n})();`;
    new vm.Script(bundled,{filename:`offline:${moduleKey}`});
    modules.set(moduleKey,{source:bundled,exports:[...exports.keys()],sourceSha256:hash(sourceOriginal),compiledSourceSha256:hash(source)});
    visiting.delete(moduleKey);order.push(moduleKey);
  }
  for (const key of REQUIRED_MODULES) await visit(key);
  await visit('app.js');

  const storySource=`window.STORY=${jsonSafe(story)};\n${assetDeclarations.join('\n')}\n${storyAssetAssignments.join('\n')}`;
  const appSource=`'use strict';\nconst __vnModules=Object.create(null);\n${order.map(key=>`\n/* module: ${key} */\n${modules.get(key).source}`).join('\n')}`;
  // Also catches accidental identifier collisions across the generated outer
  // scope, apart from each independently parsed module IIFE above.
  new vm.Script(storySource,{filename:'offline:story-and-assets'});
  new vm.Script(appSource,{filename:'offline:application'});

  html=html.replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi,'');
  html=html.replace(/<script\b[^>]*\bsrc=["'][^"']+["'][^>]*>\s*<\/script>/gi,'');
  html=html.replace(/<\/head>/i,`<style>\n${cssParts.join('\n')}\n</style>\n<script>${jsSafe(storySource)}</script>\n</head>`);
  html=html.replace(/<\/body>/i,`<script>${jsSafe(appSource)}</script>\n</body>`);
  html=html.split('\n').map(line=>line.trim()===''?'':line).join('\n');
  if (/<script\b[^>]*\bsrc\s*=/i.test(html) || /<link\b[^>]*\brel=["']stylesheet/i.test(html)) throw new Error('External script or stylesheet remains.');
  const inlineScripts=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const [index,match] of inlineScripts.entries()) new vm.Script(match[1],{filename:`offline:inline-${index+1}`});
  const report={
    vnDirectory:'vn',outputHtml:path.basename(output),offlineBytes:Buffer.byteLength(html),sha256:hash(html),
    storyChapters:story.chapters.length,storyAssetKeys:storyAssetKeys.length,
    ep1AssetKeys:Object.keys(ep1Assets),uniqueEmbeddedAssets:assetRecords.length,
    embeddedOriginalBytes:assetRecords.reduce((sum,a)=>sum+a.bytes,0),
    mimeTypes:[...new Set(assetRecords.map(x=>x.mime))],assets:assetRecords,
    cssFiles:[...new Set(cssFiles)],moduleOrder:order,
    modules:Object.fromEntries([...modules].map(([key,value])=>[key,{exports:value.exports,sourceSha256:value.sourceSha256,compiledSourceSha256:value.compiledSourceSha256}])),
    inlineScriptsParsed:inlineScripts.length,externalScripts:false,externalStylesheets:false,
    writes:[path.basename(output),`${path.basename(output)}.manifest.json`],sourceCheckoutModified:false,
    networkCallsPerformed:0,externalCost:0,
  };
  await fs.mkdir(path.dirname(output),{recursive:true});
  await fs.writeFile(output,html,'utf8');
  await fs.writeFile(`${output}.manifest.json`,JSON.stringify(report,null,2),'utf8');
  return report;
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url) {
  try {
    if (process.argv.length!==4) throw new Error('Usage: node build-vn-offline.mjs <absolute VN directory> <absolute output.html>');
    const report=await buildOffline(process.argv[2],process.argv[3]);
    console.log(JSON.stringify({outputHtml:report.outputHtml,offlineBytes:report.offlineBytes,uniqueEmbeddedAssets:report.uniqueEmbeddedAssets,mimeTypes:report.mimeTypes,modules:report.moduleOrder,inlineScriptsParsed:report.inlineScriptsParsed,sourceCheckoutModified:false,externalCost:0},null,2));
  } catch (error) {console.error(error.message);process.exitCode=1;}
}
