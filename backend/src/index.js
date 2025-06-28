const express = require("express");
const cors = require("cors");
const pool = require("../config/db");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send({ message: "mensaje de backend" });
});

// Ruta de verificación de conexión
app.get('/dbcheck', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ message: 'Conexión establecida correctamente' });
  } catch (err) {
    console.error('Error al conectar con la base:', err.message);
    res.status(500).json({ error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
