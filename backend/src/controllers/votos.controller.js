const votoService = require("../services/votos.service");

exports.emitir = async (req, res) => {
  const { sessionId, numeroLista, esObservado } = req.body;

  try {
    await votoService.emitirVoto(sessionId, numeroLista, esObservado);
    res.json({ success: true, message: "Voto registrado correctamente" });
  } catch (err) {
    console.error("Error al emitir voto:", err.message);
    res.status(400).json({ error: err.message });
  }
};
