import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Views/Login/Login';
import EmisionVoto from './Views/EmisionVoto/EmisionVoto';
import PantallaDecision from './Views/PantallaDecision/PantallaDecision';
import PrivateRoute from './middlewares/PrivateRoute';
import MiembroMesa from './Views/MiembroMesa/MiembroMesa';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute />}>  
            {/* Acá adentro van las rutas protegidas */}
            <Route path="/votar" element={<EmisionVoto />} />
            <Route path="/mesa/decidir" element={<PantallaDecision />} />
            <Route path="/mesa" element={<MiembroMesa />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;