const path = require('path');
const fs = require('fs');

// Ensure .env loads cleanly from MCNC or root
const envPaths = [
    path.resolve(__dirname, '.env'),
    path.resolve(__dirname, '..', '.env'),
    path.resolve('C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\.env'),
    path.resolve('C:\\Warlord_Inc\\Warlord_WASP\\.env')
];
for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath });
        break;
    }
}

const nodemailer = require('nodemailer');

// ==========================================
// CLI ARGUMENT PARSER & MODES
// ==========================================
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run') || (!args.includes('--send') && !args.includes('--test'));
const isTestMode = args.includes('--test');

// Extract profile: --profile=robert | chief | william | rhythm (default: robert)
let selectedProfile = 'robert';
const profileArg = args.find(a => a.startsWith('--profile='));
if (profileArg) {
    selectedProfile = profileArg.split('=')[1].toLowerCase().trim();
}

// Extract category: --category=Financial_Assistance | Churches | Humanitarian_Aid | Social_Clubs | Commercial_HVAC
let selectedCategory = (selectedProfile === 'rhythm') ? 'Commercial_HVAC' : 'Financial_Assistance';
const categoryArg = args.find(a => a.startsWith('--category='));
if (categoryArg) {
    selectedCategory = categoryArg.split('=')[1].trim();
}

console.log('====================================================');
console.log(`[OUTREACH DISPATCH ENGINE] : ${isDryRun ? 'DRY-RUN (Zero Network Traffic)' : isTestMode ? 'TEST MODE (Single Inbox Probe)' : 'LIVE QUEUE DISPATCH'}`);
console.log(`[ACTIVE SENDER PROFILE]   : ${selectedProfile.toUpperCase()}`);
console.log(`[ACTIVE TARGET CATEGORY]  : ${selectedCategory}`);
console.log('====================================================');

// ==========================================
// PROFILE LOADER (NAMESPACED VIA .ENV)
// ==========================================
function getSmtpConfig(profileName) {
    const prefix = `SMTP_${profileName.toUpperCase()}_`;
    
    const host = process.env[`${prefix}HOST`] || process.env.SMTP_HOST;
    const port = process.env[`${prefix}PORT`] || process.env.SMTP_PORT || '465';
    const secure = (process.env[`${prefix}SECURE`] || process.env.SMTP_SECURE || 'true') === 'true';
    const user = process.env[`${prefix}USER`] || process.env.SMTP_USER;
    const pass = process.env[`${prefix}PASS`] || process.env.SMTP_PASS;
    const from = process.env[`${prefix}FROM`] || process.env.SMTP_FROM || `"Robert" <${user}>`;

    return { host, port: parseInt(port, 10), secure, user, pass, from };
}

// ==========================================
// CATEGORIZED CSV LEAD LOADER (CAPITALIZED PATHS)
// ==========================================
function loadCategorizedLeads(profileName, categoryName) {
    const isCommercial = (profileName === 'rhythm');
    const rootSubdir = isCommercial ? 'Commercial_Sales' : 'Fundraising';
    const projectFolder = isCommercial ? 'Rhythm_Trading' : 'Chief_Madothi_Fund';
    const cleanCategory = categoryName.endsWith('.csv') ? categoryName : `${categoryName}.csv`;

    const targetPath = path.resolve(
        'C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\Data',
        rootSubdir,
        'Categories',
        projectFolder,
        cleanCategory
    );

    if (!fs.existsSync(targetPath)) {
        console.warn(`[WARN] Target lead file not found: ${targetPath}`);
        return [];
    }

    const raw = fs.readFileSync(targetPath, 'utf8').trim();
    const lines = raw.split('\n').filter(l => l.trim().length > 0);
    const leads = [];

    // Parse header and rows
    for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim());
        if (parts.length >= 3 && parts[2].includes('@')) {
            leads.push({
                firstName: parts[0],
                companyName: parts[1],
                email: parts[2],
                website: parts[3] || '',
                grantType: parts[4] || '',
                notes: parts[5] || ''
            });
        }
    }
    return leads;
}

// Single Test Probe Target (Pre-Flight Safety Verification)
const testQueue = [
    {
        firstName: "Mike",
        companyName: "Executive Command",
        email: "miketantoon@gmail.com"
    }
];

// ==========================================
// AMBER VERIFIED COPY ENGINE
// ==========================================
function renderEmailBody(contact) {
    if (selectedProfile === 'robert' || selectedProfile === 'chief' || selectedProfile === 'william') {
        return `Dear ${contact.firstName},

I am writing to you directly regarding The Chief Madothi Children's School & Feeding Fund.

We are currently coordinating vital infrastructure, classroom resources, and nutritional supplies for our foundation learners.

May we share our brief operational brief and latest school ledger with your office?

Warm regards,
Robert
Field Operations Director
The Chief Madothi Children's School & Feeding Fund
https://chiefmadothi.website`;
    }

    return `Hi ${contact.firstName},

We track commercial facilities and property managers in DFW preparing HVAC maintenance bids.

We route exclusive commercial bid opportunities directly onto your calendar—no shared lead pools.

Can I send you two upcoming commercial project profiles currently seeking contractor bids?

Best regards,
Mike Tanton
Warlord B2B Commercial Operations`;
}

// ==========================================
// EXECUTION PIPELINE
// ==========================================
async function runPipeline() {
    const smtp = getSmtpConfig(selectedProfile);
    let transporter = null;

    if (!isDryRun) {
        if (!smtp.host || !smtp.user || !smtp.pass) {
            console.error(`[ABORT] Incomplete SMTP credentials for profile [${selectedProfile.toUpperCase()}] in .env.`);
            console.error(`Expected: SMTP_${selectedProfile.toUpperCase()}_HOST, SMTP_${selectedProfile.toUpperCase()}_USER, SMTP_${selectedProfile.toUpperCase()}_PASS`);
            process.exit(1);
        }

        console.log(`[TRANSPORT INIT] Connecting to ${smtp.host}:${smtp.port} (SSL: ${smtp.secure}) as ${smtp.user}...`);
        
        transporter = nodemailer.createTransport({
            host: smtp.host,
            port: smtp.port,
            secure: smtp.secure,
            auth: {
                user: smtp.user,
                pass: smtp.pass
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Pre-flight handshake verification
        try {
            await transporter.verify();
            console.log('[TRANSPORT VERIFIED] SMTP Handshake & Authentication Successful.\n');
        } catch (authErr) {
            console.error('[AUTH FAILURE] SMTP Verification failed:', authErr.message);
            process.exit(1);
        }
    }

    const activeList = isTestMode ? testQueue : loadCategorizedLeads(selectedProfile, selectedCategory);

    if (activeList.length === 0) {
        console.log(`[IDLE] No leads found in category: ${selectedCategory}. Aborting queue.`);
        return;
    }

    for (let i = 0; i < activeList.length; i++) {
        const contact = activeList[i];
        const bodyContent = renderEmailBody(contact);
        const subjectLine = (selectedProfile === 'robert' || selectedProfile === 'chief' || selectedProfile === 'william')
            ? `Chief Madothi Foundation Update // Educational Initiative`
            : `Exclusive commercial HVAC bid profiles for ${contact.companyName}`;

        if (isDryRun) {
            console.log(`\n--- [DISPATCH INSPECTION ${i + 1}/${activeList.length}] ---`);
            console.log(`FROM: ${smtp.from}`);
            console.log(`TO: ${contact.email}`);
            console.log(`SUBJECT: ${subjectLine}`);
            console.log(`BODY:\n${bodyContent}`);
            console.log('----------------------------------------------------');
        } else {
            console.log(`[SENDING ${i + 1}/${activeList.length}] Dispatching from ${smtp.user} to ${contact.email}...`);
            try {
                await transporter.sendMail({
                    from: smtp.from,
                    to: contact.email,
                    subject: subjectLine,
                    text: bodyContent
                });
                console.log(`[CONFIRMED] Delivered to ${contact.email}`);
                
                if (i < activeList.length - 1) {
                    console.log('[PACING] Waiting 5 seconds before next dispatch...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            } catch (err) {
                console.error(`[ERROR] Failed to send to ${contact.email}:`, err.message);
            }
        }
    }

    console.log(`\n[COMPLETE] Processed ${activeList.length} records. Status: CLEAN.`);
}

runPipeline();