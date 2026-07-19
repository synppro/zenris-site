import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(import.meta.dirname, '..', 'src', 'content', 'copy');
const load = (p) => JSON.parse(readFileSync(join(dir, p), 'utf8'));
const save = (p, o) => writeFileSync(join(dir, p), JSON.stringify(o, null, 2), 'utf8');
const walk = (o, fn) => {
  if (typeof o === 'string') return fn(o);
  if (Array.isArray(o)) return o.map((x) => walk(x, fn));
  if (o && typeof o === 'object') return Object.fromEntries(Object.entries(o).map(([k, v]) => [k, walk(v, fn)]));
  return o;
};
const email = (s) => s.replace(/\be-mail\b/g, 'email').replace(/\bE-mail\b/g, 'Email');

// EN teleradiologie: mistranslation
let tel = load('en/platforma__teleradiologie.json');
tel = walk(tel, (s) => email(s.replace('no VPN configured by a patient colleague', 'no VPN cobbled together by an obliging colleague')));
save('en/platforma__teleradiologie.json', tel);

// EN homepage: dictation language + SSO punctuation
let home = load('en/homepage.json');
home = walk(home, (s) => email(s
  .replace('AI voice dictation', 'voice dictation in Romanian')
  .replace('voice dictation with AI', 'AI-assisted voice dictation in Romanian')
  .replace('SAML–OIDC', 'SAML/OIDC')));
save('en/homepage.json', home);

// EN solutii/clinici: glosses
let cl = load('en/solutii__clinici.json');
cl = walk(cl, (s) => email(s
  .replace('automatic CNAS claims', 'automatic claims to CNAS, Romania’s national health insurance house')
  .replace('SIUI exports and image CDs', 'SIUI exports (the legacy desktop claims app) and image CDs')));
save('en/solutii__clinici.json', cl);

// EN: email unify pe restul
for (const f of ['en/arhitectura.json', 'en/platforma.json', 'en/platforma__pacs-viewer.json', 'en/platforma__portal-pacient.json', 'en/platforma__ris-raportare.json', 'en/solutii__spitale.json', 'en/solutii__teleradiologie.json', 'en/misc.json']) {
  save(f, walk(load(f), email));
}

// EN arhitectura + RO arhitectura: OIDC e aprobat — restaurează consecvent
let aen = load('en/arhitectura.json');
aen = walk(aen, (s) => s.replace('AD/LDAP, SAML.', 'AD/LDAP, SAML/OIDC.').replace('AD/LDAP, SAML,', 'AD/LDAP, SAML/OIDC,'));
save('en/arhitectura.json', aen);
let aro = load('ro/arhitectura.json');
aro = walk(aro, (s) => s.replace('AD/LDAP, SAML.', 'AD/LDAP, SAML/OIDC.').replace('AD/LDAP, SAML,', 'AD/LDAP, SAML/OIDC,'));
save('ro/arhitectura.json', aro);

console.log('review fixes applied');
