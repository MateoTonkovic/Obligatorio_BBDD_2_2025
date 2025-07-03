const pool = require('../db');
const crypto = require('crypto');

async function authenticate(ci, contrasena, circuito) {
  const conn = await pool.getConnection();
  try {
    const [[person]] = await conn.query(
      'SELECT CI FROM Persona WHERE CI = ?',
      [ci]
    );
    if (!person) throw new Error('Usuario no encontrado');

    const [[votante]] = await conn.query(
      'SELECT Contrasena FROM Votante WHERE CIPersona = ? AND NumeroCircuito = ? AND Voto = FALSE',
      [ci, circuito]
    );
    const [[miembro]] = await conn.query(
      'SELECT Contrasena FROM MiembroMesa WHERE CIPersona = ? AND IdMesa = ?',
      [ci, circuito]
    );

    let role = null;
    let observado = false;
    let debeElegir = false;

    if (miembro) {
      if (miembro.Contrasena !== contrasena) throw new Error('Credencial inválida');
      role = 'miembro';
      debeElegir = !!votante;
    } else if (votante) {
      if (votante.Contrasena !== contrasena) throw new Error('Credencial inválida');
      role = 'votante';
      await conn.query(
        'UPDATE Votante SET Voto = TRUE WHERE CIPersona = ? AND NumeroCircuito = ?',
        [ci, circuito]
      );
    } else {
      observado = true;
    }

    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 3600 * 1000);
    await conn.query(
      'INSERT INTO Session (SessionId, FechaExpiracion, Utilizado) VALUES (?, ?, ?)',
      [sessionId, expiresAt, false]
    );

    const [tokenResult] = await conn.query(
      'INSERT INTO Token (CIPersona, fechaExpiracion) VALUES (?, ?)',
      [ci, expiresAt]
    );

    return { sessionId, tokenId: tokenResult.insertId, role, observado, debeElegir };
  } finally {
    conn.release();
  }
}

module.exports = { authenticate };
