const express = require('express');
const cors = require('cors')
const seeder = require('./seeder');
const db = require('./db');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
    res.send({ message: 'mensaje de backend' });
});
app.use('/api', seeder);

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
