const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const listasRouter = require("./routes/listas");
const votosRouter = require("./routes/votos");

app.use('/api/listas', listasRouter);
app.use('/api/votos', votosRouter);

app.get('/', (req, res) => {
    res.send({ message: 'mensaje de backend' });
});

const seeder = require('./seeder');

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
