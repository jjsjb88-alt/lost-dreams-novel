const fs = require('fs');
const pilot = fs.readFileSync('pilot.html', 'utf8');
const blocks = pilot.match(/<script>([\s\S]*?)<\/script>/g) || [];
let ok = 0;
blocks.forEach((b, i) => {
  const body = b.replace(/^<script>/, '').replace(/<\/script>$/, '');
  try { new Function(body); ok++; }
  catch (e) { console.log('SYNTAX ERR block' + i + ': ' + e.message); }
});
console.log('script blocks ok: ' + ok + '/' + blocks.length);
console.log('22-1 refs: ' + (pilot.match(/22-1/g) || []).length);
console.log('29-1 refs: ' + (pilot.match(/29-1/g) || []).length);
console.log('petition35 refs: ' + (pilot.match(/petition35/g) || []).length);
const bump = pilot.match(/const BUMP=\{([^}]*)\}/)[1];
console.log('BUMP: ' + bump);
// every setpiece id referenced in D must exist
const d = pilot.match(/const D=\{([\s\S]*?)\n\};/)[1];
const sps = new Set([...d.matchAll(/sp:'([^']+)'/g)].map(m => m[1]));
const missing = [...sps].filter(id => !pilot.includes('id="' + id + '"') && !fs.readFileSync('reader-effects.js', 'utf8').includes("'" + id + "'"));
console.log('missing setpiece targets: ' + (missing.length ? missing.join(', ') : 'none'));