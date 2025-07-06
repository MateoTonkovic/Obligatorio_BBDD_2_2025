const express = require("express");
const cors = require("cors");
const seederRouter = require("./seeder");
const listasRouter = require("./routes/listas.routes");
const votosRouter = require("./routes/votos.routes");
const authRouter = require("./routes/auth.routes");
const authVoto = require("./routes/auth.voto");
const votosObservados = require("./routes/votosObservados.routes");
const cerrarMesa = require("./routes/cerrarMesa.routes");
const estadoMesa = require("./routes/estadoMesa.routes");
const authMiddleware = require("./middleware/auth.middleware");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/seeder', seederRouter);

app.use('/api', authMiddleware);

app.use('/api/listas', listasRouter);
app.use('/api/votos', votosRouter);
app.use('/api/observados', votosObservados);
app.use('/api/autorizar', authVoto);
app.use('/api/cerrarMesa', cerrarMesa);
app.use('/api/estadoMesa', estadoMesa);

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
