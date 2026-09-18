const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(express.json({ limit: '50mb' }));   // biar bisa upload base64 gambar
app.use(express.static('public'));

/* ======================= FILE STORAGE ======================= */
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const USERS_FILE    = path.join(DATA_DIR, 'users.json');
const APKS_FILE     = path.join(DATA_DIR, 'apks.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

function readJSON(file, def) {
  try {
    if (!fs.existsSync(file)) return def;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) { return def; }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/* ======================= PASSWORD HASHING ======================= */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return salt + ':' + hash;
}
function verifyPassword(password, stored) {
  try {
    const [salt, hash] = stored.split(':');
    const check = crypto.scryptSync(password, salt, 64).toString('hex');
    return check === hash;
  } catch (e) { return false; }
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/* ======================= AUTH MIDDLEWARE ======================= */
function auth(req, res, next) {
  const token = (req.headers['authorization'] || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Belum login' });

  const sessions = readJSON(SESSIONS_FILE, {});
  const sess = sessions[token];

  if (!sess || sess.expiresAt < Date.now()) {
    if (sess) { delete sessions[token]; writeJSON(SESSIONS_FILE, sessions); }
    return res.status(401).json({ error: 'Session habis. Login ulang.' });
  }

  const users = readJSON(USERS_FILE, []);
  const user = users.find(u => u.username === sess.username);
  if (!user) return res.status(401).json({ error: 'User tidak ditemukan' });

  req.user = user;
  req.token = token;
  next();
}

/* ======================= ROUTES ======================= */

/* ----- REGISTER ----- */
app.post('/api/register', (req, res) => {
  const { username, password, nama } = req.body;

  if (!username || !password) return res.status(400).json({ error: 'Username & password wajib diisi' });
  if (!/^[a-z0-9_.]{3,20}$/.test(username)) return res.status(400).json({ error: 'Username: huruf kecil, angka, _ atau . (3-20)' });
  if (password.length < 6) return res.status(400).json({ error: 'Password minimal 6 karakter' });

  const users = readJSON(USERS_FILE, []);
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ error: 'Username sudah dipakai' });
  }

  const newUser = {
    id: crypto.randomBytes(8).toString('hex'),
    username,
    nama: nama || username,
    passwordHash: hashPassword(password),
    role: 'user',
    createdAt: Date.now()
  };
  users.push(newUser);
  writeJSON(USERS_FILE, users);

  res.json({ ok: true, message: 'Pendaftaran berhasil. Silakan login.' });
});

/* ----- LOGIN ----- */
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username & password wajib diisi' });

  const users = readJSON(USERS_FILE, []);
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Username tidak terdaftar' });
  if (!verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Password salah' });
  }

  const token = generateToken();
  const sessions = readJSON(SESSIONS_FILE, {});
  sessions[token] = {
    username: user.username,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000  // 7 hari
  };
  writeJSON(SESSIONS_FILE, sessions);

  res.json({
    ok: true,
    token,
    user: { username: user.username, nama: user.nama, role: user.role }
  });
});

/* ----- LOGOUT ----- */
app.post('/api/logout', auth, (req, res) => {
  const sessions = readJSON(SESSIONS_FILE, {});
  delete sessions[req.token];
  writeJSON(SESSIONS_FILE, sessions);
  res.json({ ok: true });
});

/* ----- CEK USER (me) ----- */
app.get('/api/me', auth, (req, res) => {
  res.json({
    username: req.user.username,
    nama: req.user.nama,
    role: req.user.role
  });
});

/* ----- LIST SEMUA APK (PUBLIC) ----- */
app.get('/api/apks', (req, res) => {
  const apks = readJSON(APKS_FILE, []);
  apks.sort((a, b) => b.createdAt - a.createdAt);
  res.json(apks);
});

/* ----- DETAIL APK (PUBLIC) ----- */
app.get('/api/apks/:id', (req, res) => {
  const apks = readJSON(APKS_FILE, []);
  const apk = apks.find(a => a.id === req.params.id);
  if (!apk) return res.status(404).json({ error: 'APK tidak ditemukan' });
  res.json(apk);
});

/* ----- UPLOAD APK (AUTH) ----- */
app.post('/api/apks', auth, (req, res) => {
  const apks = readJSON(APKS_FILE, []);

  const newApk = {
    id: crypto.randomBytes(8).toString('hex'),
    nama: req.body.nama,
    developer: req.body.developer || 'Developer',
    downloadUrl: req.body.downloadUrl,
    rating: req.body.rating || '5.0',
    jmlUlasan: req.body.jmlUlasan || '0 ulasan',
    ukuran: req.body.ukuran || '-',
    downloads: req.body.downloads || '-',
    desc1: req.body.desc1 || '',
    desc2: req.body.desc2 || '',
    whatsnew: req.body.whatsnew || '-',
    themeColor: req.body.themeColor || '#16a34a',
    icon: req.body.icon || '',
    screenshots: req.body.screenshots || [],
    reviewsArr: req.body.reviewsArr || [],
    uploadedByUsername: req.user.username,
    uploadedByNama: req.user.nama,
    createdAt: Date.now()
  };

  apks.push(newApk);
  writeJSON(APKS_FILE, apks);
  res.json({ ok: true, id: newApk.id });
});

/* ----- HAPUS APK (AUTH + OWNER OR ADMIN) ----- */
app.delete('/api/apks/:id', auth, (req, res) => {
  const apks = readJSON(APKS_FILE, []);
  const idx = apks.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'APK tidak ditemukan' });

  const apk = apks[idx];
  const isOwner = apk.uploadedByUsername === req.user.username;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Tidak boleh hapus APK orang lain' });
  }

  apks.splice(idx, 1);
  writeJSON(APKS_FILE, apks);
  res.json({ ok: true });
});

/* ======================= START ======================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('  ✅ Server jalan!');
  console.log('  🌐 Buka: http://localhost:' + PORT);
  console.log('');
});