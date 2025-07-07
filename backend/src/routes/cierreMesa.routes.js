const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", async (req, res) => {
    const circuito = parseInt(req.body.circuito, 10);
    try {
        await db.query("UPDATE Mesa SET Estado = 'CERRADA' WHERE IdMesa = ?", [circuito]);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error autorizando voto:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;