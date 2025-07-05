const authService = require('../services/auth.service');

exports.login = async (req, res) => {
    const { ci, contrasena, circuito } = req.body;
    try {
        const { sessionId, tokenId, role, observado, debeElegir } = await authService.authenticate(ci, contrasena, circuito);
        res.json({ sessionId, tokenId, role, observado, debeElegir });
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
};
