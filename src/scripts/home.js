// Interacțiunile homepage-ului (RO + EN): scrollytelling, diagrama de izolare, toggle deployment.

const steps = [...document.querySelectorAll('.step')];
const screens = [...document.querySelectorAll('.stage .screen')];
if (steps.length && screens.length) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const idx = Number(e.target.dataset.step);
        steps.forEach((s, i) => s.classList.toggle('active', i === idx));
        screens.forEach((s) => s.classList.toggle('on', Number(s.dataset.visual) === idx));
      }
    },
    { rootMargin: '-40% 0px -40% 0px' }
  );
  steps.forEach((s) => io.observe(s));
  screens[0]?.classList.add('on');
  steps[0]?.classList.add('active');
}

const isoSvg = document.getElementById('iso-svg');
const isoNote = document.getElementById('iso-note');
const poolLabel = document.getElementById('pool-label');
const isoButtons = [...document.querySelectorAll('.iso-btns button')];
function selectIso(k) {
  if (!isoSvg) return;
  const btn = isoButtons.find((b) => b.dataset.sel === k);
  isoSvg.setAttribute('data-sel', k);
  if (isoNote && btn?.dataset.note) isoNote.textContent = btn.dataset.note;
  if (poolLabel) {
    poolLabel.textContent = k === 'radiolog'
      ? isoSvg.dataset.poolActive || poolLabel.textContent
      : isoSvg.dataset.poolLabel || poolLabel.textContent;
  }
  isoButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sel === k)));
}
isoButtons.forEach((b) => b.addEventListener('click', () => selectIso(b.dataset.sel)));
document.querySelectorAll('#iso-svg .inst').forEach((g) => {
  g.addEventListener('click', () => selectIso(g.dataset.inst));
  g.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectIso(g.dataset.inst); }
  });
});

const deploy = document.querySelector('.deploy');
deploy?.querySelectorAll('.seg button').forEach((b) =>
  b.addEventListener('click', () => {
    const mode = b.dataset.d;
    deploy.setAttribute('data-deploy', mode);
    deploy.querySelectorAll('.seg button').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
    deploy.querySelectorAll('.d-pane').forEach((p) => { p.hidden = p.dataset.pane !== mode; });
  })
);
