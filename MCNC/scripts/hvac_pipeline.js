require('dotenv').config();
const nodemailer = require('nodemailer');
const path = require('path');

// ==========================================
// CONFIGURATION & DRY-RUN GATE
// ==========================================
const isDryRun = process.argv.includes('--dry-run');

console.log('====================================================');
console.log(`[HVAC DISPATCH ENGINE] : ${isDryRun ? 'DRY-RUN MODE (Zero Network Traffic)' : 'LIVE EXECUTION'}`);
console.log('====================================================');

// ==========================================
// TARGET RECIPIENTS (PHASE 3 ASSET)
// ==========================================
const targetQueue = [
    {
        firstName: "Bob",
        companyName: "McCoy's Heating and Air",
        email: "bob@mccoyshvac.com"
    },
    {
        firstName: "David",
        companyName: "Holt Mechanical",
        email: "david@holtmechanical.com"
    },
    {
        firstName: "James",
        companyName: "Southern Comfort Commercial",
        email: "james@southerncomfort.com"
    },
    {
        firstName: "Rick",
        companyName: "A#1 Commercial Services",
        email: "rick@a1commercial.com"
    }
];

// ==========================================
// AMBER VERIFIED B2B COPY ENGINE
// ==========================================
function renderEmailBody(contact) {
    return `Hi ${contact.firstName},

We track commercial facilities and property managers in DFW preparing HVAC maintenance bids.

We route exclusive commercial bid opportunities directly onto your calendar—no shared lead pools.

Can I send you two upcoming commercial project profiles currently seeking contractor bids?

Best regards,
Mike Tanton
Warlord B2B Commercial Operations`;
}

// ==========================================
// EXECUTION ENGINE
// ==========================================
async function runPipeline() {
    let transporter = null;

    if (!isDryRun) {
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.error('[ABORT] Missing SMTP configuration in .env. Halting live send.');
            process.exit(1);
        }

        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    for (let i = 0; i < targetQueue.length; i++) {
        const contact = targetQueue[i];
        const bodyContent = renderEmailBody(contact);
        const subjectLine = `Exclusive commercial HVAC bid profiles for ${contact.companyName}`;

        if (isDryRun) {
            console.log(`\n--- [DISPATCH INSPECTION ${i + 1}/${targetQueue.length}] ---`);
            console.log(`TO: ${contact.email}`);
            console.log(`SUBJECT: ${subjectLine}`);
            console.log(`BODY:\n${bodyContent}`);
            console.log('----------------------------------------------------');
        } else {
            console.log(`[SENDING ${i + 1}/${targetQueue.length}] Dispatching to ${contact.email}...`);
            try {
                await transporter.sendMail({
                    from: `"Mike Tanton" <${process.env.SMTP_USER}>`,
                    to: contact.email,
                    subject: subjectLine,
                    text: bodyContent
                });
                console.log(`[CONFIRMED] Delivered to ${contact.email}`);
                // 5-second pacing delay between messages to protect sender reputation
                await new Promise(resolve => setTimeout(resolve, 5000));
            } catch (err) {
                console.error(`[ERROR] Failed to send to ${contact.email}:`, err.message);
            }
        }
    }

    console.log(`\n[COMPLETE] Processed ${targetQueue.length} records. Status: CLEAN.`);
}

runPipeline();