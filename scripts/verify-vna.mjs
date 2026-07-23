import { chromium } from 'playwright';
const BASE = 'http://localhost:4321';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// 1. teaserul de pe homepage duce la ancora #vna
await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(300);
const teaser = await page.locator('.vna-teaser a').getAttribute('href');
console.log('teaser href:', teaser);
await page.locator('.vna-teaser a').click();
await page.waitForTimeout(600);
console.log('url după click:', page.url());
const anchored = await page.evaluate(() => {
  const el = document.getElementById('vna');
  if (!el) return 'LIPSĂ #vna';
  const r = el.getBoundingClientRect();
  return `#vna există, top=${Math.round(r.top)} (vizibil: ${r.top < 300})`;
});
console.log(anchored);
await page.screenshot({ path: 'scripts/shots/vna-section.png' });

// 2. chips hero (5 acum) + subtitlul de la module
await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
const chips = await page.locator('.hero .chips .chip').count();
console.log('chips hero RO:', chips);
await page.goto(BASE + '/en/', { waitUntil: 'domcontentloaded' });
const chipsEn = await page.locator('.hero .chips .chip').count();
console.log('chips hero EN:', chipsEn);

// 3. mobil overflow pe paginile atinse
const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
const pm = await m.newPage();
const bad = [];
for (const u of ['/', '/en/', '/platforma/', '/en/platforma/', '/solutii/clinici/']) {
  await pm.goto(BASE + u, { waitUntil: 'domcontentloaded' });
  await pm.waitForTimeout(250);
  if (await pm.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)) bad.push(u);
}
console.log('mobil overflow:', bad.length ? bad : 'zero');

await browser.close();
console.log('done');
