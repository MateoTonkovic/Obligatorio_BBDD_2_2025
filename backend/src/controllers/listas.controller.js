const listaService = require('../services/listas.service');

exports.obtenerListas = async (req, res) => {
  try {
    const listas = await listaService.obtenerListasConNombrePartido();
    res.json(listas);
  } catch (error) {
    console.error("Error en el controlador al obtener listas:", error);
    res.status(500).json({ error: "Error al obtener las listas" });
  }
};
