const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

async function sendOutboundMail(options) {
  const { host, port, user, pass, from, to, subject, bodyText, replyTo } = options;

  if (!to || !subject || !bodyText) {
    throw new Error('INVALID_DISPATCH_PAYLOAD: Missing recipient, subject, or body');
  }

  const transporter = nodemailer.createTransport({
    host: host || process.env.SMTP_HOST,
    port: parseInt(port || process.env.SMTP_PORT || '587'),
    secure: parseInt(port || process.env.SMTP_PORT || '587') === 465,
    auth: {
      user: user || process.env.SMTP_USER,
      pass: pass || process.env.SMTP_PASS,
    }
  });

  const mailOptions = {
    from: from || process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    replyTo: replyTo || from || process.env.SMTP_USER,
    subject,
    text: bodyText
  };

  const info = await transporter.sendMail(mailOptions);
  
  const logDir = path.join(__dirname, '..', 'MCNC_Logs');
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  
  const logEntry = `[${new Date().toISOString()}] SENT to: ${to} | ID: ${info.messageId} | SUBJ: "${subject}"\n`;
  fs.appendFileSync(path.join(logDir, 'email_dispatch.log'), logEntry, 'utf8');

  return { status: 'DISPATCHED', messageId: info.messageId, recipient: to };
}

module.exports = { sendOutboundMail };