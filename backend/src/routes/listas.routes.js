const express = require('express');
const router = express.Router();
const listaController = require('../controllers/listas.controller');

router.get('/', listaController.obtenerListas);

module.exports = router;

