module.exports = {
  name: "menu",
  aliases: ["help"],
  description: "Menampilkan daftar plugin.",
  command: async ({ sock, jid, plugins }) => {
    const lines = [
      "╭───〔 JAYPAY MENU 〕───",
      "│",
      ...plugins.map(p => `│ !${p.name} — ${p.description}`),
      "│",
      "╰────────────────────"
    ];
    await sock.sendMessage(jid, { text: lines.join("\n") });
  }
};
