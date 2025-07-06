const pool = require("../db");
const crypto = require("crypto");

async function authenticate(ci, contrasena, circuito) {
  const conn = await pool.getConnection();
  try {
    const [[person]] = await conn.query("SELECT * FROM Persona WHERE CI = ?", [
      ci,
    ]);
    console.log("Persona encontrada:", person);
    if (!person) throw new Error("Usuario no encontrado");

    const [[votante]] = await conn.query(
      "SELECT NumeroCircuito, Contrasena FROM Votante WHERE CIPersona = ? AND Voto = FALSE",
      [ci]
    );

    const [[miembro]] = await conn.query(
      "SELECT Contrasena FROM MiembroMesa WHERE CIPersona = ? AND IdMesa = ?",
      [ci, circuito]
    );

    const [[circuitoInfo]] = await conn.query(
      "SELECT * FROM Circuito WHERE NumeroCircuito = ?",
      [circuito]
    );

    console.log("Circuito Info:", circuitoInfo);
    if (!circuitoInfo) throw new Error("Circuito no encontrado");
    const observado =
      person.CredencialCivica < circuitoInfo.PrimeraCredencial ||
      person.CredencialCivica > circuitoInfo.UltimaCredencial;
    console.log("Observado:", observado);
    let debeElegir = false;
    let role = null;

    if (miembro) {
      if (miembro.Contrasena !== contrasena)
        throw new Error("Credencial inválida");
      role = "miembro";
      debeElegir = !!votante; // Si aparte de ser miembro, es votante, debe elegir posteriormente
    } else if (votante) {
      if (votante.Contrasena !== contrasena) throw new Error("Credencial inválida");

      role = "votante";
      await conn.query(
        "UPDATE Votante SET Voto = TRUE WHERE CIPersona = ? AND NumeroCircuito = ?",
        [ci, circuito]
      );
    } else {
      throw new Error("El usuario no se encuentra registrado o ya ha votado");
    }

    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000);
    await conn.query(
      "INSERT INTO Session (SessionId, FechaExpiracion, Utilizado) VALUES (?, ?, ?)",
      [sessionId, expiresAt, false]
    );

    const [tokenResult] = await conn.query(
      "INSERT INTO Token (CIPersona, fechaExpiracion) VALUES (?, ?)",
      [ci, expiresAt]
    );

    return {
      sessionId,
      tokenId: tokenResult.insertId,
      role,
      observado,
      debeElegir,
    };
  } finally {
    conn.release();
  }
}

module.exports = { authenticate };
