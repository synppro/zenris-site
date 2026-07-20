import { chromium } from 'playwright';

const BASE = 'http://localhost:4321';
const pages = [
  '/', '/platforma/', '/platforma/pacs-viewer/', '/platforma/ris-raportare/',
  '/platforma/teleradiologie/', '/platforma/portal-pacient/',
  '/solutii/clinici/', '/solutii/spitale/', '/solutii/teleradiologie/',
  '/arhitectura/', '/noutati/', '/demo/', '/en/',
];

const browser = await chromium.launch();
// iPhone 13/14 logic viewport
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true });
const page = await ctx.newPage();

let anyOverflow = false;
for (const p of pages) {
  await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(300);
  const res = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const docW = document.documentElement.scrollWidth;
    const offenders = [];
    if (docW > vw + 1) {
      for (const el of document.querySelectorAll('*')) {
        const r = el.getBoundingClientRect();
        if (r.right > vw + 1 && r.width > 0 && r.left >= -1) {
          // doar elementele care chiar depasesc si nu au un parinte deja raportat
          offenders.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className && el.className.toString ? el.className.toString() : '').slice(0, 40),
            right: Math.round(r.right),
            width: Math.round(r.width),
          });
        }
      }
    }
    return { vw, docW, offenders: offenders.slice(0, 8) };
  });
  const flag = res.docW > res.vw + 1 ? '  <<< OVERFLOW' : 'ok';
  console.log(`${p}  vw=${res.vw} docW=${res.docW} ${flag}`);
  if (res.docW > res.vw + 1) {
    anyOverflow = true;
    for (const o of res.offenders) console.log(`     ${o.tag}.${o.cls} right=${o.right} w=${o.width}`);
  }
}

// screenshot cateva sectiuni cheie pe mobil
await page.goto(BASE + '/arhitectura/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(300);
await page.screenshot({ path: 'scripts/shots/m-arhitectura.png', fullPage: false });
await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(300);
await page.screenshot({ path: 'scripts/shots/m-home.png', fullPage: false });

await browser.close();
console.log(anyOverflow ? 'REZULTAT: EXISTA OVERFLOW' : 'REZULTAT: zero overflow');
