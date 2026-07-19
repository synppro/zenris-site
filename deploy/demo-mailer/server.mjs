// ZenRIS demo-mailer v2 — endpointul formularului de demo de pe zenris.ro
//
// POST /api/demo-request  (JSON sau x-www-form-urlencoded)
//   { name, email, phone?, institution, message?, lang?, website (honeypot), elapsed? }
//
// Configurare dintr-un fișier pe server (vezi smtp.example.json):
//   CONFIG_FILE (env) → implicit /etc/zenris-site/smtp.json → fallback ./smtp.config.json
//   Fișierul se recitește automat la modificare (nu e nevoie de restart).
//
// Protecții anti-abuz:
//   - allowlist de Origin/Referer (config.allowedOrigins)
//   - honeypot („website”) + timp minim de completare (config.limits.minElapsedMs)
//   - rate-limit per IP (fereastră + plafon zilnic) și plafon global zilnic
//   - limite de lungime pe câmpuri, corp max 20 KB, striparea CR/LF (anti header-injection)
//   - validare de email, răspunsuri uniforme (nu divulgă motivul refuzului către boți)

import { createServer } from 'node:http';
import { readFileSync, watchFile, existsSync } from 'node:fs';
import nodemailer from 'nodemailer';

const CONFIG_CANDIDATES = [
  process.env.CONFIG_FILE,
  '/etc/zenris-site/smtp.json',
  new URL('./smtp.config.json', import.meta.url).pathname,
].filter(Boolean);

const DEFAULTS = {
  port: 8080,
  smtp: { host: '', port: 587, secure: false, requireTLS: true, user: '', pass: '', from: 'site@zenris.ro' },
  to: 'contact@zenris.ro',
  allowedOrigins: ['https://zenris.ro', 'https://www.zenris.ro'],
  limits: {
    perIpWindow: 5,        // cereri / fereastră / IP
    windowMinutes: 10,
    perIpDaily: 10,        // cereri / zi / IP
    globalDaily: 150,      // plafon global / zi
    minElapsedMs: 3000,    // sub atât = bot
    maxField: 300,
    maxMessage: 2000,
  },
  dryRun: process.env.DRY_RUN === '1',
};

let cfg = DEFAULTS;
let transport = null;
let configPath = null;

function loadConfig() {
  for (const p of CONFIG_CANDIDATES) {
    if (existsSync(p)) { configPath = p; break; }
  }
  let fileCfg = {};
  if (configPath) {
    try { fileCfg = JSON.parse(readFileSync(configPath, 'utf8')); }
    catch (e) { console.error(`[config] ${configPath} invalid: ${e.message} — păstrez configul anterior`); return; }
  }
  cfg = {
    ...DEFAULTS, ...fileCfg,
    smtp: { ...DEFAULTS.smtp, ...(fileCfg.smtp || {}) },
    limits: { ...DEFAULTS.limits, ...(fileCfg.limits || {}) },
  };
  transport = cfg.dryRun || !cfg.smtp.host ? null : nodemailer.createTransport({
    host: cfg.smtp.host,
    port: Number(cfg.smtp.port),
    secure: !!cfg.smtp.secure,               // true = TLS implicit (465)
    requireTLS: cfg.smtp.requireTLS !== false, // STARTTLS obligatoriu pe 587
    auth: cfg.smtp.user ? { user: cfg.smtp.user, pass: cfg.smtp.pass } : undefined,
  });
  console.log(`[config] încărcat din ${configPath || '(defaults)'} — smtp=${cfg.smtp.host || 'DRY'}:${cfg.smtp.port} to=${cfg.to}`);
}
loadConfig();
if (configPath) watchFile(configPath, { interval: 5000 }, loadConfig);

// ── rate limiting (în memorie) ──────────────────────────────────────────────
const ipWindow = new Map();   // ip -> [timestamps]
const ipDaily = new Map();    // ip -> { day, count }
let globalDaily = { day: '', count: 0 };
const today = () => new Date().toISOString().slice(0, 10);

function allowed(ip) {
  const L = cfg.limits;
  const now = Date.now();
  const win = (ipWindow.get(ip) || []).filter((t) => now - t < L.windowMinutes * 60_000);
  if (win.length >= L.perIpWindow) return false;
  win.push(now); ipWindow.set(ip, win);
  if (ipWindow.size > 10_000) ipWindow.clear(); // plasă de siguranță pt. memorie

  const d = today();
  const daily = ipDaily.get(ip)?.day === d ? ipDaily.get(ip) : { day: d, count: 0 };
  if (daily.count >= L.perIpDaily) return false;
  daily.count++; ipDaily.set(ip, daily);

  if (globalDaily.day !== d) globalDaily = { day: d, count: 0 };
  if (globalDaily.count >= L.globalDaily) return false;
  globalDaily.count++;
  return true;
}

// ── igienizare ──────────────────────────────────────────────────────────────
const line = (s, max) => String(s ?? '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, max);
const EMAIL_RE = /^[^@\s]{1,64}@[^@\s]{1,255}\.[^@\s]{2,24}$/;

function originOk(req) {
  const o = req.headers.origin || req.headers.referer || '';
  if (!o) return true; // curl / no-JS form POST fără origin — acceptat, restul filtrelor rămân
  return cfg.allowedOrigins.some((a) => o === a || o.startsWith(a + '/')) || /^https?:\/\/localhost(:\d+)?/.test(o);
}

function parseBody(raw, contentType) {
  if (contentType?.includes('application/json')) return JSON.parse(raw);
  const params = new URLSearchParams(raw);
  return Object.fromEntries(params.entries());
}

// ── server ──────────────────────────────────────────────────────────────────
createServer((req, res) => {
  const wantsHtml = (req.headers.accept || '').includes('text/html');
  const send = (code, obj) => {
    if (wantsHtml && code === 200) {
      res.writeHead(303, { Location: (req.headers.referer || '/') });
      return res.end();
    }
    res.writeHead(code, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(JSON.stringify(obj));
  };

  if (req.method !== 'POST' || !req.url.startsWith('/api/demo-request')) return send(404, { ok: false });

  const ip = line(req.headers['x-real-ip'] || String(req.headers['x-forwarded-for'] || '').split(',')[0] || req.socket.remoteAddress, 64);
  if (!originOk(req)) { console.warn(`[reject] origin ${req.headers.origin} ip=${ip}`); return send(200, { ok: true }); }
  if (!allowed(ip)) { console.warn(`[reject] rate ip=${ip}`); return send(429, { ok: false, error: 'rate_limited' }); }

  let body = '';
  req.on('data', (c) => { body += c; if (body.length > 20_000) { req.destroy(); } });
  req.on('end', async () => {
    try {
      const d = parseBody(body, req.headers['content-type']);
      const L = cfg.limits;

      if (d.website) { console.warn(`[reject] honeypot ip=${ip}`); return send(200, { ok: true }); }
      const elapsed = Number(d.elapsed);
      if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < L.minElapsedMs) {
        console.warn(`[reject] prea rapid (${elapsed}ms) ip=${ip}`);
        return send(200, { ok: true });
      }

      const name = line(d.name, L.maxField);
      const email = line(d.email, L.maxField);
      const phone = line(d.phone, L.maxField);
      const institution = line(d.institution, L.maxField);
      const message = String(d.message ?? '').replace(/\r/g, '').trim().slice(0, L.maxMessage);
      const lang = line(d.lang, 5) || 'ro';

      if (!name || !institution || !EMAIL_RE.test(email)) return send(400, { ok: false, error: 'invalid' });

      const text = [
        `Cerere de demo — zenris.ro (${lang})`,
        `Nume: ${name}`,
        `Email: ${email}`,
        `Telefon: ${phone || '—'}`,
        `Instituție: ${institution}`,
        '',
        message || '(fără mesaj)',
        '',
        `— IP: ${ip} · ${new Date().toISOString()}`,
      ].join('\n');

      if (!transport) { console.log('[DRY]\n' + text); return send(200, { ok: true, dry: true }); }
      await transport.sendMail({
        from: cfg.smtp.from,
        to: cfg.to,
        replyTo: `${name.replace(/["<>]/g, '')} <${email}>`,
        subject: `Cerere demo: ${institution} — ${name}`,
        text,
      });
      console.log(`[ok] cerere de la ${email} (${institution}) ip=${ip}`);
      send(200, { ok: true });
    } catch (e) {
      console.error('[error]', e.message);
      send(502, { ok: false, error: 'send_failed' });
    }
  });
}).listen(Number(process.env.PORT || cfg.port), () =>
  console.log(`demo-mailer v2 pe :${process.env.PORT || cfg.port} (config: ${configPath || 'defaults/DRY'})`));
