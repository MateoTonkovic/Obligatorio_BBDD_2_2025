const pool = require("../db");

exports.porLista = async (circuito) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `
      (
        SELECT 
          L.NumeroLista AS NombreLista,
          PP.Nombre AS NombrePartido,
          COUNT(*) AS CantVotos,
          ROUND(COUNT(*) * 100.0 / (
            SELECT COUNT(*) 
            FROM Voto 
            WHERE NumeroCircuito = ?
          ), 2) AS Porcentaje
        FROM Voto AS V
        JOIN Lista AS L ON V.NumeroLista = L.NumeroLista
        JOIN PartidoPolitico AS PP ON L.IdPartido = PP.IdPartido
        WHERE V.Tipo = 'VALIDO' AND V.NumeroCircuito = ?
        GROUP BY L.NumeroLista, PP.Nombre
      )
      UNION ALL
      (
        SELECT 
          'En Blanco' AS NombreLista,
          'En Blanco' AS NombrePartido,
          COUNT(*) AS CantVotos,
          ROUND(COUNT(*) * 100.0 / (
            SELECT COUNT(*) 
            FROM Voto 
            WHERE NumeroCircuito = ?
          ), 2) AS Porcentaje
        FROM Voto 
        WHERE Tipo = 'BLANCO' AND NumeroCircuito = ?
      )
      UNION ALL
      (
        SELECT 
          'Anulado' AS NombreLista,
          'Anulado' AS NombrePartido,
          COUNT(*) AS CantVotos,
          ROUND(COUNT(*) * 100.0 / (
            SELECT COUNT(*) 
            FROM Voto 
            WHERE NumeroCircuito = ?
          ), 2) AS Porcentaje
        FROM Voto 
        WHERE Tipo = 'ANULADO' AND NumeroCircuito = ?
      )
      ORDER BY CantVotos DESC
    `,
      [circuito, circuito, circuito, circuito, circuito, circuito]
    );

    return rows;
  } finally {
    conn.release();
  }
};

exports.porPartido = async (circuito) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `
      (
        SELECT 
          PP.Nombre AS NombrePartido,
          COUNT(*) AS CantVotos,
          ROUND(COUNT(*) * 100.0 / (
            SELECT COUNT(*) 
            FROM Voto 
            WHERE NumeroCircuito = ?
          ), 2) AS Porcentaje
        FROM Voto AS V
        JOIN Lista AS L ON V.NumeroLista = L.NumeroLista
        JOIN PartidoPolitico AS PP ON L.IdPartido = PP.IdPartido
        WHERE V.Tipo = 'VALIDO' AND V.NumeroCircuito = ?
        GROUP BY PP.Nombre
      )
      UNION ALL
      (
        SELECT 
          'En Blanco' AS NombrePartido,
          COUNT(*) AS CantVotos,
          ROUND(COUNT(*) * 100.0 / (
            SELECT COUNT(*) 
            FROM Voto 
            WHERE NumeroCircuito = ?
          ), 2) AS Porcentaje
        FROM Voto AS V
        WHERE V.Tipo = 'BLANCO' AND V.NumeroCircuito = ?
      )
      UNION ALL
      (
        SELECT 
          'Anulado' AS NombrePartido,
          COUNT(*) AS CantVotos,
          ROUND(COUNT(*) * 100.0 / (
            SELECT COUNT(*) 
            FROM Voto 
            WHERE NumeroCircuito = ?
          ), 2) AS Porcentaje
        FROM Voto AS V
        WHERE V.Tipo = 'ANULADO' AND V.NumeroCircuito = ?
      )
      ORDER BY CantVotos DESC
    `,
      [circuito, circuito, circuito, circuito, circuito, circuito]
    );

    return rows;
  } finally {
    conn.release();
  }
};

exports.porCandidato = async (circuito) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `
      (
        SELECT 
          PP.Nombre AS NombrePartido,
          CONCAT(P.Nombre, ' ', P.Apellido) AS NombreCandidato,
          COUNT(*) AS CantVotos,
          ROUND(COUNT(*) * 100.0 / (
            SELECT COUNT(*) 
            FROM Voto 
            WHERE NumeroCircuito = ?
          ), 2) AS Porcentaje
        FROM Voto V
        JOIN Lista L ON V.NumeroLista = L.NumeroLista
        JOIN PartidoPolitico PP ON L.IdPartido = PP.IdPartido
        JOIN Integra I ON I.NumeroLista = L.NumeroLista
        JOIN Persona P ON P.CI = I.CIPersona
        WHERE V.Tipo = 'VALIDO' 
          AND V.NumeroCircuito = ? 
          AND I.OrdenLista = 1 
          AND I.Organo = 'PRESIDENCIAL'
        GROUP BY PP.Nombre, P.Nombre, P.Apellido
      )
      UNION ALL
      (
        SELECT 
          'En Blanco' AS NombrePartido,
          'En Blanco' AS NombreCandidato,
          COUNT(*) AS CantVotos,
          ROUND(COUNT(*) * 100.0 / (
            SELECT COUNT(*) 
            FROM Voto 
            WHERE NumeroCircuito = ?
          ), 2) AS Porcentaje
        FROM Voto 
        WHERE Tipo = 'BLANCO' AND NumeroCircuito = ?
      )
      UNION ALL
      (
        SELECT 
          'Anulado' AS NombrePartido,
          'Anulado' AS NombreCandidato,
          COUNT(*) AS CantVotos,
          ROUND(COUNT(*) * 100.0 / (
            SELECT COUNT(*) 
            FROM Voto 
            WHERE NumeroCircuito = ?
          ), 2) AS Porcentaje
        FROM Voto 
        WHERE Tipo = 'ANULADO' AND NumeroCircuito = ?
      )
      ORDER BY CantVotos DESC
    `,
      [circuito, circuito, circuito, circuito, circuito, circuito]
    );

    return rows;
  } finally {
    conn.release();
  }
};

exports.obtenerTodos = async () => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query("SELECT NumeroCircuito FROM Circuito");
    return rows;
  } finally {
    conn.release();
  }
};

exports.resultadosPorPartidoDepartamento = async (departamento) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `
      SELECT 
        D.IdDepartamento,
        D.Nombre AS Departamento,
        COALESCE(PP.Nombre, 'Voto Anulado') AS NombrePartido,
        COUNT(*) AS CantVotos,
        ROUND(COUNT(*) * 100.0 / (
          SELECT COUNT(*) 
          FROM Voto V2 
          JOIN Circuito C2 ON V2.NumeroCircuito = C2.NumeroCircuito
          JOIN Establecimiento E2 ON C2.IdEstablecimiento = E2.IdEstablecimiento
          JOIN Zona Z2 ON E2.IdZona = Z2.IdZona
          JOIN Localidad L2 ON Z2.IdLocalidad = L2.IdLocalidad
          WHERE L2.IdDepartamento = ?
        ), 2) AS Porcentaje
      FROM Voto V
      JOIN Circuito C ON V.NumeroCircuito = C.NumeroCircuito
      JOIN Establecimiento E ON C.IdEstablecimiento = E.IdEstablecimiento
      JOIN Zona Z ON E.IdZona = Z.IdZona
      JOIN Localidad L ON Z.IdLocalidad = L.IdLocalidad
      JOIN Departamento D ON L.IdDepartamento = D.IdDepartamento
      LEFT JOIN Lista LI ON V.NumeroLista = LI.NumeroLista
      LEFT JOIN PartidoPolitico PP ON LI.IdPartido = PP.IdPartido
      WHERE D.IdDepartamento = ?
      GROUP BY D.IdDepartamento, D.Nombre, NombrePartido
      ORDER BY D.Nombre, CantVotos DESC
    `,
      [departamento, departamento]
    );
    return rows;
  } finally {
    conn.release();
  }
};

exports.resultadosPorCandidatoDepartamento = async (departamento) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `
      SELECT 
        D.IdDepartamento,
        D.Nombre AS Departamento,
        COALESCE(CONCAT(P.Nombre, ' ', P.Apellido), 'Voto Anulado') AS NombreCandidato,
        COALESCE(PP.Nombre, 'Voto Anulado') AS NombrePartido,
        COUNT(*) AS CantVotos,
        ROUND(COUNT(*) * 100.0 / (
          SELECT COUNT(*) 
          FROM Voto V2 
          JOIN Circuito C2 ON V2.NumeroCircuito = C2.NumeroCircuito
          JOIN Establecimiento E2 ON C2.IdEstablecimiento = E2.IdEstablecimiento
          JOIN Zona Z2 ON E2.IdZona = Z2.IdZona
          JOIN Localidad L2 ON Z2.IdLocalidad = L2.IdLocalidad
          WHERE L2.IdDepartamento = ?
        ), 2) AS Porcentaje
      FROM Voto V
      JOIN Circuito C ON V.NumeroCircuito = C.NumeroCircuito
      JOIN Establecimiento E ON C.IdEstablecimiento = E.IdEstablecimiento
      JOIN Zona Z ON E.IdZona = Z.IdZona
      JOIN Localidad L ON Z.IdLocalidad = L.IdLocalidad
      JOIN Departamento D ON L.IdDepartamento = D.IdDepartamento
      LEFT JOIN Lista LI ON V.NumeroLista = LI.NumeroLista
      LEFT JOIN PartidoPolitico PP ON LI.IdPartido = PP.IdPartido
      LEFT JOIN Integra I ON I.NumeroLista = LI.NumeroLista AND I.OrdenLista = 1 AND I.Organo = 'PRESIDENCIAL'
      LEFT JOIN Persona P ON P.CI = I.CIPersona
      WHERE D.IdDepartamento = ?
      GROUP BY D.IdDepartamento, D.Nombre, NombreCandidato, NombrePartido
      ORDER BY D.Nombre, CantVotos DESC
    `,
      [departamento, departamento]
    );
    return rows;
  } finally {
    conn.release();
  }
};

exports.ganadorPorDepartamento = async () => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(`
      SELECT 
        Departamento,
        NombreCandidato,
        NombrePartido,
        CantVotos
      FROM (
        SELECT 
          D.Nombre AS Departamento,
          CONCAT(P.Nombre, ' ', P.Apellido) AS NombreCandidato,
          PP.Nombre AS NombrePartido,
          COUNT(*) AS CantVotos,
          RANK() OVER (PARTITION BY D.Nombre ORDER BY COUNT(*) DESC) AS rk
        FROM Voto V
        JOIN Lista L ON V.NumeroLista = L.NumeroLista
        JOIN Integra I ON I.NumeroLista = L.NumeroLista AND I.OrdenLista = 1 AND I.Organo = 'PRESIDENCIAL'
        JOIN Persona P ON P.CI = I.CIPersona
        JOIN PartidoPolitico PP ON L.IdPartido = PP.IdPartido
        JOIN Circuito C ON V.NumeroCircuito = C.NumeroCircuito
        JOIN Establecimiento E ON C.IdEstablecimiento = E.IdEstablecimiento
        JOIN Zona Z ON E.IdZona = Z.IdZona
        JOIN Localidad Loca ON Z.IdLocalidad = Loca.IdLocalidad
        JOIN Departamento D ON Loca.IdDepartamento = D.IdDepartamento
        WHERE V.Tipo = 'VALIDO'
        GROUP BY D.Nombre, P.Nombre, P.Apellido, PP.Nombre
      ) AS sub
      WHERE rk = 1
      ORDER BY Departamento
    `);
    return rows;
  } finally {
    conn.release();
  }
};

exports.obtenerDepartamentos = async () => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT IdDepartamento, Nombre FROM Departamento ORDER BY Nombre`
    );
    return rows;
  } finally {
    conn.release();
  }
};
