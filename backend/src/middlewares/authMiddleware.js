const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token de acesso não fornecido." });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: "Token malformatado." });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    if (typeof decoded.id !== 'string') return res.status(401).json({ error: "Token inválido." });
    const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { sessionVersion: true } });
    if (!user || (decoded.sessionVersion ?? 0) !== user.sessionVersion) {
      return res.status(401).json({ error: "Sessão expirada. Entre novamente." });
    }
    req.userId = decoded.id;

    return next();

  } catch (error) {
    if (!(error instanceof jwt.JsonWebTokenError)) {
      return res.status(503).json({ error: "Não foi possível verificar a sessão. Tente novamente." });
    }
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
};

module.exports = authMiddleware;
