// ============================================================================
// WARLORD WASP // MCNC MAIL GATEWAY & TRIAGE ENGINE
// PORT: 8085
// FILE: C:\Warlord_Inc\Warlord_WASP\MCNC\services\mail_gateway.js
// ============================================================================

const express = require('express');
const cors = require('cors');
const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');

const app = express();
const PORT = 8085;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ============================================================================
// ACCOUNT ROSTER CONFIGURATION
// ============================================================================
const ACCOUNTS = {
    'miketantoon@gmail.com': {
        imap: { host: 'imap.gmail.com', port: 993, secure: true, auth: { user: 'miketantoon@gmail.com', pass: 'jrkbnsllszhfwsat' } },
        smtp: { host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: 'miketantoon@gmail.com', pass: 'jrkbnsllszhfwsat' } }
    },
    'mike@rhythmtrading.com': {
        imap: { host: 'mail.rhythmtrading.com', port: 993, secure: true, auth: { user: 'mike@rhythmtrading.com', pass: 'YOUR_PASSWORD' } },
        smtp: { host: 'mail.rhythmtrading.com', port: 465, secure: true, auth: { user: 'mike@rhythmtrading.com', pass: 'YOUR_PASSWORD' } }
    },
    'mike@peptidesforafrica.org': {
        imap: { host: 'mail.peptidesforafrica.org', port: 993, secure: true, auth: { user: 'mike@peptidesforafrica.org', pass: 'YOUR_PASSWORD' } },
        smtp: { host: 'mail.peptidesforafrica.org', port: 465, secure: true, auth: { user: 'mike@peptidesforafrica.org', pass: 'YOUR_PASSWORD' } }
    }
};

// ============================================================================
// HERMES 3 TRIAGE LOGIC
// ============================================================================
async function categorizeEmail(subject, textSnippet) {
    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'hermes3:latest',
                prompt: `Analyze this email and categorize it into EXACTLY ONE of these four buckets: URGENT_CORE, OPERATIONAL_ROUTINE, NEWSLETTER_PROMO, SPAM_JUNK.\n\nSubject: ${subject}\nSnippet: ${textSnippet.substring(0, 400)}\n\nBucket:`,
                stream: false
            })
        });
        const data = await response.json();
        const res = (data.response || '').toUpperCase();
        
        if (res.includes('URGENT_CORE')) return 'URGENT_CORE';
        if (res.includes('OPERATIONAL_ROUTINE')) return 'OPERATIONAL_ROUTINE';
        if (res.includes('NEWSLETTER_PROMO')) return 'NEWSLETTER_PROMO';
        if (res.includes('SPAM_JUNK')) return 'SPAM_JUNK';
        
        return 'URGENT_CORE';
    } catch (e) {
        console.error('[TRIAGE] Local Ollama offline. Defaulting to URGENT_CORE.');
        return 'URGENT_CORE';
    }
}

// ============================================================================
// IMAP LISTENER
// ============================================================================
async function startImapListener(accountId, config) {
    const client = new ImapFlow({ ...config.imap, logger: false });

    try {
        await client.connect();
        console.log(`[MAIL GATEWAY] Connected to IMAP: ${accountId}`);

        let lock = await client.getMailboxLock('INBOX');
        try {
            client.on('exists', async () => {
                console.log(`[MAIL GATEWAY] New mail event on ${accountId}.`);
            });
        } finally {
            lock.release();
        }
    } catch (err) {
        console.error(`[MAIL GATEWAY] IMAP Connection failed for ${accountId}:`, err.message);
    }
}

// Start listeners for accounts that have passwords configured
Object.keys(ACCOUNTS).forEach(id => {
    if (!ACCOUNTS[id].imap.auth.pass.includes('YOUR_')) {
        startImapListener(id, ACCOUNTS[id]);
    } else {
        console.log(`[MAIL GATEWAY] Skipping ${id} (Awaiting credentials in config)`);
    }
});

// ============================================================================
// AGENT DISPATCH ENDPOINTS
// ============================================================================

app.post('/api/mail/send', async (req, res) => {
    const { account, to, subject, body } = req.body;
    if (!ACCOUNTS[account]) return res.status(400).json({ error: 'Account not configured' });
    
    try {
        const transporter = nodemailer.createTransport(ACCOUNTS[account].smtp);
        const info = await transporter.sendMail({
            from: account,
            to: to,
            subject: subject,
            text: body
        });
        console.log(`[MAIL GATEWAY] DISPATCHED from ${account} to ${to}`);
        return res.json({ success: true, messageId: info.messageId });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.post('/api/mail/draft', async (req, res) => {
    const { account, to, subject, body } = req.body;
    if (!ACCOUNTS[account]) return res.status(400).json({ error: 'Account not configured' });

    const client = new ImapFlow({ ...ACCOUNTS[account].imap, logger: false });
    try {
        await client.connect();
        const rawMessage = `From: ${account}\r\nTo: ${to}\r\nSubject: ${subject}\r\n\r\n${body}`;
        const folder = account.includes('gmail.com') ? '[Gmail]/Drafts' : 'Drafts';
        await client.append(folder, rawMessage, ['\\Draft']);
        await client.logout();
        
        console.log(`[MAIL GATEWAY] DRAFT STAGED on ${account} for ${to}`);
        return res.json({ success: true, status: 'Draft staged successfully for human review.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log('====================================================');
    console.log('[PILLAR 4] WARLORD MAIL GATEWAY ONLINE');
    console.log(`[PORT]             : ${PORT}`);
    console.log(`[CAPABILITY]       : Local LLM Triage & Dispatch`);
    console.log('====================================================');
});
