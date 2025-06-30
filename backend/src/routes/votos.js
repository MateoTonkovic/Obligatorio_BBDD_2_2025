const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", async (req, res) => {
  const {
    sessionId,
    numeroLista,
    idEleccion,
    numeroCircuito,
    tipo,
    esObservado,
  } = req.body;

  try {
    const resultado = await db.query(
      `INSERT INTO Voto (SessionId, NumeroLista, IdEleccion, NumeroCircuito, Tipo, EsObservado)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING IdVoto`,
      [sessionId, numeroLista, idEleccion, numeroCircuito, tipo, esObservado]
    );

    // ✅ marcar que el votante ya votó (esto es opcional y depende del flujo)
    // await db.query("UPDATE Votante SET Voto = true WHERE SessionId = $1", [sessionId]);

    res.status(201).json({ exito: true, idVoto: resultado.rows[0].idvoto });
  } catch (error) {
    console.error("Error registrando voto:", error);
    res.status(500).json({ exito: false, error: error.message });
  }
});

module.exports = router;
