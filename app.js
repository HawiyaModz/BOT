require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");
const bcrypt = require("bcryptjs");

const whatsapp = require("./lib/whatsapp");

const app = express();
const PORT = process.env.PORT || 3000;

// ===============================
// APP CONFIG
// ===============================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "jaypay-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

// ===============================
// TEMPORARY USER STORAGE
// ===============================
const users = [];

// ===============================
// AUTH MIDDLEWARE
// ===============================
function auth(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  next();
}

// ===============================
// HOME
// ===============================
app.get("/", (req, res) => {
  res.render("index", {
    user: req.session.user || null
  });
});

// ===============================
// LOGIN PAGE
// ===============================
app.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }

  res.render("login", {
    error: null
  });
});

// ===============================
// LOGIN PROCESS
// ===============================
app.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const password = String(req.body.password || "");

    // Validasi
    if (!email || !password) {
      return res.render("login", {
        error: "Email dan password wajib diisi."
      });
    }

    // Cari user berdasarkan email
    const user = users.find(
      (item) => item.email.toLowerCase() === email
    );

    if (!user) {
      return res.render("login", {
        error: "Email atau password salah."
      });
    }

    // Cek password
    const validPassword = await bcrypt.compare(
      password,
      user.password
    );

    if (!validPassword) {
      return res.render("login", {
        error: "Email atau password salah."
      });
    }

    // Simpan session
    req.session.user = {
      name: user.name,
      email: user.email
    };

    res.redirect("/dashboard");
  } catch (error) {
    console.error("Login error:", error);

    res.render("login", {
      error: "Terjadi kesalahan saat login."
    });
  }
});

// ===============================
// REGISTER PAGE
// ===============================
app.get("/register", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }

  res.render("register", {
    error: null
  });
});

// ===============================
// REGISTER PROCESS
// ===============================
app.post("/register", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();

    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const password = String(req.body.password || "");

    // Validasi
    if (!name || !email || !password) {
      return res.render("register", {
        error: "Nama, email dan password wajib diisi."
      });
    }

    if (name.length < 2) {
      return res.render("register", {
        error: "Nama minimal 2 karakter."
      });
    }

    if (password.length < 6) {
      return res.render("register", {
        error: "Password minimal 6 karakter."
      });
    }

    // Validasi email sederhana
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.render("register", {
        error: "Format email tidak valid."
      });
    }

    // Cek email sudah digunakan
    const exists = users.some(
      (item) => item.email.toLowerCase() === email
    );

    if (exists) {
      return res.render("register", {
        error: "Email sudah terdaftar."
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Simpan user
    users.push({
      name,
      email,
      password: hashedPassword
    });

    console.log("User berhasil daftar:", email);

    // Setelah daftar langsung arahkan ke login
    res.redirect("/login");
  } catch (error) {
    console.error("Register error:", error);

    res.render("register", {
      error: "Terjadi kesalahan saat membuat akun."
    });
  }
});

// ===============================
// LOGOUT
// ===============================
app.get("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Logout error:", error);
    }

    res.redirect("/");
  });
});

// ===============================
// DASHBOARD
// ===============================
app.get("/dashboard", auth, (req, res) => {
  res.render("dashboard", {
    user: req.session.user,
    wa: whatsapp.getStatus()
  });
});

// ===============================
// FEATURES
// ===============================
app.get("/features", auth, (req, res) => {
  res.render("features", {
    user: req.session.user
  });
});

// ===============================
// FAQ
// ===============================
app.get("/faq", (req, res) => {
  res.render("faq", {
    user: req.session.user || null
  });
});

// ===============================
// WHATSAPP PAGE
// ===============================
app.get("/whatsapp", auth, (req, res) => {
  res.render("whatsapp", {
    user: req.session.user,
    wa: whatsapp.getStatus(),
    error: null
  });
});

// ===============================
// CONNECT WHATSAPP
// ===============================
app.post("/whatsapp/connect", auth, async (req, res) => {
  try {
    const phone = String(req.body.phone || "")
      .replace(/\D/g, "");

    if (!phone) {
      return res.render("whatsapp", {
        user: req.session.user,
        wa: whatsapp.getStatus(),
        error: "Masukkan nomor WhatsApp."
      });
    }

    await whatsapp.startWhatsApp(phone);

    // Tidak perlu whatsapp.setupMessages()
    // karena handler sudah ada di lib/whatsapp.js

    res.redirect("/whatsapp");
  } catch (error) {
    console.error(
      "WhatsApp connection error:",
      error
    );

    res.render("whatsapp", {
      user: req.session.user,
      wa: whatsapp.getStatus(),
      error:
        error.message ||
        "Gagal menghubungkan WhatsApp."
    });
  }
});

// ===============================
// WHATSAPP STATUS API
// ===============================
app.get("/api/whatsapp/status", auth, (req, res) => {
  res.json(whatsapp.getStatus());
});

// ===============================
// PLUGINS API
// ===============================
app.get("/api/plugins", auth, (req, res) => {
  try {
    const plugins = whatsapp.loadPlugins();

    res.json(
      plugins.map((plugin) => ({
        name: plugin.name,
        aliases: plugin.aliases || [],
        description: plugin.description || ""
      }))
    );
  } catch (error) {
    console.error("Plugin API error:", error);

    res.status(500).json({
      error: "Gagal membaca plugin."
    });
  }
});

// ===============================
// 404
// ===============================
app.use((req, res) => {
  res.status(404).send("Halaman tidak ditemukan.");
});

// ===============================
// ERROR HANDLER
// ===============================
app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(500).send(
    "Terjadi kesalahan pada server."
  );
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  console.log("");
  console.log("================================");
  console.log("          JAYPAY SERVER");
  console.log("================================");
  console.log(`Server berjalan di port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
  console.log("================================");
  console.log("");
});