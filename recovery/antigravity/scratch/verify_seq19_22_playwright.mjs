import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');
const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
const vnDir = path.join(repoRoot, 'vn');
const verificationDir = path.join(repoRoot, 'loop', '.runtime', 'vn-verification');
const outDir = path.join(verificationDir, 'seq_screenshots');
const ep2OutDir = path.join(verificationDir, 'ep2_screenshots');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(ep2OutDir, { recursive: true });

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.mp3': 'audio/mpeg',
  '.json': 'application/json; charset=utf-8',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  const urlPath = decodeURIComponent(url.pathname);
  if (urlPath === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }
  const relPath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const filePath = path.resolve(vnDir, relPath);
  if (!filePath.startsWith(vnDir) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});

try {
  const offlineResults = [];
  for (const viewport of [{ width: 400, height: 844 }, { width: 1440, height: 900 }]) {
    const context = await browser.newContext({ viewport });
    const offlinePage = await context.newPage();
    const offlineErrors = [];
    const externalRequests = [];
    offlinePage.on('pageerror', error => offlineErrors.push(error.message));
    offlinePage.on('request', request => {
      if (request.resourceType() !== 'document' && !request.url().startsWith('data:')) externalRequests.push(request.url());
    });
    for (const [chapter, beat, actor] of [['19', 71, 'yoonsera'], ['20-1', 8, 'eunkyung'], ['20-1', 36, 'haerin']]) {
      await offlinePage.goto(baseUrl + '/play-offline.html?sequence=19-22&chapter=' + chapter + '&beat=' + beat, { waitUntil: 'networkidle' });
      await offlinePage.locator('#gameScreen').waitFor({ state: 'visible' });
      const portrait = await offlinePage.locator('#portraitImage').evaluate(image => ({ source: image.getAttribute('src') || '', width: image.naturalWidth, height: image.naturalHeight }));
      assert.ok(portrait.source.startsWith('data:image/webp;base64,'), 'offline ' + actor + ' must be embedded; got ' + portrait.source.slice(0, 80));
      const expectedSource = 'data:image/webp;base64,' + fs.readFileSync(path.join(vnDir, 'assets', actor + '.webp')).toString('base64');
      assert.equal(portrait.source === expectedSource, true, 'offline portrait must match ' + actor);
      assert.ok(portrait.width > 0 && portrait.height > 0, 'offline ' + actor + ' must decode');
      const device = viewport.width === 400 ? 'mobile' : 'desktop';
      await offlinePage.screenshot({ path: path.join(outDir, '13-offline-' + actor + '-' + device + '.png') });
      offlineResults.push({ actor, viewport: viewport.width, embedded: true, matchesExpectedAsset: true, width: portrait.width, height: portrait.height });
    }
    assert.deepEqual(offlineErrors, [], 'offline page errors');
    assert.deepEqual(externalRequests, [], 'standalone HTML must not request adjacent assets');
    await context.close();
  }
  // 1. Mobile (400x844) full sequence walkthrough
  const mobileCtx = await browser.newContext({ viewport: { width: 400, height: 844 } });
  const page = await mobileCtx.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem(
      'lost_dreams_vn_20261018_release1',
      JSON.stringify({
        version: 2,
        settings: { fontSize: 20, textSpeed: 80, autoWait: 500, instant: true, sound: false, volume: 35, reducedMotion: true },
        seen: {},
        slots: [null, null, null, null, null, null],
        autosave: null,
        beforeJump: null,
      }),
    );
  });
  await page.reload({ waitUntil: 'networkidle' });

  // Verify sequence button on title screen
  const seqBtn = page.locator('#sequence1922Button');
  await seqBtn.waitFor({ state: 'visible' });
  assert.equal((await seqBtn.textContent()).trim(), '19~22화 시퀀스 재생');
  await page.screenshot({ path: path.join(outDir, '01-title-mobile.png') });

  // Open Sequence 19-22 modal
  await seqBtn.click();
  await page.locator('.sequence-track-list').waitFor({ state: 'visible' });
  const trackCards = await page.locator('.sequence-track-card').count();
  assert.equal(trackCards, 6);
  await page.screenshot({ path: path.join(outDir, '02-seq-modal-mobile.png') });

  // Click start from Episode 19
  await page.locator('.demo-start-actions button').first().click();
  await page.locator('#gameScreen').waitFor({ state: 'visible' });

  const expectedOrder = ['19', '20', '20-1', '21', '21-1', '22'];
  const visitedChapters = [];
  let totalPagesStepped = 0;
  const capturedSet = new Set();

  for (let cIdx = 0; cIdx < expectedOrder.length; cIdx++) {
    const expectedCh = expectedOrder[cIdx];
    const chLabel = await page.locator('#chapterLabel').textContent();
    assert.ok(chLabel.includes(`시퀀스 0${cIdx + 1} / 06`), `Expected sequence badge in ${chLabel}`);
    visitedChapters.push(expectedCh);

    // If we just entered chapter 20, test stepping back to 19 and forward again
    if (expectedCh === '20') {
      await page.locator('#previousButton').click();
      const backLabel = await page.locator('#chapterLabel').textContent();
      assert.ok(backLabel.includes('시퀀스 01 / 06'), `Expected step back to 19, got ${backLabel}`);
      await page.locator('#storyBox').click();
      await page.locator('.end-card button').first().click();
      const forwardLabel = await page.locator('#chapterLabel').textContent();
      assert.ok(forwardLabel.includes('시퀀스 02 / 06'), `Expected forward to 20, got ${forwardLabel}`);
    }

    // Step through the chapter until .end-screen appears
    let safety = 0;
    while (safety++ < 500) {
      const endVisible = await page.locator('.end-screen').isVisible();
      if (endVisible) break;

      const stateSnapshot = await page.evaluate(() => {
        const raw = JSON.parse(localStorage.getItem('lost_dreams_vn_20261018_release1'));
        const p = raw?.autosave?.progress;
        const img = document.getElementById('portraitImage');
        return {
          chapterId: p?.chapterId,
          beatIndex: p?.beatIndex,
          sequenceMode: p?.sequenceMode,
          portraitSrc: img?.getAttribute('src') || '',
          portraitNaturalWidth: img?.naturalWidth || 0,
          portraitVisible: document.getElementById('portraitWrap')?.classList.contains('visible') || false,
          speaker: document.getElementById('speaker')?.textContent || '',
          cardTitle: document.getElementById('directionCard')?.textContent || '',
          neuralVisible: !document.getElementById('neuralStage')?.hidden,
        };
      });

      assert.equal(stateSnapshot.sequenceMode, '19-22');

      if (expectedCh === '19' && stateSnapshot.beatIndex >= 70 && stateSnapshot.beatIndex <= 75 && !capturedSet.has('03')) {
        capturedSet.add('03');
        assert.ok(stateSnapshot.portraitSrc.includes('yoonsera.webp'), `Expected yoonsera.webp, got ${stateSnapshot.portraitSrc}`);
        assert.ok(stateSnapshot.portraitNaturalWidth > 0, 'yoonsera.webp naturalWidth > 0');
        await page.screenshot({ path: path.join(outDir, '03-ep19-yoonsera-mobile.png') });
      }
      if (expectedCh === '20-1' && stateSnapshot.beatIndex >= 6 && stateSnapshot.beatIndex <= 14 && !capturedSet.has('04')) {
        capturedSet.add('04');
        assert.ok(stateSnapshot.portraitSrc.includes('eunkyung.webp'), `Expected eunkyung.webp, got ${stateSnapshot.portraitSrc}`);
        assert.ok(stateSnapshot.portraitNaturalWidth > 0, 'eunkyung.webp naturalWidth > 0');
        await page.screenshot({ path: path.join(outDir, '04-ep20-1-eunkyung-mobile.png') });
      }
      if (expectedCh === '20-1' && stateSnapshot.beatIndex >= 35 && stateSnapshot.beatIndex <= 45 && !capturedSet.has('05')) {
        capturedSet.add('05');
        assert.ok(stateSnapshot.portraitSrc.includes('haerin.webp'), `Expected haerin.webp, got ${stateSnapshot.portraitSrc}`);
        assert.ok(stateSnapshot.portraitNaturalWidth > 0, 'haerin.webp naturalWidth > 0');
        await page.screenshot({ path: path.join(outDir, '05-ep20-1-haerin-mobile.png') });
      }
      if (expectedCh === '21' && stateSnapshot.beatIndex >= 75 && stateSnapshot.beatIndex <= 83 && !capturedSet.has('06')) {
        capturedSet.add('06');
        await page.screenshot({ path: path.join(outDir, '06-ep21-haerin-call-mobile.png') });
      }
      if (expectedCh === '21-1' && stateSnapshot.beatIndex === 86 && !capturedSet.has('07')) {
        capturedSet.add('07');
        assert.equal(stateSnapshot.neuralVisible, true);
        await page.screenshot({ path: path.join(outDir, '07-ep21-1-rescue12-mobile.png') });
      }
      if (expectedCh === '22' && stateSnapshot.beatIndex === 102 && !capturedSet.has('08')) {
        capturedSet.add('08');
        assert.equal(stateSnapshot.neuralVisible, true);
        await page.screenshot({ path: path.join(outDir, '08-ep22-yoonha-mobile.png') });
      }

      await page.locator('#storyBox').click();
      totalPagesStepped++;
    }

    assert.equal(await page.locator('.end-screen').isVisible(), true, `Chapter ${expectedCh} reached end screen`);
    if (expectedCh === '22') {
      const endEyebrow = await page.locator('.end-card .eyebrow').textContent();
      assert.equal(endEyebrow.trim(), 'SEQUENCE 19–22 COMPLETE');
      await page.screenshot({ path: path.join(outDir, '09-ep22-complete-mobile.png') });
    } else {
      await page.locator('.end-card button').first().click();
    }
  }

  assert.deepEqual(visitedChapters, expectedOrder);
  assert.equal(errors.length, 0, `Unexpected errors: ${errors.join('; ')}`);

  // Recapture Episode 2 beat 118..120 & 121..123 mobile screen to verify document/story-box spacing
  await page.evaluate(() => {
    const raw = JSON.parse(localStorage.getItem('lost_dreams_vn_20261018_release1'));
    raw.autosave = { progress: { chapterId: '2', beatIndex: 118, choices: {}, finished: false }, timestamp: Date.now(), preview: '118' };
    localStorage.setItem('lost_dreams_vn_20261018_release1', JSON.stringify(raw));
  });
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.locator('#continueButton').click();
  await page.locator('#gameScreen').waitFor({ state: 'visible' });
  await page.screenshot({ path: path.join(ep2OutDir, 'mobile-09b-father-port-realization.png') });
  await page.locator('#storyBox').click();
  await page.screenshot({ path: path.join(ep2OutDir, 'mobile-09c-father-port-part2.png') });

  // 2. Desktop (1440x900) representative scenes
  const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const dPage = await desktopCtx.newPage();
  await dPage.goto(baseUrl, { waitUntil: 'networkidle' });
  await dPage.evaluate(() => {
    localStorage.setItem(
      'lost_dreams_vn_20261018_release1',
      JSON.stringify({
        version: 1,
        settings: { fontSize: 20, textSpeed: 80, autoWait: 500, instant: true, sound: false, volume: 35, reducedMotion: true },
        seen: [],
        slots: [null, null, null],
        autosave: null,
        metadata: {},
      }),
    );
  });
  await dPage.goto(`${baseUrl}/?sequence=19-22`, { waitUntil: 'networkidle' });
  await dPage.locator('.sequence-track-list').waitFor({ state: 'visible' });
  await dPage.screenshot({ path: path.join(outDir, '10-seq-modal-desktop.png') });

  await dPage.goto(`${baseUrl}/?sequence=19-22&chapter=19&beat=71`, { waitUntil: 'networkidle' });
  await dPage.locator('#gameScreen').waitFor({ state: 'visible' });
  await dPage.screenshot({ path: path.join(outDir, '11-ep19-yoonsera-desktop.png') });

  await dPage.goto(`${baseUrl}/?sequence=19-22&chapter=20-1&beat=36`, { waitUntil: 'networkidle' });
  await dPage.locator('#gameScreen').waitFor({ state: 'visible' });
  await dPage.screenshot({ path: path.join(outDir, '12-ep20-1-haerin-desktop.png') });

  console.log(JSON.stringify({
    offlinePortraits: offlineResults,
    mobileChaptersVisited: visitedChapters,
    totalPagesStepped,
    consoleAndPageErrors: errors.length,
    screenshotsSaved: fs.readdirSync(outDir),
  }, null, 2));
} finally {
  await browser.close();
  server.close();
}
