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
    await conn.query('SET FOREIGN_KEY_CHECKS=0');

    const rawCircuital = await parseCSV('plan-circuital.csv');
    const rawIntegration = await parseCSV('integracion-de-hojas-de-votacion-eleccion-nacional.csv');

    const circuital = rawCircuital.map(rec => ({
      Departamento: rec.Departamento.trim(),
      Localidad: rec.Localidad.trim(),
      Local: (rec['Local '] || rec.Local).trim(),
      NroCircuito: parseInt(rec.NroCircuito, 10) || 0,
      Accesibilidad: rec.Accesibilidad === 'S' ? 1 : 0,
      Desde: parseInt(rec.Desde, 10) || 0,
      Hasta: parseInt(rec.Hasta, 10) || 0
    }));

    const integration = rawIntegration.map(rec => {
      const parts = rec.Nombre.split(',').map(s => s.trim());
      const apellido = parts[0] || '';
      const nombre = parts[1] || parts[0] || '';
      return {
        PartidoPolitico: rec.PartidoPolitico.trim(),
        Departamento: rec.Departamento.trim(),
        CredencialNumero: parseInt(rec.CredencialNumero, 10) || 0,
        Nombre: nombre,
        Apellido: apellido,
        FechaNacimiento: rec.FechaNacimiento?.trim() || '1970-01-01',
        Ordinal: parseInt(rec.Ordinal, 10) || 1,
        Candidatura: rec.Candidatura?.trim() || ''
      };
    });

    await conn.beginTransaction();

    console.log('Creando departamentos')
    const deptNames = Array.from(new Set([
      ...circuital.map(r => r.Departamento),
      ...integration.map(r => r.Departamento)
    ]));
    const deptValues = deptNames.map((name, idx) => [idx + 1, name]);
    await conn.query(
      'INSERT IGNORE INTO Departamento (IdDepartamento, Nombre) VALUES ?',
      [deptValues]
    );
    const deptMap = new Map(deptNames.map((n, i) => [n, i + 1]));

    console.log('Creando localidades')
    const locKeys = Array.from(new Set(
      circuital.map(r => `${r.Localidad}|${deptMap.get(r.Departamento)}`)
    ));
    const locValues = locKeys.map((key, idx) => {
      const [loc] = key.split('|');
      const rec = circuital.find(r => `${r.Localidad}|${deptMap.get(r.Departamento)}` === key);
      const deptId = deptMap.get(rec.Departamento);
      return [idx + 1, loc, 'Desconocida', deptId];
    });
    await conn.query(
      'INSERT IGNORE INTO Localidad (IdLocalidad, Nombre, Tipo, IdDepartamento) VALUES ?',
      [locValues]
    );
    const locMap = new Map(locKeys.map((k, i) => [k, i + 1]));

    console.log('Creando zonas')
    const zoneValues = Array.from(locMap.values()).map((locId, idx) => [idx + 1, `Zona ${locId}`, locId]);
    await conn.query(
      'INSERT IGNORE INTO Zona (IdZona, Nombre, IdLocalidad) VALUES ?',
      [zoneValues]
    );
    const zoneMap = new Map(zoneValues.map(([, , locId], i) => [locId, i + 1]));

    console.log('Creando establecimientos')
    const estKeys = Array.from(new Set(circuital.map(r => r.Local)));
    const estValues = estKeys.map((name, idx) => {
      const rec = circuital.find(r => r.Local === name);
      const deptId = deptMap.get(rec.Departamento);
      const locKey = `${rec.Localidad}|${deptId}`;
      const zoneId = zoneMap.get(locMap.get(locKey));
      return [idx + 1, name, 'Desconocida', zoneId];
    });
    await conn.query(
      'INSERT IGNORE INTO Establecimiento (IdEstablecimiento, Nombre, Tipo, IdZona) VALUES ?',
      [estValues]
    );
    const estMap = new Map(estKeys.map((n, i) => [n, i + 1]));

    console.log('Creando comisarías')
    const comisValues = deptNames.map((name, idx) => {
      const num = (idx + 1) * 10;
      return [num, `Comisaria de ${name}`, idx + 1];
    });
    await conn.query(
      'INSERT IGNORE INTO Comisaria (NumeroComisaria, NombreComisaria, IdDepartamento) VALUES ?',
      [comisValues]
    );
    const comisMap = new Map(deptNames.map((n, i) => [i + 1, (i + 1) * 10]));

    console.log('Creando circuitos')
    const circuitoValues = circuital.map(r => [
      r.NroCircuito,
      estMap.get(r.Local),
      r.Accesibilidad,
      0,
      r.Desde,
      r.Hasta
    ]);
    await conn.query(
      'INSERT IGNORE INTO Circuito (NumeroCircuito, IdEstablecimiento, EsAccesible, NumeroDeVotos, PrimeraCredencial, UltimaCredencial) VALUES ?',
      [circuitoValues]
    );
    
    console.log('Creando mesas')
    const mesaValues = circuital.map(r => [r.NroCircuito, r.NroCircuito, 'ABIERTA']);
    await conn.query(
      'INSERT IGNORE INTO Mesa (IdMesa, NumeroCircuito, Estado) VALUES ?',
      [mesaValues]
    );

    console.log('Creando partidos políticos')
    const partyNames = Array.from(new Set(integration.map(r => r.PartidoPolitico)));
    const partyValues = partyNames.map((p, idx) => [idx + 1, p, `${p} 123 Calle Falsa`]);
    await conn.query(
      'INSERT IGNORE INTO PartidoPolitico (IdPartido, Nombre, Direccion) VALUES ?',
      [partyValues]
    );
    const partyMap = new Map(partyNames.map((p, i) => [p, i + 1]));

    console.log('Creando listas')
    const listKeys = Array.from(new Set(
      integration.map(r => `${r.PartidoPolitico}|${r.Departamento}`)
    ));
    const listValues = listKeys.map((key, idx) => {
      const [p, dept] = key.split('|');
      return [idx + 1, partyMap.get(p), deptMap.get(dept)];
    });
    await conn.query(
      'INSERT IGNORE INTO Lista (NumeroLista, IdPartido, IdDepartamento) VALUES ?',
      [listValues]
    );
    const listMap = new Map(listKeys.map((k, i) => [k, i + 1]));

    console.log('Creando elecciones')
    await conn.query(
      'INSERT IGNORE INTO Eleccion (IdEleccion, Tipo, Fecha) VALUES (?, ?, ?)',
      [1, 'Nacional', new Date()]
    );

    console.log('Creando personas')
    const personaValues = integration.map(r => [
      r.CredencialNumero,
      r.CredencialNumero,
      r.Nombre,
      r.Apellido,
      r.FechaNacimiento
    ]);
    await conn.query(
      'INSERT IGNORE INTO Persona (CI, CredencialCivica, Nombre, Apellido, FechaNacimiento) VALUES ?',
      [personaValues]
    );

    console.log('Creando candidatos')
    const candidatoValues = integration.map(r => [
      r.CredencialNumero,
      1,
      partyMap.get(r.PartidoPolitico)
    ]);
    await conn.query(
      'INSERT IGNORE INTO Candidato (CIPersona, IdEleccion, IdPartido) VALUES ?',
      [candidatoValues]
    );

    console.log('Creando integra')
    const integraValues = integration.map(r => {
      const org = r.Candidatura.includes('Diputado')
        ? 'Diputado'
        : r.Candidatura.includes('Senador')
        ? 'Senador'
        : r.Candidatura;
      return [
        r.CredencialNumero,
        listMap.get(`${r.PartidoPolitico}|${r.Departamento}`),
        r.Ordinal,
        org
      ];
    });
    await conn.query(
      'INSERT IGNORE INTO Integra (CIPersona, NumeroLista, OrdenLista, Organo) VALUES ?',
      [integraValues]
    );

    console.log('Creando votantes')
    const personaVotanteValues = circuital.map(r => [
      r.Desde,
      r.Desde,
      'Votante',
      'Seed',
      '1980-01-01'
    ]);
    await conn.query(
      'INSERT IGNORE INTO Persona (CI, CredencialCivica, Nombre, Apellido, FechaNacimiento) VALUES ?',
      [personaVotanteValues]
    );

    console.log('Creando miembros de mesa')
    const personaMiembroValues = circuital.map(r => [
      r.Desde + 100000,
      r.Desde + 100000,
      'Miembro',
      'Mesa',
      '1985-01-01'
    ]);
    await conn.query(
      'INSERT IGNORE INTO Persona (CI, CredencialCivica, Nombre, Apellido, FechaNacimiento) VALUES ?',
      [personaMiembroValues]
    );

    const votanteValues = circuital.flatMap(r => [
      [r.Desde, r.NroCircuito, 'pass', false],        
      [r.Desde + 100000, r.NroCircuito, 'pass', false] 
    ]);
    await conn.query(
      'INSERT IGNORE INTO Votante (CIPersona, NumeroCircuito, Contrasena, Voto) VALUES ?',
      [votanteValues]
    );

    const miembroValues = circuital.map(r => [
      r.Desde + 100000,
      r.NroCircuito,
      'MTSS',
      'Presidente',
      'pass'
    ]);
    await conn.query(
      'INSERT IGNORE INTO MiembroMesa (CIPersona, IdMesa, OrganismoEstado, Rol, Contrasena) VALUES ?',
      [miembroValues]
    );

    console.log('Creando agentes policiales')
    const agentePersonaValues = circuital.map(r => [
      r.Desde + 200000,
      r.Desde + 200000,
      'Juan',
      'Perez',
      '1975-01-01'
    ]);
    await conn.query(
      'INSERT IGNORE INTO Persona (CI, CredencialCivica, Nombre, Apellido, FechaNacimiento) VALUES ?',
      [agentePersonaValues]
    );
    const agenteValues = circuital.map(r => [
      r.Desde + 200000,
      comisMap.get(deptMap.get(r.Departamento)),
      estMap.get(r.Local)
    ]);
    await conn.query(
      'INSERT IGNORE INTO AgentePolicial (CIPersona, NumeroComisaria, IdEstablecimiento) VALUES ?',
      [agenteValues]
    );

    await conn.commit();
    await conn.query('SET FOREIGN_KEY_CHECKS=1');
    res.json({ status: 'OK', message: 'Seeds completado' });
  } catch (err) {
    console.error(err);
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
