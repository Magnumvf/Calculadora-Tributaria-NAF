const nodemailer = require('nodemailer');

async function enviar(options) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_FROM) {
    const error = new Error('O envio de e-mail ainda não foi configurado.');
    error.status = 503;
    throw error;
  }
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    ...(SMTP_USER ? { auth: { user: SMTP_USER, pass: SMTP_PASS } } : {}),
    connectionTimeout: 10000,
    socketTimeout: 15000,
  });
  const info = await transport.sendMail({ from: SMTP_FROM, ...options });
  if (!info.accepted?.length) throw new Error('Destinatário recusado pelo servidor de e-mail.');
}


module.exports = { enviar };
