const { Pool } = require('pg');

// Render injects DATABASE_URL automatically when the web service and the
// Postgres database are linked (see render.yaml). Render's internal
// connection string doesn't need SSL, but the external one does, so we
// detect that from the URL rather than hard-coding it.
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: connectionString && !connectionString.includes('localhost')
    ? { rejectUnauthorized: false }
    : false
});

module.exports = pool;
