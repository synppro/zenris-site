import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const src = process.argv[2];
const raw = JSON.parse(readFileSync(src, 'utf8'));
const result = raw.result ?? raw;
const outDir = join(import.meta.dirname, '..', 'src', 'content', 'copy', 'ro');
mkdirSync(outDir, { recursive: true });

for (const page of result.pages) {
  const file = join(outDir, page.slug.replace(/\//g, '__') + '.json');
  writeFileSync(file, JSON.stringify(page, null, 2), 'utf8');
  console.log('wrote', file);
}
writeFileSync(join(outDir, '..', 'audit-ro.json'), JSON.stringify(result.audit, null, 2), 'utf8');
console.log('audit issues:', result.audit?.issues?.length ?? 'n/a');
console.log('overall:', result.audit?.overall ?? '');
