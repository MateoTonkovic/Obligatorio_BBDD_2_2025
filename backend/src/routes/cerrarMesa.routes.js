const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", async (req, res) => {
    const circuito = parseInt(req.body.circuito, 10);
    try {
        await db.query("UPDATE Mesa SET Estado = 'CERRADA' WHERE IdMesa = ?", [circuito]);
        res.status(200).json([]);
    } catch (error) {
        console.error("Error cerrando mesa:", error);
        res.status(500).json([]);
    }
});

module.exports = router;