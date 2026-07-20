import { chromium } from 'playwright';
const B = 'http://localhost:4321';
const br = await chromium.launch();
for (const w of [320, 360, 390]) {
  const c = await br.newContext({ viewport: { width: w, height: 800 }, deviceScaleFactor: 2, isMobile: true });
  const p = await c.newPage();
  for (const u of ['/platforma/zenagent/', '/en/platforma/zenagent/']) {
    await p.goto(B + u, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(200);
    const bad = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    console.log(`w=${w} ${u} ${bad ? 'OVERFLOW' : 'ok'}`);
  }
  await c.close();
}
await br.close();
