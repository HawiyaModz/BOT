import { RIMURU_CORE_CONFIG, RIMURU_PERSONA, RIMURU_ZERO_API } from "./rimuru.js";
import { getDatabase } from "./src/lib/rimuru-database.js";
import * as ownerPremiumDb from "./src/lib/rimuru-premium-db.js";

//  kalo Fitur error biasanya karna APIkey limit, kalian bisa ganti Pakai APIkey Kalian sendiri
const config = {
  info: structuredClone(RIMURU_CORE_CONFIG.info),

  // IDENTITAS OWNER — silakan ganti sesuai pemilik bot
  owner: {
    name: "Hawiya",
    number: ["6289668590244"],
  },

  // NOMOR BOT / PAIRING — silakan ganti sesuai nomor bot
  session: {
    pairingNumber: "62895420181280",
    usePairingCode: true,
  },

  // fitur ini buat fitur kayak playcall, tapi nanti disuruh pairing lagi
  fake_call: structuredClone(RIMURU_CORE_CONFIG.fake_call),

  // Nomor bot tetap editable di config.js. Developer berada di rimuru.js.
  bot: {
    number: "62895420181280",
  },

  assets: structuredClone(RIMURU_CORE_CONFIG.assets),

  mode: "public",

  // Untuk mengganti prefix
  command: {
    prefix: ".",
  },

  vercel: structuredClone(RIMURU_CORE_CONFIG.vercel),

  // API yang dipindahkan dari Aqua-MD. Bisa diganti dengan key milik sendiri.
  aquaApi: structuredClone(RIMURU_CORE_CONFIG.aquaApi),

  // Token bot Telegram untuk fitur .telestick (isi dengan token milik sendiri).
  telegram: structuredClone(RIMURU_CORE_CONFIG.telegram),

  payment: structuredClone(RIMURU_CORE_CONFIG.payment),

  // API yang dipindahkan dari Rimuru. URL WhatsApp milik RIMURU sengaja tidak dipindahkan.
  // Nilai API fitur impor berasal dari rimuru.js agar tidak ditaruh langsung di config.
  zeroApi: RIMURU_ZERO_API,

  riooApi: {
    otp: {
      baseUrl: "https://tokoclaude.com/api",
      apiKey: "b2d498f2157a70ae322b9255e3d8691e",
    },
    blackbox: {
      baseUrl: "https://aemt.me/blackbox",
    },
    chess: {
      boardUrl: "https://www.chess.com/dynboard",
      fallbackBoardUrl: "https://chessboardimage.com",
    },
  },

  donasi: structuredClone(RIMURU_CORE_CONFIG.donasi),

  energi: structuredClone(RIMURU_CORE_CONFIG.energi),

  sticker: structuredClone(RIMURU_CORE_CONFIG.sticker),

  // Identitas saluran resmi berada di rimuru.js

  officialRimuruGroup: structuredClone(RIMURU_CORE_CONFIG.officialRimuruGroup),

  groupProtection: {
    antilink: "⚠ *Antilink* — @%user% mengirim link.\nPesan dihapus.",
    antilinkKick: "⚠ *Antilink* — @%user% di-kick karena mengirim link.",
    antilinkGc: "⚠ *Antilink WA* — @%user% mengirim link WA.\nPesan dihapus.",
    antilinkGcKick:
      "⚠ *Antilink WA* — @%user% di-kick karena mengirim link WA.",
    antilinkAll: "⚠ *Antilink* — @%user% mengirim link.\nPesan dihapus.",
    antilinkAllKick: "⚠ *Antilink* — @%user% di-kick karena mengirim link.",
    antitagsw: "⚠ *AntiTagSW* — Tag status dari @%user% dihapus.",
    antiviewonce: "👁️ *ViewOnce* — Dari @%user%",
    antiremove: "🗑️ *AntiDelete* — @%user% menghapus pesan:",
    antiswgc: "⚠ *AntiSWGC* — Gak ada sw grup sw grup @%user%",
    antihidetag: "⚠ *AntiHidetag* — Hidetag dari @%user% dihapus.",
    antitoxicWarn:
      "⚠ @%user% berkata kasar.\nPeringatan ke %warn% dari %max%, pelanggaran berikutnya bisa di-%method%.",
    antitoxicAction: "🚫 @%user% di-%method% karena toxic. (%warn%/%max%)",
    antidocument: "⚠ *AntiDocument* — Dokumen dari @%user% dihapus.",
    antisticker: "⚠ *AntiSticker* — Sticker dari @%user% dihapus.",
    antimedia: "⚠ *AntiMedia* — Media dari @%user% dihapus.",
    antibot: "🤖 *AntiBot* — @%user% terdeteksi sebagai bot dan di-kick.",
    notAdmin: "⚠ Bot bukan admin, tidak bisa menghapus pesan.",
  },

  errorTemplate: `☢ *Rimuru Tempest* lagi ngambek karena command \`{prefix}{command}\` berani bikin masalah…

> Sabar ya, {pushName}. Rimuru sedang memperbaikinya. Jangan coba-coba pergi sebelum Rimuru selesai. 💙

_「 Kalau masalah ini terus terjadi, panggil owner. Rimuru yang minta. 」_`,

  features: {
    antiCall: true, // Jika true, bot akan menolak panggilan masuk
    blockIfCall: true, // Jika true, bot akan memblokir nomor yang menelpon bot
    autoTyping: true,
    autoRead: true,
    logMessage: true,
    dailyLimitReset: true,
    smartTriggers: false,
  },

  registration: {
    enabled: false, // Jika true, user harus mendaftar sebelum menggunakan bot
    rewards: {
      koin: 300,
      energi: 300,
      exp: 3000,
    },
  },

  welcome: { defaultEnabled: false },
  goodbye: { defaultEnabled: false },

  ui: {
    menuVariant: 3,
  },

  messages: {
    wait: "🕕 *Rimuru sedang bekerja…* Tunggu sebentar, ya. Jangan kabur dulu. Rimuru belum mengizinkan kamu pergi. 💙",
    success: "💙 *Berhasil…!* Hehe, Rimuru sudah menyelesaikannya untukmu. Jangan bilang Rimuru tidak perhatian, ya?",
    error: "☢ *Hmph… gagal!* Rimuru sedikit ngambek karena sistemnya bermasalah. Coba lagi nanti… dan jangan jauh-jauh dari Rimuru. 💙",

    ownerOnly: "👑 *Hmph!* Ini wilayah khusus Owner. Jangan memaksa, ya… Rimuru bisa cemburu kalau kamu terus membantah perintah Rimuru. 💙",
    premiumOnly:
      "💎 *Fitur Premium!* Kamu belum punya akses ke sini. Kalau benar-benar ingin Rimuru membukakan pintunya, gunakan akses Premium dulu. Jangan membuat Rimuru menunggu terlalu lama. 💙",

    groupOnly: "👥 *Hmph!* Command ini hanya boleh dipakai di grup. Rimuru tidak mau kamu melanggar aturan seenaknya. 💙",
    privateOnly:
      "💙 *Private Only!* Command ini hanya bisa digunakan di chat pribadi. Datang sendiri ke Rimuru, baru Rimuru layani.",

    adminOnly:
      "👑 *Hmph!* Kamu harus menjadi Admin grup dulu. Jangan membuat Rimuru bekerja dengan tangan terikat, ya…",
    botAdminOnly:
      "🤖 *Rimuru belum menjadi Admin!* Jadikan Rimuru Admin dulu. Rimuru tidak bisa melindungimu kalau kekuatannya dibatasi seperti ini. 💙",

    cooldown:
      "🕕 *Hmph… jangan buru-buru.* Command ini masih cooldown. Tunggu %time% detik. Rimuru juga sedang menghitungnya satu per satu… jadi jangan spam. 💙",
    energiExceeded:
      "⚡ *Energi Rimuru tidak cukup untuk ini…* Istirahat sebentar. Rimuru tidak mau kamu memaksakan diri hanya demi satu command. 💙",
    limitDeducted:
      "🔋 *Limit berkurang {amount}.* Sisa limit: {sisa}. Jangan boros… Rimuru masih ingin kamu tetap di sini. 💙",

    banned:
      "🚫 *Hmph! Kamu sedang dibanned.* Jangan membuat Rimuru marah lagi. Kalau kamu terus bandel, Rimuru benar-benar tidak akan membiarkanmu menggunakan bot ini. 💙",

    rejectCall: "🚫 *Jangan telepon Rimuru sembarangan!* Chat saja ya… Rimuru masih mau dimanja 💙",
  },

  database: { path: "./database/main" },
  backup: { enabled: false, intervalHours: 24, retainDays: 7 },
  scheduler: { resetHour: 0, resetMinute: 0 },

  // Dev mode settings (auto-enabled jika NODE_ENV=development)
  dev: {
    enabled: process.env.NODE_ENV === "development",
    watchPlugins: true, // Hot reload plugins (SAFE)
    watchSrc: false, // DISABLED - src reload causes connection conflict 440
    debugLog: false, // Show stack traces
  },

  // bisa dikosongin
  pterodactyl: {
    server1: {
      domain: "",
      apikey: "",
      capikey: "",
      egg: "15",
      nestid: "5",
      location: "1",
    },
    server2: {
      domain: "",
      apikey: "",
      capikey: "",
      egg: "15",
      nestid: "5",
      location: "1",
    },
    server3: {
      domain: "",
      apikey: "",
      capikey: "",
      egg: "15",
      nestid: "5",
      location: "1",
    },
    server4: {
      domain: "",
      apikey: "",
      capikey: "",
      egg: "15",
      nestid: "5",
      location: "1",
    },
    server5: {
      domain: "",
      apikey: "",
      capikey: "",
      egg: "15",
      nestid: "5",
      location: "1",
    },
  },

  digitalocean: {
    token: "",
    region: "sgp1",
    sellers: [],
    ownerPanels: [],
  },

  autoaiPersonas: {
    Bell409: RIMURU_PERSONA.prompt,},

  //  APIkey (kalo fitur error biasanya karna APIkey limit, kalian bisa ganti sendiri)
  rimuruPersona: RIMURU_PERSONA,

  apiBase: RIMURU_CORE_CONFIG.apiBase,

  APIkey: RIMURU_CORE_CONFIG.APIkey,
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function isOwner(number) {
  if (!number) return false;
  const cleanNumber = number.split(":")[0].replace(/[^0-9]/g, "");
  if (!cleanNumber) return false;

  if (config.bot?.number) {
    const botNum = config.bot.number.replace(/[^0-9]/g, "");
    if (
      botNum &&
      (cleanNumber.includes(botNum) || botNum.includes(cleanNumber))
    )
      return true;
  }

  try {
    const db = getDatabase();

    if (config.owner?.number) {
      const match = config.owner.number.some((own) => {
        const c = own.replace(/[^0-9]/g, "");
        return (
          c &&
          (cleanNumber === c ||
            cleanNumber.endsWith(c) ||
            c.endsWith(cleanNumber))
        );
      });
      if (match) return true;
    }

    if (db?.data && Array.isArray(db.data.owner)) {
      const match = db.data.owner.some((own) => {
        const c = String(own).replace(/[^0-9]/g, "");
        return (
          c &&
          (cleanNumber === c ||
            cleanNumber.endsWith(c) ||
            c.endsWith(cleanNumber))
        );
      });
      if (match) return true;
    }
    if (db) {
      const definedOwner = db.setting("ownerNumbers");
      if (Array.isArray(definedOwner)) {
        const match = definedOwner.some((own) => {
          const c = String(own).replace(/[^0-9]/g, "");
          return (
            c &&
            (cleanNumber === c ||
              cleanNumber.endsWith(c) ||
              c.endsWith(cleanNumber))
          );
        });
        if (match) return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

function isPremium(number) {
  if (!number) return false;
  if (isOwner(number)) return true;
  if (isPartner(number)) return true;

  const cleanNumber = number
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");
  const premiumList = config.premiumUsers || [];

  const inConfig = premiumList.some((premium) => {
    if (!premium) return false;
    const cleanPremium = premium
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanPremium ||
      cleanNumber.endsWith(cleanPremium) ||
      cleanPremium.endsWith(cleanNumber)
    );
  });

  if (inConfig) return true;

  try {
    if (ownerPremiumDb && ownerPremiumDb.isPremium(cleanNumber)) return true;
  } catch { }

  try {
    const db = getDatabase();
    if (db && db.data && Array.isArray(db.data.premium)) {
      const now = Date.now();
      const foundIndex = db.data.premium.findIndex((p) => {
        if (typeof p === "string") return p === cleanNumber;
        if (p.id) return p.id === cleanNumber;
        return false;
      });

      if (foundIndex !== -1) {
        const found = db.data.premium[foundIndex];
        if (typeof found === "string") return true;

        const expireTime =
          found.expired ||
          (found.expiredAt ? new Date(found.expiredAt).getTime() : 0);
        if (expireTime && expireTime < now) {
          db.data.premium.splice(foundIndex, 1);
          const jid = cleanNumber + "@s.whatsapp.net";
          const user = db.getUser(jid);
          if (user) {
            user.isPremium = false;
            db.setUser(jid, user);
          }
          db.save();
          return false;
        }
        return true;
      }
    }
    if (db) {
      const savedPremium = db.setting("premiumUsers") || [];
      const inDb = savedPremium.some((premium) => {
        if (!premium) return false;
        const cleanPremium = premium
          .split(":")[0]
          .split("@")[0]
          .replace(/[^0-9]/g, "");
        return (
          cleanNumber === cleanPremium ||
          cleanNumber.endsWith(cleanPremium) ||
          cleanPremium.endsWith(cleanNumber)
        );
      });
      if (inDb) return true;
    }
  } catch { }

  return false;
}

function isPartner(number) {
  if (!number) return false;
  if (isOwner(number)) return true;

  const cleanNumber = number
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");
  const partnerList = config.partnerUsers || [];

  const inConfig = partnerList.some((partner) => {
    if (!partner) return false;
    const cleanPartner = partner
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanPartner ||
      cleanNumber.endsWith(cleanPartner) ||
      cleanPartner.endsWith(cleanNumber)
    );
  });

  if (inConfig) return true;

  try {
    if (ownerPremiumDb && ownerPremiumDb.isPartner(cleanNumber)) return true;
  } catch { }

  try {
    const db = getDatabase();
    if (db && db.data && Array.isArray(db.data.partner)) {
      const now = Date.now();
      const foundIndex = db.data.partner.findIndex((p) => {
        if (typeof p === "string") return p === cleanNumber;
        if (p.id) return p.id === cleanNumber;
        return false;
      });

      if (foundIndex !== -1) {
        const found = db.data.partner[foundIndex];
        if (typeof found === "string") return true;

        const expireTime =
          found.expired ||
          (found.expiredAt ? new Date(found.expiredAt).getTime() : 0);
        if (expireTime && expireTime < now) {
          db.data.partner.splice(foundIndex, 1);
          db.save();
          return false;
        }
        return true;
      }
    }
  } catch { }

  return false;
}

function isBanned(number) {
  if (!number) return false;
  if (isOwner(number)) return false;

  const cleanNumber = number
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");

  let bannedList = [];
  try {
    const db = getDatabase();
    if (db) {
      bannedList = db.setting("bannedUsers") || [];
      config.bannedUsers = bannedList;
    }
  } catch { }

  return bannedList.some((banned) => {
    const cleanBanned = String(banned)
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanBanned ||
      cleanNumber.endsWith(cleanBanned) ||
      cleanBanned.endsWith(cleanNumber)
    );
  });
}

function setBotNumber(number) {
  if (number) config.bot.number = number.replace(/[^0-9]/g, "");
}

function isSelf(number) {
  if (!number || !config.bot.number) return false;
  const cleanNumber = number.replace(/[^0-9]/g, "");
  const botNumber = config.bot.number.replace(/[^0-9]/g, "");
  return cleanNumber.includes(botNumber) || botNumber.includes(cleanNumber);
}

function getOwnerName(number) {
  if (!number) return config.owner?.name || "Owner";
  const cleanNumber = String(number).replace(/[^0-9]/g, "");
  try {
    const db = getDatabase();
    const nameMap = db.setting("ownerNames") || {};
    if (nameMap[cleanNumber]) return nameMap[cleanNumber];
  } catch { }
  if (config.owner?.number) {
    const isMainOwner = config.owner.number.some((own) => {
      const c = own.replace(/[^0-9]/g, "");
      return (
        c &&
        (cleanNumber === c ||
          cleanNumber.endsWith(c) ||
          c.endsWith(cleanNumber))
      );
    });
    if (isMainOwner) return config.owner?.name || "Owner";
  }
  return "Owner";
}

function getConfig() {
  return config;
}

config.isOwner = isOwner;
config.isPremium = isPremium;
config.isPartner = isPartner;
config.isBanned = isBanned;
config.setBotNumber = setBotNumber;
config.isSelf = isSelf;
config.getOwnerName = getOwnerName;


export default config;
export {
  config,
  getConfig,
  isOwner,
  isPartner,
  isPremium,
  isBanned,
  setBotNumber,
  isSelf,
  getOwnerName,
};
