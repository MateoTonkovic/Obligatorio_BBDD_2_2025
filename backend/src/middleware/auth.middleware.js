const pool = require('../db');

async function authMiddleware(req, res, next) {
  const tokenId = req.headers['token'] || req.headers['authorization'];
  if (!tokenId) {
    return res.status(401).json({ error: 'No session' });
  }

  const conn = await pool.getConnection();
  try {
    const [[token]] = await conn.query(
      'SELECT IDToken, fechaExpiracion FROM Token WHERE IDToken = ?',
      [tokenId]
    );
    if (!token) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const now = new Date();
    if (token.fechaExpiracion < now) {
      return res.status(401).json({ error: 'invalid session' });
    }

    req.token = tokenId;
    next();
  } catch (err) {
    console.error('Auth middleware error', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    conn.release();
  }
}

module.exports = authMiddleware;