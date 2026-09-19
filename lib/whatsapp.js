const fs = require("fs");
const path = require("path");
const pino = require("pino");
const QRCode = require("qrcode");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const AUTH_DIR = path.join(__dirname, "..", "auth_info");
const PLUGINS_DIR = path.join(__dirname, "..", "plugins");

let sock = null;
let reconnectTimer = null;
let starting = false;
let requestedPairingFor = null;

let state = {
  status: "disconnected",
  qr: null,
  pairingCode: null,
  phone: null,
  connected: false,
  error: null
};

function ensureAuthDir() {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }
}

function loadPlugins() {
  if (!fs.existsSync(PLUGINS_DIR)) {
    fs.mkdirSync(PLUGINS_DIR, { recursive: true });
  }

  return fs.readdirSync(PLUGINS_DIR)
    .filter(file => file.endsWith(".js"))
    .map(file => {
      try {
        const full = path.join(PLUGINS_DIR, file);
        delete require.cache[require.resolve(full)];
        return { ...require(full), file };
      } catch (err) {
        console.error("Plugin error:", file, err.message);
        return null;
      }
    })
    .filter(Boolean);
}

function getMessageText(msg) {
  return (
    msg?.message?.conversation ||
    msg?.message?.extendedTextMessage?.text ||
    msg?.message?.imageMessage?.caption ||
    msg?.message?.videoMessage?.caption ||
    ""
  ).trim();
}

function attachMessageHandler(client) {
  client.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const msg = messages?.[0];
      if (!msg?.message || msg.key?.fromMe) return;

      const jid = msg.key.remoteJid;
      if (!jid) return;

      const text = getMessageText(msg);
      if (!text.startsWith("!")) return;

      const parts = text.split(/\s+/);
      const commandName = parts[0].slice(1).toLowerCase();
      const args = parts.slice(1);
      const plugins = loadPlugins();

      const plugin = plugins.find(p =>
        p.name?.toLowerCase() === commandName ||
        (p.aliases || []).some(a => a.toLowerCase() === commandName)
      );

      if (!plugin?.command) return;

      await plugin.command({
        sock: client,
        jid,
        msg,
        args,
        text,
        plugins
      });
    } catch (err) {
      console.error("Message/plugin error:", err);
    }
  });
}

async function requestPairingCode(client, phoneNumber) {
  if (!phoneNumber) return;

  const normalized = String(phoneNumber).replace(/\D/g, "");
  if (!normalized) {
    throw new Error("Nomor WhatsApp tidak valid.");
  }

  // WhatsApp harus sudah menerima socket sebelum pairing code diminta.
  // Delay kecil ini mengikuti pola pairing Baileys yang umum dipakai.
  await new Promise(resolve => setTimeout(resolve, 2500));

  if (client !== sock) return;
  if (client.authState?.creds?.registered) return;

  try {
    state.status = "requesting_pairing";
    state.error = null;

    // Jangan membuat kode sendiri. Kode ini benar-benar diberikan
    // oleh server WhatsApp melalui socket Baileys.
    const code = await client.requestPairingCode(normalized);

    if (client !== sock) return;

    state.phone = normalized;
    state.pairingCode = code;
    state.status = "pairing_code";
    state.connected = false;

    console.log(`[JayPay] Pairing code untuk ${normalized}: ${code}`);
  } catch (error) {
    console.error("Pairing code error:", error);

    if (client === sock) {
      state.status = "error";
      state.error = error.message || "Gagal membuat kode pairing.";
      state.pairingCode = null;
    }
  }
}

async function startWhatsApp(phoneNumber = null) {
  if (starting) return state;
  starting = true;

  try {
    ensureAuthDir();

    const { state: authState, saveCreds } =
      await useMultiFileAuthState(AUTH_DIR);

    let version;
    try {
      const latest = await fetchLatestBaileysVersion();
      version = latest.version;
    } catch (error) {
      console.warn("Tidak bisa mengambil versi WhatsApp terbaru:", error.message);
    }

    const options = {
      auth: authState,
      printQRInTerminal: false,
      logger: pino({ level: "silent" }),
      browser: ["JayPay", "Chrome", "1.0.0"],
      markOnlineOnConnect: false,
      syncFullHistory: false
    };

    if (version) options.version = version;

    const client = makeWASocket(options);
    sock = client;

    state = {
      status: "connecting",
      qr: null,
      pairingCode: null,
      phone: phoneNumber ? String(phoneNumber).replace(/\D/g, "") : null,
      connected: false,
      error: null
    };

    client.ev.on("creds.update", saveCreds);
    attachMessageHandler(client);

    client.ev.on("connection.update", async ({
      connection,
      lastDisconnect,
      qr
    }) => {
      if (client !== sock) return;

      if (qr) {
        try {
          state.qr = await QRCode.toDataURL(qr);
          state.status = "scan_qr";
          state.pairingCode = null;
        } catch (error) {
          console.error("QR error:", error);
        }
      }

      if (connection === "open") {
        state.status = "connected";
        state.connected = true;
        state.qr = null;
        state.pairingCode = null;
        state.error = null;

        console.log("[JayPay] WhatsApp berhasil terhubung.");
      }

      if (connection === "close") {
        state.connected = false;

        const statusCode =
          lastDisconnect?.error?.output?.statusCode;

        const loggedOut = statusCode === DisconnectReason.loggedOut;

        state.status = loggedOut ? "logged_out" : "disconnected";

        if (!loggedOut && !reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            startWhatsApp().catch(error => {
              console.error("Reconnect error:", error);
            });
          }, 3000);
        }
      }
    });

    // Hanya minta pairing jika session belum pernah terdaftar.
    // Jika session sudah terdaftar, Baileys akan login menggunakan auth_info.
    if (phoneNumber && !authState.creds.registered) {
      const normalized = String(phoneNumber).replace(/\D/g, "");

      if (!normalized) {
        throw new Error("Nomor WhatsApp tidak valid.");
      }

      requestedPairingFor = normalized;
      await requestPairingCode(client, normalized);
      requestedPairingFor = null;
    }

    return state;
  } finally {
    starting = false;
  }
}

function getStatus() {
  return {
    status: state.status,
    qr: state.qr,
    pairingCode: state.pairingCode,
    phone: state.phone,
    connected: state.connected,
    error: state.error
  };
}

module.exports = {
  startWhatsApp,
  getStatus,
  loadPlugins
};
