const express = require("express");
const router = express.Router();
const votoController = require("../controllers/votos.controller");

router.post("/emitir", votoController.emitir);

module.exports = router;
