const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const qrcode = require('qrcode');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Membaca PORT dari environment variable (Render/Pterodactyl/Cloud)
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

app.use(express.static('public'));

io.on('connection', async (socket) => {
    console.log('Client terhubung ke Socket.io:', socket.id);

    // Menyimpan sesi auth di folder 'auth_info'
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        // Kirim QR Code ke Frontend
        if (qr) {
            qrcode.toDataURL(qr, (err, url) => {
                if (!err) {
                    socket.emit('qr', url);
                    socket.emit('status', 'Silakan scan QR Code di atas menggunakan WhatsApp Anda.');
                }
            });
        }

        if (connection === 'open') {
            socket.emit('ready', 'WhatsApp Bot Berhasil Terhubung!');
            console.log('Koneksi WhatsApp terbuka & bot siap digunakan!');
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            if (shouldReconnect) {
                socket.emit('status', 'Koneksi terputus, mencoba menghubungkan ulang...');
            } else {
                socket.emit('status', 'Sesi di-logout. Silakan refresh halaman untuk scan ulang.');
            }
        }
    });

    // Logika Auto-Reply Bot
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const body = m.message.conversation || m.message.extendedTextMessage?.text || '';
        
        // Contoh Respon Perintah
        if (body.toLowerCase() === 'ping') {
            await sock.sendMessage(m.key.remoteJid, { text: 'pong 🏓 (Bot Server Aktif)' });
        } else if (body.toLowerCase() === 'halo' || body.toLowerCase() === 'hi') {
            await sock.sendMessage(m.key.remoteJid, { text: 'Halo! Saya adalah WhatsApp Bot otomatis.' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client terputus:', socket.id);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server berjalan di http://0.0.0.0:${PORT}`);
});
