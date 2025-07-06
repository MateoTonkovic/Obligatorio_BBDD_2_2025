import { useState, useEffect } from "react";
import "./resultados.css";
import escudo from "../../Images/escudoUruguay.png";

export default function Resultados() {
  const [tipoVista, setTipoVista] = useState("circuito");
  const [tipoResultado, setTipoResultado] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [circuitos, setCircuitos] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [circuitoSeleccionado, setCircuitoSeleccionado] = useState(null);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState("");
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchConToken = (url) => {
    return fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  useEffect(() => {
    fetchConToken("http://localhost:3001/api/resultados/")
      .then((res) => res.json())
      .then((data) => setCircuitos(data))
      .catch((err) => console.error("Error al cargar circuitos:", err));

    fetchConToken("http://localhost:3001/api/resultados/departamentos")
      .then((res) => res.json())
      .then((data) => setDepartamentos(data))
      .catch((err) => console.error("Error al cargar departamentos:", err));
  }, []);
  console.log(departamentoSeleccionado)

  useEffect(() => {
    setDatos([]);
    if (
      (tipoVista === "circuito" && circuitoSeleccionado) ||
      (tipoVista === "departamento" && departamentoSeleccionado) ||
      tipoVista === "ganador"
    ) {
      setLoading(true);
      let url = "";

      if (tipoVista === "circuito") {
        url = `http://localhost:3001/api/resultados/${tipoResultado}?circuito=${circuitoSeleccionado}`;
      } else if (tipoVista === "departamento") {
        url = `http://localhost:3001/api/resultados/departamento/${tipoResultado}?departamento=${departamentoSeleccionado}`;
      } else if (tipoVista === "ganador") {
        url = `http://localhost:3001/api/resultados/departamento/ganador`;
      }

      fetchConToken(url)
        .then((res) => res.json())
        .then((data) => setDatos(Array.isArray(data) ? data : []))
        .catch((err) => {
          console.error("Error al cargar resultados:", err);
          setDatos([]);
        })
        .finally(() => setLoading(false));
    }
  }, [
    tipoVista,
    tipoResultado,
    circuitoSeleccionado,
    departamentoSeleccionado,
  ]);

   const cerrarSesion = () => {
    localStorage.removeItem("tokenId");
    localStorage.removeItem("sessionId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("observado");
    localStorage.removeItem("numeroCircuito");
    navigate("/login");
  };


  return (
    <div className="contenedor">
      <header className="encabezado">
        <div className="logo-titulo">
          <img src={escudo} alt="Escudo de Uruguay" className="logo" />
          <h2 className="estado">Resultados Electorales</h2>
        </div>
      </header>
      <div className="cuerpo">
        <div className="opciones-vista">
          <button
            onClick={() => {
              setTipoVista("circuito");
              setDatos([]);
            }}
          >
            Por Circuito
          </button>
          <button
            onClick={() => {
              setTipoVista("departamento");
              setDatos([]);
            }}
          >
            Por Departamento
          </button>
          <button
            onClick={() => {
              setTipoVista("ganador");
              setDatos([]);
            }}
          >
            Ganadores por Departamento
          </button>
        </div>

        {tipoVista === "circuito" && (
          <div className="buscador-circuito">
            <input
              type="text"
              placeholder="Buscar circuito..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <div className="lista-sugerencias">
              {busqueda &&
                circuitos
                  .filter((c) => c.NumeroCircuito.toString().includes(busqueda))
                  .map((c) => (
                    <div
                      key={c.NumeroCircuito}
                      className="sugerencia-item"
                      onClick={() => {
                        setCircuitoSeleccionado(c.NumeroCircuito);
                        setBusqueda("");
                      }}
                    >
                      Circuito {c.NumeroCircuito}
                    </div>
                  ))}
            </div>
          </div>
        )}

        {tipoVista === "departamento" && (
          <div className="selector-departamento">
            <select
              value={departamentoSeleccionado}
              onChange={(e) => setDepartamentoSeleccionado(e.target.value)}
            >
              <option value="">Seleccione un departamento</option>
              {departamentos.map((d) => (
                <option key={d.IdDepartamento} value={d.IdDepartamento}>
                  {d.Nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        {(tipoVista === "circuito" && circuitoSeleccionado) ||
        (tipoVista === "departamento" && departamentoSeleccionado) ||
        tipoVista === "ganador" ? (
          <>
            <h2>
              {tipoVista === "circuito"
                ? `Resultados del circuito ${circuitoSeleccionado}`
                : tipoVista === "departamento"
                ? `Resultados del departamento seleccionado`
                : "Ganadores por departamento"}
            </h2>

            {tipoVista !== "ganador" && (
              <div className="opciones-tipo">
                {tipoVista === "circuito" && (
                  <button
                    onClick={() => setTipoResultado("lista")}
                    className={tipoResultado === "lista" ? "activo" : ""}
                  >
                    Por Lista
                  </button>
                )}
                <button
                  onClick={() => setTipoResultado("partido")}
                  className={tipoResultado === "partido" ? "activo" : ""}
                >
                  Por Partido
                </button>
                <button
                  onClick={() => setTipoResultado("candidato")}
                  className={tipoResultado === "candidato" ? "activo" : ""}
                >
                  Por Candidato
                </button>
              </div>
            )}

            {loading ? (
              <p>Cargando resultados...</p>
            ) : datos.length === 0 ? (
              <p>No hay resultados para mostrar.</p>
            ) : (
              <table className="tabla-resultados">
                <thead>
                  <tr>
                    {tipoVista === "ganador" && (
                      <>
                        <th>Departamento</th>
                        <th>Candidato</th>
                        <th>Partido</th>
                        <th>Votos</th>
                      </>
                    )}
                    {tipoVista !== "ganador" && tipoResultado === "lista" && (
                      <>
                        {tipoVista === "departamento" && <th>Departamento</th>}
                        <th>Lista</th>
                        <th>Partido</th>
                        <th>Cant. Votos</th>
                        <th>Porcentaje</th>
                      </>
                    )}
                    {tipoVista !== "ganador" && tipoResultado === "partido" && (
                      <>
                        {tipoVista === "departamento" && <th>Departamento</th>}
                        <th>Partido</th>
                        <th>Cant. Votos</th>
                        <th>Porcentaje</th>
                      </>
                    )}
                    {tipoVista !== "ganador" &&
                      tipoResultado === "candidato" && (
                        <>
                          {tipoVista === "departamento" && (
                            <th>Departamento</th>
                          )}
                          <th>Partido</th>
                          <th>Candidato</th>
                          <th>Cant. Votos</th>
                          <th>Porcentaje</th>
                        </>
                      )}
                  </tr>
                </thead>
                <tbody>
                  {datos.map((fila, idx) => (
                    <tr key={idx}>
                      {tipoVista === "ganador" && (
                        <>
                          <td>{fila.Departamento}</td>
                          <td>{fila.NombreCandidato}</td>
                          <td>{fila.NombrePartido}</td>
                          <td>{fila.CantVotos}</td>
                        </>
                      )}
                      {tipoVista !== "ganador" && tipoResultado === "lista" && (
                        <>
                          {tipoVista === "departamento" && (
                            <td>{fila.Departamento}</td>
                          )}
                          <td>{fila.NombreLista}</td>
                          <td>{fila.NombrePartido}</td>
                          <td>{fila.CantVotos}</td>
                          <td>{fila.Porcentaje}%</td>
                        </>
                      )}
                      {tipoVista !== "ganador" &&
                        tipoResultado === "partido" && (
                          <>
                            {tipoVista === "departamento" && (
                              <td>{fila.Departamento}</td>
                            )}
                            <td>{fila.NombrePartido}</td>
                            <td>{fila.CantVotos}</td>
                            <td>{fila.Porcentaje}%</td>
                          </>
                        )}
                      {tipoVista !== "ganador" &&
                        tipoResultado === "candidato" && (
                          <>
                            {tipoVista === "departamento" && (
                              <td>{fila.Departamento}</td>
                            )}
                            <td>{fila.NombrePartido}</td>
                            <td>{fila.NombreCandidato}</td>
                            <td>{fila.CantVotos}</td>
                            <td>{fila.Porcentaje}%</td>
                          </>
                        )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : null}
      </div>
      <footer className="pie">
        <button className="boton-salir" onClick={cerrarSesion}>Salir</button>
      </footer>
    </div>
  );
}
