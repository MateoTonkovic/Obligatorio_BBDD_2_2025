import { useEffect, useState } from "react";
import EmisionVoto from "./Views/EmisionVoto/EmisionVoto";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
//   const [backendMsg, setBackendMsg] = useState("Cargando…");

//   useEffect(() => {
//     fetch("http://localhost:3001/")
//       .then((res) => {
//         if (!res.ok) throw new Error(`HTTP error ${res.status}`);
//         return res.json();
//       })
//       .then((data) => {
//         console.log("data", data);
//         setBackendMsg(data.message);
//       })
//       .catch((err) => {
//         console.error("Error al llamar al backend:", err);
//         setBackendMsg("Error al conectar con el backend");
//       });
//   }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/votar" element={<EmisionVoto />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
