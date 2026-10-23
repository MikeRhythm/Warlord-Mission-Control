/**
 * WARLORD INC // AUTOMATED INTEL-TO-LEAD PIPELINE
 * Execution: node Intel_To_Leads.js --profile=chief --category=Financial_Assistance --file=Dossier_Target.md
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Parse CLI Arguments
const args = process.argv.slice(2).reduce((acc, curr) => {
    const [key, val] = curr.replace(/^--/, '').split('=');
    acc[key] = val;
    return acc;
}, {});

const PROFILE = args.profile || 'chief';
const CATEGORY = args.category || 'Financial_Assistance';
const SOURCE_FILE = args.file;

if (!SOURCE_FILE) {
    console.error('[!] FATAL: Missing --file argument (Target Markdown Dossier in vault/Docs/)');
    process.exit(1);
}

// Absolute Path Isolation (Tier 2 ROE Compliance)
const BASE_DIR = 'C:\\Warlord_Inc\\Warlord_WASP\\MCNC';
const DOCS_DIR = path.join(BASE_DIR, 'vault', 'Docs');
const SOURCE_PATH = path.join(DOCS_DIR, SOURCE_FILE);

const PROFILE_MAP = {
    chief: path.join(BASE_DIR, 'Data', 'Fundraising', 'Categories', 'Chief_Madothi_Fund'),
    rhythm: path.join(BASE_DIR, 'Data', 'Commercial_Sales', 'Categories', 'Rhythm_Trading')
};

const TARGET_DIR = PROFILE_MAP[PROFILE.toLowerCase()];
if (!TARGET_DIR) {
    console.error(`[!] FATAL: Unknown profile: ${PROFILE}`);
    process.exit(1);
}

const TARGET_CSV = path.join(TARGET_DIR, `${CATEGORY}.csv`);
const LEDGER_PATH = path.join(BASE_DIR, 'Data', 'State', 'Global_Ledger.csv');

// Verify Target Directory Exists
if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Verify State Ledger Exists
if (!fs.existsSync(LEDGER_PATH)) {
    console.error(`[!] FATAL: Global_Ledger.csv missing at: ${LEDGER_PATH}`);
    process.exit(1);
}

/**
 * Normalizes email address for strict RFC 5322 hashing
 */
function normalizeEmail(email) {
    return email ? email.trim().toLowerCase() : '';
}

/**
 * Reads existing hashes from Master Ledger to eliminate duplicates
 */
function loadExistingLedger() {
    const content = fs.readFileSync(LEDGER_PATH, 'utf8');
    const lines = content.split(/\r?\n/);
    const hashes = new Set();
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const cols = line.split(',');
            hashes.add(cols[0]);
        }
    }
    return hashes;
}

/**
 * Parses Markdown Dossier for structured entity contacts
 */
function extractLeadsFromMarkdown(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const leads = [];

    // Pattern 1: Standard Markdown Tables (| Name | Org | Email | Phone | Notes |)
    const tableRegex = /\|(.+)\|(.+)\|(.+)\|(.+)\|(.+)\|/g;
    let match;
    let isHeader = true;

    while ((match = tableRegex.exec(content)) !== null) {
        const [full, col1, col2, col3, col4, col5] = match.map(c => c.trim());
        if (col1.includes('---') || col2.includes('---') || isHeader) {
            isHeader = false;
            continue;
        }

        const potentialEmail = [col1, col2, col3, col4, col5].find(c => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c));
        if (potentialEmail) {
            leads.push({
                Organization: col1,
                ContactPerson: col2,
                Email: potentialEmail,
                Phone: col4 || '',
                Context: col5 || ''
            });
        }
    }

    // Pattern 2: Key-Value Blocks
    const blockRegex = /Organization:\s*(.+)\r?\nContact:\s*(.+)\r?\nEmail:\s*(.+)\r?\nPhone:\s*(.+)/g;
    while ((match = blockRegex.exec(content)) !== null) {
        leads.push({
            Organization: match[1].trim(),
            ContactPerson: match[2].trim(),
            Email: match[3].trim(),
            Phone: match[4].trim(),
            Context: 'Key-Value Extraction'
        });
    }

    return leads;
}

/**
 * Append leads atomically to Category CSV and update Ledger
 */
function processLeads() {
    console.log(`[*] Target Dossier: ${SOURCE_PATH}`);
    if (!fs.existsSync(SOURCE_PATH)) {
        console.error(`[!] File not found: ${SOURCE_PATH}`);
        process.exit(1);
    }

    const rawLeads = extractLeadsFromMarkdown(SOURCE_PATH);
    const existingLedger = loadExistingLedger();
    const currentDate = new Date().toISOString().split('T')[0];

    let addedCount = 0;
    let dupCount = 0;

    const csvExists = fs.existsSync(TARGET_CSV);
    const csvStream = fs.createWriteStream(TARGET_CSV, { flags: 'a', encoding: 'utf8' });
    const ledgerStream = fs.createWriteStream(LEDGER_PATH, { flags: 'a', encoding: 'utf8' });

    if (!csvExists) {
        csvStream.write('Organization,ContactPerson,Email,Phone,Context,Status\n');
    }

    rawLeads.forEach(lead => {
        const normEmail = normalizeEmail(lead.Email);
        const hash = crypto.createHash('sha256').update(normEmail).digest('hex').substring(0, 16);
        const domain = normEmail.split('@')[1] || '';

        if (existingLedger.has(hash)) {
            dupCount++;
            return;
        }

        // Clean CSV field values
        const cleanOrg = `"${lead.Organization.replace(/"/g, '""')}"`;
        const cleanContact = `"${lead.ContactPerson.replace(/"/g, '""')}"`;
        const cleanPhone = `"${lead.Phone.replace(/"/g, '""')}"`;
        const cleanContext = `"${lead.Context.replace(/"/g, '""')}"`;

        csvStream.write(`${cleanOrg},${cleanContact},${normEmail},${cleanPhone},${cleanContext},PENDING\n`);
        ledgerStream.write(`${hash},${normEmail},${domain},${PROFILE},${CATEGORY},${currentDate},NEVER,PENDING\n`);

        existingLedger.add(hash);
        addedCount++;
    });

    csvStream.end();
    ledgerStream.end();

    console.log(`[✔] Batch completed:`);
    console.log(`    - Added: ${addedCount} leads to ${TARGET_CSV}`);
    console.log(`    - Skipped duplicates: ${dupCount}`);
    console.log(`    - Master Ledger synchronized: ${LEDGER_PATH}`);
}

processLeads();