import { useState, useEffect } from "react";
import "./autorizacionVoto.css";
import escudo from "../../Images/escudoUruguay.png";
import { useNavigate } from "react-router-dom";

export default function AutorizarVoto() {
  const [observados, setObservados] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [mesaAbierta, setMesaAbierta] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verificarEstadoMesa = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/estadoMesa", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "authorization": localStorage.getItem("tokenId"),
          },
          body: JSON.stringify({
            circuito: localStorage.getItem("numeroCircuito"),
          }),
        });

        const data = await res.json();

        if (data.estado.toUpperCase() === "CERRADA") {
          setMesaAbierta(false);
          setMensaje("La mesa se encuentra cerrada.");
        } else {
          setMesaAbierta(true);
        }
      } catch (error) {
        console.error("❌ No se pudo verificar el estado de la mesa:", error);
        setMensaje("Error al verificar el estado de la mesa.");
      }
    };
    verificarEstadoMesa();
  }, []);


  useEffect(() => {
    if (!mesaAbierta) return;

    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/observados", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "authorization": localStorage.getItem("tokenId")
          },
          body: JSON.stringify({ circuito: localStorage.getItem("numeroCircuito") }),
        });

        const data = await res.json();
        setObservados(Array.isArray(data) ? data : []);

        if (!data || data.length === 0) {
          setMensaje("No hay votos observados pendientes.");
        }
        console.log(data);
      } catch (error) {
        setMensaje("Error al cargar votos");
        setObservados([]);
      }
    };
    fetchData();
  }, [mesaAbierta]);


  const cerrarMesa = () => {
    fetch("http://localhost:3001/api/cerrarMesa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": localStorage.getItem("tokenId")
      },
      body: JSON.stringify({ circuito: localStorage.getItem("numeroCircuito") }),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        setObservados([]);
        setMensaje("✅ Mesa cerrada correctamente.");
        setMesaAbierta(false);
        navigate("/resultados");
      })
      .catch(() => setMensaje("❌ No se pudo cerrar la mesa."));
  }

  const autorizarVoto = (idVoto) => {
    fetch("http://localhost:3001/api/autorizar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": localStorage.getItem("tokenId")
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

  return (
    <div className="contenedor-autorizacion">
      <header className="encabezado">
        <div className="logo-titulo">
          <img src={escudo} alt="Escudo de Uruguay" className="logo" />
          <h2 className="estado">Autorización de Votos Observados</h2>
        </div>
      </header>

      <main className="cuerpo-auth-voto">
        <div className="boton-cierre-container">
          {mesaAbierta ? (
            <button
              className="boton-cierreMesa"
              onClick={() => cerrarMesa()}
            >
              Cerrar Mesa
            </button>
          ) :
          
          <button
            className="boton-cierreMesa"
            onClick={() => navigate("/resultados")}
          >
            Ver Resultados
          </button>
          }
        </div>
        {observados.length === 0 ? (
          <p className="mensaje">{mensaje}</p>
        ) : (
          <div className="tabla-observados">
            {observados.map((voto) => (
              <div key={voto.IdVoto} className="fila-voto">
                <div>
                  <strong>Voto ID:</strong> {voto.IdVoto} <br />
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
