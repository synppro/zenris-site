import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const src = process.argv[2];
const raw = JSON.parse(readFileSync(src, 'utf8'));
const result = raw.result ?? raw;
const outDir = join(import.meta.dirname, '..', 'src', 'content', 'copy', 'en');
mkdirSync(outDir, { recursive: true });

for (const page of result.pages) {
  writeFileSync(join(outDir, page.slug.replace(/\//g, '__') + '.json'), JSON.stringify(page, null, 2), 'utf8');
}
writeFileSync(join(outDir, 'homepage.json'), JSON.stringify(result.home, null, 2), 'utf8');
writeFileSync(join(outDir, 'misc.json'), JSON.stringify(result.misc, null, 2), 'utf8');
writeFileSync(join(outDir, '..', 'review-en.json'), JSON.stringify(result.review, null, 2), 'utf8');
console.log('pages:', result.pages.length, '| review issues:', result.review?.issues?.length);
console.log(result.review?.overall?.slice(0, 800) ?? '');
