import { useState, useEffect } from "react";
import "./emisionVoto.css";
import escudo from "../../Images/escudoUruguay.png";

function EmisionVoto() {
  const [listas, setListas] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/api/listas")
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
        console.error("❌ Error al cargar las listas:", error);
        setMensaje("⚠️ Error al cargar las listas");
      });
  }, []);

  const confirmarVoto = () => {
    if (!seleccionada) {
      setMensaje("Por favor seleccioná una lista");
    } else {
      setMensaje(`Voto registrado para la lista ${seleccionada}`);
    }
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
        <h2 className="titulo-seleccion">Seleccioná una lista:</h2>

        <input
          type="text"
          placeholder="Buscar por número de lista o partido..."
          className="buscador"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <div className="opciones-listas-grid">
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

        {mensaje && <p className="mensaje">{mensaje}</p>}
      </main>

      <footer className="pie">
        <button className="boton-confirmar" onClick={confirmarVoto}>
          Confirmar
        </button>
      </footer>
    </div>
  );
}

export default EmisionVoto;

