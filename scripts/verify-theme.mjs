import { chromium } from 'playwright';
const BASE = 'http://localhost:4321';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(500);
const bg1 = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const theme1 = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
console.log('default: data-theme=', theme1, 'body-bg=', bg1);
await page.screenshot({ path: 'scripts/shots/13-default-light.png' });

// toggle -> dark
await page.click('#theme-toggle');
await page.waitForTimeout(400);
const bg2 = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
const theme2 = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
console.log('după toggle: data-theme=', theme2, 'body-bg=', bg2);
await page.screenshot({ path: 'scripts/shots/14-toggled-dark.png' });

// persistență la reload
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(400);
const theme3 = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
console.log('după reload (trebuie dark, persistat):', theme3);

await browser.close();
console.log('THEME CHECK DONE');
