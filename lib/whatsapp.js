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
let messageHandlerAttached = false;
let state = { status: "disconnected", qr: null, pairingCode: null };

function loadPlugins() {
  if (!fs.existsSync(PLUGINS_DIR)) fs.mkdirSync(PLUGINS_DIR, { recursive: true });
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

async function startWhatsApp(phoneNumber = null) {
  const { state: authState, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: authState,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }),
    browser: ["JayPay", "Chrome", "1.0.0"]
  });

  state = { status: "connecting", qr: null, pairingCode: null };
  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      state.qr = await QRCode.toDataURL(qr);
      state.status = "scan_qr";
    }
    if (connection === "open") {
      state.status = "connected";
      state.qr = null;
      state.pairingCode = null;
    }
    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode;
      state.status = "disconnected";
      if (code !== DisconnectReason.loggedOut) {
        setTimeout(() => startWhatsApp().catch(() => {}), 3000);
      }
    }
  });

  if (!messageHandlerAttached) {
    messageHandlerAttached = true;
    sock.ev.on("messages.upsert", async ({ messages }) => {
      const msg = messages[0];
      if (!msg?.message || msg.key.fromMe) return;

      const jid = msg.key.remoteJid;
      const text = msg.message.conversation ||
        msg.message.extendedTextMessage?.text || "";
      const parts = text.trim().split(/\s+/);
      if (!parts[0]?.startsWith("!")) return;

      const commandName = parts[0].slice(1).toLowerCase();
      const args = parts.slice(1);
      const plugins = loadPlugins();
      const plugin = plugins.find(p =>
        p.name?.toLowerCase() === commandName ||
        (p.aliases || []).map(a => a.toLowerCase()).includes(commandName)
      );
      if (!plugin?.command) return;

      try {
        await plugin.command({ sock, jid, msg, args, text, plugins });
      } catch (err) {
        console.error(`Plugin ${plugin.name} error:`, err);
        await sock.sendMessage(jid, { text: "❌ Terjadi kesalahan saat menjalankan fitur." });
      }
    });
  }

  if (phoneNumber && !authState.creds.registered) {
    const normalized = String(phoneNumber).replace(/\D/g, "");
    if (!normalized) throw new Error("Nomor WhatsApp tidak valid.");
    setTimeout(async () => {
      try {
        state.pairingCode = await sock.requestPairingCode(normalized);
        state.status = "pairing_code";
      } catch (e) {
        state.status = "error";
      }
    }, 2500);
  }

  return state;
}

function getStatus() {
  return {
    status: state.status,
    qr: state.qr,
    pairingCode: state.pairingCode,
    connected: state.status === "connected"
  };
}

module.exports = { startWhatsApp, getStatus, loadPlugins };
