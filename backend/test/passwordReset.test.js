const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

test('fluxo de recuperação de senha com banco e SMTP simulados', async (t) => {
  const originalEnv = { ...process.env };
  Object.assign(process.env, { JWT_SECRET: 'segredo-de-teste', APP_URL: 'http://localhost:5173', SMTP_HOST: 'smtp.example.test', SMTP_FROM: 'naf@example.test' });
  const user = { id: 'u1', name: 'Teste', email: 'teste@example.test', password: await bcrypt.hash('senha-anterior', 4), sessionVersion: 0, resetTokenHash: null, resetTokenExpiresAt: null, resetRequestedAt: null };
  const prismaPath = require.resolve('../src/config/prisma');
  const originalPrisma = require.cache[prismaPath];
  const smtpOriginal = nodemailer.createTransport;
  const enviados = [];
  let smtpFalha = false;
  nodemailer.createTransport = () => ({ sendMail: async (message) => {
    if (smtpFalha) throw Object.assign(new Error('SMTP teste indisponível'), { code: 'TEST_SMTP' });
    enviados.push(message);
    return { accepted: [message.to] };
  } });
  const matches = (where) => Object.entries(where).every(([key, value]) => {
    if (key === 'OR') return value.some(matches);
    if (value && typeof value === 'object') {
      if ('gt' in value) return user[key] != null && user[key] > value.gt;
      if ('lt' in value) return user[key] != null && user[key] < value.lt;
    }
    return user[key] === value;
  });
  require.cache[prismaPath] = { exports: { user: {
    findUnique: async ({ where }) => matches(where) ? { ...user } : null,
    updateMany: async ({ where, data }) => {
      if (!matches(where)) return { count: 0 };
      for (const [key, value] of Object.entries(data)) user[key] = value?.increment ? user[key] + value.increment : value;
      return { count: 1 };
    },
  } } };
  const app = express();
  app.use(express.json());
  app.use('/auth', require('../src/routes/authRoutes'));
  app.get('/protected', require('../src/middlewares/authMiddleware'), (req, res) => res.json({ ok: true }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => {
    server.close();
    nodemailer.createTransport = smtpOriginal;
    if (originalPrisma) require.cache[prismaPath] = originalPrisma;
    else delete require.cache[prismaPath];
    process.env = originalEnv;
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (path, body) => fetch(`${base}/auth/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Host: 'attacker.example' }, body: JSON.stringify(body) });
  const protectedRequest = (token) => fetch(`${base}/protected`, { headers: { Authorization: `Bearer ${token}` } });
  const linkToken = () => new URLSearchParams(new URL(enviados.at(-1).text.match(/http:\/\/\S+/)[0]).hash.slice(1)).get('token');
  let token;
  let oldSession;

  await t.test('envia link confiável; guarda hash; resposta não revela conta; limita repetição', async () => {
    const existing = await post('forgot-password', { email: user.email });
    const unknown = await post('forgot-password', { email: 'ausente@example.test' });
    assert.equal(existing.status, 200);
    assert.deepEqual(await existing.json(), await unknown.json());
    assert.equal(enviados.length, 1);
    assert.match(enviados[0].text, /http:\/\/localhost:5173\/redefinir-senha#token=/);
    assert.doesNotMatch(enviados[0].text, /attacker/);
    token = linkToken();
    assert.equal(token.length, 64);
    assert.equal(user.resetTokenHash, crypto.createHash('sha256').update(token).digest('hex'));
    assert.notEqual(user.resetTokenHash, token);
    assert.ok(user.resetTokenExpiresAt > new Date());
    await post('forgot-password', { email: user.email });
    assert.equal(enviados.length, 1);
    oldSession = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    assert.equal((await protectedRequest(oldSession)).status, 200);
  });
  await t.test('rejeita token inválido, expirado e senha curta sem alterar a conta', async () => {
    const oldPassword = user.password;
    assert.equal((await post('reset-password', { token: 'invalido', password: 'nova-senha' })).status, 400);
    assert.equal((await post('reset-password', { token, password: 'curta' })).status, 400);
    user.resetTokenExpiresAt = new Date(0);
    assert.equal((await post('reset-password', { token, password: 'nova-senha' })).status, 400);
    assert.equal(user.password, oldPassword);
    user.resetTokenExpiresAt = new Date(Date.now() + 60000);
  });
  await t.test('consome uma única vez mesmo em paralelo; invalida sessões e senha antigas', async () => {
    const results = await Promise.all([post('reset-password', { token, password: 'nova-senha' }), post('reset-password', { token, password: 'nova-senha' })]);
    assert.deepEqual(results.map(r => r.status).sort(), [200, 400]);
    assert.equal(user.resetTokenHash, null);
    assert.equal(await bcrypt.compare('nova-senha', user.password), true);
    assert.equal(await bcrypt.compare('senha-anterior', user.password), false);
    assert.equal((await protectedRequest(oldSession)).status, 401);
    assert.equal((await post('login', { email: user.email, password: 'senha-anterior' })).status, 401);
    const login = await post('login', { email: user.email, password: 'nova-senha' });
    assert.equal(login.status, 200);
    assert.equal((await protectedRequest((await login.json()).token)).status, 200);
  });
  await t.test('novo pedido substitui o token anterior; falha SMTP limpa token sem mudar senha', async () => {
    user.resetRequestedAt = new Date(0);
    await post('forgot-password', { email: user.email });
    const previous = linkToken();
    user.resetRequestedAt = new Date(0);
    await post('forgot-password', { email: user.email });
    assert.notEqual(linkToken(), previous);
    assert.equal((await post('reset-password', { token: previous, password: 'outra-senha' })).status, 400);
    user.resetRequestedAt = new Date(0);
    smtpFalha = true;
    assert.equal((await post('forgot-password', { email: user.email })).status, 200);
    assert.equal(user.resetTokenHash, null);
    assert.equal(await bcrypt.compare('nova-senha', user.password), true);
  });
  await t.test('configuração ausente informa indisponibilidade; limita tentativas por IP', async () => {
    delete process.env.APP_URL;
    assert.equal((await post('forgot-password', { email: 'ausente@example.test' })).status, 503);
    let response;
    for (let i = 0; i < 21; i++) response = await post('forgot-password', { email: 'ausente@example.test' });
    assert.equal(response.status, 429);
  });
});
