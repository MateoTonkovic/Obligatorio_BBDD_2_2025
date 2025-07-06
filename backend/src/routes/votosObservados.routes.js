const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", async (req, res) => {
  const circuito = parseInt(req.body.circuito, 10);

  try {
    const resultado = await db.query(
      `SELECT V.* 
       FROM Voto V
       JOIN Circuito C ON V.NumeroCircuito = C.NumeroCircuito
       JOIN Mesa M ON C.NumeroCircuito = M.NumeroCircuito
       WHERE V.EsObservado = TRUE 
         AND V.Autorizado = FALSE 
         AND V.NumeroCircuito = ? 
         AND M.Estado = 'Abierta'`,
      [circuito]
    );

    res.status(200).json(resultado[0] || []);
  } catch (error) {
    console.error("Error obteniendo votos observados:", error);
    res.status(500).json([]);
  }
});

module.exports = router;