const express = require('express');
const cors = require('cors');
const seederRouter = require('./seeder');
const listasRouter = require("./routes/listas");
const votosRouter = require("./routes/votos");
const authRouter = require("./routes/auth.routes");
const authVoto = require("./routes/authVoto");
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
app.use('/api/votos/autorizar', authVoto);
app.get('/', (req, res) => {
    res.send({ message: 'mensaje de backend' });
});


app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
