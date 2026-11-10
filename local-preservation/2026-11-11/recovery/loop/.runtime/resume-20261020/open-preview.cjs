const fs = require('fs');
const { chromium } = require('C:/Users/jbseo/.gemini/antigravity-cli/brain/e2d8e107-51da-4d48-ac0c-d7e6ea1487ac/scratch/node_modules/playwright-core');
(async () => {
  const browser = await chromium.launch({ headless: false, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  browser.on('disconnected', () => process.exit(0));
  const ep2Context = await browser.newContext({ viewport: null });
  const ep2 = await ep2Context.newPage();
  await ep2.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await ep2.locator('#chaptersButton').click();
  await ep2.locator('.chapter-card').filter({ hasText: 'AI가 모르는 것' }).getByRole('button', { name: '읽기', exact: true }).click();
  await ep2.locator('#gameScreen').waitFor({ state: 'visible' });
  const sequenceContext = await browser.newContext({ viewport: null });
  const sequence = await sequenceContext.newPage();
  await sequence.goto('http://127.0.0.1:4173/?sequence=19-22&chapter=19&beat=0', { waitUntil: 'networkidle' });
  await sequence.locator('#gameScreen').waitFor({ state: 'visible' });
  const state = {
    status: 'OPEN',
    episodeTwo: { url: ep2.url(), chapter: await ep2.locator('#chapterLabel').innerText(), title: await ep2.locator('#chapterTitle').innerText(), progress: await ep2.locator('#progressText').innerText() },
    sequence: { url: sequence.url(), chapter: await sequence.locator('#chapterLabel').innerText(), title: await sequence.locator('#chapterTitle').innerText(), progress: await sequence.locator('#progressText').innerText() },
    isolatedReadingSaves: true
  };
  fs.writeFileSync(__dirname + '/preview-open-state.json', JSON.stringify(state, null, 2));
  console.log(JSON.stringify(state, null, 2));
  await ep2.bringToFront();
})().catch(error => { console.error(error); process.exitCode = 1; });

