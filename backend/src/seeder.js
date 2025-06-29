const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const pool = require('./db');
const router = express.Router();

function parseCSV(fileName) {
  const results = [];
  const filePath = path.join(__dirname, '..', 'data', fileName);
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', data => results.push(data))
      .on('end', () => resolve(results))
      .on('error', err => reject(err));
  });
}

router.post('/seed', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const rawCircuital = await parseCSV('plan-circuital.csv');
    const rawIntegration = await parseCSV('integracion-de-hojas-de-votacion-eleccion-nacional.csv');

    const circuital = rawCircuital.map(rec => ({
      Departamento: rec.Departamento.trim(),
      Localidad: rec.Localidad.trim(),
      Local: (rec['Local '] || rec.Local).trim(),
      NroCircuito: parseInt(rec.NroCircuito, 10) || 0,
      Accesibilidad: rec.Accesibilidad === 'S',
      Desde: parseInt(rec.Desde, 10) || 0,
      Hasta: parseInt(rec.Hasta, 10) || 0,
      TipoLocalidad: rec.TipoLocalidad?.trim(),
      TipoEstablecimiento: rec.TipoCircuito?.trim()
    }));

    const integration = rawIntegration.map(rec => ({
      PartidoPolitico: rec.PartidoPolitico.trim(),
      Direccion: rec.Direccion?.trim(),
      Departamento: rec.Departamento.trim(),
      CredencialNumero: parseInt(rec.CredencialNumero, 10) || 0,
      Nombre: rec.Nombre.trim(),
      Apellido: rec.Apellido?.trim(),
      FechaNacimiento: rec.FechaNacimiento?.trim(),
      Ordinal: parseInt(rec.Ordinal, 10) || 1,
      Organizacion: rec.Organizacion?.trim()
    }));

    await conn.beginTransaction();

    const deptMap = new Map();
    let deptCounter = 1;
    for (const rec of [...circuital, ...integration]) {
      if (!deptMap.has(rec.Departamento)) {
        await conn.query(
          'INSERT IGNORE INTO Departamento (IdDepartamento, Nombre) VALUES (?, ?)',
          [deptCounter, rec.Departamento]
        );
        deptMap.set(rec.Departamento, deptCounter);
        deptCounter++;
      }
    }

    const locMap = new Map();
    let locCounter = 1;
    for (const rec of circuital) {
      const deptId = deptMap.get(rec.Departamento);
      const key = `${rec.Localidad}|${deptId}`;
      if (!locMap.has(key)) {
        await conn.query(
          'INSERT IGNORE INTO Localidad (IdLocalidad, Nombre, Tipo, IdDepartamento) VALUES (?, ?, ?, ?)',
          [locCounter, rec.Localidad, rec.TipoLocalidad || 'Desconocida', deptId]
        );
        locMap.set(key, locCounter);
        locCounter++;
      }
    }

    const zoneMap = new Map();
    let zoneCounter = 1;
    for (const locId of locMap.values()) {
      const zoneName = `Zona ${locId}`;
      await conn.query(
        'INSERT IGNORE INTO Zona (IdZona, Nombre, IdLocalidad) VALUES (?, ?, ?)',
        [zoneCounter, zoneName, locId]
      );
      zoneMap.set(locId, zoneCounter);
      zoneCounter++;
    }

    const estMap = new Map();
    let estCounter = 1;
    for (const rec of circuital) {
      const key = rec.Local;
      if (!estMap.has(key)) {
        const deptId = deptMap.get(rec.Departamento);
        const locKey = `${rec.Localidad}|${deptId}`;
        const zoneId = zoneMap.get(locMap.get(locKey));
        await conn.query(
          'INSERT IGNORE INTO Establecimiento (IdEstablecimiento, Nombre, Tipo, IdZona) VALUES (?, ?, ?, ?)',
          [estCounter, rec.Local, rec.TipoEstablecimiento || 'Desconocido', zoneId]
        );
        estMap.set(key, estCounter);
        estCounter++;
      }
    }

    const comisMap = new Map();
    for (const [name, deptId] of deptMap.entries()) {
      const num = deptId * 10;
      await conn.query(
        'INSERT IGNORE INTO Comisaria (NumeroComisaria, NombreComisaria, IdDepartamento) VALUES (?, ?, ?)',
        [num, `Comisaria de ${name}`, deptId]
      );
      comisMap.set(deptId, num);
    }

    for (const rec of circuital) {
      await conn.query(
        'INSERT IGNORE INTO Circuito (NumeroCircuito, IdEstablecimiento, EsAccesible, NumeroDeVotos, PrimeraCredencial, UltimaCredencial) VALUES (?, ?, ?, ?, ?, ?)',
        [rec.NroCircuito, estMap.get(rec.Local), rec.Accesibilidad, 0, rec.Desde, rec.Hasta]
      );
      await conn.query(
        'INSERT IGNORE INTO Mesa (IdMesa, NumeroCircuito, Estado) VALUES (?, ?, ?)',
        [rec.NroCircuito, rec.NroCircuito, 'ABIERTA']
      );
    }

    const partyMap = new Map();
    const listMap = new Map();
    let listCounter = 1;
    for (const rec of integration) {
      const party = rec.PartidoPolitico;
      if (!partyMap.has(party)) {
        await conn.query(
          'INSERT IGNORE INTO PartidoPolitico (IdPartido, Direccion) VALUES (?, ?)',
          [listCounter, rec.Direccion || '']
        );
        partyMap.set(party, listCounter);
        listCounter++;
      }
      const deptId = deptMap.get(rec.Departamento);
      const key = `${party}|${deptId}`;
      if (!listMap.has(key)) {
        await conn.query(
          'INSERT IGNORE INTO Lista (NumeroLista, IdPartido, IdDepartamento) VALUES (?, ?, ?)',
          [listCounter, partyMap.get(party), deptId]
        );
        listMap.set(key, listCounter);
        listCounter++;
      }
    }

    await conn.query(
      'INSERT IGNORE INTO Eleccion (IdEleccion, Tipo, Fecha) VALUES (?, ?, ?)',
      [1, 'Nacional', new Date()]
    );

    for (const rec of integration) {
      const ci = rec.CredencialNumero;
      await conn.query(
        'INSERT IGNORE INTO Persona (CI, CredencialCivica, Nombre, Apellido, FechaNacimiento) VALUES (?, ?, ?, ?, ?)',
        [ci, ci, rec.Nombre, rec.Apellido || '', rec.FechaNacimiento || '1970-01-01']
      );
      await conn.query(
        'INSERT IGNORE INTO Candidato (CIPersona, IdEleccion, IdPartido) VALUES (?, ?, ?)',
        [ci, 1, partyMap.get(rec.PartidoPolitico)]
      );
      const deptId = deptMap.get(rec.Departamento);
      const listaId = listMap.get(`${rec.PartidoPolitico}|${deptId}`);
      await conn.query(
        'INSERT IGNORE INTO Integra (CIPersona, NumeroLista, OrdenLista, Organo) VALUES (?, ?, ?, ?)',
        [ci, listaId, rec.Ordinal, rec.Organizacion || '']
      );
    }

    for (const rec of circuital) {
      const ci = rec.Desde;  // use Desde as CIPersona
      const nro = rec.NroCircuito;
      const deptId = deptMap.get(rec.Departamento);
      await conn.query(
        'INSERT IGNORE INTO Votante (CIPersona, NumeroCircuito, Contrasena, Voto) VALUES (?, ?, ?, ?)',
        [ci, nro, 'pass', false]
      );
      await conn.query(
        'INSERT IGNORE INTO MiembroMesa (CIPersona, IdMesa, OrganismoEstado, Rol, Contrasena) VALUES (?, ?, ?, ?, ?)',
        [ci + 100000, nro, 'MTSS', 'Presidente', 'pass']
      );
      await conn.query(
        'INSERT IGNORE INTO AgentePolicial (CIPersona, NumeroComisaria, IdEstablecimiento) VALUES (?, ?, ?)',
        [ci + 200000, comisMap.get(deptId), estMap.get(rec.Local)]
      );
    }

    await conn.commit();
    res.json({ status: 'OK', message: 'Seed completed' });
  } catch (err) {
    console.error(err);
    await conn.rollback();
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
