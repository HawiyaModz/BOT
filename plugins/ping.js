module.exports = {
  name: "ping",
  aliases: ["p"],
  description: "Cek apakah bot aktif.",
  command: async ({ sock, jid }) => {
    await sock.sendMessage(jid, { text: "🏓 Pong! JayPay Bot aktif." });
  }
};
