import { chromium } from 'playwright';

const BASE = 'http://localhost:4321';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });

const img = page.locator('#ct-img');
const ov = page.locator('#ct-ov');

const src0 = await img.getAttribute('src');
console.log('initial:', src0, '|', await ov.textContent());

// 1. wheel = navigare felii
await img.hover();
await page.mouse.wheel(0, 240);
await page.waitForTimeout(200);
const afterWheel = await img.getAttribute('src');
console.log('după wheel:', afterWheel, '|', await ov.textContent());

// 2. click pe seria de os
await page.locator('.rail button[data-series="b"]').click();
await page.waitForTimeout(200);
const afterSeries = await img.getAttribute('src');
console.log('după click seria b:', afterSeries, '|', await ov.textContent());
if (!afterSeries.includes('/ct/b/')) throw new Error('seria nu s-a schimbat!');

// 3. drag orizontal = contrast
const box = await page.locator('#ct-vport').boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await page.mouse.down();
await page.mouse.move(box.x + box.width / 2 + 160, box.y + box.height / 2, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(200);
const filter = await img.evaluate((el) => el.style.filter);
console.log('după drag orizontal:', filter, '|', await ov.textContent());
if (!/contrast\((?!1\))/.test(filter)) throw new Error('contrastul nu s-a schimbat!');

// 4. drag vertical = felii
await page.mouse.move(box.x + box.width / 2, box.y + 100);
await page.mouse.down();
await page.mouse.move(box.x + box.width / 2, box.y + 100 + 140, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(200);
console.log('după drag vertical:', await img.getAttribute('src'), '|', await ov.textContent());

// 5. hint dispărut după interacțiune
const hintGone = await page.locator('#ct-hint').evaluate((el) => el.classList.contains('gone'));
console.log('hint ascuns:', hintGone);

await page.screenshot({ path: 'scripts/shots/12-viewer-interactiv.png' });

// 6. EN
await page.goto(BASE + '/en/', { waitUntil: 'domcontentloaded' });
await page.locator('.rail button[data-series="c"]').click();
await page.waitForTimeout(200);
const enSeries = await page.locator('#ct-img').getAttribute('src');
console.log('EN seria c:', enSeries);
if (!enSeries.includes('/ct/c/')) throw new Error('EN: seria nu s-a schimbat!');

console.log('pageerrors:', errors.length ? errors : 'none');
await browser.close();
console.log('VIEWER OK');
