// ZenVNA (profil de arhivare) + licențierea pe spațiu în copy-ul paginilor.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(import.meta.dirname, '..', 'src', 'content', 'copy');
const load = (p) => JSON.parse(readFileSync(join(dir, p + '.json'), 'utf8'));
const save = (p, o) => writeFileSync(join(dir, p + '.json'), JSON.stringify(o, null, 2), 'utf8');

// ── /platforma: secțiunea ZenVNA după „Imaginile știu unde să meargă” (idx 1) ──
const pRo = load('ro/platforma');
if (!pRo.sections.some((s) => s.id === 'vna')) {
  pRo.sections.splice(2, 0, {
    id: 'vna',
    heading: 'Doar arhivă? Există ZenVNA.',
    body: 'Nu orice cabinet are nevoie de un RIS. Un ecograf, un aparat de radiologie, un flux mic — dar aceleași obligații de arhivare. ZenVNA e profilul minimal al platformei: aceeași arhivă DICOM sigură, cu izolare per instituție, catalog tehnic cu căutare și cote de stocare transparente — fără fluxul clinic pe care nu-l folosești.\n\nIar când crești, treci la ZenRIS complet fără migrare: e aceeași arhivă, în același standard.',
    bullets: [
      '**Orice echipament DICOM trimite direct.** Ecograf, RX, orice — arhivat în câteva secunde.',
      '**Catalog tehnic cu căutare.** Studii și serii, filtrabile, cu statistici per instituție.',
      '**Cote de stocare transparente.** Vezi exact cât ocupi și cât mai ai — fără surprize.',
      '**Datele rămân în DICOM standard.** Le recuperezi oricând, pe orice sistem.',
    ],
    visual_note: 'card sobru cu un contor de stocare (folosit X din Y) + listă de studii',
  });
  save('ro/platforma', pRo);
}

const pEn = load('en/platforma');
if (!pEn.sections.some((s) => s.id === 'vna')) {
  pEn.sections.splice(2, 0, {
    id: 'vna',
    heading: 'Archive only? There’s ZenVNA.',
    body: 'Not every practice needs a RIS. An ultrasound machine, an X-ray unit, a small workflow — but the same archiving obligations. ZenVNA is the platform’s minimal profile: the same secure DICOM archive, with per-institution isolation, a searchable technical catalog and transparent storage quotas — without the clinical workflow you don’t use.\n\nAnd when you grow, you move to the full ZenRIS with no migration: it’s the same archive, in the same standard.',
    bullets: [
      '**Any DICOM device sends directly.** Ultrasound, X-ray, anything — archived in seconds.',
      '**A searchable technical catalog.** Studies and series, filterable, with per-institution statistics.',
      '**Transparent storage quotas.** See exactly how much you use and how much is left — no surprises.',
      '**Data stays in standard DICOM.** Retrieve it any time, onto any system.',
    ],
    visual_note: 'sober card with a storage meter (X of Y used) + study list',
  });
  save('en/platforma', pEn);
}

// ── /solutii/clinici: traseul de creștere în closing ──
const cRo = load('ro/solutii__clinici');
if (!cRo.closing.body.includes('ZenVNA')) {
  cRo.closing.body += '\n\nȘi dacă azi ai doar un ecograf: începi cu ZenVNA — doar arhiva, licențiată pe spațiu — și treci la platforma completă când crește fluxul. Pe aceeași arhivă, fără migrare.';
  save('ro/solutii__clinici', cRo);
}
const cEn = load('en/solutii__clinici');
if (!cEn.closing.body.includes('ZenVNA')) {
  cEn.closing.body += '\n\nAnd if all you have today is an ultrasound machine: start with ZenVNA — just the archive, licensed by storage — and move to the full platform as your volume grows. Same archive, no migration.';
  save('en/solutii__clinici', cEn);
}

console.log('vna aplicat');
