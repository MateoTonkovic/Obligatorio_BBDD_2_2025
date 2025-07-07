const resultadosService = require("../services/resultados.service");

exports.obtenerPorLista = async (req, res) => {
  const { circuito } = req.query;
  try {
    const resultados = await resultadosService.porLista(circuito);
    res.json(resultados);
  } catch (error) {
    console.error("Error al obtener resultados por lista:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerPorPartido = async (req, res) => {
  const { circuito } = req.query;
  try {
    const resultados = await resultadosService.porPartido(circuito);
    res.json(resultados);
  } catch (error) {
    console.error("Error al obtener resultados por partido:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerPorCandidato = async (req, res) => {
  const { circuito } = req.query;
  try {
    const resultados = await resultadosService.porCandidato(circuito);
    res.json(resultados);
  } catch (error) {
    console.error("Error al obtener resultados por candidato:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerPorPartidoDepartamento = async (req, res) => {
  try {
    const { departamento } = req.query;
    const resultados = await resultadosService.resultadosPorPartidoDepartamento(departamento);
    res.json(resultados);
  } catch (error) {
    console.error("Error al obtener resultados por partido (departamento):", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerPorCandidatoDepartamento = async (req, res) => {
  try {
    const { departamento } = req.query;
    const resultados = await resultadosService.resultadosPorCandidatoDepartamento(departamento);
    res.json(resultados);
  } catch (error) {
    console.error("Error al obtener resultados por candidato (departamento):", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerGanadoresPorDepartamento = async (req, res) => {
  try {
    const resultados = await resultadosService.ganadorPorDepartamento();
    res.json(resultados);
  } catch (error) {
    console.error("Error al obtener ganadores por departamento:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerTodos = async (req, res) => {
  try {
    const circuitos = await resultadosService.obtenerTodos();
    res.json(circuitos);
  } catch (err) {
    console.error("Error al obtener circuitos:", err.message);
    res.status(500).json({ error: "Error al obtener los circuitos" });
  }
};

exports.obtenerDepartamentos = async (req, res) => {
  try {
    const departamentos = await resultadosService.obtenerDepartamentos();
    res.json(departamentos);
  } catch (error) {
    console.error("Error al obtener departamentos:", error.message);
    res.status(500).json({ error: "Error al obtener departamentos" });
  }
};
