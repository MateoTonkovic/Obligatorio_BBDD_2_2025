const authService = require('../services/auth.service');

exports.login = async (req, res) => {
    const { ci, credencial, circuito } = req.body;
    try {
        const { sessionId, tokenId, role, observado } = await authService.authenticate(ci, credencial, circuito);
        res.json({ sessionId, tokenId, role, observado });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
};
