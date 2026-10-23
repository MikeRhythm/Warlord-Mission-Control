const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Target directory for Obsidian persistent artifact logging
const VAULT_DOCS_PATH = path.join('C:', 'Warlord_Inc', 'Warlord_WASP', 'MCNC', 'vault', 'Docs');

/**
 * Dispatches outbound email via Namecheap / cPanel SSL SMTP (Port 465)
 * @param {Object} options
 * @param {string} options.host - Namecheap SMTP host (e.g. mail.privateemail.com or mail.yourdomain.com)
 * @param {number} [options.port=465] - SSL Port 465
 * @param {string} options.user - Full sender email address
 * @param {string} options.pass - Mailbox password
 * @param {string} [options.fromName] - Display Name (e.g. "Mike // Rhythm Trading")
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Subject line
 * @param {string} options.body - Plaintext or HTML body
 * @param {string} [options.project='GENERAL'] - Project Scope name
 */
async function sendMail(options) {
  const {
    host,
    port = 465,
    user,
    pass,
    fromName,
    to,
    subject,
    body,
    project = 'GENERAL'
  } = options;

  if (!host || !user || !pass || !to || !subject) {
    throw new Error('Missing required SMTP configuration parameters (host, user, pass, to, subject).');
  }

  const transporter = nodemailer.createTransport({
    host: host,
    port: parseInt(port, 10),
    secure: parseInt(port, 10) === 465,
    auth: {
      user: user,
      pass: pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: fromName ? `"${fromName}" <${user}>` : user,
    to: to,
    subject: subject,
    text: body,
    html: body.replace(/\n/g, '<br>')
  };

  const info = await transporter.sendMail(mailOptions);

  // Write immutable audit trail into Obsidian Vault Docs
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeProject = project.replace(/[^a-zA-Z0-9_-]/g, '_');
    const logFileName = `EMAIL_DISPATCH_${safeProject}_${timestamp}.md`;
    const logFilePath = path.join(VAULT_DOCS_PATH, logFileName);

    const logContent = [
      `---`,
      `type: email_dispatch`,
      `project: ${project}`,
      `messageId: ${info.messageId}`,
      `sender: ${user}`,
      `recipient: ${to}`,
      `timestamp: ${new Date().toISOString()}`,
      `status: DISPATCHED`,
      `---`,
      `# Outbound Email Dispatch Log`,
      `**Project:** ${project}`,
      `**Sender:** ${user}`,
      `**Recipient:** ${to}`,
      `**Subject:** ${subject}`,
      ``,
      `## Message Body`,
      body
    ].join('\n');

    if (fs.existsSync(VAULT_DOCS_PATH)) {
      fs.writeFileSync(logFilePath, logContent, 'utf8');
    }
  } catch (err) {
    console.error('[MAIL ENGINE LOG WARNING]: Could not write to Obsidian vault:', err.message);
  }

  return { success: true, messageId: info.messageId };
}

module.exports = { sendMail };

// CLI direct test invocation check
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 5) {
    console.log('Usage: node mail_engine.js <host> <user> <pass> <to> <subject> [body]');
    process.exit(1);
  }
  const [host, user, pass, to, subject, body = 'Automated test dispatch from Warlord Mail Engine'] = args;
  sendMail({ host, user, pass, to, subject, body })
    .then(res => {
      console.log('[MAIL ENGINE SUCCESS]:', res);
      process.exit(0);
    })
    .catch(err => {
      console.error('[MAIL ENGINE ERROR]:', err.message);
      process.exit(1);
    });
}
