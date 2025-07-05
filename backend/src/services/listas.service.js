const db = require("../db");

exports.obtenerListasConNombrePartido = async () => {
  const [rows] = await db.query(`
      SELECT 
        Lista.NumeroLista, 
        Lista.IdPartido, 
        PartidoPolitico.Nombre AS NombrePartido
      FROM Lista
      JOIN PartidoPolitico ON Lista.IdPartido = PartidoPolitico.IdPartido
    `);
  return rows;
};
