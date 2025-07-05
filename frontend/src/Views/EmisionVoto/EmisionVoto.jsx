import { useState, useEffect } from "react";
import "./emisionVoto.css";
import escudo from "../../Images/escudoUruguay.png";

function EmisionVoto() {
  const [listas, setListas] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [votoExitoso, setVotoExitoso] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("tokenId");
    const role = localStorage.getItem("userRole");
    setUserRole(role);

    fetch("http://localhost:3001/api/listas", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        token: token,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Respuesta no OK del servidor");
        }
        return res.json();
      })
      .then((data) => {
        setListas(data.flat());
      })
      .catch((error) => {
        console.error("Error al cargar las listas:", error);
        setMensaje("Error al cargar las listas");
      });
  }, []);

  const confirmarVoto = () => {
    if (!seleccionada) {
      setMensaje("Por favor seleccioná una lista.");
      return;
    }

    fetch("http://localhost:3001/api/votos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: localStorage.getItem("tokenId"),
      },
      body: JSON.stringify({
        sessionId: localStorage.getItem("sessionId"),
        numeroLista: seleccionada,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setVotoExitoso(true);
          setMensaje("¡Voto registrado con éxito!");
        } else {
          setMensaje(`Error: ${data.error || "No se pudo registrar el voto"}`);
        }
      })
      .catch((err) => {
        console.error("Error al emitir voto:", err);
        setMensaje("Ocurrió un error al emitir el voto.");
      });
  };

  const cerrarSesion = () => {
    localStorage.removeItem("tokenId");
    localStorage.removeItem("sessionId");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const volverTareasMesa = () => {
    navigate("/miembroMesa");
  };

  const listasFiltradas = listas.filter((lista) => {
    const texto = busqueda.trim().toLowerCase();
    return (
      texto === "" ||
      lista.NumeroLista.toString().includes(texto) ||
      lista.IdPartido.toString().includes(texto)
    );
  });

  return (
    <div className="contenedor-voto">
      <header className="encabezado">
        <div className="logo-titulo">
          <img src={escudo} alt="Escudo de Uruguay" className="logo" />
          <h2 className="estado">Registrar voto</h2>
        </div>
      </header>

      <main className="cuerpo">
        {!votoExitoso && (
          <>
            <div className="seccion-busqueda">
              <h2 className="titulo-seleccion">Seleccioná una lista:</h2>
              <input
                type="text"
                className="buscador"
                placeholder="Buscar por número de lista o partido..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="opciones-listas-grid">
              <label
                className={`opcion-lista especial blanco ${
                  seleccionada === "blanco" ? "seleccionada" : ""
                }`}
              >
                <input
                  type="radio"
                  name="lista"
                  value="blanco"
                  onChange={() => setSeleccionada("blanco")}
                />
                <div>
                  <strong>Voto en Blanco</strong>
                </div>
              </label>
              <label
                className={`opcion-lista especial anulado ${
                  seleccionada === "anulado" ? "seleccionada" : ""
                }`}
              >
                <input
                  type="radio"
                  name="lista"
                  value="anulado"
                  onChange={() => setSeleccionada("anulado")}
                />
                <div>
                  <strong>Voto Anulado</strong>
                </div>
              </label>
              {listasFiltradas.map((lista, i) => (
                <label
                  key={i}
                  className={`opcion-lista color-partido-${lista.IdPartido} ${
                    seleccionada === lista.NumeroLista ? "seleccionada" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="lista"
                    value={lista.NumeroLista}
                    onChange={() => setSeleccionada(lista.NumeroLista)}
                  />
                  <div>
                    <strong>Lista {lista.NumeroLista}</strong>
                    <br />
                    Partido {lista.IdPartido}
                  </div>
                </label>
              ))}
            </div>
          </>
        )}

        {mensaje && <p className="mensaje">{mensaje}</p>}
      </main>

      <footer className="pie">
        {!votoExitoso ? (
          <button className="boton-confirmar" onClick={confirmarVoto}>
            Confirmar
          </button>
        ) : (
          <div className="acciones-post-voto">
            {userRole === "miembro" ? (
              <button onClick={volverTareasMesa}>Volver a mesa</button>
            ) : null}
            <button onClick={cerrarSesion}>Cerrar sesión</button>
          </div>
        )}
      </footer>
    </div>
  );
}

export default EmisionVoto;
