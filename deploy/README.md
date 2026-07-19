# Deploy zenris.ro

## Site (static)

`npm run build` → `dist/` se servește direct din OpenResty/nginx. Exemplu location:

```nginx
server {
  server_name zenris.ro www.zenris.ro;
  root /srv/zenris-site;           # conținutul lui dist/
  index index.html;
  location / { try_files $uri $uri/ =404; }
  location /api/demo-request { proxy_pass http://demo-mailer:8080; }
}
```

## demo-mailer (formularul de demo)

Micro-serviciu Node în `deploy/demo-mailer/`. **Configurarea se face dintr-un fișier pe server**,
recitit automat la modificare (fără restart):

1. Copiază `smtp.example.json` → `/etc/zenris-site/smtp.json` (sau setează `CONFIG_FILE=/calea/ta.json`).
2. Completează: `smtp.host`, `smtp.port`, `smtp.secure` (true = TLS implicit/465),
   `smtp.requireTLS` (STARTTLS obligatoriu pe 587), `smtp.user`/`smtp.pass` (opționale),
   `smtp.from` (expeditorul), `to` (destinatarul cererilor).
3. `chmod 600` pe fișier — conține parola SMTP.

Fără fișier de config (sau cu `DRY_RUN=1`) serviciul rulează în mod „dry”: loghează cererile, nu trimite.

Protecții anti-abuz incluse (praguri ajustabile din `limits` în același fișier):
- allowlist de Origin/Referer (`allowedOrigins`);
- honeypot + timp minim de completare a formularului (`minElapsedMs`, implicit 3 s);
- rate-limit: 5 cereri/10 min/IP, 10/zi/IP, plafon global 150/zi;
- corp max 20 KB, câmpuri tăiate la lungimi fixe, CR/LF eliminate (anti header-injection în subiect/reply-to);
- refuzurile de bot primesc răspuns de succes fals (nu învață ce filtru i-a prins).

Compose:

```yaml
services:
  demo-mailer:
    build: ./demo-mailer
    volumes:
      - /etc/zenris-site/smtp.json:/etc/zenris-site/smtp.json:ro
    restart: unless-stopped
```

Frontend-ul are fallback: dacă endpoint-ul nu răspunde, deschide clientul de email cu cererea precompletată;
formularul funcționează și fără JavaScript (POST clasic pe același endpoint).
