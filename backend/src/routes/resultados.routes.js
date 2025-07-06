const express = require("express");
const router = express.Router();
const resultadosController = require("../controllers/resultados.controller");
const { route } = require("../seeder");

router.get("/", resultadosController.obtenerTodos);
router.get("/lista", resultadosController.obtenerPorLista);
router.get("/partido", resultadosController.obtenerPorPartido);
router.get("/candidato", resultadosController.obtenerPorCandidato);
router.get("/departamento/partido", resultadosController.obtenerPorPartidoDepartamento);
router.get("/departamento/candidato", resultadosController.obtenerPorCandidatoDepartamento);
router.get("/departamento/ganador", resultadosController.obtenerGanadoresPorDepartamento);
router.get("/departamentos", resultadosController.obtenerDepartamentos);

module.exports = router;
