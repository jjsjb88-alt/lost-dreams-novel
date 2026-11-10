import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright-core');
const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
const vnDir = path.join(repoRoot, 'vn');
const outDir = path.join(repoRoot, 'loop', '.runtime', 'vn-verification', 'ep2_screenshots');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.mp3': 'audio/mpeg',
};

await fs.mkdir(outDir, { recursive: true });

const server = http.createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    if (urlPath === '/favicon.ico') {
      res.writeHead(204);
      res.end();
      return;
    }
    const relPath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
    const fullPath = path.resolve(vnDir, relPath);
    if (!fullPath.startsWith(vnDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    const data = await fs.readFile(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});
const errors = [];

try {
  // 1. Mobile 400x844 full sequential verification
  const mobileContext = await browser.newContext({
    viewport: { width: 400, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await mobileContext.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', err => errors.push(`pageerror: ${err.message}`));
  page.on('requestfailed', req => errors.push(`requestfailed: ${req.url()} (${req.failure()?.errorText})`));

  // Seed a save at Episode 1 final beat (1:256, reading page 256) to verify 1 -> 2 transition
  await page.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    const raw = localStorage.getItem('lost_dreams_vn_20261018_release1');
    const store = raw ? JSON.parse(raw) : { version: 2, settings: {}, slots: [null, null, null], seen: [], metadata: {} };
    store.settings = {
      ...store.settings,
      instant: true,
      sound: true,
      volume: 45,
      auto: false,
      skip: false,
      fontSize: 18,
      textSpeed: 45,
      autoWait: 1200,
      reducedMotion: false,
    };
    store.autosave = {
      timestamp: Date.now(),
      preview: '1화 마지막',
      progress: { chapterId: '1', beatIndex: 262, finished: false, choices: {} },
    };
    localStorage.setItem('lost_dreams_vn_20261018_release1', JSON.stringify(store));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('#continueButton');
  await page.waitForSelector('#gameScreen:not([hidden])');

  // Verify we are on 1:262 and advance to Chapter Complete
  const ep1EndProgress = await page.textContent('#progressText');
  assert.equal(ep1EndProgress.trim(), '263 / 263');
  await page.click('#storyBox');
  await page.waitForSelector('.end-screen');
  const ep1EndTitle = await page.textContent('.end-screen h2');
  assert.equal(ep1EndTitle.trim(), '자신과 단둘이');

  // Click 다음 장 -> should transition to Episode 2 beat 0
  await page.click('.end-screen .end-actions button:first-child');
  await page.waitForFunction(() => document.querySelector('#chapterLabel')?.textContent?.trim() === '2화');

  const screenshotPlan = new Map([
    [0, 'mobile-00-ep2-opening.png'],
    [8, 'mobile-01-zero-token.png'],
    [20, 'mobile-02-mother-morning.png'],
    [58, 'mobile-03-mother-calculation.png'],
    [62, 'mobile-04-commute-train.png'],
    [65, 'mobile-05-empty-desk.png'],
    [83, 'mobile-06-jiwoo-invite.png'],
    [95, 'mobile-07-father-tablet-cg.png'],
    [97, 'mobile-08-father-simulation-card.png'],
    [112, 'mobile-09-father-urgent.png'],
    [118, 'mobile-09b-father-port-realization.png'],
    [137, 'mobile-10-i-am-not-there.png'],
    [146, 'mobile-11-tablet-turned-off.png'],
    [150, 'mobile-12-father-never-lifted-head.png'],
    [175, 'mobile-13-clay-street-cg.png'],
    [197, 'mobile-14-street-one-month.png'],
    [226, 'mobile-15-night-reasons.png'],
    [230, 'mobile-16-turn-ad-back-on.png'],
    [239, 'mobile-17-dream-jiwoo.png'],
    [257, 'mobile-18-dream-mono-no-response.png'],
    [264, 'mobile-19-dream-termination-confirm.png'],
    [269, 'mobile-20-penalty-settlement.png'],
    [271, 'mobile-21-blackout.png'],
    [280, 'mobile-22-msg-1.png'],
    [283, 'mobile-23-msg-2.png'],
    [285, 'mobile-24-msg-3.png'],
  ]);

  const visitedRanges = [];
  let stepCount = 0;

  while (true) {
    const state = await page.evaluate(() => {
      const progressText = document.querySelector('#progressText')?.textContent?.trim() || '';
      const m = progressText.match(/^(\d+)(?:–(\d+))?\s*\/\s*(\d+)$/);
      const start = m ? Number(m[1]) - 1 : -1;
      const end = m ? (m[2] ? Number(m[2]) - 1 : start) : -1;
      const total = m ? Number(m[3]) : 0;
      const speaker = document.querySelector('#speaker')?.textContent?.trim() || '';
      const speakerHidden = document.querySelector('#speaker')?.hidden ?? true;
      const storyText = document.querySelector('#storyText')?.textContent || '';
      const primary = document.querySelector('#storyBox')?.classList.contains('primary-perception') || false;
      const neuralSender = document.querySelector('.neural-sender')?.textContent?.trim() || '';
      const neuralTitle = document.querySelector('.neural-title')?.textContent?.trim() || '';
      const neuralStatus = document.querySelector('.neural-status')?.textContent?.trim() || '';
      const neuralBody = document.querySelector('.neural-body')?.textContent?.trim() || '';
      const neuralHistory = [...document.querySelectorAll('.neural-history-entry')].map(n => n.textContent.trim());
      const docHidden = document.querySelector('.ep1-document')?.hidden ?? true;
      const docLabel = document.querySelector('.ep1-doc-label')?.textContent?.trim() || '';
      const actors = [...document.querySelectorAll('.ep1-actor')].map(a => ({
        id: a.dataset.id,
        asset: a.dataset.asset,
        pose: a.dataset.pose,
        rect: a.getBoundingClientRect().toJSON(),
      }));
      const cg = document.querySelector('.ep1-stage')?.dataset?.cg || '';
      const blackout = document.querySelector('#stage')?.classList.contains('ep1-blackout') || false;
      const scrollWidth = document.documentElement.scrollWidth;
      const storyBoxRect = document.querySelector('#storyBox')?.getBoundingClientRect()?.toJSON() || null;
      return {
        start, end, total, speaker, speakerHidden, storyText, primary,
        neuralSender, neuralTitle, neuralStatus, neuralBody, neuralHistory,
        docHidden, docLabel, actors, cg, blackout, scrollWidth, storyBoxRect,
      };
    });

    assert.equal(state.total, 286, `expected 286 total beats, got ${state.total}`);
    assert.ok(state.scrollWidth <= 400, `horizontal overflow (${state.scrollWidth}px) at beat ${state.start}`);
    visitedRanges.push([state.start, state.end]);

    // Specific scene assertions
    if (state.start === 8) {
      assert.equal(state.primary, true);
      assert.equal(state.neuralTitle, '수면 정산');
      assert.ok(state.neuralBody.includes('+0 TOKEN'));
    }
    if (state.start === 20) {
      assert.equal(state.actors.length, 2);
      for (const actor of state.actors) {
        assert.ok(actor.rect.top >= 0 && actor.rect.top < state.storyBoxRect.top, `actor ${actor.id} head not visible above storyBox at 20`);
      }
    }
    if (state.start === 58) {
      assert.equal(state.end, 61);
      assert.equal(state.cg, 'table');
      assert.ok(state.storyText.includes('하고 싶으면 해'));
      assert.ok(state.storyText.includes('대신 돈은 계산해야지'));
    }
    if (state.start === 65) {
      assert.equal(state.actors.length, 0);
    }
    if (state.start === 83) {
      assert.equal(state.primary, true);
      assert.equal(state.neuralSender, '지우');
      assert.equal(state.neuralBody, '오늘 시간 돼?');
    }
    if (state.start === 95) {
      assert.equal(state.cg, 'cgFatherTablet');
      assert.equal(state.docHidden, true);
    }
    if (state.start === 97) {
      assert.equal(state.primary, true);
      assert.equal(state.neuralSender, '지우 아버지의 태블릿');
      assert.equal(state.neuralTitle, '가계 시뮬레이션');
    }
    if (state.start === 112) {
      assert.equal(state.docHidden, false);
      assert.equal(state.docLabel, '지우 가족 가계 시뮬레이션');
      assert.equal(state.actors.find(a => a.id === 'father')?.asset, 'fatherUrgent');
    }
    if (state.start === 137) {
      assert.equal(state.end, 137);
      assert.equal(state.speaker, '지우');
      assert.equal(state.storyText.trim(), '“내가 없잖아.”');
    }
    if (state.start === 146) {
      assert.equal(state.end, 146);
      assert.equal(state.docHidden, true);
      const father = state.actors.find(a => a.id === 'father');
      assert.equal(father?.asset, 'fatherBowed');
      assert.equal(father?.pose, 'bowed');
    }
    if (state.start === 150) {
      const father = state.actors.find(a => a.id === 'father');
      assert.equal(father?.asset, 'fatherBowed');
    }
    if (state.start === 175) {
      assert.equal(state.cg, 'cgClayStreet');
    }
    if (state.start === 230) {
      assert.equal(state.cg, 'night');
    }
    if (state.start === 239) {
      assert.equal(state.cg, 'cgDreamResort');
      assert.equal(state.speaker, '꿈속 지우');
    }
    if (state.start === 257) {
      assert.equal(state.primary, true);
      assert.equal(state.neuralStatus, '응답 없음');
    }
    if (state.start === 264) {
      assert.equal(state.primary, true);
      assert.equal(state.neuralTitle, '선택 확인');
    }
    if (state.start === 269) {
      assert.equal(state.primary, true);
      assert.equal(state.neuralTitle, '중도 종료 정산');
      assert.ok(state.neuralBody.includes('-4.2 TOKEN'));
    }
    if (state.start === 271) {
      assert.equal(state.blackout, true);
    }
    if (state.start === 280) {
      assert.equal(state.primary, true);
      assert.equal(state.neuralSender, '지우');
      assert.equal(state.neuralBody, '나 꿈꿨어.');
      assert.deepEqual(state.neuralHistory, []);
    }
    if (state.start === 283) {
      assert.equal(state.primary, true);
      assert.equal(state.neuralSender, '지우');
      assert.equal(state.neuralBody, '근데 하나도 안 행복해.');
      assert.deepEqual(state.neuralHistory, ['나 꿈꿨어.']);
    }
    if (state.start === 285) {
      assert.equal(state.primary, true);
      assert.equal(state.neuralSender, '지우');
      assert.equal(state.neuralBody, '이상하게 좋다.');
      assert.deepEqual(state.neuralHistory, ['나 꿈꿨어.', '근데 하나도 안 행복해.']);
    }

    if (screenshotPlan.has(state.start)) {
      await page.waitForTimeout(620);
      await page.screenshot({ path: path.join(outDir, screenshotPlan.get(state.start)) });
    }

    stepCount += 1;
    if (state.end === 285) break;

    await page.click('#storyBox');
  }

  // Verify contiguous coverage of 0..285
  let expectedNext = 0;
  for (const [s, e] of visitedRanges) {
    assert.equal(s, expectedNext, `gap or overlap at ${s}, expected ${expectedNext}`);
    expectedNext = e + 1;
  }
  assert.equal(expectedNext, 286);

  // Test modal open/close backlog deduplication on beat 285
  const backlogBefore = await page.evaluate( async () => {
    document.querySelector('#backlogButton').click();
    const count = document.querySelectorAll('.backlog-entry').length;
    document.querySelector('#modalClose').click();
    return count;
  });
  const backlogAfter = await page.evaluate(async () => {
    document.querySelector('#gameSettingsButton').click();
    document.querySelector('#modalClose').click();
    document.querySelector('#backlogButton').click();
    const count = document.querySelectorAll('.backlog-entry').length;
    document.querySelector('#modalClose').click();
    return count;
  });
  assert.equal(backlogAfter, backlogBefore, 'closing settings/backlog modal must not duplicate backlog entries');

  // Advance from 285 -> Chapter Complete screen ('이상하게 좋다')
  await page.click('#storyBox');
  await page.waitForSelector('.end-screen');
  const ep2EndTitle = await page.textContent('.end-screen h2');
  assert.equal(ep2EndTitle.trim(), '이상하게 좋다');
  await page.screenshot({ path: path.join(outDir, 'mobile-25-chapter-complete.png') });

  // Click 다음 장 -> should transition to Episode 3 beat 0
  await page.click('.end-screen .end-actions button:first-child');
  await page.waitForFunction(() => document.querySelector('#chapterLabel')?.textContent?.trim() === '3화');
  const ep3Progress = await page.textContent('#progressText');
  assert.ok(ep3Progress.trim().startsWith('1 /'), `expected Episode 3 beat 1, got ${ep3Progress}`);

  // 2. Verify mid-bundle old save restoration (chapter '2', beatIndex 35 inside [33, 36])
  await page.evaluate(() => {
    const store = JSON.parse(localStorage.getItem('lost_dreams_vn_20261018_release1'));
    store.autosave = {
      timestamp: Date.now(),
      preview: '중간 저장 테스트',
      progress: { chapterId: '2', beatIndex: 35, finished: false, choices: {} },
    };
    localStorage.setItem('lost_dreams_vn_20261018_release1', JSON.stringify(store));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('#continueButton');
  await page.waitForSelector('#gameScreen:not([hidden])');
  const midSaveProgress = await page.textContent('#progressText');
  assert.equal(midSaveProgress.trim(), '36–37 / 286', 'old save inside a reading page must resume at exact saved beatIndex 35');
  await page.click('#previousButton');
  const prevFromMidSave = await page.textContent('#progressText');
  assert.equal(prevFromMidSave.trim(), '34–37 / 286', 'previous from mid-page save must go to start of that reading page (33)');

  await mobileContext.close();

  // 3. Desktop 1440x900 key scene verification
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const desktopPage = await desktopContext.newPage();
  desktopPage.on('console', msg => {
    if (msg.type() === 'error') errors.push(`desktop console.error: ${msg.text()}`);
  });
  desktopPage.on('pageerror', err => errors.push(`desktop pageerror: ${err.message}`));

  const desktopTargets = [
    [20, 'desktop-01-mother-morning.png'],
    [95, 'desktop-02-father-tablet-cg.png'],
    [112, 'desktop-03-father-simulation-stage.png'],
    [175, 'desktop-04-clay-street-cg.png'],
    [239, 'desktop-05-dream-resort.png'],
    [285, 'desktop-06-dawn-final-msg.png'],
  ];

  await desktopPage.goto(`${baseUrl}/index.html`, { waitUntil: 'networkidle' });
  for (const [beatIdx, filename] of desktopTargets) {
    await desktopPage.evaluate((idx) => {
      const raw = localStorage.getItem('lost_dreams_vn_20261018_release1');
      const store = raw ? JSON.parse(raw) : { version: 2, settings: {}, slots: [null, null, null], seen: ['2:280', '2:283'], metadata: {} };
      store.settings = { ...store.settings, instant: true, sound: false, reducedMotion: false };
      store.seen = ['2:280', '2:283'];
      store.autosave = {
        timestamp: Date.now(),
        preview: '데스크톱 캡처',
        progress: { chapterId: '2', beatIndex: idx, finished: false, choices: {} },
      };
      localStorage.setItem('lost_dreams_vn_20261018_release1', JSON.stringify(store));
    }, beatIdx);
    await desktopPage.reload({ waitUntil: 'networkidle' });
    await desktopPage.click('#continueButton');
    await desktopPage.waitForSelector('#gameScreen:not([hidden])');
    await desktopPage.waitForTimeout(80);
    await desktopPage.screenshot({ path: path.join(outDir, filename) });
  }
  await desktopContext.close();

  // 4. Offline single-HTML verification
  const offlineContext = await browser.newContext({ viewport: { width: 400, height: 844 } });
  const offlinePage = await offlineContext.newPage();
  offlinePage.on('console', msg => {
    if (msg.type() === 'error') errors.push(`offline console.error: ${msg.text()}`);
  });
  offlinePage.on('pageerror', err => errors.push(`offline pageerror: ${err.message}`));
  await offlinePage.goto(`${baseUrl}/play-offline.html`, { waitUntil: 'load' });
  await offlinePage.evaluate(() => {
    localStorage.setItem('lost_dreams_vn_20261018_release1', JSON.stringify({
      version: 2,
      settings: { instant: true, sound: false },
      slots: [null, null, null],
      seen: ['2:280', '2:283'],
      metadata: {},
      autosave: {
        timestamp: Date.now(),
        preview: '오프라인 확인',
        progress: { chapterId: '2', beatIndex: 95, finished: false, choices: {} },
      },
    }));
  });
  await offlinePage.reload({ waitUntil: 'load' });
  await offlinePage.click('#continueButton');
  await offlinePage.waitForSelector('#gameScreen:not([hidden])');
  const offlineCg = await offlinePage.getAttribute('.ep1-stage', 'data-cg');
  assert.equal(offlineCg, 'cgFatherTablet');
  await offlineContext.close();

  assert.deepEqual(errors, [], `Playwright verification encountered errors: ${errors.join('; ')}`);

  console.log(JSON.stringify({
    status: 'PASS',
    mobileReadingPagesStepped: stepCount,
    totalBeatsCovered: expectedNext,
    screenshotsCaptured: screenshotPlan.size + 1 + desktopTargets.length,
    backlogDeduplicatedCount: backlogAfter,
    midSaveResumeVerified: true,
    transitionsVerified: ['1->2', '2->3'],
    offlineHtmlVerified: true,
    errors: errors.length,
  }, null, 2));
} finally {
  await browser.close();
  server.close();
}
