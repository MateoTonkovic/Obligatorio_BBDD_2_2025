import { useState, useEffect } from "react";
import "./emisionVoto.css";
import escudo from "../../Images/escudoUruguay.png";
import { useNavigate } from "react-router-dom";

function EmisionVoto() {
  const [listas, setListas] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [votoExitoso, setVotoExitoso] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [tipoVoto, setTipoVoto] = useState("");
  const [observado, setObservado] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("tokenId");
    const role = localStorage.getItem("userRole");
    const esObservado = localStorage.getItem("observado") === "true";

    setUserRole(role);
    setObservado(esObservado);

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
    console.log({
      sessionId: localStorage.getItem("sessionId"),
      numeroLista: seleccionada,
      esObservado: observado,
    });
    fetch("http://localhost:3001/api/votos/emitir", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: localStorage.getItem("tokenId"),
      },
      body: JSON.stringify({
        sessionId: localStorage.getItem("sessionId"),
        numeroLista: seleccionada,
        esObservado: observado,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setVotoExitoso(true);

          if (seleccionada === "blanco") {
            setTipoVoto("Voto en Blanco");
          } else if (seleccionada === "anulado") {
            setTipoVoto("Voto Anulado");
          } else {
            setTipoVoto(`Lista ${seleccionada}`);
          }
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
    localStorage.removeItem("observado");
    navigate("/login");
  };

  const volverTareasMesa = () => {
    navigate("/mesa");
  };

  const listasFiltradas = listas
    .filter((lista) => {
      const texto = busqueda.trim().toLowerCase();
      return (
        texto === "" ||
        lista.NumeroLista.toString().includes(texto) ||
        (lista.NombrePartido &&
          lista.NombrePartido.toLowerCase().includes(texto))
      );
    })
    .sort((a, b) => a.NumeroLista - b.NumeroLista);

  const obtenerClaseColor = (nombrePartido) => {
    const nombre = nombrePartido.toLowerCase();
    if (nombre.includes("asamblea popular")) return "color-ap";
    if (nombre.includes("cabildo abierto")) return "color-ca";
    if (nombre.includes("frente amplio")) return "color-fa";
    if (nombre.includes("avanzar republicano")) return "color-ar";
    if (nombre.includes("colorado")) return "color-pc";
    if (nombre.includes("ambientalista")) return "color-amb";
    if (nombre.includes("ecologista")) return "color-eco";
    if (nombre.includes("identidad soberana")) return "color-ids";
    if (nombre.includes("independiente")) return "color-pi";
    if (nombre.includes("nacional")) return "color-pn";
    if (nombre.includes("pcn")) return "color-pcn";
    return "color-generico";
  };

  return (
    <div className="contenedor-voto">
      <header className="encabezado">
        <div className="logo-titulo">
          <img src={escudo} alt="Escudo de Uruguay" className="logo" />
          <h2 className="estado">Registrar voto</h2>
        </div>
      </header>

      <main className="cuerpo">
        {!votoExitoso ? (
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
                  className={`opcion-lista ${obtenerClaseColor(
                    lista.NombrePartido
                  )} ${
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
                    Partido {lista.NombrePartido}
                  </div>
                </label>
              ))}
            </div>
          </>
        ) : (
          <div className="mensaje-exito">
            <h2>¡Voto registrado con éxito!</h2>
            <p>{tipoVoto}</p>
            {observado && (
              <p className="observado">
                Este voto fue registrado como observado.
              </p>
            )}
            <p>Gracias por participar en la elección.</p>

            <div className="acciones-post-voto">
              {userRole === "miembro" ? (
                <button className="boton-confirmar" onClick={volverTareasMesa}>
                  Volver a mesa
                </button>
              ) : (
                <button className="boton-confirmar" onClick={cerrarSesion}>
                  Salir
                </button>
              )}
            </div>
          </div>
        )}

        {mensaje && !votoExitoso && <p className="mensaje">{mensaje}</p>}
      </main>

      <footer className="pie">
        {!votoExitoso && (
          <button className="boton-confirmar" onClick={confirmarVoto}>
            Confirmar
          </button>
        )}
      </footer>
    </div>
  );
}

export default EmisionVoto;
