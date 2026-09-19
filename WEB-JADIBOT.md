# Rimuru MD — Web Jadibot Gateway

Versi ini menambahkan website gateway agar pengguna bisa membuat **Jadibot** langsung dari browser.

## Cara menjalankan

```bash
npm install
npm start
```

Setelah bot aktif, buka:

`http://IP-SERVER:3000`

Port dapat diubah lewat `.env`:

- `WEB_GATEWAY_PORT=3000`
- `WEB_MAX_JADIBOTS=10`
- `WEB_RATE_LIMIT=8`

## Alur pengguna

1. Masukkan nomor WhatsApp dalam format internasional, contoh `6281234567890`.
2. Website meminta pairing code dari engine Jadibot.
3. Pengguna memasukkan pairing code di WhatsApp → Perangkat tertaut → Tautkan dengan nomor telepon.
4. Setelah terhubung, nomor tersebut menjalankan plugin/fitur bot yang sama.
5. Pengguna dapat memutuskan sesi dari website.

## Catatan deployment

Gunakan HTTPS/reverse proxy untuk domain publik. Jangan membuka folder `session/jadibot` ke web server statis karena folder tersebut berisi kredensial sesi WhatsApp.

Gateway memiliki rate limit sederhana dan batas jumlah jadibot untuk mencegah spam. Untuk produksi, tambahkan autentikasi/CAPTCHA/WAF sesuai kebutuhan hosting.
