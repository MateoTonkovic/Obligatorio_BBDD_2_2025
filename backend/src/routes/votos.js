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

    res.status(201).json({ exito: true, idVoto: resultado.rows[0].idvoto });
  } catch (error) {
    console.error("Error registrando voto:", error);
    res.status(500).json({ exito: false, error: error.message });
  }
});

router.get("/observados", async (req, res) => {
  try {
    const resultado = await db.query(
      `SELECT * FROM Voto WHERE EsObservado = TRUE AND Autorizado = FALSE`
    );
    res.status(200).json(resultado.rows || []);
  } catch (error) {
    console.error("Error obteniendo votos observados:", error);
    res.status(500).json([]);
  }
});

module.exports = router;
