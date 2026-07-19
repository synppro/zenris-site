import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(import.meta.dirname, '..', 'src', 'content', 'copy', 'ro');
const load = (f) => JSON.parse(readFileSync(join(dir, f), 'utf8'));
const save = (f, o) => writeFileSync(join(dir, f), JSON.stringify(o, null, 2), 'utf8');

const walk = (o, fn) => {
  if (typeof o === 'string') return fn(o);
  if (Array.isArray(o)) return o.map((x) => walk(x, fn));
  if (o && typeof o === 'object') return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, walk(v, fn)]));
  return o;
};

// 6) ghilimele: orice " dreaptă în text devine ” (deschiderile sunt mereu „)
const fixQuotes = (s) => s.replace(/"/g, '”');

// 1) pacs-viewer: claim de performanță cu cifră
let p = load('platforma__pacs-viewer.json');
p = walk(p, (s) => fixQuotes(s
  .replace('Prima imagine, sub o secundă.', 'Prima imagine, înainte să te așezi.')
  .replace(/sub o secundă/g, 'imediat')));
save('platforma__pacs-viewer.json', p);

// 2) solutii/teleradiologie: onboarding condițional
let st = load('solutii__teleradiologie.json');
st = walk(st, (s) => fixQuotes(s
  .replace('Onboarding în aceeași zi.', 'Onboarding posibil în aceeași zi.')
  .replace('e o zi de lucru, nu un trimestru', 'poate fi o zi de lucru, nu un trimestru')));
save('solutii__teleradiologie.json', st);

// 3+4) arhitectura: OIDC + reordonare „Concret:”
let a = load('arhitectura.json');
a = walk(a, (s) => fixQuotes(s
  .replace('AD/LDAP, SAML, OIDC', 'AD/LDAP, SAML')
  .replace('AD/LDAP/SAML–OIDC', 'AD/LDAP/SAML')
  .replace(/SAML, OIDC/g, 'SAML')));
for (const sec of a.sections) {
  if (sec.body && sec.body.includes('Concret:')) {
    const m = sec.body.match(/Concret:\s*\n\n(Integrările cu RadiAnt[\s\S]*?)(\n\n|$)/);
    if (m) {
      sec.body = sec.body.replace(m[0], 'Concret:' + (m[2] || ''));
      sec.body = sec.body.replace('Concret:', m[1] + '\n\nConcret:');
    }
  }
}
save('arhitectura.json', a);

// 5) platforma: atribuirea concluziei -> ZenReport
let pl = load('platforma.json');
pl = walk(pl, (s) => fixQuotes(s.replace(
  'Dictare în română, structurare automată, propunere de concluzie.',
  'Dictare în română, cu structurare automată pe secțiunile raportului.')));
save('platforma.json', pl);

// ghilimele pe restul paginilor
for (const f of ['platforma__ris-raportare.json', 'platforma__teleradiologie.json', 'platforma__portal-pacient.json', 'solutii__clinici.json', 'solutii__spitale.json']) {
  save(f, walk(load(f), fixQuotes));
}
console.log('audit fixes applied');
