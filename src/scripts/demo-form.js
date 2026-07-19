// Formularul de demo: POST către /api/demo-request, cu fallback pe email precompletat.

document.querySelectorAll('form[data-form]').forEach((form) => {
  const started = Date.now();
  const btn = form.querySelector('button[type="submit"]');
  const status = form.querySelector('.form-status');

  const show = (msg, ok) => {
    if (!status) return;
    status.textContent = msg;
    status.classList.toggle('ok', ok);
    status.hidden = false;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.lang = document.documentElement.lang || 'ro';
    data.elapsed = Date.now() - started;
    if (btn) btn.disabled = true;
    try {
      const r = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) { form.reset(); show(form.dataset.ok, true); }
      else if (r.status === 429) { show(form.dataset.limit || form.dataset.err, false); }
      else { throw new Error('send_failed'); }
    } catch {
      show(form.dataset.err, false);
      const subject = encodeURIComponent(`Cerere demo — ${data.institution || ''}`);
      const bodyTxt = encodeURIComponent(
        ['name', 'email', 'phone', 'institution', 'message']
          .filter((k) => data[k])
          .map((k) => `${k}: ${data[k]}`)
          .join('\n')
      );
      window.open(`mailto:contact@zenris.ro?subject=${subject}&body=${bodyTxt}`, '_self');
    } finally {
      if (btn) btn.disabled = false;
    }
  });
});
