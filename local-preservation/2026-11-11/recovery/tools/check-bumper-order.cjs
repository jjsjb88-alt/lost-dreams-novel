const fs = require('fs');
const pilot = fs.readFileSync('pilot.html', 'utf8');
const rjs = fs.readFileSync('reader-effects.js', 'utf8');
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const fail = [];
const ok = (n, c) => { console.log((c ? 'PASS ' : 'FAIL ') + n); if (!c) fail.push(n); };

const bumpLine = pilot.match(/const BUMP=\{([^}]*)\}/)[1];
const bump = {};
for (const m of bumpLine.matchAll(/(\d+):\[([^\]]*)\]/g)) {
  bump[+m[1]] = m[2].split(',').map(s => s.trim().replace(/'/g, '')).filter(Boolean);
}
console.log('BUMP parsed:', JSON.stringify(bump));

const orderSrc = pilot.match(/ORDER=\[\];for\(let i=1;i<=MAX;i\+\+\)[^\n]*/);
ok('ORDER rule intact', !!orderSrc && /ORDER\.push\(i,\.\.\.\(BUMP\[i\]\|\|\[\]\)\)/.test(orderSrc[0]));

// hidden files must not appear in manifest
const paths = manifest.manuscript.map(m => m.path.replace(/^manuscript\//, ''));
const hiddenList = fs.readFileSync('scripts/build-manifest.mjs', 'utf8')
  .match(/HIDDEN_MANUSCRIPT = new Set\(\[([\s\S]*?)\]\)/)[1]
  .match(/'([^']+)'/g).map(s => s.replace(/'/g, ''));
console.log('HIDDEN:', JSON.stringify(hiddenList));
hiddenList.forEach(h => ok('hidden not in manifest: ' + h, !paths.includes(h)));

// every BUMP entry must exist on disk; in manifest unless hidden
for (const [main, list] of Object.entries(bump)) {
  for (const b of list) {
    const f = 'ep' + String(main).padStart(3, '0') + '-' + b.split('-')[1] + '.md';
    ok('bump file exists: ' + f, fs.existsSync('manuscript/' + f));
    const inManifest = paths.includes(f);
    const isHidden = hiddenList.includes(f);
    if (isHidden) {
      ok('bump hidden-but-referenced (intentional): ' + f, !inManifest);
    } else {
      ok('bump in manifest: ' + f, inManifest);
    }
  }
}

// D entries: no 6-2 leftover, 7-2 present
ok("D['6-2'] removed", !/'6-2':\{/.test(pilot));
ok("D['7-2'] present", /'7-2':\{/.test(pilot));

// each D key has hook/on/sp; hook must exist verbatim in its manuscript
const dBlock = pilot.match(/const D=\{([\s\S]*?)\n\};/)[1];
for (const m of dBlock.matchAll(/'([\d-]+)':\{([^}]*)\}/g)) {
  const key = m[1], body = m[2];
  const hook = (body.match(/hook:"([^"]*)"/) || body.match(/hook:'([^']*)'/));
  if (!hook) continue;
  const hv = hook[1];
  const num = key.split('-')[0];
  const f = key.includes('-')
    ? 'manuscript/ep' + String(num).padStart(3, '0') + '-' + key.split('-')[1] + '.md'
    : 'manuscript/ep' + String(num).padStart(3, '0') + '.md';
  if (!fs.existsSync(f)) continue;
  const src = fs.readFileSync(f, 'utf8');
  ok('hook verbatim in ' + f + ' [' + key + ']', src.includes(hv));
}

// setpiece ids referenced by bumpers exist either in pilot or reader-effects
for (const [main, list] of Object.entries(bump)) {
  for (const b of list) {
    const key = main + '-' + b;
    const d = (dBlock.match(new RegExp("'" + key + "':\\{([^}]*)\\}")) || [])[1];
    if (!d) continue;
    const sp = (d.match(/sp:'([^']*)'/) || [])[1];
    if (!sp) continue;
    const hasDiv = pilot.includes('id="' + sp + '"');
    const hasFx = rjs.includes("'" + sp + "'");
    ok('sp exists ' + sp + ' (' + key + ')', hasDiv || hasFx);
  }
}

console.log(fail.length ? 'FAILURES: ' + fail.length : 'ALL OK');
process.exit(fail.length ? 1 : 0);