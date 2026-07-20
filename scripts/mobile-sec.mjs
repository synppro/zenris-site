import { chromium } from 'playwright';
const BASE = 'http://localhost:4321';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
const page = await ctx.newPage();

for (const [p, name] of [['/', 'ro'], ['/en/', 'en']]) {
  await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);
  const info = await page.evaluate(() => {
    const list = document.querySelector('#securitate .check-list');
    const items = [...list.querySelectorAll('li')];
    const lefts = new Set(items.map((li) => Math.round(li.getBoundingClientRect().left)));
    const allInView = items.every((li) => li.getBoundingClientRect().right <= document.documentElement.clientWidth + 1);
    return { count: items.length, columns: lefts.size, allInView };
  });
  console.log(`${name}: ${info.count} elemente, ${info.columns} coloana(e), toate in ecran: ${info.allInView}`);
  await page.locator('#securitate').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `scripts/shots/m-sec-${name}.png` });
}
await browser.close();
console.log('done');
