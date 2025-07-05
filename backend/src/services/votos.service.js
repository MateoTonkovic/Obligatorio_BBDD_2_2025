const pool = require("../db");

exports.emitirVoto = async (sessionId, numeroLista) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[sesion]] = await conn.query(
      "SELECT * FROM Session WHERE SessionId = ? FOR UPDATE",
      [sessionId]
    );

    if (!sesion) throw new Error("Sesión inválida");
    if (sesion.Utilizado) throw new Error("Sesión ya utilizada");
    if (new Date(sesion.FechaExpiracion) < new Date())
      throw new Error("Sesión expirada");

    // ⚠️ Acá deberías tener otra lógica para saber a qué circuito pertenece esa sesión.
    // Si no hay forma de obtenerlo sin violar el anonimato, deberías haberlo guardado al crear la sesión.
    // Supongamos que lo estás guardando en otra tabla temporal: SessionCircuito

    const [[sc]] = await conn.query(
      "SELECT NumeroCircuito FROM SessionCircuito WHERE SessionId = ?",
      [sessionId]
    );
    if (!sc) throw new Error("No se encontró circuito para esta sesión");

    const [[mesa]] = await conn.query(
      "SELECT * FROM Mesa WHERE NumeroCircuito = ?",
      [sc.NumeroCircuito]
    );

    if (!mesa || mesa.Estado !== "ABIERTA")
      throw new Error("La mesa no está habilitada para votar");

    await conn.query(
      "INSERT INTO Voto (SessionId, NumeroLista, IdEleccion, NumeroCircuito, Tipo, EsObservado) VALUES (?, ?, ?, ?, ?, ?)",
      [sessionId, numeroLista, 1, sc.NumeroCircuito, "PRESENCIAL", false]
    );

    await conn.query(
      "UPDATE Session SET Utilizado = TRUE WHERE SessionId = ?",
      [sessionId]
    );

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};
