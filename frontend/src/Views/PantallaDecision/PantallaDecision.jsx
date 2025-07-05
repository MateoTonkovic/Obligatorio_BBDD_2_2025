import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import escudo from "../../Images/escudoUruguay.png";
import "./pantallaDecision.css";

export default function PantallaDecision() {
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState("");

  const handleVotar = () => {
    navigate("/votar");
  };

  const handleMiembroMesa = () => {
    navigate("/mesa/autorizar");
  };

  useEffect(() => {
    // Validación: solo permitir ingresar si es miembro de mesa
    const role = localStorage.getItem("userRole");
    if (role !== "miembro") {
      setMensaje("⚠️ Acceso no autorizado.");
    }
  }, []);

  return (
    <div className="contenedor-decision">
      <header className="encabezado">
        <div className="logo-titulo">
          <img src={escudo} alt="Escudo de Uruguay" className="logo" />
          <h2 className="estado">Decisión de ingreso</h2>
        </div>
      </header>

      <main className="cuerpo">
        {mensaje ? (
          <p className="mensaje">{mensaje}</p>
        ) : (
          <>
            <h2 className="titulo">¿Cómo deseas ingresar?</h2>
            <div className="botones-opcion">
              <button className="boton-opcion" onClick={handleVotar}>
                Ingresar como votante
              </button>
              <button className="boton-opcion" onClick={handleMiembroMesa}>
                Ingresar como miembro de mesa
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
