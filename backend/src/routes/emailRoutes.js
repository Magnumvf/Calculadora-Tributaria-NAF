const express = require('express');
const { enviar } = require('../services/emailService');
const prisma = require('../config/prisma');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();
const emailValido = (value) => typeof value === 'string' && value.length <= 254 && /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(value);


function falha(res, error) {
  return res.status(error.status || 502).json({
    error: error.status === 503 ? error.message : 'Não foi possível enviar o e-mail. Tente novamente mais tarde.',
  });
}

router.post('/naf', authMiddleware, async (req, res) => {
  const { nome, email, mensagem } = req.body;
  if (typeof nome !== 'string' || !nome.trim() || nome.length > 150 || !emailValido(email) || typeof mensagem !== 'string' || !mensagem.trim() || mensagem.length > 5000) {
    return res.status(400).json({ error: 'Informe nome, e-mail válido e mensagem de até 5.000 caracteres.' });
  }
  if (!emailValido(process.env.NAF_EMAIL)) {
    return res.status(503).json({ error: 'O endereço de contato do NAF ainda não foi configurado.' });
  }
  try {
    await enviar({
      to: process.env.NAF_EMAIL,
      replyTo: email,
      subject: 'Contato pela Calculadora NAF',
      text: `Nome: ${nome}\nE-mail: ${email}\n\n${mensagem}`,
    });
    return res.json({ message: 'Mensagem encaminhada ao servidor de e-mail do NAF.' });
  } catch (error) {
    return falha(res, error);
  }
});

router.post('/comparativo', authMiddleware, async (req, res) => {
  const { email, calculoId } = req.body;
  if (!emailValido(email) || typeof calculoId !== 'string') {
    return res.status(400).json({ error: 'Informe um e-mail válido e uma simulação.' });
  }
  try {
    const calculo = await prisma.calculo.findFirst({ where: { id: calculoId, userId: req.userId } });
    if (!calculo) return res.status(404).json({ error: 'Simulação não encontrada.' });
    const moeda = (valor) => valor == null ? 'Não informado' : Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const percentual = calculo.fatorR == null ? null : new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(calculo.fatorR);
    await enviar({
      to: email,
      subject: 'Seu comparativo tributário — NAF',
      text: [
        'Calculadora NAF — Universidade Christus',
        `Profissão: ${calculo.tipoProfissao}`,
        `Renda mensal: ${moeda(calculo.faturamento)}`,
        `Custos: ${moeda(calculo.custos)}`,
        `Tributação PF: ${moeda(calculo.impostoPF)}`,
        `Tributação PJ: ${moeda(calculo.impostoPJ)}`,
        `Regime indicado: ${calculo.melhorOpcao}`,
        `Economia mensal: ${moeda(calculo.economiaMensal)}`,
        ...(calculo.fatorR == null ? [] : [
          `Folha informada: ${moeda(calculo.folha)}`,
          `Fator R: ${percentual}`,
          `Anexo tributário: ${calculo.anexo || 'Não registrado'}`,
        ]),
        'Os valores são estimativas.',
      ].join('\n'),
    });
    return res.json({ message: 'Comparativo encaminhado ao servidor de e-mail.' });
  } catch (error) {
    return falha(res, error);
  }
});

module.exports = router;
