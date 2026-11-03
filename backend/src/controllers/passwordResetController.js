const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { enviar } = require('../services/emailService');

const mensagemSolicitacao = 'Se este e-mail estiver cadastrado, você receberá um link de recuperação. Confira também o spam.';
const mensagemToken = 'Link inválido ou expirado. Solicite uma nova recuperação de senha.';
const tokenHash = (token) => crypto.createHash('sha256').update(token).digest('hex');

exports.solicitar = async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
  if (email.length > 254 || !/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(email)) {
    return res.status(400).json({ error: 'Informe um e-mail válido.' });
  }
  let link;
  try {
    // Usa configuração confiável; nunca constrói links a partir do cabeçalho Host.
    link = new URL('/redefinir-senha', process.env.APP_URL);
    if (!['http:', 'https:'].includes(link.protocol) || !process.env.SMTP_HOST || !process.env.SMTP_FROM) throw new Error('Configuração ausente');
  } catch {
    return res.status(503).json({ error: 'A recuperação de senha ainda não está configurada.' });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!user) return res.json({ message: mensagemSolicitacao });
    const token = crypto.randomBytes(32).toString('hex');
    const hash = tokenHash(token);
    const now = new Date();
    const result = await prisma.user.updateMany({
      where: { id: user.id, OR: [{ resetRequestedAt: null }, { resetRequestedAt: { lt: new Date(now.getTime() - 60000) } }] },
      data: { resetTokenHash: hash, resetTokenExpiresAt: new Date(now.getTime() + 30 * 60000), resetRequestedAt: now },
    });
    // Resposta não depende do resultado SMTP nem revela se a conta existe.
    res.json({ message: mensagemSolicitacao });
    if (!result.count) return;
    link.hash = `token=${token}`;
    try {
      await enviar({
        to: email,
        subject: 'Redefina sua senha — Calculadora NAF',
        text: `Recebemos uma solicitação de recuperação de senha.\n\nAbra o link abaixo para definir uma nova senha:\n${link.href}\n\nEste link vale por 30 minutos e pode ser usado uma única vez.\nSe você não solicitou a recuperação, ignore esta mensagem. Sua senha não foi alterada.`,
      });
    } catch (error) {
      // Não registra link, senha ou dados SMTP nos logs.
      console.error('Falha no envio de recuperação:', error.code || 'SMTP_ERROR');
      await prisma.user.updateMany({ where: { id: user.id, resetTokenHash: hash }, data: { resetTokenHash: null, resetTokenExpiresAt: null, resetRequestedAt: null } });
    }
  } catch {
    if (!res.headersSent) return res.status(503).json({ error: 'Não foi possível solicitar a recuperação. Tente novamente.' });
    console.error('Falha ao finalizar solicitação de recuperação.');
  }
};

exports.redefinir = async (req, res) => {
  const { token, password } = req.body;
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return res.status(400).json({ error: mensagemToken });
  if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ error: 'Use uma senha com pelo menos 8 caracteres e no máximo 72 bytes.' });
  }
  try {
    const hash = tokenHash(token);
    const user = await prisma.user.findUnique({ where: { resetTokenHash: hash }, select: { id: true, resetTokenExpiresAt: true } });
    if (!user || !user.resetTokenExpiresAt || user.resetTokenExpiresAt <= new Date()) return res.status(400).json({ error: mensagemToken });
    const passwordHash = await bcrypt.hash(password, 10);
    // Consumo e troca da senha na mesma operação: duas requisições não reutilizam o link.
    const result = await prisma.user.updateMany({
      where: { id: user.id, resetTokenHash: hash, resetTokenExpiresAt: { gt: new Date() } },
      data: { password: passwordHash, resetTokenHash: null, resetTokenExpiresAt: null, sessionVersion: { increment: 1 } },
    });
    if (!result.count) return res.status(400).json({ error: mensagemToken });
    return res.json({ message: 'Senha atualizada. Entre novamente com sua nova senha.' });
  } catch {
    return res.status(503).json({ error: 'Não foi possível atualizar a senha. Tente novamente.' });
  }
};
