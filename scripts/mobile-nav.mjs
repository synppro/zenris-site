import { chromium } from 'playwright';
const BASE = 'http://localhost:4321';
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
const page = await ctx.newPage();
await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(300);

const burgerVisible = await page.locator('#nav-toggle').isVisible();
console.log('hamburger vizibil pe mobil:', burgerVisible);

await page.locator('#nav-toggle').click();
await page.waitForTimeout(400);
const navOpen = await page.evaluate(() => {
  const nav = document.querySelector('.site-header .nav');
  const r = nav.getBoundingClientRect();
  return { hasOpen: nav.classList.contains('open'), visible: r.height > 0 && getComputedStyle(nav).display !== 'none', links: nav.querySelectorAll('a,button').length };
});
console.log('nav dupa click:', JSON.stringify(navOpen));
await page.screenshot({ path: 'scripts/shots/m-nav2.png' });

// expandez un submeniu (Platforma)
await page.locator('.site-header .nav .drop > button').first().click();
await page.waitForTimeout(300);
await page.screenshot({ path: 'scripts/shots/m-nav3-submenu.png' });

// verific viewerul: tap pe seria de os pe mobil
await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(400);
await page.locator('.rail button[data-series="b"]').click();
await page.waitForTimeout(300);
const src = await page.locator('#ct-img').getAttribute('src');
console.log('viewer tap serie os -> src:', src, src.includes('/ct/b/') ? 'OK' : 'FAIL');

await browser.close();
console.log('done');
