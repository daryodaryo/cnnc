require('dotenv').config();
const path = require('path');
const express = require('express');
const initDb = require('./db/init');
const loginRouter = require('./routes/login');
const requireAdminAuth = require('./middleware/requireAdminAuth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Gated before the static file server so it's never served to anyone
// who hasn't authenticated — admin.html lives outside public/ for the
// same reason (so express.static can't accidentally hand it out).
app.get('/admin.html', requireAdminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'private', 'admin.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', loginRouter);

app.get('/healthz', (req, res) => res.json({ ok: true }));

initDb()
  .catch((err) => console.error('DB init failed:', err.message))
  .finally(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
