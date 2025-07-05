const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/autorizar", async (req, res) => {
    const { idVoto } = req.body;
    try {
        await db.query("UPDATE Voto SET Autorizado = TRUE WHERE IdVoto = ?", [idVoto]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error autorizando voto:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;