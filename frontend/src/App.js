import { useEffect, useState } from 'react';

function App() {
    const [backendMsg, setBackendMsg] = useState('Cargando…');

    useEffect(() => {
        fetch('http://localhost:3001/')
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error ${res.status}`);
                return res.json();
            })
            .then((data) => {
                console.log('data', data);
                setBackendMsg(data.message);
            })
            .catch((err) => {
                console.error('Error al llamar al backend:', err);
                setBackendMsg('Error al conectar con el backend');
            });
    }, []);

    return (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <h1>Front</h1>
            <p>
                {backendMsg}
            </p>
        </div>
    );
}

export default App;
