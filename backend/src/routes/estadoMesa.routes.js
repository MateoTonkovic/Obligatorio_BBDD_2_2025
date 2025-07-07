const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", async (req, res) => {
  const circuito = parseInt(req.body.circuito, 10);
  try {
    const [resultado] = await db.query(
      "SELECT Estado FROM Mesa WHERE NumeroCircuito = ?",
      [circuito]
    );

    if (resultado.length > 0) {
      res.json({ estado: resultado[0].Estado });
    } else {
      res.status(404).json({ estado: "Desconocido" });
    }
  } catch (error) {
    console.error("Error al consultar estado de la mesa:", error);
    res.status(500).json({ estado: "Error" });
  }
});

module.exports = router;