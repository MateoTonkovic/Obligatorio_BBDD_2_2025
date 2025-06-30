import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Views/Login/Login';
import EmisionVoto from './Views/EmisionVoto/EmisionVoto';
import PrivateRoute from './middlewares/PrivateRoute';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute />}>  
            {/* Acá adentro van las rutas protegidas */}
            <Route path="/votar" element={<EmisionVoto />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;