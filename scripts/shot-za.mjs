import { chromium } from 'playwright';
const BASE = 'http://localhost:4321/platforma/zenagent/';
const browser = await chromium.launch();

const d = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const pd = await d.newPage();
await pd.goto(BASE, { waitUntil: 'domcontentloaded' });
await pd.waitForTimeout(400);
await pd.screenshot({ path: 'scripts/shots/za-desktop.png' });
await pd.evaluate(() => document.querySelector('#cum').scrollIntoView());
await pd.waitForTimeout(300);
await pd.screenshot({ path: 'scripts/shots/za-flow.png' });

const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
const pm = await m.newPage();
await pm.goto(BASE, { waitUntil: 'domcontentloaded' });
await pm.waitForTimeout(400);
const overflow = await pm.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
console.log('mobil overflow:', overflow);
await pm.evaluate(() => document.querySelector('#cum').scrollIntoView());
await pm.waitForTimeout(300);
await pm.screenshot({ path: 'scripts/shots/za-mobile-flow.png' });

await browser.close();
console.log('done');
