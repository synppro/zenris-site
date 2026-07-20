import { chromium } from 'playwright';
const BASE = 'http://localhost:4321';
const browser = await chromium.launch();

for (const w of [320, 360, 390]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, deviceScaleFactor: 2, isMobile: true });
  const page = await ctx.newPage();
  let overflow = [];
  for (const p of ['/', '/en/', '/arhitectura/', '/platforma/pacs-viewer/', '/demo/']) {
    await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(250);
    const bad = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    if (bad) overflow.push(p);
  }
  console.log(`w=${w}: ${overflow.length ? 'OVERFLOW la ' + overflow.join(', ') : 'ok'}`);
  await ctx.close();
}

// capturez tabelul deploy + meniul mobil pe 390
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
const page = await ctx.newPage();
await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(300);
await page.locator('#deployment').scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await page.screenshot({ path: 'scripts/shots/m-deploy-table.png' });
// meniul hamburger
await page.evaluate(() => window.scrollTo(0, 0));
await page.click('#nav-toggle');
await page.waitForTimeout(300);
await page.screenshot({ path: 'scripts/shots/m-nav-open.png' });

await browser.close();
console.log('done');
