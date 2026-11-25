// Protects admin-only routes with HTTP Basic Auth.
// Credentials come from env vars so they're never committed to the repo.
// If ADMIN_PASSWORD isn't set, access is refused entirely (fail closed)
// rather than left open by accident.
function requireAdminAuth(req, res, next) {
  const expectedUser = process.env.ADMIN_USER || 'admin';
  const expectedPassword = process.env.ADMIN_PASSWORD;

  if (!expectedPassword) {
    return res
      .status(503)
      .send('Admin dashboard is not configured. Set ADMIN_PASSWORD on the server.');
  }

  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');

  if (scheme === 'Basic' && encoded) {
    const decoded = Buffer.from(encoded, 'base64').toString('utf8');
    const separatorIndex = decoded.indexOf(':');
    const user = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);

    if (user === expectedUser && password === expectedPassword) {
      return next();
    }
  }

  res.set('WWW-Authenticate', 'Basic realm="Admin area"');
  return res.status(401).send('Authentication required.');
}

module.exports = requireAdminAuth;
