exports.emitirVoto = async (
  sessionId,
  numeroLista,
  esObservado,
  numeroCircuito
) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[sesion]] = await conn.query(
      "SELECT * FROM Session WHERE SessionId = ? FOR UPDATE",
      [sessionId]
    );
    if (!sesion) throw new Error("Sesión no encontrada");
    if (sesion.Utilizado) throw new Error("La sesión ya fue utilizada");
    console.log("Sesión encontrada:", sesion);

    console.log("Fecha de expiración:", sesion.FechaExpiracion);
    console.log("Fecha actual:", new Date().getTime());
    if (new Date(sesion.FechaExpiracion).getTime() < new Date().getTime())
      throw new Error("Sesión expirada");

    if (!numeroCircuito) throw new Error("Número de circuito no proporcionado");

    const [[mesa]] = await conn.query(
      "SELECT * FROM Mesa WHERE NumeroCircuito = ?",
      [numeroCircuito]
    );
    if (!mesa || mesa.Estado !== "ABIERTA")
      throw new Error("La mesa no está abierta");

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
      [sessionId, numeroListaFinal, 1, numeroCircuito, tipo, !!esObservado]
    );

    await conn.query(
      "UPDATE Session SET Utilizado = TRUE WHERE SessionId = ?",
      [sessionId]
    );

    await conn.query(
      "UPDATE Circuito SET NumeroDeVotos = NumeroDeVotos + 1 WHERE NumeroCircuito = ?",
      [numeroCircuito]
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
