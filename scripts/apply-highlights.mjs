// Evidențiază capabilitățile „ascunse” (doze/DRL, peer review, screening RMN,
// metrici productivitate) în paginile existente + corecția „dictare nativă în RIS”.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = join(import.meta.dirname, '..', 'src', 'content', 'copy');
const load = (p) => JSON.parse(readFileSync(join(dir, p + '.json'), 'utf8'));
const save = (p, o) => writeFileSync(join(dir, p + '.json'), JSON.stringify(o, null, 2), 'utf8');

// ── /platforma: secțiune nouă „calitate inclusă” după „Citirea și raportul” (idx 2) ──
const pRo = load('ro/platforma');
pRo.sections.splice(3, 0, {
  heading: 'Calitatea e inclusă, nu vândută separat',
  body: 'Capabilitățile pe care piața le vinde ca produse dedicate sunt aici parte din platformă. Registrul de doze urmărește fiecare expunere și doza cumulată per pacient, cu alerte când se depășesc nivelurile de referință. Peer review-ul cu scoring, cosemnarea și second opinion-ul rulează în același worklist, nu într-o aplicație paralelă.\n\nChestionarul de siguranță RMN e digital, în fluxul de programare — nu o hârtie rătăcită la recepție. Iar activitatea fiecărui radiolog se măsoară continuu, cu metrici gata de raport.',
  bullets: [
    '**Registru de doze + alerte DRL.** Doză per studiu și cumulativă per pacient, cu alertă la depășirea nivelurilor de referință.',
    '**Peer review cu scoring.** Discrepanțe, cosemnare, second opinion — integrate în citirea de zi cu zi.',
    '**Screening RMN digital.** Chestionar structurat de siguranță, completat înainte de examinare, arhivat cu studiul.',
    '**Metrici per radiolog.** Volum, timpi, calitate — vizibile live.',
  ],
  visual_note: 'patru carduri sobre, fără iconografie medicală clișeu',
});
save('ro/platforma', pRo);

const pEn = load('en/platforma');
pEn.sections.splice(3, 0, {
  heading: 'Quality is included, not sold separately',
  body: 'The capabilities the market sells as dedicated products are part of the platform here. The dose registry tracks every exposure and the cumulative dose per patient, with alerts when reference levels are exceeded. Peer review with scoring, co-signing and second opinions run in the same worklist, not in a parallel application.\n\nThe MRI safety questionnaire is digital, inside the scheduling flow — not a sheet of paper lost at the front desk. And every radiologist’s activity is measured continuously, with report-ready metrics.',
  bullets: [
    '**Dose registry + DRL alerts.** Per-study and cumulative per-patient dose, with alerts when reference levels are exceeded.',
    '**Peer review with scoring.** Discrepancies, co-signing, second opinions — built into everyday reading.',
    '**Digital MRI safety screening.** A structured questionnaire, completed before the exam, archived with the study.',
    '**Per-radiologist metrics.** Volume, turnaround, quality — visible live.',
  ],
  visual_note: 'four sober cards, no clichéd medical iconography',
});
save('en/platforma', pEn);

// ── /platforma/ris-raportare: dictare nativă + fluxuri de calitate ──
const rRo = load('ro/platforma__ris-raportare');
rRo.sections[1].body += '\n\nDictarea e nativă în RIS — nu o aplicație separată, nu o licență bolt-on. Deschizi raportul, vorbești, textul e acolo.';
rRo.sections[5].body += '\n\nTot aici trăiesc fluxurile de calitate: cosemnare pentru medicii în supervizare, peer review cu scoring și discrepanțe, second opinion — în worklist, nu într-o aplicație paralelă.';
save('ro/platforma__ris-raportare', rRo);

const rEn = load('en/platforma__ris-raportare');
rEn.sections[1].body += '\n\nDictation is native to the RIS — not a separate application, not a bolt-on license. You open the report, you speak, the text is there.';
rEn.sections[5].body += '\n\nThe quality workflows live here too: co-signing for supervised physicians, peer review with scoring and discrepancies, second opinions — in the worklist, not in a parallel application.';
save('en/platforma__ris-raportare', rEn);

// ── /solutii/spitale: bullets de conformitate la „Pregătit de control” (idx 3) ──
const sRo = load('ro/solutii__spitale');
sRo.sections[3].bullets = [
  ...(sRo.sections[3].bullets || []),
  '**Registru de doze cu alerte DRL.** Evidența expunerilor per studiu și cumulativ per pacient — cerința de radioprotecție, acoperită nativ, fără un produs separat.',
  '**Peer review cu scoring.** Program de calitate integrat: discrepanțe, cosemnare, statistici per radiolog.',
  '**Screening de siguranță RMN, digital.** Chestionar structurat, completat înainte de examinare, arhivat cu studiul.',
];
save('ro/solutii__spitale', sRo);

const sEn = load('en/solutii__spitale');
sEn.sections[3].bullets = [
  ...(sEn.sections[3].bullets || []),
  '**Dose registry with DRL alerts.** Exposure records per study and cumulative per patient — the radiation-protection requirement, covered natively, with no separate product.',
  '**Peer review with scoring.** An integrated quality program: discrepancies, co-signing, per-radiologist statistics.',
  '**Digital MRI safety screening.** A structured questionnaire, completed before the exam, archived with the study.',
];
save('en/solutii__spitale', sEn);

// ── /solutii/teleradiologie: calitatea măsurată pe pool (idx 4) ──
const tRo = load('ro/solutii__teleradiologie');
tRo.sections[4].body += '\n\nȘi calitatea se măsoară la fel de ușor: peer review cu scoring și discrepanțe pe fiecare membru al pool-ului — dovada pe care o pui pe masă când clientul întreabă de calitate.';
save('ro/solutii__teleradiologie', tRo);

const tEn = load('en/solutii__teleradiologie');
tEn.sections[4].body += '\n\nAnd quality is just as measurable: peer review with scoring and discrepancies for every member of the pool — the proof you put on the table when a client asks about quality.';
save('en/solutii__teleradiologie', tEn);

console.log('highlights aplicate');
