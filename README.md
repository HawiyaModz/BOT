# JayPay — Node.js Website

Website JayPay dengan Node.js + Express + EJS.

## Menjalankan

```bash
npm install
npm start
```

Buka browser:
http://localhost:3000

## Catatan
- Data pengguna saat ini disimpan sementara di memory.
- Untuk production, gunakan database seperti MySQL, PostgreSQL, atau MongoDB.
- Session default cocok untuk development.
- Tema utama menggunakan warna `#42A5F5`.

## Developer

Hawiya
- Instagram: @hawiyaaa
- YouTube: @hawiyaaa
- WhatsApp: 62896-6859-0244


## WhatsApp Bot (contoh)

Halaman `/whatsapp` menyediakan contoh koneksi WhatsApp menggunakan Baileys:
- QR code
- Pairing code
- `!ping`
- `!menu`

**Catatan:** integrasi WhatsApp menggunakan library pihak ketiga dan harus digunakan sesuai ketentuan WhatsApp. Folder `auth_info/` berisi kredensial sesi dan jangan dibagikan atau di-commit ke Git.


## Sistem Plugin

Semua fitur bot berada di folder `plugins/`.

```text
plugins/
├── menu.js
└── ping.js
```

Tambah fitur cukup dengan membuat file baru, misalnya `plugins/hello.js`:

```js
module.exports = {
  name: "hello",
  aliases: ["hi"],
  description: "Menyapa pengguna.",
  command: async ({ sock, jid, args }) => {
    await sock.sendMessage(jid, {
      text: `Halo ${args.join(" ") || "kak"} 👋`
    });
  }
};
```

Perintah otomatis menjadi `!hello` atau `!hi`.
