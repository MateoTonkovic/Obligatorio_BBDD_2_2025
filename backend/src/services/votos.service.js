exports.emitirVoto = async (sessionId, numeroLista, esObservado) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[sesion]] = await conn.query(
      "SELECT * FROM Session WHERE SessionId = ? FOR UPDATE",
      [sessionId]
    );
    if (!sesion) throw new Error("Sesión no encontrada");
    if (sesion.Utilizado) throw new Error("La sesión ya fue utilizada");
    if (new Date(sesion.FechaExpiracion) < new Date()) throw new Error("Sesión expirada");

    const [[sc]] = await conn.query(
      "SELECT NumeroCircuito FROM SessionCircuito WHERE SessionId = ?",
      [sessionId]
    );
    if (!sc) throw new Error("No se encontró el circuito asociado a la sesión");

    const [[mesa]] = await conn.query(
      "SELECT * FROM Mesa WHERE NumeroCircuito = ?",
      [sc.NumeroCircuito]
    );
    if (!mesa || mesa.Estado !== "ABIERTA") throw new Error("La mesa no está abierta");

    let tipo = "VALIDO";
    let numeroListaFinal = numeroLista;

    if (numeroLista === "blanco") {
      tipo = "BLANCO";
      numeroListaFinal = null;
    } else if (numeroLista === "anulado") {
      tipo = "ANULADO";
      numeroListaFinal = null;
    }

    await conn.query(
      `INSERT INTO Voto (SessionId, NumeroLista, IdEleccion, NumeroCircuito, Tipo, EsObservado)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [sessionId, numeroListaFinal, 1, sc.NumeroCircuito, tipo, !!esObservado]
    );

    await conn.query(
      "UPDATE Session SET Utilizado = TRUE WHERE SessionId = ?",
      [sessionId]
    );

    await conn.query(
      "UPDATE Circuito SET CantidadVotosEmitidos = CantidadVotosEmitidos + 1 WHERE NumeroCircuito = ?",
      [sc.NumeroCircuito]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    console.error("Error al emitir voto:", err.message);
    throw err;
  } finally {
    conn.release();
  }
};
const pool = require("../db");
