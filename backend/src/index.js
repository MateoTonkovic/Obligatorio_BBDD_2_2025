const express = require("express");
const cors = require("cors");
const seederRouter = require("./seeder");
const listasRouter = require("./routes/listas.routes");
const votosRouter = require("./routes/votos.routes");
const authRouter = require("./routes/auth.routes");
const authVoto = require("./routes/authVoto");
const observadosRouter = require("./routes/observados.routes");
const estadoMesaRouter = require("./routes/estadoMesa.routes");
const resultadosRoutes = require("./routes/resultados.routes");
const cierreMesaRoutes = require("./routes/cierreMesa.routes");
const authMiddleware = require("./middleware/auth.middleware");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/seeder', seederRouter);
app.use("/api/resultados", resultadosRoutes);

app.use('/api', authMiddleware);

app.use('/api/listas', listasRouter);
app.use('/api/votos', votosRouter);
app.use('/api/observados', observadosRouter);
app.use('/api/estadoMesa', estadoMesaRouter);
app.use('/api/cerrarMesa', cierreMesaRoutes);
app.use('/api/autorizar', authVoto);

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
