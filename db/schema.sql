-- Run automatically on server startup by db/init.js (also safe to run by hand).

-- Logs every submitted login attempt, successful or not.
-- NOTE: this stores the raw password INPUT so it shows up in the admin
-- view, as requested. That is fine for a local demo/test database, but
-- storing plaintext passwords is a real security risk in anything public
-- or production-facing — anyone with DB access could read every password
-- anyone has ever typed. Before this goes live for real users, either
-- drop the password_input column or hash it before INSERT.
CREATE TABLE IF NOT EXISTS login_attempts (
  id SERIAL PRIMARY KEY,
  email_input TEXT,
  password_input TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Minimal users table so "login" has something real to check against.
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL
);

-- Seed one demo account so you can test the flow immediately:
--   [email protected] / demo1234
-- password_hash is plaintext here only because there's no auth/hashing
-- library wired up yet — swap in bcrypt before using real accounts.
INSERT INTO users (email, password_hash)
VALUES ('[email protected]', 'demo1234')
ON CONFLICT (email) DO NOTHING;
