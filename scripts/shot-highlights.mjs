import { chromium } from 'playwright';
const BASE = 'http://localhost:4321';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(400);
await page.locator('.included').scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await page.screenshot({ path: 'scripts/shots/hl-home-included.png' });

await page.goto(BASE + '/platforma/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(300);
const h = await page.evaluate(() => [...document.querySelectorAll('h2')].map((x) => x.textContent).slice(0, 8));
console.log('platforma h2:', h.join(' | '));
await page.evaluate(() => [...document.querySelectorAll('h2')].find((x) => x.textContent.includes('Calitatea'))?.scrollIntoView());
await page.waitForTimeout(300);
await page.screenshot({ path: 'scripts/shots/hl-platforma-calitate.png' });

// mobil: overflow check pe paginile modificate
const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
const pm = await m.newPage();
let bad = [];
for (const u of ['/', '/en/', '/platforma/', '/en/platforma/', '/solutii/spitale/', '/platforma/ris-raportare/', '/solutii/teleradiologie/']) {
  await pm.goto(BASE + u, { waitUntil: 'domcontentloaded' });
  await pm.waitForTimeout(250);
  const o = await pm.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  if (o) bad.push(u);
}
console.log('mobil overflow:', bad.length ? bad : 'zero');
await browser.close();
console.log('done');
