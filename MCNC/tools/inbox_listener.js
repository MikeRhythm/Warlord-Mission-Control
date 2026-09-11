const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const fs = require('fs');
const path = require('path');

/**
 * WARLORD MCNC ATOMIC INBOX LISTENER
 * Monitors inbound mail, parses replies, and stages responses for Monty/Mike approval.
 */

async function checkInboxReplies(options = {}) {
  const host = options.host || process.env.IMAP_HOST || process.env.SMTP_HOST?.replace('smtp.', 'imap.');
  const port = parseInt(options.port || process.env.IMAP_PORT || '993');
  const user = options.user || process.env.IMAP_USER || process.env.SMTP_USER;
  const pass = options.pass || process.env.IMAP_PASS || process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('IMAP_CONFIG_ERROR: Missing host, user, or pass in credentials.');
  }

  const client = new ImapFlow({
    host,
    port,
    secure: port === 993,
    auth: { user, pass },
    logger: false
  });

  const triageResults = [];
  const stageDir = path.join(__dirname, '..', 'vault', 'Marketing', 'Pending_Replies');
  if (!fs.existsSync(stageDir)) fs.mkdirSync(stageDir, { recursive: true });

  await client.connect();
  const lock = await client.getMailboxLock('INBOX');

  try {
    // Search for unseen messages
    for await (const message of client.fetch({ seen: false }, { envelope: true, source: true })) {
      const parsed = await simpleParser(message.source);
      const fromAddr = parsed.from?.value?.[0]?.address || 'unknown';
      const subject = parsed.subject || 'No Subject';
      const bodyText = parsed.text || '';
      const inReplyTo = parsed.inReplyTo || '';

      // Triage Classification
      let intent = 'QUESTION';
      const lower = bodyText.toLowerCase();
      if (lower.includes('unsubscribe') || lower.includes('remove') || lower.includes('stop')) {
        intent = 'UNSUBSCRIBE';
      } else if (lower.includes('yes') || lower.includes('interested') || lower.includes('let us chat') || lower.includes('send info')) {
        intent = 'POSITIVE';
      } else if (lower.includes('not interested') || lower.includes('busy') || lower.includes('no thank')) {
        intent = 'OBJECTION';
      }

      // Stage for Monty and Mike review
      const cleanEmailName = fromAddr.replace(/[^a-z0-9]/gi, '_');
      const stagingFilePath = path.join(stageDir, `${cleanEmailName}.md`);
      const stagingContent = `# PENDING REPLY: ${fromAddr}
**Date:** ${new Date().toISOString()}
**Subject:** ${subject}
**Intent Category:** ${intent}
**In-Reply-To ID:** ${inReplyTo}

## Inbound Content
${bodyText}

---
## Staged Response Draft (Monty)
*Awaiting agent draft synthesis and Commander sign-off.*
`;

      fs.writeFileSync(stagingFilePath, stagingContent, 'utf8');

      triageResults.push({
        from: fromAddr,
        subject,
        intent,
        stagedPath: stagingFilePath
      });
    }
  } finally {
    lock.release();
  }

  await client.logout();
  return { status: 'COMPLETE', processedCount: triageResults.length, replies: triageResults };
}

module.exports = { checkInboxReplies };