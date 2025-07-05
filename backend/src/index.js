const express = require("express");
const cors = require("cors");
const seederRouter = require("./seeder");
const listasRouter = require("./routes/listas.routes");
const votosRouter = require("./routes/votos.routes");
const authRouter = require("./routes/auth.routes");
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

app.get("/", (req, res) => {
  res.send({ message: "mensaje de backend" });
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
