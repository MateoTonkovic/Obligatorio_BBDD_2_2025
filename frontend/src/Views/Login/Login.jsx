import { useState } from 'react';
import './login.css';
import escudo from '../../Images/escudoUruguay.png';
import { useNavigate } from 'react-router-dom';

export default function LoginScreen() {
    const navigate = useNavigate();

    const [ci, setCi] = useState('');
    const [password, setPassword] = useState('');
    const [circuito, setCircuito] = useState('');
    const [mensaje, setMensaje] = useState('');

    const onLogin = (data) => {
        const { sessionId, tokenId, role, observado, debeElegir } = data;

        if (observado) {
            alert('El voto será observado');
        }

        localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('tokenId', tokenId);
        localStorage.setItem('userRole', role);
        localStorage.setItem('observado', observado);

        if (role === 'miembro' && debeElegir) {
            navigate('/mesa/decidir');
        } else if (role === 'miembro') {
            navigate('/mesa/autorizar');
        } else {
            navigate('/votar');
        }
    };

    const handleSubmit = async () => {
        if (!ci || !password || !circuito) {
            setMensaje('Por favor completá todos los campos');
            return;
        }
        try {
            const res = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ci: parseInt(ci, 10), contrasena: password, circuito })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error de autenticación');
            onLogin(data);
        } catch (err) {
            setMensaje(err.message);
        }
    };

    return (
        <div className="contenedor-login">
            <header className="encabezado">
                <div className="logo-titulo">
                    <img src={escudo} alt="Escudo de Uruguay" className="logo" />
                    <h2 className="estado">Login de Votación</h2>
                </div>
            </header>

            <main className="cuerpo">
                <div className="login-form">
                    <label className='label'>
                        CI
                        <input
                            type="number"
                            value={ci}
                            onChange={e => setCi(e.target.value)}
                            placeholder="Ingrese su CI"
                        />
                    </label>
                    <label className='label'>
                        Contraseña
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Ingrese su contraseña"
                        />
                    </label>
                    <label className='label'>
                        Circuito
                        <input
                            type="number"
                            value={circuito}
                            onChange={e => setCircuito(e.target.value)}
                            placeholder="Número de circuito"
                        />
                    </label>
                    <button className="boton-confirmar" onClick={handleSubmit}>
                        Iniciar Sesión
                    </button>
                    {mensaje && <p className="mensaje">{mensaje}</p>}
                </div>
            </main>
        </div>
    );
}
