const pool = require('../db');

async function authMiddleware(req, res, next) {
  const sessionId = req.headers['session'] || req.headers['authorization'];
  if (!sessionId) {
    return res.status(401).json({ error: 'No session' });
  }

  const conn = await pool.getConnection();
  try {
    const [[session]] = await conn.query(
      'SELECT SessionId, FechaExpiracion, Utilizado FROM Session WHERE SessionId = ?',
      [sessionId]
    );
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const now = new Date();
    if (session.FechaExpiracion < now) {
      return res.status(401).json({ error: 'invalid session' });
    }

    if (session.Utilizado) {
      return res.status(401).json({ error: 'invalid session' });
    }

    req.sessionId = sessionId;
    next();
  } catch (err) {
    console.error('Auth middleware error', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    conn.release();
  }
}

module.exports = authMiddleware;