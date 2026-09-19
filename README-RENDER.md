# Rimuru Web Jadibot - Render

Versi ini disiapkan untuk Render Web Service.

## Deploy dengan Render Blueprint

1. Upload project ini ke GitHub/GitLab.
2. Di Render pilih **New -> Blueprint** dan pilih repository.
3. Render akan membaca `render.yaml`.
4. Build command: `npm install`
5. Start command: `npm start`
6. Setelah deploy selesai, buka URL Render.

## Deploy manual

- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/health`

## Persistent session

`render.yaml` memakai persistent disk di `/var/data` dan mengarahkan session Jadibot ke:

`/var/data/session/jadibot`

Persistent disk penting agar kredensial WhatsApp tidak hilang saat service restart/redeploy. Persistent disk Render dapat memerlukan service plan berbayar sesuai ketentuan Render.

## Environment variables

- `NODE_ENV=production`
- `WEB_MAX_JADIBOTS=5`
- `WEB_RATE_LIMIT=8`
- `JADIBOT_AUTH_FOLDER=/var/data/session/jadibot`

Render otomatis menyediakan `PORT`; gateway sudah menggunakan `PORT` tersebut.

## Health check

`GET /health` mengembalikan status JSON jika service hidup.

## Catatan keamanan

Jangan commit folder `session/`, `.env`, atau kredensial WhatsApp ke repository. Pairing code adalah rahasia dan jangan dibagikan kepada orang lain.
