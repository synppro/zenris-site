# zenris.ro — site de prezentare

Site static (Astro) pentru ZenRIS: dark-first, accent albastru brand `#2563eb`, imagistică CT reală
(anonimizată, randată din ZenPACS dev), RO + EN.

## Comenzi

```sh
npm install
npm run dev       # dev server pe :4321
npm run build     # build static în dist/
node scripts/verify.mjs   # verificare headless: screenshots + crawl linkuri (necesită dev server pornit)
```

## Structură

- `src/pages/` — paginile RO; `src/pages/en/` — oglinda EN
- `src/content/copy/{ro,en}/` — copy-ul paginilor de conținut (JSON, randat de `ContentPage.astro`)
- `src/styles/global.css` — design tokens (temă dark implicită + `data-theme="light"`)
- `src/styles/home.css` + `src/scripts/home.js` — partajate de homepage-urile RO/EN
- `src/assets/ct/` — felii CT reale anonimizate (fereastră creier 40/80, os 600/2800)

## De activat ulterior (decizii în așteptare)

1. **„Deschide un studiu demo”** — CTA-ul secundar din hero devine link către viewerul demo public
   când instanța e gata (acum: ancoră la narativă / „Vezi cum funcționează”).
2. **Prețuri / filozofia de licențiere** — secțiune nescrisă încă; și subtitlul „Nu cumperi module —
   primești platforma” din grid ține de aceeași decizie.
3. **ISO 9001 / 13485** — NU sunt menționate pe site până nu se confirmă certificatele cu documente.
4. **Formularul de demo** — funcțional: POST la `/api/demo-request`, servit de `deploy/demo-mailer`
   (config SMTP din fișier pe server, protecții anti-abuz — vezi `deploy/README.md`); fallback
   `mailto:` dacă endpoint-ul nu răspunde. Alternativa cu calendar (Zoho Bookings) rămâne opțiune.
5. **Cifre publice** („pulsul sistemului”), Ctrl+K command palette — faza 2.

## Reguli de conținut (nu se încalcă)

- Componentele terțe din platformă nu se numesc public. Integrările externe (RadiAnt, OsiriX, Horos) — da.
- AI = doar dictare, asistare raport, triage. Fără claim-uri de detecție/diagnostic.
- Conformitate afișabilă: dispozitiv medical Clasa I (ANMDMR), GDPR, găzduire UE/RO, 2FA, SSO (AD/LDAP/SAML/OIDC).
- Fără cifre inventate; cronologiile ilustrative se marchează ca atare.
