const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

const passwordReset = require('../controllers/passwordResetController');
const { rateLimit } = require('express-rate-limit');

const router = express.Router();
const limiteRecuperacao = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Aguarde 15 minutos e tente novamente.' },
});
router.post('/forgot-password', limiteRecuperacao, passwordReset.solicitar);
router.post('/reset-password', limiteRecuperacao, passwordReset.redefinir);

// -- Rotas públicas --
// Cadastro /auth/register
router.post('/register', authController.register);
// Login /auth/login
router.post('/login', authController.login);

// -- Rota protegida --
router.get('/me', authMiddleware, async (req, res) => {
  const prisma = require('../config/prisma');
  
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true }
  });

  res.json({ message: "Você está autenticado!", user });
});

module.exports = router;
