const express = require('express');
const pool = require('../db/pool');
const requireAdminAuth = require('../middleware/requireAdminAuth');

const router = express.Router();

// POST /api/login
// Checks the submitted credentials against the users table, then logs the
// attempt (including the raw inputs) into login_attempts regardless of
// whether it succeeded.
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  if (!email || !password) {
    return res.status(400).json({ ok: false, message: 'Email and password are required.' });
  }

  let success = false;
  try {
    const result = await pool.query('SELECT password_hash FROM users WHERE email = $1', [email]);
    // Demo-only comparison. Replace with bcrypt.compare() once real
    // accounts (and hashed passwords) are in play.
    success = result.rows.length > 0 && result.rows[0].password_hash === password;
  } catch (err) {
    console.error('User lookup failed:', err.message);
  }

  try {
    await pool.query(
      `INSERT INTO login_attempts (email_input, password_input, success, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)`,
      [email, password, success, ip, userAgent]
    );
  } catch (err) {
    console.error('Failed to log login attempt:', err.message);
  }

  if (success) {
    return res.json({ ok: true, message: 'Logged in.' });
  }
  return res.status(401).json({ ok: false, message: 'Invalid email or password.' });
});

// GET /api/attempts
// Returns the most recent logged attempts for the admin view.
router.get('/attempts', requireAdminAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email_input, password_input, success, ip_address, user_agent, created_at
       FROM login_attempts
       ORDER BY created_at DESC
       LIMIT 200`
    );
    res.json({ ok: true, attempts: result.rows });
  } catch (err) {
    console.error('Failed to load attempts:', err.message);
    res.status(500).json({ ok: false, message: 'Could not load attempts.' });
  }
});

module.exports = router;
