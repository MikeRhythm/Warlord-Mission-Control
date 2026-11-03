const express = require('express');
const { ImapFlow } = require('imapflow');
const nodemailer = require('nodemailer');
const { simpleParser } = require('mailparser');
const axios = require('axios');

const app = express();
app.use(express.json());

const PORT = 8085;
const OLLAMA_URL = 'http://localhost:11434/api/generate';

// ============================================================================
// ACCOUNT CONFIGURATIONS
// ============================================================================
const ACCOUNTS = {
    'miketantoon@gmail.com': {
        imap: {
            host: 'imap.gmail.com',
            port: 993,
            secure: true,
            auth: {
                user: 'miketantoon@gmail.com',
                pass: 'jrkbnsllszhfwsat'
            }
        },
        smtp: {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'miketantoon@gmail.com',
                pass: 'jrkbnsllszhfwsat'
            }
        }
    },
    'mike@rhythmtradingco.com': {
        imap: {
            host: 'mail.rhythmtradingco.com',
            port: 993,
            secure: true,
            auth: {
                user: 'mike@rhythmtradingco.com',
                pass: 'NotNat0181$'
            }
        },
        smtp: {
            host: 'mail.rhythmtradingco.com',
            port: 465,
            secure: true,
            auth: {
                user: 'mike@rhythmtradingco.com',
                pass: 'NotNat0181$'
            }
        }
    },
    'admin@rhythmtradingco.com': {
        imap: {
            host: 'mail.rhythmtradingco.com',
            port: 993,
            secure: true,
            auth: {
                user: 'admin@rhythmtradingco.com',
                pass: 'AdminPeanut123$'
            }
        },
        smtp: {
            host: 'mail.rhythmtradingco.com',
            port: 465,
            secure: true,
            auth: {
                user: 'admin@rhythmtradingco.com',
                pass: 'AdminPeanut123$'
            }
        }
    }
};

// ============================================================================
// CRITICAL RECORD PROTECTION WHITELIST
// ============================================================================
const CRITICAL_KEYWORDS = [
    'absa', 'fnb', 'standard bank', 'nedbank', 'capitec', 'investec', 'mercantile',
    'reserve bank', 'sarb', 'sars', 'attorney', 'lawyer', 'legal', 'litigation',
    'advocate', 'contract', 'agreement', 'cipc', 'valr', 'intrepid', 'court'
];

function isProtectedEmail(from, subject, body) {
    const combined = `${from || ''} ${subject || ''} ${body || ''}`.toLowerCase();
    return CRITICAL_KEYWORDS.some(keyword => combined.includes(keyword));
}

// ============================================================================
// LLM TRIAGE (HERMES 3)
// ============================================================================
async function triageEmailWithLLM(from, subject, snippet) {
    const prompt = `Analyze this incoming email and categorize it into EXACTLY ONE bucket:
- URGENT_CORE: Important business, partners, direct human communication requiring attention.
- OPERATIONAL_ROUTINE: Server notices, automated receipts, service invoices, operational tracking.
- NEWSLETTER_PROMO: Marketing campaigns, promos, discounts, newsletters.
- SPAM_JUNK: Unsolicited sales, scrapers, obvious cold pitches.

From: ${from}
Subject: ${subject}
Snippet: ${snippet}

Return ONLY the single bucket name without explanation:`;

    try {
        const resp = await axios.post(OLLAMA_URL, {
            model: 'hermes3:latest',
            prompt: prompt,
            stream: false
        }, { timeout: 10000 });

        const result = resp.data.response.trim();
        if (['URGENT_CORE', 'OPERATIONAL_ROUTINE', 'NEWSLETTER_PROMO', 'SPAM_JUNK'].includes(result)) {
            return result;
        }
        return 'URGENT_CORE';
    } catch (err) {
        console.error('[TRIAGE] Hermes 3 offline or error. Defaulting to URGENT_CORE.');
        return 'URGENT_CORE';
    }
}

// ============================================================================
// TIER 1 ROE: DRAFT-FIRST STAGING
// ============================================================================
app.post('/api/mail/draft', async (req, res) => {
    const { account, to, subject, body } = req.body;
    const targetAccount = account || 'miketantoon@gmail.com';

    if (!ACCOUNTS[targetAccount]) {
        return res.status(400).json({ error: `Account ${targetAccount} is not configured.` });
    }

    const client = new ImapFlow({ ...ACCOUNTS[targetAccount].imap, logger: false });
    try {
        await client.connect();
        const draftsFolder = targetAccount.includes('gmail.com') ? '[Gmail]/Drafts' : 'Drafts';

        const rawMessage = Buffer.from(
            `From: ${targetAccount}\r\n` +
            `To: ${to}\r\n` +
            `Subject: ${subject}\r\n` +
            `Content-Type: text/plain; charset=utf-8\r\n\r\n` +
            `${body}\r\n`
        );

        await client.append(draftsFolder, rawMessage, ['\\Draft']);
        console.log(`[MAIL GATEWAY] DRAFT STAGED on ${targetAccount} for ${to}`);
        return res.json({ success: true, account: targetAccount, stagedTo: to, subject: subject });
    } catch (err) {
        console.error('[DRAFT ERROR]', err);
        return res.status(500).json({ error: err.message });
    } finally {
        await client.logout();
    }
});

// ============================================================================
// INCOMING LISTENER INITIALIZER
// ============================================================================
async function initAccountListener(accountKey) {
    const config = ACCOUNTS[accountKey];
    if (config.imap.auth.pass === 'YOUR_RHYTHM_PASSWORD_HERE') {
        console.log(`[MAIL GATEWAY] Skipping ${accountKey} (Awaiting credentials in config)`);
        return;
    }

    const client = new ImapFlow({ ...config.imap, logger: false });

    client.on('error', err => {
        console.error(`[IMAP ERROR] ${accountKey}:`, err.message);
    });

    try {
        await client.connect();
        console.log(`[MAIL GATEWAY] Connected to IMAP: ${accountKey}`);

        let lock = await client.getMailboxLock('INBOX');
        try {
            client.on('exists', async data => {
                console.log(`[EVENT] ${accountKey}: New message detected (Total: ${data.count})`);
                
                let message = await client.fetchOne(data.count, { source: true, flags: true, envelope: true });
                if (!message) return;

                let parsed = await simpleParser(message.source);
                let from = parsed.from ? parsed.from.text : '';
                let subject = parsed.subject || '';
                let snippet = parsed.text ? parsed.text.slice(0, 300) : '';

                // 1. Critical whitelist check
                if (isProtectedEmail(from, subject, snippet)) {
                    console.log(`[PROTECTED] Preserved in Primary: "${subject}" from ${from}`);
                    return;
                }

                // 2. Local LLM Triage
                let bucket = await triageEmailWithLLM(from, subject, snippet);
                console.log(`[TRIAGE] ${accountKey} -> ${bucket}: "${subject}"`);

                if (bucket === 'SPAM_JUNK') {
                    const trashFolder = accountKey.includes('gmail.com') ? '[Gmail]/Trash' : 'Trash';
                    await client.messageMove(message.uid, trashFolder, { uid: true });
                    console.log(`[PURGE] Moved SPAM to Trash: "${subject}"`);
                }
            });

            await client.idle();
        } finally {
            lock.release();
        }
    } catch (err) {
        console.error(`[INIT ERROR] Could not connect to ${accountKey}:`, err.message);
    }
}

// ============================================================================
// SERVER BOOT
// ============================================================================
app.listen(PORT, async () => {
    console.log('=============================================');
    console.log('[PILLAR 4] WARLORD MAIL GATEWAY ONLINE');
    console.log(`[PORT]             : ${PORT}`);
    console.log('[CAPABILITY]       : Local LLM Triage & Critical Protection');
    console.log('=============================================');

    for (const key of Object.keys(ACCOUNTS)) {
        await initAccountListener(key);
    }
});