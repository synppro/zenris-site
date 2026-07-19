import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:4321';
const OUT = 'scripts/shots';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` });

// 1. Homepage RO — hero
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await shot('01-home-hero');

// 2. Scrollytelling mid-story (pasul 4 — viewerul)
await page.locator('.step[data-step="3"]').scrollIntoViewIfNeeded();
await page.waitForTimeout(900);
await shot('02-home-story-step4');

// 3. Diagrama de izolare + interacțiune
await page.locator('#izolare').scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await page.locator('.iso-btns button[data-sel="radiolog"]').click();
await page.waitForTimeout(400);
await shot('03-home-izolare-radiolog');

// 4. Deployment toggle -> cloud
await page.locator('#deployment').scrollIntoViewIfNeeded();
await page.locator('.seg button[data-d="cloud"]').click();
await page.waitForTimeout(300);
await shot('04-home-deploy-cloud');

// 5. Module + final
await page.locator('#module').scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await shot('05-home-module');

// 6. EN homepage
await page.goto(BASE + '/en/', { waitUntil: 'networkidle' });
await shot('06-en-home');

// 7. PACS viewer page
await page.goto(BASE + '/platforma/pacs-viewer/', { waitUntil: 'networkidle' });
await shot('07-pacs-viewer');

// 8. Arhitectura
await page.goto(BASE + '/arhitectura/', { waitUntil: 'networkidle' });
await shot('08-arhitectura');

// 9. Demo + light theme
await page.goto(BASE + '/demo/', { waitUntil: 'networkidle' });
await shot('09-demo');
await page.click('#theme-toggle');
await page.waitForTimeout(300);
await shot('10-demo-light');

// 10. Light homepage
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(300);
await shot('11-home-light');

// link check pe toate paginile interne
const seen = new Set();
const queue = ['/'];
const broken = [];
while (queue.length) {
  const path = queue.shift();
  if (seen.has(path)) continue;
  seen.add(path);
  const resp = await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
  if (!resp || resp.status() >= 400) { broken.push(`${path} -> ${resp?.status()}`); continue; }
  const hrefs = await page.$$eval('a[href^="/"]', (as) => as.map((a) => a.getAttribute('href')));
  for (const h of hrefs) {
    const clean = h.split('#')[0];
    if (clean && !seen.has(clean)) queue.push(clean);
  }
}

console.log('pages crawled:', seen.size);
console.log('broken links:', broken.length ? broken : 'none');
console.log('console errors:', errors.length ? [...new Set(errors)].slice(0, 10) : 'none');
await browser.close();
