require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const bcrypt = require("bcryptjs");
const whatsapp = require("./lib/whatsapp");

const app = express();
const PORT = process.env.PORT || 3000;

const users = [];

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: process.env.SESSION_SECRET || "development-secret-change-me",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

function auth(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

app.get("/", (req, res) => res.render("index", { user: req.session.user }));
app.get("/features", (req, res) => res.render("features"));
app.get("/faq", (req, res) => res.render("faq"));

app.get("/login", (req, res) => res.render("login", { error: null }));
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.render("login", { error: "Email atau password salah." });
  }
  req.session.user = { name: user.name, email: user.email };
  res.redirect("/dashboard");
});

app.get("/register", (req, res) => res.render("register", { error: null }));
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6) {
    return res.render("register", { error: "Lengkapi data. Password minimal 6 karakter." });
  }
  if (users.some(u => u.email === email)) {
    return res.render("register", { error: "Email sudah terdaftar." });
  }
  users.push({ name, email, password: await bcrypt.hash(password, 10) });
  res.redirect("/login");
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});


app.get("/whatsapp", auth, (req, res) => {
  res.render("whatsapp", { user: req.session.user, wa: whatsapp.getStatus(), error: null });
});

app.post("/whatsapp/connect", auth, async (req, res) => {
  try {
    const phone = (req.body.phone || "").replace(/\D/g, "");
    if (!phone) return res.render("whatsapp", { user: req.session.user, wa: whatsapp.getStatus(), error: "Masukkan nomor WhatsApp." });
    await whatsapp.startWhatsApp(phone);
    whatsapp.setupMessages();
    res.redirect("/whatsapp");
  } catch (e) {
    res.render("whatsapp", { user: req.session.user, wa: whatsapp.getStatus(), error: e.message });
  }
});

app.get("/api/plugins", auth, (req, res) => {
  res.json(whatsapp.loadPlugins().map(p => ({
    name: p.name,
    aliases: p.aliases || [],
    description: p.description || ""
  })));
});

app.get("/api/whatsapp/status", auth, (req, res) => {
  res.json(whatsapp.getStatus());
});

app.get("/dashboard", auth, (req, res) => {
  res.render("dashboard", { user: req.session.user });
});

app.get("/api/status", auth, (req, res) => {
  res.json({
    status: "online",
    uptime: "99.9%",
    users: users.length,
    features: 48,
    updatedAt: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});