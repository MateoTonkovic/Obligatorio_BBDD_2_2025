const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /api/listas
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM Lista");
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener las listas:", error);
    res.status(500).json({ error: "Error al obtener las listas" });
  }
});

module.exports = router;
