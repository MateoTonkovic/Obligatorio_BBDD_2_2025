import { useState, useEffect } from "react";
import "./autorizacionVoto.css";
import escudo from "../../Images/escudoUruguay.png";

export default function AutorizarVoto() {
const [observados, setObservados] = useState([]);
const [mensaje, setMensaje] = useState("");
const [isLoading, setIsLoading] = useState(true); // Nuevo estado de carga

useEffect(() => {
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/votos/observados", {
        headers: {
          "Authorization": localStorage.getItem("tokenId"),
          "Content-Type": "application/json"
        }
      });
      
      const data = await res.json();
      setObservados(Array.isArray(data) ? data : []);
      
      if (!data || data.length === 0) {
        setMensaje("No hay votos observados pendientes");
      }
      console.log(data);
    } catch (error) {
      setMensaje("Error al cargar votos");
      setObservados([]);
    } finally {
      setIsLoading(false);
    }
  };
  fetchData();
}, []);

  const autorizarVoto = (idVoto) => {
    fetch("http://localhost:3001/api/votos/autorizar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `${localStorage.getItem("tokenId")}`,
      },
      body: JSON.stringify({ idVoto }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        setObservados(observados.filter((v) => v.IdVoto !== idVoto));
        setMensaje("✅ Voto autorizado correctamente.");
      })
      .catch(() => setMensaje("❌ No se pudo autorizar el voto."));
  };

  if (isLoading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="contenedor-autorizacion">
      <header className="encabezado">
        <div className="logo-titulo">
          <img src={escudo} alt="Escudo de Uruguay" className="logo" />
          <h2 className="estado">Autorización de Votos Observados</h2>
        </div>
      </header>

      <main className="cuerpo">
        {observados.length === 0 ? (
          <p className="mensaje">{mensaje}</p>
        ) : (
          <div className="tabla-observados">
            {observados.map((voto) => (
              <div key={voto.IdVoto} className="fila-voto">
                <div>
                  <strong>Voto ID:</strong> {voto.IdVoto} <br />
                  <strong>CI Votante:</strong> {voto.CIPersona} <br />
                  <strong>Circuito:</strong> {voto.NumeroCircuito}
                </div>
                <button
                  className="boton-confirmar"
                  onClick={() => autorizarVoto(voto.IdVoto)}
                >
                  Autorizar
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
