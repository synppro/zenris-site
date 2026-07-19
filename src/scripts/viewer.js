// Mini-viewerul interactiv din hero: stive CT reale.
// scroll / drag vertical = navighezi feliile · drag orizontal = contrast
// click pe serie = schimbă stiva · dublu-click = reset contrast
// Cine automat până la prima interacțiune; respectă prefers-reduced-motion.

const vport = document.getElementById('ct-vport');
if (vport) {
  const img = document.getElementById('ct-img');
  const overlay = document.getElementById('ct-ov');
  const scrub = document.getElementById('ct-scrub');
  const hint = document.getElementById('ct-hint');
  const railBtns = [...document.querySelectorAll('.rail button[data-series]')];

  const state = {
    series: railBtns[0]?.dataset.series || 'a',
    wl: railBtns[0]?.dataset.wl || 'W 80 · L 40',
    count: Number(railBtns[0]?.dataset.count || 28),
    idx: 14,
    contrast: 1,
    bright: 1,
    interacted: false,
  };
  const cache = new Map();
  const src = (s, i) => `/ct/${s}/${String(i).padStart(2, '0')}.jpg`;

  function preload(s) {
    for (let i = 0; i < state.count; i++) {
      const k = src(s, i);
      if (!cache.has(k)) { const im = new Image(); im.src = k; cache.set(k, im); }
    }
  }

  function render() {
    img.src = src(state.series, state.idx);
    const extra = state.contrast !== 1 || state.bright !== 1
      ? ` · C ${Math.round(state.contrast * 100)}%` : '';
    if (overlay) overlay.textContent = `${state.wl} · IM ${state.idx + 1}/${state.count}${extra}`;
    if (scrub) scrub.style.width = `${((state.idx + 1) / state.count) * 100}%`;
    img.style.filter = `contrast(${state.contrast}) brightness(${state.bright})`;
  }

  function step(delta) {
    state.idx = Math.min(state.count - 1, Math.max(0, state.idx + delta));
    render();
  }

  function markInteracted() {
    if (state.interacted) return;
    state.interacted = true;
    stopCine();
    hint?.classList.add('gone');
  }

  // ── cine automat până la prima interacțiune ──
  let cineTimer = null;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function startCine() {
    if (reduced || cineTimer) return;
    let dir = 1;
    cineTimer = setInterval(() => {
      if (state.idx >= state.count - 1) dir = -1;
      if (state.idx <= 0) dir = 1;
      step(dir);
    }, 320);
  }
  const stopCine = () => { clearInterval(cineTimer); cineTimer = null; };

  // ── scroll = felii ──
  vport.addEventListener('wheel', (e) => {
    e.preventDefault();
    markInteracted();
    step(Math.sign(e.deltaY));
  }, { passive: false });

  // ── drag: vertical = felii, orizontal = contrast ──
  let drag = null;
  vport.addEventListener('pointerdown', (e) => {
    markInteracted();
    drag = { x: e.clientX, y: e.clientY, idx: state.idx, c: state.contrast, b: state.bright };
    vport.setPointerCapture(e.pointerId);
  });
  vport.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      state.contrast = Math.min(2.6, Math.max(0.4, drag.c + dx / 220));
    } else {
      state.idx = Math.min(state.count - 1, Math.max(0, drag.idx + Math.round(dy / 14)));
    }
    render();
  });
  const endDrag = () => { drag = null; };
  vport.addEventListener('pointerup', endDrag);
  vport.addEventListener('pointercancel', endDrag);

  vport.addEventListener('dblclick', () => { state.contrast = 1; state.bright = 1; render(); });

  // ── seriile din rail ──
  railBtns.forEach((b) => b.addEventListener('click', () => {
    markInteracted();
    state.series = b.dataset.series;
    state.wl = b.dataset.wl || state.wl;
    state.count = Number(b.dataset.count || state.count);
    state.idx = Math.min(state.idx, state.count - 1);
    railBtns.forEach((x) => x.classList.toggle('on', x === b));
    preload(state.series);
    render();
  }));

  // ── tastatură (accesibilitate) ──
  vport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); markInteracted(); step(1); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); markInteracted(); step(-1); }
  });

  preload(state.series);
  render();
  startCine();
}
