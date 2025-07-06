import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Views/Login/Login';
import EmisionVoto from './Views/EmisionVoto/EmisionVoto';
import PantallaDecision from './Views/PantallaDecision/PantallaDecision';
import PrivateRoute from './middlewares/PrivateRoute';
import AutorizarVoto from './Views/AutorizacionVoto/AutorizacionVoto';
import Resultados from './Views/Resultados/Resultados';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute />}>  
            <Route path="/votar" element={<EmisionVoto />} />
            <Route path="/mesa">
              <Route path="decidir" element={<PantallaDecision />} />
              <Route path="autorizar" element={<AutorizarVoto />} />
              <Route path="/resultados" element={<Resultados />} />
              <Route index element={<AutorizarVoto />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;