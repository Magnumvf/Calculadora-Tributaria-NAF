const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

test('e-mails: autenticação, propriedade do cálculo, configuração e resposta SMTP', async (t) => {
  const originalEnv = { ...process.env };
  process.env.JWT_SECRET = 'chave-apenas-para-teste';
  process.env.NAF_EMAIL = 'naf@example.test';
  process.env.SMTP_HOST = 'smtp.example.test';
  process.env.SMTP_FROM = 'app@example.test';
  let encontrado = true;
  let rejeitar = false;
  let consulta;
  const enviados = [];
  const prismaPath = require.resolve('../src/config/prisma');
  const originalPrisma = require.cache[prismaPath];
  require.cache[prismaPath] = { exports: { user: { findUnique: async () => ({ sessionVersion: 0 }) }, calculo: { findFirst: async (query) => {
    consulta = query;
    return encontrado ? { tipoProfissao: 'psicologo', faturamento: 5000, custos: 800,
      impostoPF: 269.51, impostoPJ: 478.31, melhorOpcao: 'Pessoa Física (PF)', economiaMensal: 208.8 } : null;
  } } } };
  const originalTransport = nodemailer.createTransport;
  nodemailer.createTransport = () => ({ sendMail: async (message) => {
    if (rejeitar) throw new Error('SMTP indisponível');
    enviados.push(message);
    return { accepted: [message.to] };
  } });
  const app = express();
  app.use(express.json());
  app.use('/emails', require('../src/routes/emailRoutes'));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => {
    server.close();
    nodemailer.createTransport = originalTransport;
    if (originalPrisma) require.cache[prismaPath] = originalPrisma;
    else delete require.cache[prismaPath];
    process.env = originalEnv;
  });
  const token = jwt.sign({ id: 'usuario-teste' }, process.env.JWT_SECRET);
  async function post(path, body, autenticado = true) {
    return fetch(`http://127.0.0.1:${server.address().port}/emails/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(autenticado ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
  }
  const comparativo = { calculoId: 'calculo-teste', email: 'usuario@example.test' };
  assert.equal((await post('comparativo', comparativo, false)).status, 401);
  assert.equal((await post('comparativo', { ...comparativo, email: 'invalido' })).status, 400);
  encontrado = false;
  assert.equal((await post('comparativo', comparativo)).status, 404);
  encontrado = true;
  assert.equal((await post('comparativo', comparativo)).status, 200);
  assert.deepEqual(consulta.where, { id: 'calculo-teste', userId: 'usuario-teste' });
  assert.match(enviados[0].text, /Pessoa Física/);
  const contato = { nome: 'Teste', email: 'usuario@example.test', mensagem: 'Uma dúvida.' };
  assert.equal((await post('naf', contato)).status, 200);
  assert.equal(enviados[1].to, process.env.NAF_EMAIL);
  assert.equal(enviados[1].replyTo, contato.email);
  rejeitar = true;
  assert.equal((await post('naf', contato)).status, 502);
  delete process.env.SMTP_HOST;
  assert.equal((await post('comparativo', comparativo)).status, 503);
  delete process.env.NAF_EMAIL;
  assert.equal((await post('naf', contato)).status, 503);
  assert.equal(enviados.length, 2, 'Falhas não devem registrar envios');
});
